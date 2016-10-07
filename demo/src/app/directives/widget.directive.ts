import {Directive, OnInit, Renderer, ElementRef} from '@angular/core';

@Directive({
  selector: '[widget]'
})
export class Widget implements OnInit{

  constructor(private _ngEl: ElementRef,
              private _renderer: Renderer) { }

  ngOnInit(): void {
    this._renderer.setElementClass(this._ngEl.nativeElement, 'widget', true);
  }

}
