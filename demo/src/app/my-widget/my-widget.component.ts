import {Component, OnInit, Renderer, ElementRef} from '@angular/core';
import {Widget} from "../../../../directives/widget.directive";

@Component({
  selector: 'app-my-widget',
  templateUrl: './my-widget.component.html',
  styleUrls: ['./my-widget.component.css']
})
export class MyWidgetComponent extends Widget implements OnInit {

  constructor(private _ngEl: ElementRef,
              private _renderer: Renderer) {
    super(this._ngEl, this._renderer);
  }

  ngOnInit() {
  }

}
