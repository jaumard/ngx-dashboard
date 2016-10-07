import {EventEmitter, ContentChildren, Directive, Output, OnInit, AfterViewInit, Renderer, ElementRef, QueryList} from '@angular/core';
import {Widget} from "./widget.directive";

@Directive({
  selector: '[dashboard]',
  host: { //TODO this should be done on all child not here
    '(mousedown)': '_onMouseDown($event)',
    '(mousemove)': '_onMouseMove($event)',
    '(mouseup)': '_onMouseUp($event)',
    '(touchstart)': '_onMouseDown($event)',
    '(touchmove)': '_onMouseMove($event)',
    '(touchend)': '_onMouseUp($event)',
    '(window:resize)': '_onResize($event)',
    '(document:mousemove)': '_onMouseMove($event)',
    '(document:mouseup)': '_onMouseUp($event)'
  }
})
export class Dashboard implements OnInit, AfterViewInit {
//	Event Emitters
  @Output() public onDragStart: EventEmitter<Widget> = new EventEmitter<Widget>();
  @Output() public onDrag: EventEmitter<Widget> = new EventEmitter<Widget>();
  @Output() public onDragStop: EventEmitter<Widget> = new EventEmitter<Widget>();

  //	Public variables
  public dragEnable: boolean = true;

  //	Private variables
  //private _items: Array<Widget> = [];
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
    console.log(this._items);
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


  private _onResize(e: any): void {
    console.log('_onResize');
  }

  private _onMouseDown(e: any): boolean {
    console.log('_onMouseDown');
    return true;
  }

  private _onMouseMove(e: any): boolean {
    console.log('_onMouseMove');
    return true;
  }

  private _onMouseUp(e: any): boolean {
    console.log('_onMouseUp');
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
