import {Component, ViewChild, OnInit} from "@angular/core";
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
export class AppComponent implements OnInit {
  title = 'app works!';
  @ViewChild(DashboardComponent) dashboard;
  widgetsSize: number[] = [300, 150];
  dashboardMargin: number = 20;

  constructor() {

  }

  ngOnInit(): void {
    this._onResize(null)
  }

  private _onResize(event: any) {
    if (window.innerWidth < 750) {
      this.dashboardMargin = 10;
      this.widgetsSize = [this.dashboard.width / 2 - this.dashboardMargin, 150];
    }
    else {
      this.dashboardMargin = 20;
      const nbColumn = Math.floor(this.dashboard.width / (300 + this.dashboardMargin));
      this.widgetsSize = [this.dashboard.width / nbColumn - this.dashboardMargin, 150];
    }
  }

  log(widget: WidgetComponent, type: string) {
    console.log(widget, type);
  }

  logOrder(order: Array<string>) {
    console.log(order, 'orderchange');
  }

  addWidget() {
    const ref: MyWidgetComponent = this.dashboard.addItem(MyWidgetComponent);
    ref.widgetId = Math.random() + '';
  }

  close(e: any, id: string) {
    this.dashboard.removeItemById(id);
    e.preventDefault();
    e.stopPropagation();
  }
}
