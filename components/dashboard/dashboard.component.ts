import {
  EventEmitter,
  ContentChildren,
  Component,
  Input,
  Output,
  OnInit,
  AfterViewInit,
  Renderer,
  ElementRef,
  QueryList
} from '@angular/core';
import {Widget} from "../../directives/widget.directive";

@Component({
  selector: 'dashboard',
  template: '<ng-content></ng-content>',
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
export class DashboardComponent implements OnInit, AfterViewInit {
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
  private _elements: Widget[] = [];
  private _offset: any;

  @ContentChildren(Widget) _items: QueryList<Widget>;

  constructor(private _ngEl: ElementRef,
              private _renderer: Renderer) {
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this._width = this._ngEl.nativeElement.offsetWidth;
    this._items.forEach(item => {
      item.setEventListener(this.handle, this._onMouseDown.bind(this));
      this._elements.push(item);
    });

    this._offset = {top: this._ngEl.nativeElement.offsetY || this._ngEl.nativeElement.offsetTop,
      left: this._ngEl.nativeElement.offsetX || this._ngEl.nativeElement.offsetLeft};
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

    let items = this._elements;

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
    e.preventDefault();
    e.stopPropagation();
  }

  private _onMouseDown(e: any, widget: Widget): boolean {
    console.log('_onMouseDown', e);
    this._isDragging = this.dragEnable;
    widget.addClass('active');
    this._currentElement = widget;
    this._offset = this._getOffsetFromTarget(e);
    this._elements.forEach(item => {
      if (item != this._currentElement) {
        item.addClass('animate');
      }
    });
    e.preventDefault();
    e.stopPropagation();
    return true;
  }

  private _onMouseMove(e: any): boolean {
    if (this._isDragging) {
      console.log('_onMouseMove', e);
      const pos = this._getMousePosition(e);
      let left = pos.left - this._offset.left;
      let top = pos.top - this._offset.top;

      this._elements.sort(this._compare);
      this._calculPositions();
      this._currentElement.setPosition(top, left);
      e.preventDefault();
      e.stopPropagation();
    }
    return true;
  }

  private _onMouseUp(e: any): boolean {
    console.log('_onMouseUp');
    this._isDragging = false;
    if (this._currentElement) {
      this._currentElement.removeClass('active');
      this._currentElement.addClass('animate');
    }
    this._currentElement = null;
    this._offset = null;
    this._calculPositions();
    setTimeout(() => {
      this._items.forEach(item => {
        item.removeClass('animate');
      });
    }, 500);
    e.preventDefault();
    e.stopPropagation();

    return true;
  }

  private _manageEvent(e: any): any {
    if (((<any>window).TouchEvent && e instanceof TouchEvent) || (e.touches || e.changedTouches)) {
      e = e.touches.length > 0 ? e.touches[0] : e.changedTouches[0];
    }
    return e;
  }

  private _getOffsetFromTarget(e: any) {
    let x;
    let y;
    if (((<any>window).TouchEvent && e instanceof TouchEvent) || (e.touches || e.changedTouches)) {
      e = e.touches.length > 0 ? e.touches[0] : e.changedTouches[0];
      //const rect = e.target.getBoundingClientRect();
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
}
