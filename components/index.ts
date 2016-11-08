import {NgModule} from '@angular/core';
import {DashboardComponent} from "../components/dashboard/dashboard.component";
import {WidgetComponent} from "./widget/widget.component";

@NgModule({
  declarations: [
    DashboardComponent,
    WidgetComponent
  ],
  exports: [
    DashboardComponent,
    WidgetComponent
  ],
  providers: []
})
export class Ng2DashboardModule {
}
