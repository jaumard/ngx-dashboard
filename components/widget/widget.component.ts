import {Component, OnInit, Renderer, Input, ElementRef, ContentChild} from "@angular/core";
import {WidgetHandleDirective} from "../../directives/widget-handle.directive";

@Component({
  selector: 'widget',
  template: '<ng-content></ng-content>'
})
export class WidgetComponent implements OnInit {
  @Input() public size: number[] = [1, 1];
  @Input() public widgetId: string;
  @ContentChild(WidgetHandleDirective) protected _handle: WidgetHandleDirective;

  constructor(protected _ngEl: ElementRef,
              protected _renderer: Renderer) {
  }

  ngOnInit(): void {
    this._renderer.setElementClass(this._ngEl.nativeElement, 'widget', true);
  }

  public get element(): any {
    return this._ngEl.nativeElement;
  }

  public get offset(): any {
    return this._ngEl.nativeElement.getBoundingClientRect();
  }

  public get width(): number {
    return this._ngEl.nativeElement.offsetWidth;
  }

  public get height(): number {
    return this._ngEl.nativeElement.offsetHeight;
  }

  public set height(height) {
    this._renderer.setElementStyle(this._ngEl.nativeElement, 'height', height + 'px');
  }

  public set width(width) {
    this._renderer.setElementStyle(this._ngEl.nativeElement, 'width', width + 'px');
  }

  public setPosition(top: number, left: number): void {
    this._renderer.setElementStyle(this._ngEl.nativeElement, 'top', top + 'px');
    this._renderer.setElementStyle(this._ngEl.nativeElement, 'left', left + 'px');
  }

  public setEventListener(cbMouse: Function): void {
    if (this._handle) {
      this._renderer.listen(this._handle.element, 'mousedown', (e) => cbMouse(e, this));
      this._renderer.listen(this._handle.element, 'touchstart', (e) => cbMouse(e, this));
    }
    else {
      this._renderer.listen(this._ngEl.nativeElement, 'mousedown', (e) => cbMouse(e, this));
      this._renderer.listen(this._ngEl.nativeElement, 'touchstart', (e) => cbMouse(e, this));
    }
  }

  addClass(myClass: string): void {
    this._renderer.setElementClass(this._ngEl.nativeElement, myClass, true);
  }

  removeClass(myClass: string): void {
    this._renderer.setElementClass(this._ngEl.nativeElement, myClass, false);
  }

  get handle(): any {
    return this._handle ? this._handle.element : this.element;
  }
}
