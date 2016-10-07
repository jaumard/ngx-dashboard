import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { Dashboard } from './directives/dashboard.directive';
import { Widget } from './directives/widget.directive';
import { MyWidgetComponent } from './components/my-widget/my-widget.component';

@NgModule({
  declarations: [
    AppComponent,
    Dashboard,
    Widget,
    MyWidgetComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
