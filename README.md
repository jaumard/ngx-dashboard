# ngx-dashboard
Dashboard library for angular 4 and more

[![NPM version][npm-image]][npm-url]
[![NPM downloads][npm-download]][npm-url]
[![Dependency Status][daviddm-image]][daviddm-url]
[![Code Climate][codeclimate-image]][codeclimate-url]
[![Beerpay](https://beerpay.io/jaumard/ngx-dashboard/badge.svg?style=flat)](https://beerpay.io/jaumard/ngx-dashboard)
[![Beerpay](https://beerpay.io/jaumard/ngx-dashboard/make-wish.svg?style=flat)](https://beerpay.io/jaumard/ngx-dashboard)

Demo at: https://jaumard.github.io/ngx-dashboard/demo/demoDist/index.html

## Installation 

```js
npm i ngx-dashboard
// or with yarn 
yarn add ngx-dashboard
```

## Usage 

See demo source code here: https://github.com/jaumard/ngx-dashboard/tree/master/demo

### Create my own widget
To do this you need to extend the WidgetComponent like this: 

```js
import {Component, Renderer2, ElementRef, forwardRef} from "@angular/core";
import {WidgetComponent} from "ngx-dashboard";

@Component({
  selector: 'app-my-widget',
  templateUrl: './my-widget.component.html',
  styleUrls: ['./my-widget.component.css'],
  providers: [{provide: WidgetComponent, useExisting: forwardRef(() => MyWidgetComponent) }]
})
export class MyWidgetComponent extends WidgetComponent {
  @Input() public widgetId: string;
  
  constructor(ngEl: ElementRef, renderer: Renderer2) {
    super(ngEl, renderer);
  }
}

```

The `providers` part is mandatory, if you miss it your widget will not be see as a widget.

The `@Input()` is also mandatory if you want to use `removeById` because angular 4 doesn't inherit annotations yet.

To dynamically add your widget you also need to declare it under "entryComponents" on your app module like this: 

```js
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {NgDashboardModule} from 'ngx-dashboard';

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
    NgDashboardModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

```

### Use custom drag handle

To do this, you can use the `widgetHandle` directive to select witch handle you want from your template. Example:
  
```html
<widget [size]="[2, 1]" widgetId="large">
    <div widgetHandle class="head handle">Large widget [2, 1] handle only on this text</div>
    <div>All other stuff...</div>
</widget>
```

# Development
To run the demo locally, you need to do: 

```
npm run ngm
cd demo/src
ln -s ../../src/dist .
cd ../
npm start
```

## License
[MIT](https://github.com/jaumard/trailpack-passport/blob/master/LICENSE)

## Support on Beerpay
Hey dude! Help me out for a couple of :beers:!

[![Beerpay](https://beerpay.io/jaumard/ngx-dashboard/badge.svg?style=beer-square)](https://beerpay.io/jaumard/ngx-dashboard)  [![Beerpay](https://beerpay.io/jaumard/ngx-dashboard/make-wish.svg?style=flat-square)](https://beerpay.io/jaumard/ngx-dashboard?focus=wish)

[npm-image]: https://img.shields.io/npm/v/ngx-dashboard.svg?style=flat-square
[npm-url]: https://npmjs.org/package/ngx-dashboard
[npm-download]: https://img.shields.io/npm/dt/ngx-dashboard.svg
[daviddm-image]: https://david-dm.org/jaumard/ngx-dashboard/status.svg
[daviddm-url]: https://david-dm.org/jaumard/ngx-dashboard
[codeclimate-image]: https://img.shields.io/codeclimate/github/jaumard/ngx-dashboard.svg?style=flat-square
[codeclimate-url]: https://codeclimate.com/github/jaumard/ngx-dashboard


## Support on Beerpay
Hey dude! Help me out for a couple of :beers:!

[![Beerpay](https://beerpay.io/jaumard/ngx-dashboard/badge.svg?style=beer-square)](https://beerpay.io/jaumard/ngx-dashboard)  [![Beerpay](https://beerpay.io/jaumard/ngx-dashboard/make-wish.svg?style=flat-square)](https://beerpay.io/jaumard/ngx-dashboard?focus=wish)
