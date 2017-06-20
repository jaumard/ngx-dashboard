import {
  AfterViewInit,
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  ContentChildren,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  QueryList,
  Renderer2,
  SimpleChanges,
  Type,
  ViewChild,
  ViewContainerRef
} from "@angular/core";
import {WidgetComponent} from "../widget/widget.component";

@Component({
  selector: 'dashboard',
  template: '<div #target><ng-content></ng-content></div>',
  host: {
    '(window:resize)': '_onResize($event)',
    '(document:mousemove)': '_onMouseMove($event)',
    '(document:mouseup)': '_onMouseUp($event)',
    '(document:touchmove)': '_onMouseMove($event)',
    '(document:touchend)': '_onMouseUp($event)',
    '(document:touchcancel)': '_onMouseUp($event)',
    '(document:scroll)': '_onScroll($event)'
  },
  styles: [`
    :host {
      position: relative;
      display: block;
    }

    :host /deep/ .widget {
      position: absolute;
      top: 0;
      left: 0;
      -webkit-touch-callout: none; /* iOS Safari */
      -webkit-user-select: none; /* Chrome/Safari/Opera */
      -khtml-user-select: none; /* Konqueror */
      -moz-user-select: none; /* Firefox */
      -ms-user-select: none; /* Internet Explorer/Edge */
      user-select: none;
      /* Non-prefixed version, currently
                             not supported by any browser */
    }

    :host /deep/ .widget.animate {
      -webkit-transition: all 300ms ease-out;
      -moz-transition: all 300ms ease-out;
      -o-transition: all 300ms ease-out;
      transition: all 300ms ease-out;
    }

    :host /deep/ .widget.active {
      z-index: 100000;
    }`
  ]
})
export class DashboardComponent implements AfterViewInit, OnChanges {
  //  Event Emitters
  @Output() public onDragStart: EventEmitter<WidgetComponent> = new EventEmitter<WidgetComponent>();
  @Output() public onDrag: EventEmitter<WidgetComponent> = new EventEmitter<WidgetComponent>();
  @Output() public onDragEnd: EventEmitter<WidgetComponent> = new EventEmitter<WidgetComponent>();
  @Output() public onOrderChange: EventEmitter<Array<string>> = new EventEmitter<Array<string>>();

  @Input() margin: number = 10;
  @Input() widgetsSize: number[] = [150, 150];
  @Input() THRESHOLD: number = 10;

  //    Public variables
  public dragEnable: boolean = true;
  @ViewChild('target', {read: ViewContainerRef}) private _viewCntRef: ViewContainerRef;

  //    Private variables
  static SCROLL_STEP: number = 15;
  static SCROLL_DELAY: number = 100;
  private _width: number = 0;
  private _nbColumn: number = 0;
  private _previousPosition: any = {top: 0, left: 0};
  private _isDragging: boolean = false;
  private _lastOrder: Array<string> = [];
  private _currentElement: WidgetComponent;
  private _elements: ComponentRef<WidgetComponent>[] = [];
  private _offset: any;
  private _scrollChange: number = 0;
  private _isScrolling: boolean = false;
  private _currentMouseEvent: any;

  @ContentChildren(WidgetComponent) private _items: QueryList<WidgetComponent>;

  constructor(private _componentFactoryResolver: ComponentFactoryResolver,
              private _ngEl: ElementRef,
              private _renderer: Renderer2) {

  }

  get width() {
    return this._ngEl.nativeElement.offsetWidth;
  }

  get height() {
    return this._ngEl.nativeElement.offsetHeight;
  }

  ngOnChanges(changes: SimpleChanges): void {
    // changes.prop contains the old and the new value...
    this._calculSizeAndColumn();
    this._calculPositions();
  }

  ngAfterViewInit(): void {
    this._items.forEach(item => {
      item.setEventListener(this._onMouseDown.bind(this));
      //this is an ugly ugly ugly hack :( but needed in order to make static and dynamic widget works together
      //FIXME find a way to retrieve a ComponentRef from static widgets instead of this fake one
      this._elements.push({
        instance: item,
        componentType: null,
        location: null,
        injector: null,
        hostView: null,
        destroy: null,
        onDestroy: null,
        changeDetectorRef: null
      });
    });
    this._calculSizeAndColumn();
    this._offset = {
      top: this._ngEl.nativeElement.offsetY || this._ngEl.nativeElement.offsetTop,
      left: this._ngEl.nativeElement.offsetX || this._ngEl.nativeElement.offsetLeft
    };
    this._calculPositions();
  }

  public enableDrag(): void {
    this.dragEnable = true;
    this._renderer.removeClass(this._ngEl.nativeElement, 'disabled');
  }

  public disableDrag(): void {
    this.dragEnable = false;
    this._renderer.addClass(this._ngEl.nativeElement, 'disabled');
  }

  public addItem<T extends WidgetComponent>(ngItem: Type<T>): T {
    let factory = this._componentFactoryResolver.resolveComponentFactory(ngItem);
    const ref = this._viewCntRef.createComponent(factory);
    const newItem: T = ref.instance;
    newItem.setEventListener(this._onMouseDown.bind(this));
    this._elements.push(ref);
    this._calculPositions();
    return newItem;
  }

  public clearItems(): void {
    this._viewCntRef.clear();
    this._elements = [];
  }

  public getWidgetById(widgetId: string): WidgetComponent {
    let element;
    for (let i = 0; i < this._elements.length; i++) {
      element = this._elements[i].instance;
      if (widgetId == element.widgetId) {
        break;
      }
    }
    return element;
  }

  public removeItem(ngItem: WidgetComponent): void {
    let element;
    for (let i = 0; i < this._elements.length; i++) {
      element = this._elements[i];
      if (element.instance.widgetId == ngItem.widgetId) {
        break;
      }
    }
    this._removeElement(element);
  }

  public removeItemByIndex(index: number): void {
    let element;
    for (let i = 0; i < this._elements.length; i++) {
      const widget = this._elements[i];
      if (i === index) {
        element = widget;
        break;
      }
    }
    if (element) {
      this._removeElement(element);
    }
  }

  public removeItemById(id: string): void {
    let element;
    for (let i = 0; i < this._elements.length; i++) {
      const widget = this._elements[i];
      if (widget.instance.widgetId == id) {
        element = widget;
        break;
      }
    }
    if (element) {
      this._removeElement(element);
    }

  }

  private _removeElement(widget: ComponentRef<WidgetComponent>): void {
    if (!widget) return;
    this._enableAnimation();
    const index = widget.hostView == null ? -1 : this._viewCntRef.indexOf(widget.hostView);
    if (index == -1) {
      widget.instance.removeFromParent();
    }
    else {
      this._viewCntRef.remove(index);
    }
    this._elements = this._elements.filter((item, i) => item !== widget);
    this._calculPositions();
    this._disableAnimation();
  }

  private _calculPositions(): void {
    const lines = [];
    for (let i = 0; i < this._nbColumn; i++) {
      lines[i] = 0;
    }
    this._positionWidget(lines, this._elements, 0, 0, 0)
  }

  private _positionWidget(lines: number[], items: ComponentRef<WidgetComponent>[], index: number, column: number, row: number): void {
    if (!items[index]) {
      let remainingHeight = 0;
      for (let i = 0; i < lines.length; i++) {
        if (remainingHeight < lines[i]) {
          remainingHeight = lines[i];
        }
        lines[i]--;
      }
      if (remainingHeight > 0) {
        this._positionWidget(lines, items, index, column, row + 1);
      }
      else {
        const height = row * this.widgetsSize[1] + row * this.margin;
        this._renderer.setStyle(this._ngEl.nativeElement, 'height', height + 'px');
      }
      return;
    }

    const item = items[index].instance;

    let itemWidth = item.size[0]
    if (itemWidth > this._nbColumn) {
      itemWidth = this._nbColumn;
    }

    item.width = this.widgetsSize[0] * itemWidth + ( itemWidth - 1 ) * this.margin;
    item.height = this.widgetsSize[1] * item.size[1] + ( item.size[1] - 1 ) * this.margin;

    let haveEnoughSpace = column + itemWidth - 1 <= this._nbColumn;
    while (lines[column] > 0 || !haveEnoughSpace) {
      column++;
      haveEnoughSpace = column + itemWidth - 1 <= this._nbColumn;

      if (column >= this._nbColumn) {
        column = 0;
        for (let i = 0; i < lines.length; i++) {
          lines[i]--;
        }
        row++;
        haveEnoughSpace = column + itemWidth - 1 <= this._nbColumn;
      }

      if (!haveEnoughSpace) continue;
      for (let i = 1; i < itemWidth; i++) {
        haveEnoughSpace = lines[column + i] <= 0;
        if (!haveEnoughSpace) break;
      }
    }

    const left = column * this.widgetsSize[0] + column * this.margin + this.margin / 2;
    const top = row * this.widgetsSize[1] + row * this.margin + this.margin / 2;

    lines[column] = item.size[1];
    for (let i = 1; i < itemWidth; i++) {
      lines[column + i] = item.size[1];
    }

    item.setPosition(top, left);
    this._positionWidget(lines, items, index + 1, column, row);
  }

  private _calculSizeAndColumn(): void {
    this._width = this._ngEl.nativeElement.offsetWidth;
    this._nbColumn = Math.floor(this._width / ( this.widgetsSize[0] + this.margin ));
  }

  private _onResize(e: any): void {
    this._calculSizeAndColumn();
    this._calculPositions();
  }

  private _onMouseDown(e: any, widget: WidgetComponent): boolean {
    this._isDragging = this.dragEnable && e.target === widget.handle;
    if (this._isDragging) {
      this.onDragStart.emit(widget);
      widget.addClass('active');
      this._currentElement = widget;
      this._offset = this._getOffsetFromTarget(e);
      this._enableAnimation();
      this._lastOrder = this.order;

      if (this._isTouchEvent(e)) {
        e.preventDefault();
        e.stopPropagation();
      }
      this._currentMouseEvent = e;
    }
    return true;
  }

  public get order(): Array<string> {
    return this._elements.map(elt => elt.instance.widgetId);
  }

  private _onMouseMove(e: any): boolean {
    if (this._isDragging) {
      //scroll while drag
      if (this._isTouchEvent(e))
        e = e.touches.length > 0 ? e.touches[0] : e.changedTouches[0];
      let _pageY = e.clientY;
      const y = _pageY;
      const container = document.body;
      const containerTop = container.offsetTop;

      if (window.innerHeight - y < 80) {
        this._isScrolling = true;
        this._scrollDown(container, y, e);
      } else if (containerTop + y < 80) {
        this._isScrolling = true;
        this._scrollUp(container, y, e);
      } else {
        this._isScrolling = false;
      }
      this.onDrag.emit(this._currentElement);
      const pos = this._getMousePosition(e);

      let left = pos.left - this._offset.left;
      let top = pos.top - this._offset.top;

      if (Math.abs(pos.top - this._previousPosition.top) > this.THRESHOLD
        || Math.abs(pos.left - this._previousPosition.left) > this.THRESHOLD) {
        this._elements.sort(this._compare);

        this._calculPositions();
        this._previousPosition = pos;
      }
      this._currentElement.setPosition(top, left);
      if (this._isTouchEvent(e)) {
        e.preventDefault();
        e.stopPropagation();
      }
      this._currentMouseEvent = e;
    }
    return true;
  }

  private _scrollDown(container: any, pageY: number, e: any): boolean {
    if (this._isDragging && container.scrollTop < ( this._ngEl.nativeElement.offsetHeight - window.innerHeight + this._currentElement.height ) && this._isScrolling) {
      container.scrollTop += DashboardComponent.SCROLL_STEP;
      this._scrollChange = DashboardComponent.SCROLL_STEP;
      setTimeout(this._scrollDown.bind(this, container, pageY, e), DashboardComponent.SCROLL_DELAY);
    }
    return true;
  }

  private _scrollUp(container: any, pageY: number, e: any): boolean {
    if (this._isDragging && container.scrollTop != 0 && this._isScrolling) {
      container.scrollTop -= DashboardComponent.SCROLL_STEP;
      this._scrollChange = -DashboardComponent.SCROLL_STEP;
      setTimeout(this._scrollUp.bind(this, container, pageY, e), DashboardComponent.SCROLL_DELAY);
    }
    return true;
  }

  private _onScroll(e: any): boolean {
    if (this._isDragging) {
      let refPos = this._ngEl.nativeElement.getBoundingClientRect();
      let left;
      let top;
      left = this._currentMouseEvent.clientX - refPos.left;
      top = this._currentMouseEvent.clientY - refPos.top;
      this.onDrag.emit(this._currentElement);
      left = left - this._offset.left;
      let top_1 = top - this._offset.top + this._scrollChange;
      if (Math.abs(top - this._previousPosition.top) > this.THRESHOLD
        || Math.abs(left - this._previousPosition.left) > this.THRESHOLD) {
        this._elements.sort(this._compare);
        this._calculPositions();
        //  this._previousPosition = pos;

      }
      this._currentElement.setPosition(top_1, left);

    }
    return true;
  }

  private _onMouseUp(e: any): boolean {
    if (this._isDragging) {
      this._isDragging = false;
      this._isScrolling = false;
      if (this._currentElement) {
        this.onDragEnd.emit(this._currentElement);
        this._currentElement.removeClass('active');
        this._currentElement.addClass('animate');
      }
      this._currentElement = null;
      this._offset = null;
      this._calculPositions();
      this._disableAnimation();
      if (this._isTouchEvent(e)) {
        e.preventDefault();
        e.stopPropagation();
      }
      const currentOrder = this.order;

      const isOrderChanged = JSON.stringify(this._lastOrder) != JSON.stringify(currentOrder);

      if (isOrderChanged) {
        this.onOrderChange.emit(this.order);
      }
    }
    return true;
  }

  private _manageEvent(e: any): any {
    if (this._isTouchEvent(e)) {
      e = e.touches.length > 0 ? e.touches[0] : e.changedTouches[0];
    }
    return e;
  }

  private _isTouchEvent(e: any): any {
    return ( ( <any>window ).TouchEvent && e instanceof TouchEvent ) || ( e.touches || e.changedTouches );
  }

  private _getOffsetFromTarget(e: any) {
    let x;
    let y;
    let scrollOffset = 0;
    if (this._isTouchEvent(e)) {
      e = e.touches.length > 0 ? e.touches[0] : e.changedTouches[0];
      const rect = e.target.getBoundingClientRect();
      x = e.pageX - rect.left;
      y = e.pageY - rect.top;
      scrollOffset = ( <any>document ).body.scrollTop;
    }
    else {
      x = e.offsetX || e.offsetLeft;
      y = e.offsetY || e.offsetTop;
    }

    return {top: y - scrollOffset, left: x};
  }

  private _getMousePosition(e: any): any {
    e = this._manageEvent(e);
    const refPos: any = this._ngEl.nativeElement.getBoundingClientRect();

    let left: number = e.clientX - refPos.left;
    let top: number = e.clientY - refPos.top;
    return {
      left: left,
      top: top
    };
  }

  private _compare(widget1: ComponentRef<WidgetComponent>, widget2: ComponentRef<WidgetComponent>): number {
    if (widget1.instance.offset.top > widget2.instance.offset.top + widget2.instance.height / 2) {
      return +1;
    }
    if (widget2.instance.offset.top > widget1.instance.offset.top + widget1.instance.height / 2) {
      return -1;
    }
    if (( widget1.instance.offset.left + ( widget1.instance.width / 2 ) ) > ( widget2.instance.offset.left + ( widget2.instance.width / 2 ) )) {
      return +1;
    }
    if (( widget2.instance.offset.left + ( widget2.instance.width / 2 ) ) > ( widget1.instance.offset.left + ( widget1.instance.width / 2 ) )) {
      return -1;
    }
    return 0;
  };

  private _enableAnimation(): void {
    this._elements.forEach(item => {
      if (item.instance != this._currentElement) {
        item.instance.addClass('animate');
      }
    });
  }

  private _disableAnimation(): void {
    setTimeout(() => {
      this._elements.forEach(item => {
        item.instance.removeClass('animate');
      });
    }, 400);
  }
}
