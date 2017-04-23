import {Directive, ElementRef} from "@angular/core";

@Directive({
  selector: '[widgetHandle]',
  exportAs: 'widgetHandle'
})
export class WidgetHandleDirective {

  constructor(private _ngEl: ElementRef) {
  }

  get element() {
    return this._ngEl.nativeElement;
  }
}
