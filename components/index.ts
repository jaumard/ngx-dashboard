import {NgModule} from '@angular/core';
import {Widget} from "../directives/widget.directive";
import {DashboardComponent} from "../components/dashboard/dashboard.component";

@NgModule({
  declarations: [
    Widget,
    DashboardComponent
  ],
  exports: [
    Widget,
    DashboardComponent
  ],
  providers: []
})
export class Ng2DashboardModule {
}
