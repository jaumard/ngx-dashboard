import {ElementRef, Renderer} from "@angular/core";
import {WidgetHandleDirective} from "../../directives/widget-handle.directive";
export declare class WidgetComponent {
  size: number;
  widgetId: string;

  protected _handle: WidgetHandleDirective;

  protected _ngEl: ElementRef;
  protected _renderer: Renderer;

  get width(): number;

  get height(): number;

  get element(): any;

  get offset(): any;

  get handle(): any;

  set height(height);

  set width(width);

  ngOnInit(): void;

  setPosition(top: number, left: number): void;

  setEventListener(cbMouse: Function): void;

  addClass(myClass: string): void;

  removeClass(myClass: string): void;

}
