import { NgModule } from "@angular/core";
import { PreloadAllModules, RouterModule, Routes } from "@angular/router";

import { AuthGuard } from "./auth/auth.guard";

const routes: Routes = [
  { path: "", redirectTo: "places", pathMatch: "full" },
  {
    path: "places",
    loadChildren: "./places/places.module#PlacesPageModule",
    canLoad: [AuthGuard]
  }, //top level
  { path: "auth", loadChildren: "./auth/auth.module#AuthPageModule" }, //top level

  {
    path: "bookings",
    loadChildren: "./bookings/bookings.module#BookingsPageModule",
    canLoad: [AuthGuard]
  } //top level
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
