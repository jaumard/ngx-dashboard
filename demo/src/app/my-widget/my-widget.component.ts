import {Component, Renderer2, ElementRef, forwardRef, Input, ViewChild} from "@angular/core";
import {WidgetHandleDirective, WidgetComponent} from "../../dist";

const forwardReference = forwardRef(() => MyWidgetComponent);

@Component({
  selector: 'app-my-widget',
  templateUrl: './my-widget.component.html',
  styleUrls: ['./my-widget.component.css'],
  providers: [{provide: WidgetComponent, useExisting: forwardReference}]
})
export class MyWidgetComponent extends WidgetComponent {
  @Input() public size: number[] = [1, 1];
  @Input() public widgetId: string;
  @ViewChild(WidgetHandleDirective) protected _handle: WidgetHandleDirective;

  constructor(ngEl: ElementRef, renderer: Renderer2) {
    super(ngEl, renderer);
  }
}
