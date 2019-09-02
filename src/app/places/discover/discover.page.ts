import { LoadingController } from "@ionic/angular";
import { Subscription } from "rxjs";
import { Component, OnInit, OnDestroy } from "@angular/core";
import { PlacesService } from "../places.service";
import { SegmentChangeEventDetail } from "@ionic/core";

import { Place } from "../places.model";
import { AuthService } from "./../../auth/auth.service";
import { take } from "rxjs/operators";

@Component({
  selector: "app-discover",
  templateUrl: "./discover.page.html",
  styleUrls: ["./discover.page.scss"]
})
export class DiscoverPage implements OnInit, OnDestroy {
  currentPlaces: Place[];
  isLoading: boolean = false;
  private plasesSub: Subscription;
  public relaventPlaces: Place[];

  constructor(
    private placesService: PlacesService,
    private authService: AuthService,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {}

  ionViewWillEnter() {
    this.isLoading = true;
    this.loadingCtrl
      .create({
        message: "Please wait while places are loading..."
      })
      .then(loadingEl => {
        loadingEl.present();
        this.plasesSub = this.placesService.getAllPlaces().subscribe(places => {
          this.currentPlaces = places;
          this.relaventPlaces = this.currentPlaces;
          loadingEl.dismiss();
          this.isLoading = false;
        });
      });
  }

  ngOnDestroy(): void {
    if (this.plasesSub) {
      this.plasesSub.unsubscribe();
    }
  }
  handleFilterUpdate(event: CustomEvent<SegmentChangeEventDetail>) {
    this.authService.userId.pipe(take(1)).subscribe(userId => {
      this.relaventPlaces = [];
      if (event.detail.value === "all") {
        this.relaventPlaces = this.currentPlaces;
      }
      if (event.detail.value === "bookable") {
        this.relaventPlaces = this.currentPlaces.filter(place => {
          return place.userId !== userId;
        });
      }
    });
  }
}
