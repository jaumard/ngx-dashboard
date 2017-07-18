import {ElementRef, Renderer2} from "@angular/core";
import {WidgetHandleDirective} from "../../directives/widget-handle.directive";
export declare class WidgetComponent {
  public size: number;
  public widgetId: string;
  public width: number;
  public height: number;

  protected _handle: WidgetHandleDirective;

  protected _ngEl: ElementRef;
  protected _renderer: Renderer2;

  ngOnInit(): void;

  setPosition(top: number, left: number): void;

  setEventListener(cbMouse: Function): void;

  addClass(myClass: string): void;

  setSize(size: number[]): void;

  removeClass(myClass: string): void;

}
