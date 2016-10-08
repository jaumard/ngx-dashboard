import {EventEmitter, ContentChildren, Directive, Input, Output, OnInit, AfterViewInit, Renderer, ElementRef, QueryList} from '@angular/core';
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

  //	Public variables
  public dragEnable: boolean = true;

  //	Private variables
  private _width: number = 0;
  private _destroyed: boolean = false;
  private _isDragging: boolean = false;
  private _dragReady: boolean = false;

  @ContentChildren(Widget) _items: QueryList<Widget>;

  constructor(private _ngEl: ElementRef,
              private _renderer: Renderer) { }

  ngOnInit(): void {
    this._renderer.setElementClass(this._ngEl.nativeElement, 'dashboard', true);
  }

  ngAfterViewInit(): void {
    this._width = this._ngEl.nativeElement.offsetWidth;
    console.log(this._ngEl.nativeElement.offsetWidth);
    this._items.forEach(item => {
      item.setEventListener(this.handle, this._onMouseDown.bind(this));
    })
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
    items[0].setPosition(top, left);

    for (let i = 1; i < items.length; i++) {
      let item = items[i];
      if((left + item.width*2 + this.margin) < this._width) {
        left +=  item.width + this.margin;
      }
      else {
        left = this.margin;
        top += item.height + this.margin;
      }
      item.setPosition(top, left);
    }

  }

  private _onResize(e: any): void {
    console.log('_onResize');
    this._width = this._ngEl.nativeElement.offsetWidth;
    this._calculPositions();
  }

  private _onMouseDown(e: any): boolean {
    console.log('_onMouseDown');
    this._isDragging = true;
    return true;
  }

  private _onMouseMove(e: any): boolean {
    if(this._isDragging) {
      console.log('_onMouseMove');
    }
    return true;
  }

  private _onMouseUp(e: any): boolean {
    console.log('_onMouseUp');
    this._isDragging = false;
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
