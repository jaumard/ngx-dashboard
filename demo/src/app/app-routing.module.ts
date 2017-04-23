import {NgModule} from "@angular/core";
import {Routes, RouterModule} from "@angular/router";

const routes: Routes = [];
const routesImport = RouterModule.forRoot(routes);

@NgModule({
  imports: [routesImport],
  exports: [RouterModule],
  providers: []
})
export class DemoRoutingModule { }
