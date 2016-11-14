# ng2-dashboard
Dashboard library for angular 2

Demo at: https://jaumard.github.io/ng2-dashboard/demo/dist/index.html

## Installation 

```js
npm i ng2-dashboard
// or with yarn 
yarn add ng2-dashboard
```

## Usage 

See demo source code here: https://github.com/jaumard/ng2-dashboard/tree/master/demo

### Create my own widget
To do this you need to extend the WidgetComponent like this: 

```js
import {Component, Renderer, ElementRef, forwardRef} from "@angular/core";
import {WidgetComponent} from "ng2-dashboard";

@Component({
  selector: 'app-my-widget',
  templateUrl: './my-widget.component.html',
  styleUrls: ['./my-widget.component.css'],
  providers: [{provide: WidgetComponent, useExisting: forwardRef(() => MyWidgetComponent) }]
})
export class MyWidgetComponent extends WidgetComponent {
  @Input() public widgetId: string;
  
  constructor(ngEl: ElementRef, renderer: Renderer) {
    super(ngEl, renderer);
  }
}

```

The `providers` part is mandatory, if you miss it your widget will not be see as a widget.

The `@Input()` is also mandatory if you want to use `removeById` because angular 2 doesn't inherit annotations yet.

To dynamically add your widget you also need to declare it under "entryComponents" on your app module like this: 

```js
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {Ng2DashboardModule} from 'ng2-dashboard';

import { AppComponent } from './app.component';
import {MyWidgetComponent} from './my-widget/my-widget.component';

@NgModule({
  declarations: [
    AppComponent,
    MyWidgetComponent
  ],
  entryComponents: [
    MyWidgetComponent
  ],
  imports: [
    BrowserModule,
    Ng2DashboardModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

```

## License
[MIT](https://github.com/jaumard/trailpack-passport/blob/master/LICENSE)

## Support on Beerpay
Hey dude! Help me out for a couple of :beers:!

[![Beerpay](https://beerpay.io/jaumard/ng2-dashboard/badge.svg?style=beer-square)](https://beerpay.io/jaumard/ng2-dashboard)  [![Beerpay](https://beerpay.io/jaumard/ng2-dashboard/make-wish.svg?style=flat-square)](https://beerpay.io/jaumard/ng2-dashboard?focus=wish)
