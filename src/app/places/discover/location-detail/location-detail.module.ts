import { CreateBookingComponent } from "./../../../bookings/create-booking/create-booking.component";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Routes, RouterModule } from "@angular/router";

import { IonicModule } from "@ionic/angular";

import { LocationDetailPage } from "./location-detail.page";

const routes: Routes = [
  {
    path: "",
    component: LocationDetailPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [LocationDetailPage, CreateBookingComponent],
  entryComponents: [CreateBookingComponent]
})
export class LocationDetailPageModule {}
