import {Component, ViewChild} from '@angular/core';
import {DashboardComponent} from "../../../components/dashboard/dashboard.component";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app works!';
  @ViewChild(DashboardComponent) dashboard;

  constructor() {

  }

  addWidget() {
    console.log(this.dashboard);
    //TODO add dynamically a widget
    //this.dashboard.addItem(...);
  }
}
