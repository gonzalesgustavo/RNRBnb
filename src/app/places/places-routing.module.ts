import { NgModule } from "@angular/core";
import { PlacesPage } from "./places.page";
import { RouterModule, Routes } from "@angular/router";

const routes: Routes = [
  {
    path: "tabs",
    component: PlacesPage,
    children: [
      {
        path: "discover",
        children: [
          {
            path: "",
            loadChildren: "./discover/discover.module#DiscoverPageModule"
          },
          {
            path: ":locationId",
            loadChildren:
              "./discover/location-detail/location-detail.module#LocationDetailPageModule"
          }
        ]
      },
      {
        path: "offers",
        children: [
          {
            path: "",
            loadChildren: "./offers/offers.module#OffersPageModule"
          },
          {
            path: "new",
            loadChildren:
              "./offers/new-offer/new-offer.module#NewOfferPageModule"
          },
          {
            path: "edit/:locationId",
            loadChildren:
              "./offers/edit-offer/edit-offer.module#EditOfferPageModule"
          }
        ]
      },
      {
        path: "",
        redirectTo: "/places/tabs/discover",
        pathMatch: "full"
      }
    ]
  },
  {
    path: "",
    redirectTo: "/places/tabs/discover",
    pathMatch: "full"
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PlacesRoutingModule {}
