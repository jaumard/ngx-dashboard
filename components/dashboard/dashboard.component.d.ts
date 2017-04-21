import {WidgetComponent} from "../widget/widget.component";
import {EventEmitter, QueryList, ViewContainerRef, SimpleChanges, Type} from "@angular/core";
export declare class DashboardComponent {
  onDragStart: EventEmitter<WidgetComponent>;
  onDrag: EventEmitter<WidgetComponent>;
  onDragEnd: EventEmitter<WidgetComponent>;
  margin: number;
  widgetsSize: number[];
  dragEnable: boolean;

  private _width: number;
  private _nbColumn: number;
  private _isDragging: boolean;
  private _currentElement: WidgetComponent;
  private _elements: WidgetComponent[];
  private _offset: any;
  private _items: QueryList<WidgetComponent>;
  private _viewCntRef: ViewContainerRef;

  get width(): number;

  get height(): number;

  addItem<T extends WidgetComponent>(ngItem: Type<T>): T;

  ngOnChanges(changes: SimpleChanges): void;

  ngAfterViewInit(): void;

  enableDrag(): void;

  disableDrag(): void;

  getWidgetById(widgetId: string): WidgetComponent;

  removeItem(ngItem: WidgetComponent): void;

  removeItemByIndex(index: Number): void;

  removeItemById(id: string): void;

  clearItems(): void;

  private _removeElement(widget: WidgetComponent): void;

  private _calculPositions(): void;

  private _positionWidget(lines: number[], items: WidgetComponent[], index: number, column: number, row: number): void;

  private _calculSizeAndColumn(): void;

  private _onResize(e: any): void;

  private _onMouseDown(e: any, widget: WidgetComponent): boolean;

  private _onMouseMove(e: any): boolean;

  private _onMouseUp(e: any): boolean;

  private _manageEvent(e: any): any;

  private _isTouchEvent(e: any): any;

  private _getOffsetFromTarget(e: any);

  private _getMousePosition(e: any): any;

  private _compare(widget1: WidgetComponent, widget2: WidgetComponent): number;

  private _enableAnimation(): void;

  private _disableAnimation(): void;

}
