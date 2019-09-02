import { Subscription } from "rxjs";
import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { NavController, LoadingController } from "@ionic/angular";

import { Place } from "../../places.model";
import { PlacesService } from "./../../places.service";

@Component({
  selector: "app-offer-bookings",
  templateUrl: "./offer-bookings.page.html",
  styleUrls: ["./offer-bookings.page.scss"]
})
export class OfferBookingsPage implements OnInit, OnDestroy {
  place: Place;
  placeId: string;
  isLoading: boolean = false;
  private placesSub: Subscription;

  constructor(
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private placesService: PlacesService,
    private loadingController: LoadingController
  ) {}

  ngOnInit() {
    this.isLoading = true;
    this.route.paramMap.subscribe(paramMap => {
      if (!paramMap.has("locationId")) {
        this.placeId = paramMap.get("locationId");
        this.navCtrl.navigateBack("/places/tabs/offers");
        return;
      }
      this.loadingController
        .create({
          message: "Please wait ..."
        })
        .then(loadingEl => {
          loadingEl.present();
          this.placesSub = this.placesService
            .getPlace(paramMap.get("locationId"))
            .subscribe(place => {
              this.place = place;
              this.isLoading = false;
              loadingEl.dismiss();
            });
        });
    });
  }

  ionViewDidEnter() {}
  ngOnDestroy(): void {
    if (this.placesSub) {
      this.placesSub.unsubscribe();
    }
  }
}
