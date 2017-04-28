import {NgModule} from "@angular/core";
import {DashboardComponent} from "./dashboard/dashboard.component";
import {WidgetComponent} from "./widget/widget.component";
import {WidgetHandleDirective} from "../directives/widget-handle.directive";

@NgModule({
  declarations: [
    DashboardComponent,
    WidgetComponent,
    WidgetHandleDirective
  ],
  exports: [
    DashboardComponent,
    WidgetComponent,
    WidgetHandleDirective
  ],
  providers: []
})
export class NgDashboardModule {
}
