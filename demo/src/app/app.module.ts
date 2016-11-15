import {BrowserModule} from "@angular/platform-browser";
import {NgModule} from "@angular/core";
import {FormsModule} from "@angular/forms";
import {HttpModule} from "@angular/http";
import {Ng2DashboardModule} from "../../../components";
import {AppComponent} from "./app.component";
import {MyWidgetComponent} from "./my-widget/my-widget.component";
import {WidgetHandleDirective} from "../../../directives/widget-handle.directive";

@NgModule({
  declarations: [
    AppComponent,
    MyWidgetComponent,
    WidgetHandleDirective
  ],
  entryComponents: [
    MyWidgetComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    Ng2DashboardModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
