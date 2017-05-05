webpackJsonp([0,3],{

/***/ 128:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = __webpack_require__(9);
var widget_component_1 = __webpack_require__(74);
var DashboardComponent = (function () {
    function DashboardComponent(_componentFactoryResolver, _ngEl, _renderer) {
        this._componentFactoryResolver = _componentFactoryResolver;
        this._ngEl = _ngEl;
        this._renderer = _renderer;
        //	Event Emitters
        this.onDragStart = new core_1.EventEmitter();
        this.onDrag = new core_1.EventEmitter();
        this.onDragEnd = new core_1.EventEmitter();
        this.onOrderChange = new core_1.EventEmitter();
        this.margin = 10;
        this.widgetsSize = [150, 150];
        this.THRESHOLD = 10;
        //	Public variables
        this.dragEnable = true;
        //	Private variables
        this._width = 0;
        this._nbColumn = 0;
        this._previousPosition = { top: 0, left: 0 };
        this._isDragging = false;
        this._lastOrder = [];
        this._elements = [];
    }
    Object.defineProperty(DashboardComponent.prototype, "width", {
        get: function () {
            return this._ngEl.nativeElement.offsetWidth;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DashboardComponent.prototype, "height", {
        get: function () {
            return this._ngEl.nativeElement.offsetHeight;
        },
        enumerable: true,
        configurable: true
    });
    DashboardComponent.prototype.ngOnChanges = function (changes) {
        // changes.prop contains the old and the new value...
        this._calculSizeAndColumn();
        this._calculPositions();
    };
    DashboardComponent.prototype.ngAfterViewInit = function () {
        var _this = this;
        this._items.forEach(function (item) {
            item.setEventListener(_this._onMouseDown.bind(_this));
            //this is an ugly ugly ugly hack :( but needed in order to make static and dynamic widget works together
            //FIXME find a way to retrieve a ComponentRef from static widgets instead of this fake one
            _this._elements.push({
                instance: item,
                componentType: null,
                location: null,
                injector: null,
                hostView: null,
                destroy: null,
                onDestroy: null,
                changeDetectorRef: null
            });
        });
        this._calculSizeAndColumn();
        this._offset = {
            top: this._ngEl.nativeElement.offsetY || this._ngEl.nativeElement.offsetTop,
            left: this._ngEl.nativeElement.offsetX || this._ngEl.nativeElement.offsetLeft
        };
        this._calculPositions();
    };
    DashboardComponent.prototype.enableDrag = function () {
        this.dragEnable = true;
        this._renderer.removeClass(this._ngEl.nativeElement, 'disabled');
    };
    DashboardComponent.prototype.disableDrag = function () {
        this.dragEnable = false;
        this._renderer.addClass(this._ngEl.nativeElement, 'disabled');
    };
    DashboardComponent.prototype.addItem = function (ngItem) {
        var factory = this._componentFactoryResolver.resolveComponentFactory(ngItem);
        var ref = this._viewCntRef.createComponent(factory);
        var newItem = ref.instance;
        newItem.setEventListener(this._onMouseDown.bind(this));
        this._elements.push(ref);
        this._calculPositions();
        return newItem;
    };
    DashboardComponent.prototype.clearItems = function () {
        this._viewCntRef.clear();
        this._elements = [];
    };
    DashboardComponent.prototype.getWidgetById = function (widgetId) {
        var element;
        for (var i = 0; i < this._elements.length; i++) {
            element = this._elements[i].instance;
            if (widgetId == element.widgetId) {
                break;
            }
        }
        return element;
    };
    DashboardComponent.prototype.removeItem = function (ngItem) {
        var element;
        for (var i = 0; i < this._elements.length; i++) {
            element = this._elements[i];
            if (element.instance.widgetId == ngItem.widgetId) {
                break;
            }
        }
        this._removeElement(element);
    };
    DashboardComponent.prototype.removeItemByIndex = function (index) {
        var element;
        for (var i = 0; i < this._elements.length; i++) {
            var widget = this._elements[i];
            if (i === index) {
                element = widget;
                break;
            }
        }
        if (element) {
            this._removeElement(element);
        }
    };
    DashboardComponent.prototype.removeItemById = function (id) {
        var element;
        for (var i = 0; i < this._elements.length; i++) {
            var widget = this._elements[i];
            if (widget.instance.widgetId == id) {
                element = widget;
                break;
            }
        }
        if (element) {
            this._removeElement(element);
        }
    };
    DashboardComponent.prototype._removeElement = function (widget) {
        if (!widget)
            return;
        this._enableAnimation();
        var index = widget.hostView == null ? -1 : this._viewCntRef.indexOf(widget.hostView);
        if (index == -1) {
            widget.instance.removeFromParent();
        }
        else {
            this._viewCntRef.remove(index);
        }
        this._elements = this._elements.filter(function (item, i) { return item !== widget; });
        this._calculPositions();
        this._disableAnimation();
    };
    DashboardComponent.prototype._calculPositions = function () {
        var lines = [];
        for (var i = 0; i < this._nbColumn; i++) {
            lines[i] = 0;
        }
        this._positionWidget(lines, this._elements, 0, 0, 0);
    };
    DashboardComponent.prototype._positionWidget = function (lines, items, index, column, row) {
        if (!items[index]) {
            var remainingHeight = 0;
            for (var i = 0; i < lines.length; i++) {
                if (remainingHeight < lines[i]) {
                    remainingHeight = lines[i];
                }
                lines[i]--;
            }
            if (remainingHeight > 0) {
                this._positionWidget(lines, items, index, column, row + 1);
            }
            else {
                var height = row * this.widgetsSize[1] + row * this.margin;
                this._renderer.setStyle(this._ngEl.nativeElement, 'height', height + 'px');
            }
            return;
        }
        var item = items[index].instance;
        item.width = this.widgetsSize[0] * item.size[0] + (item.size[0] - 1) * this.margin;
        item.height = this.widgetsSize[1] * item.size[1] + (item.size[1] - 1) * this.margin;
        var haveEnoughSpace = column + item.size[0] - 1 <= this._nbColumn;
        while (lines[column] > 0 || !haveEnoughSpace) {
            column++;
            haveEnoughSpace = column + item.size[0] - 1 <= this._nbColumn;
            if (column >= this._nbColumn) {
                column = 0;
                for (var i = 0; i < lines.length; i++) {
                    lines[i]--;
                }
                row++;
                haveEnoughSpace = column + item.size[0] - 1 <= this._nbColumn;
            }
            if (!haveEnoughSpace)
                continue;
            for (var i = 1; i < item.size[0]; i++) {
                haveEnoughSpace = lines[column + i] <= 0;
                if (!haveEnoughSpace)
                    break;
            }
        }
        var left = column * this.widgetsSize[0] + column * this.margin + this.margin / 2;
        var top = row * this.widgetsSize[1] + row * this.margin + this.margin / 2;
        lines[column] = item.size[1];
        for (var i = 1; i < item.size[0]; i++) {
            lines[column + i] = item.size[1];
        }
        item.setPosition(top, left);
        this._positionWidget(lines, items, index + 1, column, row);
    };
    DashboardComponent.prototype._calculSizeAndColumn = function () {
        this._width = this._ngEl.nativeElement.offsetWidth;
        this._nbColumn = Math.floor(this._width / (this.widgetsSize[0] + this.margin));
    };
    DashboardComponent.prototype._onResize = function (e) {
        this._calculSizeAndColumn();
        this._calculPositions();
    };
    DashboardComponent.prototype._onMouseDown = function (e, widget) {
        this._isDragging = this.dragEnable && e.target === widget.handle;
        if (this._isDragging) {
            this.onDragStart.emit(widget);
            widget.addClass('active');
            this._currentElement = widget;
            this._offset = this._getOffsetFromTarget(e);
            this._enableAnimation();
            this._lastOrder = this.order;
            if (this._isTouchEvent(e)) {
                e.preventDefault();
                e.stopPropagation();
            }
        }
        return true;
    };
    Object.defineProperty(DashboardComponent.prototype, "order", {
        get: function () {
            return this._elements.map(function (elt) { return elt.instance.widgetId; });
        },
        enumerable: true,
        configurable: true
    });
    DashboardComponent.prototype._onMouseMove = function (e) {
        if (this._isDragging) {
            this.onDrag.emit(this._currentElement);
            var pos = this._getMousePosition(e);
            var left = pos.left - this._offset.left;
            var top_1 = pos.top - this._offset.top;
            if (Math.abs(pos.top - this._previousPosition.top) > this.THRESHOLD
                || Math.abs(pos.left - this._previousPosition.left) > this.THRESHOLD) {
                this._elements.sort(this._compare);
                this._calculPositions();
                this._previousPosition = pos;
            }
            this._currentElement.setPosition(top_1, left);
            if (this._isTouchEvent(e)) {
                e.preventDefault();
                e.stopPropagation();
            }
        }
        return true;
    };
    DashboardComponent.prototype._onMouseUp = function (e) {
        if (this._isDragging) {
            this._isDragging = false;
            if (this._currentElement) {
                this.onDragEnd.emit(this._currentElement);
                this._currentElement.removeClass('active');
                this._currentElement.addClass('animate');
            }
            this._currentElement = null;
            this._offset = null;
            this._calculPositions();
            this._disableAnimation();
            if (this._isTouchEvent(e)) {
                e.preventDefault();
                e.stopPropagation();
            }
            var currentOrder = this.order;
            var isOrderChanged = JSON.stringify(this._lastOrder) != JSON.stringify(currentOrder);
            if (isOrderChanged) {
                this.onOrderChange.emit(this.order);
            }
        }
        return true;
    };
    DashboardComponent.prototype._manageEvent = function (e) {
        if (this._isTouchEvent(e)) {
            e = e.touches.length > 0 ? e.touches[0] : e.changedTouches[0];
        }
        return e;
    };
    DashboardComponent.prototype._isTouchEvent = function (e) {
        return (window.TouchEvent && e instanceof TouchEvent) || (e.touches || e.changedTouches);
    };
    DashboardComponent.prototype._getOffsetFromTarget = function (e) {
        var x;
        var y;
        if (this._isTouchEvent(e)) {
            e = e.touches.length > 0 ? e.touches[0] : e.changedTouches[0];
            x = e.pageX - e.target.offsetLeft;
            y = e.pageY - e.target.offsetTop;
        }
        else {
            x = e.offsetX || e.offsetLeft;
            y = e.offsetY || e.offsetTop;
        }
        return { top: y, left: x };
    };
    DashboardComponent.prototype._getMousePosition = function (e) {
        e = this._manageEvent(e);
        var refPos = this._ngEl.nativeElement.getBoundingClientRect();
        var left = e.clientX - refPos.left;
        var top = e.clientY - refPos.top;
        return {
            left: left,
            top: top
        };
    };
    DashboardComponent.prototype._compare = function (widget1, widget2) {
        if (widget1.instance.offset.top > widget2.instance.offset.top + widget2.instance.height / 2) {
            return +1;
        }
        if (widget2.instance.offset.top > widget1.instance.offset.top + widget1.instance.height / 2) {
            return -1;
        }
        if ((widget1.instance.offset.left + (widget1.instance.width / 2)) > (widget2.instance.offset.left + (widget2.instance.width / 2))) {
            return +1;
        }
        if ((widget2.instance.offset.left + (widget2.instance.width / 2)) > (widget1.instance.offset.left + (widget1.instance.width / 2))) {
            return -1;
        }
        return 0;
    };
    ;
    DashboardComponent.prototype._enableAnimation = function () {
        var _this = this;
        this._elements.forEach(function (item) {
            if (item.instance != _this._currentElement) {
                item.instance.addClass('animate');
            }
        });
    };
    DashboardComponent.prototype._disableAnimation = function () {
        var _this = this;
        setTimeout(function () {
            _this._elements.forEach(function (item) {
                item.instance.removeClass('animate');
            });
        }, 400);
    };
    return DashboardComponent;
}());
DashboardComponent.decorators = [
    { type: core_1.Component, args: [{
                selector: 'dashboard',
                template: '<div #target><ng-content></ng-content></div>',
                host: {
                    '(window:resize)': '_onResize($event)',
                    '(document:mousemove)': '_onMouseMove($event)',
                    '(document:mouseup)': '_onMouseUp($event)',
                    '(document:touchmove)': '_onMouseMove($event)',
                    '(document:touchend)': '_onMouseUp($event)',
                    '(document:touchcancel)': '_onMouseUp($event)'
                },
                styles: ["\n    :host {\n      position: relative;\n      display: block;\n    }\n    \n    :host /deep/ .widget {\n      position: absolute;\n      top: 0;\n      left: 0;\n      -webkit-touch-callout: none; /* iOS Safari */\n      -webkit-user-select: none; /* Chrome/Safari/Opera */\n      -khtml-user-select: none; /* Konqueror */\n      -moz-user-select: none; /* Firefox */\n      -ms-user-select: none; /* Internet Explorer/Edge */\n      user-select: none;\n      /* Non-prefixed version, currently\n                             not supported by any browser */\n    }\n    \n    :host /deep/ .widget.animate {\n      -webkit-transition: all 300ms ease-out;\n      -moz-transition: all 300ms ease-out;\n      -o-transition: all 300ms ease-out;\n      transition: all 300ms ease-out;\n    }\n    \n    :host /deep/ .widget.active {\n      z-index: 100000;\n    }"
                ]
            },] },
];
/** @nocollapse */
DashboardComponent.ctorParameters = function () { return [
    { type: core_1.ComponentFactoryResolver, },
    { type: core_1.ElementRef, },
    { type: core_1.Renderer2, },
]; };
DashboardComponent.propDecorators = {
    'onDragStart': [{ type: core_1.Output },],
    'onDrag': [{ type: core_1.Output },],
    'onDragEnd': [{ type: core_1.Output },],
    'onOrderChange': [{ type: core_1.Output },],
    'margin': [{ type: core_1.Input },],
    'widgetsSize': [{ type: core_1.Input },],
    'THRESHOLD': [{ type: core_1.Input },],
    '_viewCntRef': [{ type: core_1.ViewChild, args: ['target', { read: core_1.ViewContainerRef },] },],
    '_items': [{ type: core_1.ContentChildren, args: [widget_component_1.WidgetComponent,] },],
};
exports.DashboardComponent = DashboardComponent;


/***/ }),

/***/ 129:
/***/ (function(module, exports) {

function webpackEmptyContext(req) {
	throw new Error("Cannot find module '" + req + "'.");
}
webpackEmptyContext.keys = function() { return []; };
webpackEmptyContext.resolve = webpackEmptyContext;
module.exports = webpackEmptyContext;
webpackEmptyContext.id = 129;


/***/ }),

/***/ 130:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__polyfills_ts__ = __webpack_require__(139);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_platform_browser_dynamic__ = __webpack_require__(135);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__angular_core__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__environments_environment__ = __webpack_require__(138);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__app___ = __webpack_require__(137);





if (__WEBPACK_IMPORTED_MODULE_3__environments_environment__["a" /* environment */].production) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__angular_core__["enableProdMode"])();
}
__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__angular_platform_browser_dynamic__["a" /* platformBrowserDynamic */])().bootstrapModule(__WEBPACK_IMPORTED_MODULE_4__app___["a" /* AppModule */]);
//# sourceMappingURL=main.js.map

/***/ }),

/***/ 136:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_platform_browser__ = __webpack_require__(42);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_core__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__angular_forms__ = __webpack_require__(133);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__angular_http__ = __webpack_require__(134);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__dist__ = __webpack_require__(76);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__dist___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4__dist__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__app_component__ = __webpack_require__(79);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__my_widget_my_widget_component__ = __webpack_require__(80);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AppModule; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};







var AppModule = (function () {
    function AppModule() {
    }
    return AppModule;
}());
AppModule = __decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__angular_core__["NgModule"])({
        declarations: [
            __WEBPACK_IMPORTED_MODULE_5__app_component__["a" /* AppComponent */],
            __WEBPACK_IMPORTED_MODULE_6__my_widget_my_widget_component__["a" /* MyWidgetComponent */]
        ],
        entryComponents: [
            __WEBPACK_IMPORTED_MODULE_6__my_widget_my_widget_component__["a" /* MyWidgetComponent */]
        ],
        imports: [
            __WEBPACK_IMPORTED_MODULE_0__angular_platform_browser__["a" /* BrowserModule */],
            __WEBPACK_IMPORTED_MODULE_2__angular_forms__["a" /* FormsModule */],
            __WEBPACK_IMPORTED_MODULE_3__angular_http__["a" /* HttpModule */],
            __WEBPACK_IMPORTED_MODULE_4__dist__["NgDashboardModule"]
        ],
        providers: [],
        bootstrap: [__WEBPACK_IMPORTED_MODULE_5__app_component__["a" /* AppComponent */]]
    })
], AppModule);

//# sourceMappingURL=app.module.js.map

/***/ }),

/***/ 137:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__app_component__ = __webpack_require__(79);
/* unused harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__app_module__ = __webpack_require__(136);
/* harmony namespace reexport (by used) */ __webpack_require__.d(__webpack_exports__, "a", function() { return __WEBPACK_IMPORTED_MODULE_1__app_module__["a"]; });


//# sourceMappingURL=index.js.map

/***/ }),

/***/ 138:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return environment; });
// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `angular-cli.json`.
// The file contents for the current environment will overwrite these during build.
var environment = {
    production: false
};
//# sourceMappingURL=environment.js.map

/***/ }),

/***/ 139:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_core_js_es6_symbol__ = __webpack_require__(153);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_core_js_es6_symbol___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_core_js_es6_symbol__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_core_js_es6_object__ = __webpack_require__(146);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_core_js_es6_object___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_core_js_es6_object__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_core_js_es6_function__ = __webpack_require__(142);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_core_js_es6_function___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_core_js_es6_function__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_core_js_es6_parse_int__ = __webpack_require__(148);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_core_js_es6_parse_int___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_core_js_es6_parse_int__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_core_js_es6_parse_float__ = __webpack_require__(147);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_core_js_es6_parse_float___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4_core_js_es6_parse_float__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_core_js_es6_number__ = __webpack_require__(145);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_core_js_es6_number___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_5_core_js_es6_number__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6_core_js_es6_math__ = __webpack_require__(144);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6_core_js_es6_math___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_6_core_js_es6_math__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7_core_js_es6_string__ = __webpack_require__(152);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7_core_js_es6_string___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_7_core_js_es6_string__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8_core_js_es6_date__ = __webpack_require__(141);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8_core_js_es6_date___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_8_core_js_es6_date__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9_core_js_es6_array__ = __webpack_require__(140);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9_core_js_es6_array___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_9_core_js_es6_array__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10_core_js_es6_regexp__ = __webpack_require__(150);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10_core_js_es6_regexp___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_10_core_js_es6_regexp__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_11_core_js_es6_map__ = __webpack_require__(143);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_11_core_js_es6_map___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_11_core_js_es6_map__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_12_core_js_es6_set__ = __webpack_require__(151);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_12_core_js_es6_set___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_12_core_js_es6_set__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_13_core_js_es6_reflect__ = __webpack_require__(149);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_13_core_js_es6_reflect___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_13_core_js_es6_reflect__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_14_core_js_es7_reflect__ = __webpack_require__(154);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_14_core_js_es7_reflect___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_14_core_js_es7_reflect__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_15_zone_js_dist_zone__ = __webpack_require__(320);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_15_zone_js_dist_zone___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_15_zone_js_dist_zone__);
// This file includes polyfills needed by Angular 2 and is loaded before
// the app. You can add your own extra polyfills to this file.
















//# sourceMappingURL=polyfills.js.map

/***/ }),

/***/ 291:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(52)();
// imports


// module
exports.push([module.i, ".dashboard {\n  width: 100%;\n  overflow: hidden;\n  background: whitesmoke;\n}\n\n.dashboard /deep/ .widget {\n  background-color: darkgrey;\n}\n\n.widget .close {\n  position: absolute;\n  top: 5px;\n  right: 5px;\n  cursor: pointer;\n}\n\n.handle {\n  cursor: move;\n}\n", ""]);

// exports


/*** EXPORTS FROM exports-loader ***/
module.exports = module.exports.toString();

/***/ }),

/***/ 292:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(52)();
// imports


// module
exports.push([module.i, "", ""]);

// exports


/*** EXPORTS FROM exports-loader ***/
module.exports = module.exports.toString();

/***/ }),

/***/ 294:
/***/ (function(module, exports) {

module.exports = "<h1>\n  {{title}}\n</h1>\n<button (click)=\"addWidget()\">Add widget</button>\n<br><br>\n<dashboard (onOrderChange)=\"logOrder($event)\" (onDragStart)=\"log($event, 'ondragstart')\"\n           (onDragEnd)=\"log($event, 'ondragend')\"\n           (onDrag)=\"log($event, 'ondragmove')\" class=\"dashboard\" [widgetsSize]=\"widgetsSize\"\n           [margin]=\"dashboardMargin\">\n\n  <widget [size]=\"[2, 2]\" widgetId=\"big\" class=\"handle\">\n    <div class=\"head\">Big widget [2, 2]</div>\n  </widget>\n  <!--widget [size]=\"[1, 1]\" widgetId=\"small\" class=\"handle\">\n    <div class=\"head\">Small widget [1, 1]</div>\n  </widget>\n  <widget [size]=\"[1, 1]\" widgetId=\"small2\" class=\"handle\">\n    <div class=\"head\">Small widget [1, 1]</div>\n  </widget>\n  <!--widget [size]=\"[1, 1]\" widgetId=\"small3\" class=\"handle\">\n    <div class=\"head\">Small widget [1, 1]</div>\n  </widget>\n\n  <widget [size]=\"[2, 3]\" widgetId=\"big2\" class=\"handle\">\n    <div class=\"head\">Big widget [2, 3]</div>\n  </widget>\n  <widget [size]=\"[1, 1]\" widgetId=\"small4\" class=\"handle\">\n    <div class=\"head\">Small widget [1, 1]</div>\n  </widget>\n  <widget [size]=\"[1, 1]\" widgetId=\"small5\" class=\"handle\">\n    <div class=\"head\">Small widget [1, 1]</div>\n  </widget-->\n\n  <widget [size]=\"[2, 1]\" widgetId=\"large\">\n    <div widgetHandle class=\"head handle\">Large widget [2, 1] handle only on text</div>\n  </widget>\n  <widget [size]=\"[1, 2]\" widgetId=\"tall\">\n    <div widgetHandle class=\"head handle\">Tall widget [1, 2] handle only on text</div>\n  </widget>\n  <widget widgetId=\"small\" class=\"handle\">\n    <div class=\"head\">Small widget [1, 1]</div>\n  </widget>\n  <widget [size]=\"[2, 2]\" widgetId=\"big\" class=\"handle\">\n    <div class=\"head\">Big widget [2, 2]</div>\n  </widget>\n  <widget *ngFor=\"let item of [1, 2, 3, 4, 5, 6]; let i = index;\" [widgetId]=\"i\" class=\"handle\">\n    <div class=\"head\">Widget {{i}} [1, 1]</div>\n    <div class=\"close\" (click)=\"close($event, i)\">X</div>\n  </widget>\n\n</dashboard>\n"

/***/ }),

/***/ 295:
/***/ (function(module, exports) {

module.exports = "<div widgetHandle>DRAG ME</div>\n\n<p>\n  my custom widget <b>works</b>!\n</p>\n<ng-content></ng-content>\n"

/***/ }),

/***/ 318:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = __webpack_require__(9);
var dashboard_component_1 = __webpack_require__(128);
var widget_component_1 = __webpack_require__(74);
var widget_handle_directive_1 = __webpack_require__(75);
var NgDashboardModule = (function () {
    function NgDashboardModule() {
    }
    return NgDashboardModule;
}());
NgDashboardModule.decorators = [
    { type: core_1.NgModule, args: [{
                declarations: [
                    dashboard_component_1.DashboardComponent,
                    widget_component_1.WidgetComponent,
                    widget_handle_directive_1.WidgetHandleDirective
                ],
                exports: [
                    dashboard_component_1.DashboardComponent,
                    widget_component_1.WidgetComponent,
                    widget_handle_directive_1.WidgetHandleDirective
                ],
                providers: []
            },] },
];
/** @nocollapse */
NgDashboardModule.ctorParameters = function () { return []; };
exports.NgDashboardModule = NgDashboardModule;


/***/ }),

/***/ 321:
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(130);


/***/ }),

/***/ 74:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = __webpack_require__(9);
var widget_handle_directive_1 = __webpack_require__(75);
var WidgetComponent = (function () {
    function WidgetComponent(_ngEl, _renderer) {
        this._ngEl = _ngEl;
        this._renderer = _renderer;
        this.size = [1, 1];
    }
    WidgetComponent.prototype.ngOnInit = function () {
        this._renderer.addClass(this._ngEl.nativeElement, 'widget');
    };
    Object.defineProperty(WidgetComponent.prototype, "element", {
        get: function () {
            return this._ngEl.nativeElement;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WidgetComponent.prototype, "offset", {
        get: function () {
            return this._ngEl.nativeElement.getBoundingClientRect();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WidgetComponent.prototype, "width", {
        get: function () {
            return this._ngEl.nativeElement.offsetWidth;
        },
        set: function (width) {
            this._renderer.setStyle(this._ngEl.nativeElement, 'width', width + 'px');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WidgetComponent.prototype, "height", {
        get: function () {
            return this._ngEl.nativeElement.offsetHeight;
        },
        set: function (height) {
            this._renderer.setStyle(this._ngEl.nativeElement, 'height', height + 'px');
        },
        enumerable: true,
        configurable: true
    });
    WidgetComponent.prototype.setPosition = function (top, left) {
        this._renderer.setStyle(this._ngEl.nativeElement, 'top', top + 'px');
        this._renderer.setStyle(this._ngEl.nativeElement, 'left', left + 'px');
    };
    WidgetComponent.prototype.setEventListener = function (cbMouse) {
        var _this = this;
        if (this._handle) {
            this._renderer.listen(this._handle.element, 'mousedown', function (e) { return cbMouse(e, _this); });
            this._renderer.listen(this._handle.element, 'touchstart', function (e) { return cbMouse(e, _this); });
        }
        else {
            this._renderer.listen(this._ngEl.nativeElement, 'mousedown', function (e) { return cbMouse(e, _this); });
            this._renderer.listen(this._ngEl.nativeElement, 'touchstart', function (e) { return cbMouse(e, _this); });
        }
    };
    WidgetComponent.prototype.addClass = function (myClass) {
        this._renderer.addClass(this._ngEl.nativeElement, myClass);
    };
    WidgetComponent.prototype.removeClass = function (myClass) {
        this._renderer.removeClass(this._ngEl.nativeElement, myClass);
    };
    Object.defineProperty(WidgetComponent.prototype, "handle", {
        get: function () {
            return this._handle ? this._handle.element : this.element;
        },
        enumerable: true,
        configurable: true
    });
    WidgetComponent.prototype.removeFromParent = function () {
        this._ngEl.nativeElement.remove();
    };
    return WidgetComponent;
}());
WidgetComponent.decorators = [
    { type: core_1.Component, args: [{
                selector: 'widget',
                template: '<ng-content></ng-content>'
            },] },
];
/** @nocollapse */
WidgetComponent.ctorParameters = function () { return [
    { type: core_1.ElementRef, },
    { type: core_1.Renderer2, },
]; };
WidgetComponent.propDecorators = {
    'size': [{ type: core_1.Input },],
    'widgetId': [{ type: core_1.Input },],
    '_handle': [{ type: core_1.ContentChild, args: [widget_handle_directive_1.WidgetHandleDirective,] },],
};
exports.WidgetComponent = WidgetComponent;


/***/ }),

/***/ 75:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = __webpack_require__(9);
var WidgetHandleDirective = (function () {
    function WidgetHandleDirective(_ngEl) {
        this._ngEl = _ngEl;
    }
    Object.defineProperty(WidgetHandleDirective.prototype, "element", {
        get: function () {
            return this._ngEl.nativeElement;
        },
        enumerable: true,
        configurable: true
    });
    return WidgetHandleDirective;
}());
WidgetHandleDirective.decorators = [
    { type: core_1.Directive, args: [{
                selector: '[widgetHandle]',
                exportAs: 'widgetHandle'
            },] },
];
/** @nocollapse */
WidgetHandleDirective.ctorParameters = function () { return [
    { type: core_1.ElementRef, },
]; };
exports.WidgetHandleDirective = WidgetHandleDirective;


/***/ }),

/***/ 76:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(318));
__export(__webpack_require__(74));
__export(__webpack_require__(128));
__export(__webpack_require__(75));


/***/ }),

/***/ 79:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__dist__ = __webpack_require__(76);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__dist___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__dist__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__my_widget_my_widget_component__ = __webpack_require__(80);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AppComponent; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};



var AppComponent = (function () {
    function AppComponent() {
        this.title = 'app works!';
        this.widgetsSize = [300, 150];
        this.dashboardMargin = 20;
    }
    AppComponent.prototype.ngOnInit = function () {
        this._onResize(null);
    };
    AppComponent.prototype._onResize = function (event) {
        if (window.innerWidth < 750) {
            this.dashboardMargin = 10;
            this.widgetsSize = [this.dashboard.width / 2 - this.dashboardMargin, 150];
        }
        else {
            this.dashboardMargin = 20;
            var nbColumn = Math.floor(this.dashboard.width / (300 + this.dashboardMargin));
            this.widgetsSize = [this.dashboard.width / nbColumn - this.dashboardMargin, 150];
        }
    };
    AppComponent.prototype.log = function (widget, type) {
        console.log(widget, type);
    };
    AppComponent.prototype.logOrder = function (order) {
        console.log(order, 'orderchange');
    };
    AppComponent.prototype.addWidget = function () {
        var ref = this.dashboard.addItem(__WEBPACK_IMPORTED_MODULE_2__my_widget_my_widget_component__["a" /* MyWidgetComponent */]);
        ref.widgetId = Math.random() + '';
    };
    AppComponent.prototype.close = function (e, id) {
        this.dashboard.removeItemById(id);
        e.preventDefault();
        e.stopPropagation();
    };
    return AppComponent;
}());
__decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["ViewChild"])(__WEBPACK_IMPORTED_MODULE_1__dist__["DashboardComponent"]),
    __metadata("design:type", typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_1__dist__["DashboardComponent"] !== "undefined" && __WEBPACK_IMPORTED_MODULE_1__dist__["DashboardComponent"]) === "function" && _a || Object)
], AppComponent.prototype, "dashboard", void 0);
AppComponent = __decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
        selector: 'app-root',
        template: __webpack_require__(294),
        styles: [__webpack_require__(291)],
        host: {
            '(window:resize)': '_onResize($event)',
        }
    }),
    __metadata("design:paramtypes", [])
], AppComponent);

var _a;
//# sourceMappingURL=app.component.js.map

/***/ }),

/***/ 80:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__dist__ = __webpack_require__(76);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__dist___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__dist__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return MyWidgetComponent; });
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};


var forwardReference = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["forwardRef"])(function () { return MyWidgetComponent; });
var MyWidgetComponent = (function (_super) {
    __extends(MyWidgetComponent, _super);
    function MyWidgetComponent(ngEl, renderer) {
        var _this = _super.call(this, ngEl, renderer) || this;
        _this.size = [1, 1];
        return _this;
    }
    return MyWidgetComponent;
}(__WEBPACK_IMPORTED_MODULE_1__dist__["WidgetComponent"]));
__decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Input"])(),
    __metadata("design:type", Array)
], MyWidgetComponent.prototype, "size", void 0);
__decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Input"])(),
    __metadata("design:type", String)
], MyWidgetComponent.prototype, "widgetId", void 0);
__decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["ViewChild"])(__WEBPACK_IMPORTED_MODULE_1__dist__["WidgetHandleDirective"]),
    __metadata("design:type", typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_1__dist__["WidgetHandleDirective"] !== "undefined" && __WEBPACK_IMPORTED_MODULE_1__dist__["WidgetHandleDirective"]) === "function" && _a || Object)
], MyWidgetComponent.prototype, "_handle", void 0);
MyWidgetComponent = __decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
        selector: 'app-my-widget',
        template: __webpack_require__(295),
        styles: [__webpack_require__(292)],
        providers: [{ provide: __WEBPACK_IMPORTED_MODULE_1__dist__["WidgetComponent"], useExisting: forwardReference }]
    }),
    __metadata("design:paramtypes", [typeof (_b = typeof __WEBPACK_IMPORTED_MODULE_0__angular_core__["ElementRef"] !== "undefined" && __WEBPACK_IMPORTED_MODULE_0__angular_core__["ElementRef"]) === "function" && _b || Object, typeof (_c = typeof __WEBPACK_IMPORTED_MODULE_0__angular_core__["Renderer2"] !== "undefined" && __WEBPACK_IMPORTED_MODULE_0__angular_core__["Renderer2"]) === "function" && _c || Object])
], MyWidgetComponent);

var _a, _b, _c;
//# sourceMappingURL=my-widget.component.js.map

/***/ })

},[321]);
//# sourceMappingURL=main.bundle.js.map