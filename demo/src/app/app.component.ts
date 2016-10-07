import {Component, ViewChild} from '@angular/core';
import {Dashboard} from "./directives/dashboard.directive";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app works!';
  @ViewChild(Dashboard) dashboard;

  constructor() {

  }

  addWidget() {
    console.log(this.dashboard);
    //TODO add dynamically a widget
    //this.dashboard.addItem(...);
  }
}
