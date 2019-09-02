import { Component, OnInit, OnDestroy } from "@angular/core";
import { Router } from "@angular/router";
import { IonItemSliding, LoadingController } from "@ionic/angular";
import { Subscription } from "rxjs";

import { AuthService } from "src/app/auth/auth.service";
import { PlacesService } from "../places.service";
import { Place } from "../places.model";
import { take } from "rxjs/operators";

@Component({
  selector: "app-offers",
  templateUrl: "./offers.page.html",
  styleUrls: ["./offers.page.scss"]
})
export class OffersPage implements OnInit, OnDestroy {
  offers: Place[];
  isLoading: boolean = false;
  private placesSub: Subscription;
  private user: string;

  constructor(
    private placesService: PlacesService,
    private router: Router,
    private loadingController: LoadingController,
    private authService: AuthService
  ) {}

  ngOnInit() {}
  ionViewWillEnter() {
    this.isLoading = true;
    this.loadingController
      .create({
        message: "Loading places..."
      })
      .then(loadingEl => {
        loadingEl.present();
        this.authService.userId
          .pipe(take(1))
          .subscribe(userId => (this.user = userId));
        this.placesSub = this.placesService.getAllPlaces().subscribe(places => {
          this.isLoading = false;
          this.offers = places.filter(place => {
            return place.userId === this.user;
          });
          loadingEl.dismiss();
        });
      });
    if (!this.offers) {
      this.isLoading = true;
    }
  }
  ngOnDestroy(): void {
    if (this.placesSub) {
      this.placesSub.unsubscribe();
    }
  }
  handleEdit(id: string, slidingItem: IonItemSliding) {
    slidingItem.close();
    this.router.navigate(["/", "places", "tabs", "offers", "edit", id]);
  }
  handleViewOffer(offerId: string) {
    this.router.navigate(["/", "places", "tabs", "discover", offerId]);
  }
  handleDelete(id: string, slidingItem: IonItemSliding) {
    slidingItem.close();
    this.loadingController
      .create({
        message: "Canceling Booking!"
      })
      .then(loadingEl => {
        loadingEl.present();
        this.placesService.deletePlace(id).subscribe(() => {
          loadingEl.dismiss();
          this.offers = this.offers.filter(p => p.id !== id);
        });
      });
  }
}
