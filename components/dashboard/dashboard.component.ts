import {
  EventEmitter,
  ContentChildren,
  Component,
  Input,
  Output,
  AfterViewInit,
  Renderer,
  ElementRef,
  QueryList,
  ViewContainerRef,
  ComponentFactoryResolver,
  ViewChild,
  OnChanges,
  SimpleChanges
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
  styles: [require('./dashboard.component.css')]
})
export class DashboardComponent implements AfterViewInit, OnChanges {
//	Event Emitters
  @Output() public onDragStart: EventEmitter<WidgetComponent> = new EventEmitter<WidgetComponent>();
  @Output() public onDrag: EventEmitter<WidgetComponent> = new EventEmitter<WidgetComponent>();
  @Output() public onDragEnd: EventEmitter<WidgetComponent> = new EventEmitter<WidgetComponent>();

  @Input() margin: number = 10;
  @Input() handle: string;
  @Input() widgetsSize: number[] = [150, 150];

  //	Public variables
  public dragEnable: boolean = true;
  @ViewChild('target', {read: ViewContainerRef}) _viewCntRef;

  //	Private variables
  private _width: number = 0;
  private _nbColumn: number = 0;
  private _isDragging: boolean = false;
  private _currentElement: WidgetComponent;
  private _elements: WidgetComponent[] = [];
  private _offset: any;

  @ContentChildren(WidgetComponent) _items: QueryList<WidgetComponent>;

  constructor(private _componentFactoryResolver: ComponentFactoryResolver,
              private _ngEl: ElementRef,
              private _renderer: Renderer) {

  }

  ngOnChanges(changes: SimpleChanges): void {
    // changes.prop contains the old and the new value...
    this._calculSizeAndColumn();
    this._newCalculPositions();
  }

  ngAfterViewInit(): void {
    this._items.forEach(item => {
      item.setEventListener(this.handle, this._onMouseDown.bind(this));
      this._elements.push(item);
    });
    this._calculSizeAndColumn();
    this._offset = {
      top: this._ngEl.nativeElement.offsetY || this._ngEl.nativeElement.offsetTop,
      left: this._ngEl.nativeElement.offsetX || this._ngEl.nativeElement.offsetLeft
    };
    this._newCalculPositions();
  }

  public enableDrag(): void {
    this.dragEnable = true;
  }

  public disableDrag(): void {
    this.dragEnable = false;
  }

  public addItem(ngItem: { new(): WidgetComponent}): void {
    let factory = this._componentFactoryResolver.resolveComponentFactory(ngItem);
    const ref = this._viewCntRef.createComponent(factory);
    ref.instance.setEventListener(this.handle, this._onMouseDown.bind(this));
    this._elements.push(ref.instance);
    this._newCalculPositions();
  }

  public removeItem(ngItem: WidgetComponent): void {
    this._removeElement(ngItem);
  }

  public removeItemByIndex(index: Number): void {
    const element = this._elements.find((item, i) => i === index);
    this._removeElement(element);
  }

  public removeItemById(id: string): void {
    const element = this._elements.find(item => item.widgetId === id);
    this._removeElement(element);
  }

  private _removeElement(widget: WidgetComponent) {
    this._enableAnimation();
    widget.removeFromParent();
    this._elements = this._elements.filter((item, i) => item !== widget);
    this._newCalculPositions();
    this._disableAnimation();
  }

  private _newCalculPositions(): void {
    const lines = [];
    for (let i = 0; i < this._nbColumn; i++) {
      lines[i] = 0;
    }
    this._positionWidget(lines, this._elements, 0, 0, 0)
  }

  private _positionWidget(lines, items, index, column, row): void {
    if (!items[index]) return;

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
    this._newCalculPositions();
  }

  private _onMouseDown(e: any, widget: WidgetComponent): boolean {
    this._isDragging = this.dragEnable && e.target === widget.el;
    console.log('_onMouseDown');
    if (this._isDragging) {
      this.onDragStart.emit(widget);
      widget.addClass('active');
      this._currentElement = widget;
      this._offset = this._getOffsetFromTarget(e);
      this._enableAnimation();

      if (this._isTouchEvent(e)) {
        e.preventDefault();
        e.stopPropagation();
      }
    }
    return true;
  }

  private _onMouseMove(e: any): boolean {
    if (this._isDragging) {
      this.onDrag.emit(this._currentElement);
      const pos = this._getMousePosition(e);
      let left = pos.left - this._offset.left;
      let top = pos.top - this._offset.top;

      this._elements.sort(this._compare);
      this._newCalculPositions();
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
      this._newCalculPositions();
      this._disableAnimation();
      if (this._isTouchEvent(e)) {
        e.preventDefault();
        e.stopPropagation();
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

  private _getAbsoluteMousePosition(e: any): any {
    e = this._manageEvent(e);

    return {
      left: e.clientX,
      top: e.clientY
    };
  }

  private _compare = function (widget1, widget2) {
    if (widget1.offset.top > widget2.offset.top + widget2.height) {
      return +1;
    }
    if (widget2.offset.top > widget1.offset.top + widget1.height) {
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

  private _enableAnimation() {
    this._elements.forEach(item => {
      if (item != this._currentElement) {
        item.addClass('animate');
      }
    });
  }

  private _disableAnimation() {
    setTimeout(() => {
      this._elements.forEach(item => {
        item.removeClass('animate');
      });
    }, 500);
  }
}
