import {Component, ViewChild} from '@angular/core';
import {DashboardComponent} from "../../../components/dashboard/dashboard.component";
import {WidgetComponent} from "../../../components/widget/widget.component";
import {MyWidgetComponent} from "./my-widget/my-widget.component";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  host: {
    '(window:resize)': '_onResize($event)',
  }
})
export class AppComponent {
  title = 'app works!';
  @ViewChild(DashboardComponent) dashboard;
  widgetsSize: number[] = [300, 300];

  constructor() {

  }

  private _onResize(event: any) {
    if (window.innerWidth < 750) {
      this.widgetsSize = [150, 150];
    }
    else {
      this.widgetsSize = [300, 150];
    }
  }

  log(widget: WidgetComponent, type: string) {
    console.log(widget, type);
  }

  addWidget() {
    console.log('test');
    this.dashboard.addItem(MyWidgetComponent);
  }

  close(e: any, id: string) {
    this.dashboard.removeItemById(id);
    e.preventDefault();
    e.stopPropagation();
  }
}
