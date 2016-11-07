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
    '(document:touchmove)': '_onTouchEvent($event)',
    '(document:touchend)': '_onTouchEvent($event)',
    '(document:touchcancel)': '_onTouchEvent($event)'
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
      item.setEventListener(this.handle, this._onMouseDown.bind(this), this._onTouchEvent.bind(this));
      this._elements.push(item);
    });

    this._offset = {
      top: this._ngEl.nativeElement.offsetY || this._ngEl.nativeElement.offsetTop,
      left: this._ngEl.nativeElement.offsetX || this._ngEl.nativeElement.offsetLeft
    };
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

  /**
   * Simulate a mouse event based on a corresponding touch event
   * @param {Object} event A touch event
   * @param {String} simulatedType The corresponding mouse event
   */
  private simulateMouseEvent(event: any, simulatedType: any): any {
    // Ignore multi-touch events
    if (event.touches.length > 1) {
      return;
    }

    event.preventDefault();

    const touch = event.changedTouches[0],
      simulatedEvent = document.createEvent('MouseEvents');

    // Initialize the simulated mouse event using the touch event's coordinates
    simulatedEvent.initMouseEvent(
      simulatedType,    // type
      true,             // bubbles
      true,             // cancelable
      window,           // view
      1,                // detail
      touch.screenX,    // screenX
      touch.screenY,    // screenY
      touch.clientX,    // clientX
      touch.clientY,    // clientY
      false,            // ctrlKey
      false,            // altKey
      false,            // shiftKey
      false,            // metaKey
      0,                // button
      null              // relatedTarget
    );

    // Dispatch the simulated event to the target element
    event.target.dispatchEvent(simulatedEvent);
  }

  private _onTouchEvent(e: any): any {
    if (e.type === 'touchstart') {
      // Simulate the mouseover event
      this.simulateMouseEvent(event, 'mouseover');

      // Simulate the mousemove event
      this.simulateMouseEvent(event, 'mousemove');

      // Simulate the mousedown event
      this.simulateMouseEvent(event, 'mousedown');
    }
    else if(e.type === 'touchmove') {
      debugger;
      // Simulate the mousemove event
      this.simulateMouseEvent(event, 'mousemove');
    }
    else if(e.type === 'touchend' || e.type === 'touchcancel') {
      // Simulate the mouseup event
      this.simulateMouseEvent(event, 'mouseup');

      // Simulate the mouseout event
      this.simulateMouseEvent(event, 'mouseout');
    }
  }

  private _onResize(e: any): void {
    console.log('_onResize');
    this._width = this._ngEl.nativeElement.offsetWidth;
    this._calculPositions();
    //e.preventDefault();
    //e.stopPropagation();
  }

  private _onMouseDown(e: any, widget: Widget): boolean {
    console.log('_onMouseDown', e);
    this._isDragging = this.dragEnable;
    if (this._isDragging) {
      widget.addClass('active');
      this._currentElement = widget;
      this._offset = this._getOffsetFromTarget(e);
      this._elements.forEach(item => {
        if (item != this._currentElement) {
          item.addClass('animate');
        }
      });
    }
    return true;
  }

  private _onMouseMove(e: any): boolean {
    if (this._isDragging) {
      debugger;
      console.log('_onMouseMove', e);
      const pos = this._getMousePosition(e);
      let left = pos.left - this._offset.left;
      let top = pos.top - this._offset.top;

      this._elements.sort(this._compare);
      this._calculPositions();
      this._currentElement.setPosition(top, left);
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
