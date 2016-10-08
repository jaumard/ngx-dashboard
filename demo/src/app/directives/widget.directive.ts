import {Directive, OnInit, Renderer, ElementRef} from '@angular/core';

@Directive({
  selector: '[widget]'
})
export class Widget implements OnInit {

  constructor(private _ngEl: ElementRef,
              private _renderer: Renderer) {
  }

  ngOnInit(): void {
    this._renderer.setElementClass(this._ngEl.nativeElement, 'widget', true);
  }

  public get width() {
    return this._ngEl.nativeElement.offsetWidth;
  }

  public get height() {
    return this._ngEl.nativeElement.offsetHeight;
  }

  public setPosition(top: number, left: number): void {
    this._renderer.setElementStyle(this._ngEl.nativeElement, 'top', top + 'px');
    this._renderer.setElementStyle(this._ngEl.nativeElement, 'left', left + 'px');
  }

  public setEventListener(handle: string, cb: Function): void {
    if (handle) {

    }
    else {
      this._renderer.listen(this._ngEl.nativeElement, 'mousedown', cb);
      this._renderer.listen(this._ngEl.nativeElement, 'touchstart', cb);
    }
  }
}
