import {
  EventEmitter,
  ContentChildren,
  Component,
  Input,
  Output,
  AfterViewInit,
  Renderer2,
  ElementRef,
  QueryList,
  ViewContainerRef,
  ComponentFactoryResolver,
  ViewChild,
  OnChanges,
  SimpleChanges,
  Type
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
    '(document:touchcancel)': '_onMouseUp($event)'
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
//	Event Emitters
  @Output() public onDragStart: EventEmitter<WidgetComponent> = new EventEmitter<WidgetComponent>();
  @Output() public onDrag: EventEmitter<WidgetComponent> = new EventEmitter<WidgetComponent>();
  @Output() public onDragEnd: EventEmitter<WidgetComponent> = new EventEmitter<WidgetComponent>();
  @Output() public onOrderChange: EventEmitter<Array<string>> = new EventEmitter<Array<string>>();

  @Input() margin: number = 10;
  @Input() widgetsSize: number[] = [150, 150];
  @Input() THRESHOLD: number = 10;

  //	Public variables
  public dragEnable: boolean = true;
  @ViewChild('target', {read: ViewContainerRef}) private _viewCntRef: ViewContainerRef;

  //	Private variables
  private _width: number = 0;
  private _nbColumn: number = 0;
  private _previousPosition: any = {top: 0, left: 0};
  private _isDragging: boolean = false;
  private _lastOrder: Array<string> = [];
  private _currentElement: WidgetComponent;
  private _elements: WidgetComponent[] = [];
  private _offset: any;

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
      this._elements.push(item);
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
    this._elements.push(newItem);
    this._calculPositions();
    return newItem;
  }

  public clearItems(): void {
    this._viewCntRef.clear();
    this._elements = [];
  }

  private _getElementIndex(ngItem: WidgetComponent): number {
    return this._elements.indexOf(ngItem);
  }

  public getWidgetById(widgetId: string): WidgetComponent {
    let element;
    for (let i = 0; i < this._elements.length; i++) {
      element = this._elements[i];
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
      if (element.widgetId == ngItem.widgetId) {
        break;
      }
    }
    this._removeElement(element, this._getElementIndex(element));
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
      this._removeElement(element, index);
    }
  }

  public removeItemById(id: string): void {
    let element;
    for (let i = 0; i < this._elements.length; i++) {
      const widget = this._elements[i];
      if (widget.widgetId == id) {
        element = widget;
        break;
      }
    }
    if (element) {
      this._removeElement(element, this._getElementIndex(element));
    }

  }

  private _removeElement(widget: WidgetComponent, index: number): void {
    if (index < 0 || !widget) return;
    this._enableAnimation();
    if (this._viewCntRef.length < index) {
      widget.removeFromParent();
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

  private _positionWidget(lines: number[], items: WidgetComponent[], index: number, column: number, row: number): void {
    if (!items[index]) {
      const height = (row + 1) * this.widgetsSize[1] + row * this.margin;
      this._renderer.setStyle(this._ngEl.nativeElement, 'height', height + 'px');
      return;
    }

    const item = items[index];
    item.width = this.widgetsSize[0] * item.size[0] + (item.size[0] - 1) * this.margin;
    item.height = this.widgetsSize[1] * item.size[1] + (item.size[1] - 1) * this.margin;

    let haveEnoughSpace = column + item.size[0] - 1 <= this._nbColumn;
    while (lines[column] > 0 || !haveEnoughSpace) {
      column++;
      haveEnoughSpace = column + item.size[0] - 1 <= this._nbColumn;

      if (column >= this._nbColumn) {
        column = 0;
        for (let i = 0; i < lines.length; i++) {
          lines[i]--;
        }
        row++;
        haveEnoughSpace = column + item.size[0] - 1 <= this._nbColumn;
      }

      if (!haveEnoughSpace) continue;
      for (let i = 1; i < item.size[0]; i++) {
        haveEnoughSpace = lines[column + i] <= 0;
        if (!haveEnoughSpace)break;
      }
    }

    const left = column * this.widgetsSize[0] + column * this.margin;
    const top = row * this.widgetsSize[1] + row * this.margin;

    lines[column] = item.size[1];
    for (var i = 1; i < item.size[0]; i++) {
      lines[column + i] = item.size[1];
    }

    item.setPosition(top, left);
    this._positionWidget(lines, items, index + 1, column, row);
  }

  private _calculSizeAndColumn(): void {
    this._width = this._ngEl.nativeElement.offsetWidth;
    this._nbColumn = Math.floor(this._width / (this.widgetsSize[0] + this.margin));
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
    }
    return true;
  }

  public get order(): Array<string> {
    return this._elements.map(elt => elt.widgetId);
  }

  private _onMouseMove(e: any): boolean {
    if (this._isDragging) {
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
    }
    return true;
  }

  private _onMouseUp(e: any): boolean {
    if (this._isDragging) {
      this._isDragging = false;
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
    return ((<any>window).TouchEvent && e instanceof TouchEvent) || (e.touches || e.changedTouches);
  }

  private _getOffsetFromTarget(e: any) {
    let x;
    let y;
    if (this._isTouchEvent(e)) {
      e = e.touches.length > 0 ? e.touches[0] : e.changedTouches[0];
      x = e.pageX - e.target.offsetLeft;
      y = e.pageY - e.target.offsetTop;
    }
    else {
      x = e.offsetX || e.offsetLeft;
      y = e.offsetY || e.offsetTop;
    }

    return {top: y, left: x};
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

  private _compare(widget1: WidgetComponent, widget2: WidgetComponent): number {
    if (widget1.offset.top > widget2.offset.top + widget2.height / 2) {
      return +1;
    }
    if (widget2.offset.top > widget1.offset.top + widget1.height / 2) {
      return -1;
    }
    if ((widget1.offset.left + (widget1.width / 2)) > (widget2.offset.left + (widget2.width / 2))) {
      return +1;
    }
    if ((widget2.offset.left + (widget2.width / 2)) > (widget1.offset.left + (widget1.width / 2))) {
      return -1;
    }
    return 0;
  };

  private _enableAnimation(): void {
    this._elements.forEach(item => {
      if (item != this._currentElement) {
        item.addClass('animate');
      }
    });
  }

  private _disableAnimation(): void {
    setTimeout(() => {
      this._elements.forEach(item => {
        item.removeClass('animate');
      });
    }, 400);
  }
}
