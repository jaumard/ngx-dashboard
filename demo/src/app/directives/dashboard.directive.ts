import {
  EventEmitter,
  ContentChildren,
  Directive,
  Input,
  Output,
  OnInit,
  AfterViewInit,
  Renderer,
  ElementRef,
  QueryList
} from '@angular/core';
import {Widget} from "./widget.directive";

@Directive({
  selector: '[dashboard]',
  host: {
    '(window:resize)': '_onResize($event)',
    '(document:mousemove)': '_onMouseMove($event)',
    '(document:mouseup)': '_onMouseUp($event)',
    '(document:touchmove)': '_onMouseMove($event)',
    '(document:touchend)': '_onMouseUp($event)'
  }
})
export class Dashboard implements OnInit, AfterViewInit {
//	Event Emitters
  @Output() public onDragStart: EventEmitter<Widget> = new EventEmitter<Widget>();
  @Output() public onDrag: EventEmitter<Widget> = new EventEmitter<Widget>();
  @Output() public onDragStop: EventEmitter<Widget> = new EventEmitter<Widget>();

  @Input() margin: number = 10;
  @Input() handle: string;
  @Input() widgetsSize: number[] = [300, 300];

  //	Public variables
  public dragEnable: boolean = true;

  //	Private variables
  private _width: number = 0;
  private _destroyed: boolean = false;
  private _isDragging: boolean = false;
  private _dragReady: boolean = false;
  private _currentElement: Widget;
  private _offset: any;

  @ContentChildren(Widget) _items: QueryList<Widget>;

  constructor(private _ngEl: ElementRef,
              private _renderer: Renderer) {
  }

  ngOnInit(): void {
    this._renderer.setElementClass(this._ngEl.nativeElement, 'dashboard', true);
  }

  ngAfterViewInit(): void {
    this._width = this._ngEl.nativeElement.offsetWidth;
    this._items.forEach(item => {
      item.setEventListener(this.handle, this._onMouseDown.bind(this));
    })
    this._offset = {top: this._ngEl.nativeElement.offsetY, left: this._ngEl.nativeElement.offsetX}
    this._calculPositions();
  }

  public enableDrag(): void {
    this.dragEnable = true;
  }

  public disableDrag(): void {
    this.dragEnable = false;
  }

  public addItem(ngItem: Widget): void {

  }

  public removeItem(ngItem: Widget): void {

  }

  private _calculPositions(): void {
    let top = this.margin;
    let left = this.margin;

    let items = this._items.toArray();

    for (let i = 0; i < items.length; i++) {
      let item = items[i];

      item.width = this.widgetsSize[0] * item.size[0] + (item.size[0] - 1) * this.margin;
      item.height = this.widgetsSize[1] * item.size[1] + (item.size[1] - 1) * this.margin;

      if ((left + item.width + this.margin) > this._width) {
        left = this.margin;
        top += item.height + this.margin;
      }

      item.setPosition(top, left);

      left += item.width + this.margin;

    }
  }

  private _onResize(e: any): void {
    console.log('_onResize');
    this._width = this._ngEl.nativeElement.offsetWidth;
    this._calculPositions();
  }

  private _onMouseDown(e: any, widget: Widget): boolean {
    console.log('_onMouseDown', e);
    this._isDragging = this.dragEnable;
    this._currentElement = widget;
    this._offset = {top: e.offsetY, left: e.offsetX}
    return true;
  }

  private _onMouseMove(e: any): boolean {
    if (this._isDragging) {
      const pos = this._getMousePosition(e);
      const refPos: any = this._ngEl.nativeElement.getBoundingClientRect();

      const widgetOffset = this._currentElement.offset

      let left = pos.left - this._offset.left;
      let top = pos.top - this._offset.top;
      /*
       if (refPos.left > widgetOffset.left || pos.left < 0 || widgetOffset.left < 0) {
       left = this.margin;
       this._offset.left = widgetOffset.left < 0 ? 0 : widgetOffset.left;
       console.log('force left to ' + refPos.left);
       }
       else {
       left = pos.left - this._offset.left;
       console.log('user left to ' + left);
       }

       if (refPos.top > widgetOffset.top || pos.top < 0 || widgetOffset.top < 0) {
       top = this.margin;
       this._offset.top = widgetOffset.top < 0 ? 0 : widgetOffset.top;
       console.log('force top to ' + refPos.top);
       }
       else {
       top = pos.top - this._offset.top;
       console.log('user top to ' + top);
       }*/

      this._currentElement.setPosition(top, left);
      //console.log('_onMouseMove', refPos, pos, widgetOffset, left, top);

    }
    return true;
  }

  private _onMouseUp(e: any): boolean {
    console.log('_onMouseUp');
    this._isDragging = false;
    this._currentElement = null;
    this._offset = null;
    return true;
  }

  private _getMousePosition(e: any): any {
    if (((<any>window).TouchEvent && e instanceof TouchEvent) || (e.touches || e.changedTouches)) {
      e = e.touches.length > 0 ? e.touches[0] : e.changedTouches[0];
    }

    const refPos: any = this._ngEl.nativeElement.getBoundingClientRect();

    let left: number = e.clientX - refPos.left;
    let top: number = e.clientY - refPos.top;

    return {
      left: left,
      top: top
    };
  }

  private _getAbsoluteMousePosition(e: any): any {
    if (((<any>window).TouchEvent && e instanceof TouchEvent) || (e.touches || e.changedTouches)) {
      e = e.touches.length > 0 ? e.touches[0] : e.changedTouches[0];
    }

    return {
      left: e.clientX,
      top: e.clientY
    };
  }

}
