import { Subscription } from "rxjs";
import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import {
  NavController,
  ModalController,
  ActionSheetController,
  LoadingController,
  AlertController
} from "@ionic/angular";

import { CreateBookingComponent } from "./../../../bookings/create-booking/create-booking.component";
import { AuthService } from "src/app/auth/auth.service";
import { BookingsService } from "./../../../bookings/bookings.service";
import { PlacesService } from "../../places.service";
import { Place } from "../../places.model";
import { take, switchMap } from "rxjs/operators";

@Component({
  selector: "app-location-detail",
  templateUrl: "./location-detail.page.html",
  styleUrls: ["./location-detail.page.scss"]
})
export class LocationDetailPage implements OnInit, OnDestroy {
  place: Place;
  placeId: string;
  isBookable: boolean = false;
  isLoading: boolean = false;
  private placesSub: Subscription;

  constructor(
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private placesService: PlacesService,
    private modalCtrl: ModalController,
    private actionSheetCtrl: ActionSheetController,
    private bookingService: BookingsService,
    private loadingCtrl: LoadingController,
    private authService: AuthService,
    private alertCtrl: AlertController,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if (!paramMap.has("locationId")) {
        this.navCtrl.navigateBack("/places/tabs/discover");
        return;
      }
      this.isLoading = true;
      this.placeId = paramMap.get("locationId");
      this.loadingCtrl
        .create({
          message: "Please Wait..."
        })
        .then(loadingEl => {
          loadingEl.present();
          let fetchedUserId: string;
          this.placesSub = this.authService.userId
            .pipe(
              take(1),
              switchMap(userId => {
                if (!userId) {
                  throw new Error("Found no userId!");
                }
                fetchedUserId = userId;
                return this.placesService.getPlace(paramMap.get("locationId"));
              })
            )
            .subscribe(
              place => {
                this.place = place;
                if (this.place.userId === null) {
                  this.alertCtrl
                    .create({
                      header: "We're Sorry Something Went Wrong!",
                      message:
                        "Place could not be found or fetched from the server, please try again later.",
                      buttons: [
                        {
                          text: "Return",
                          handler: () => {
                            this.router.navigate(["/places/tabs/discover"]);
                          }
                        }
                      ]
                    })
                    .then(alertEl => {
                      alertEl.present();
                    });
                }
                this.isBookable = place.userId !== fetchedUserId;
                this.isLoading = false;
                loadingEl.dismiss();
              },
              error => {
                this.alertCtrl
                  .create({
                    header: "We're Sorry Something Went Wrong!",
                    message:
                      "Place could not be found or fetched from the server, please try again later.",
                    buttons: [
                      {
                        text: "Return",
                        handler: () => {
                          this.router.navigate(["/places/tabs/discover"]);
                        }
                      }
                    ]
                  })
                  .then(alertEl => {
                    alertEl.present();
                  });
              }
            );
        });
    });
  }
  ngOnDestroy(): void {
    if (this.placesSub) {
      this.placesSub.unsubscribe();
    }
  }
  handleBookPlace() {
    this.actionSheetCtrl
      .create({
        header: "Choose an Action",
        buttons: [
          {
            text: "Select Date",
            handler: () => {
              this.openBookingModal("select");
            }
          },
          {
            text: "Standard Stay",
            handler: () => {
              this.openBookingModal("standard");
            }
          },
          {
            text: "Cancel"
          }
        ]
      })
      .then(actionSheetEl => {
        actionSheetEl.present();
      });
  }
  openBookingModal(mode: "select" | "standard") {
    this.modalCtrl
      .create({
        component: CreateBookingComponent,
        componentProps: { location: this.place, selectedMode: mode }
      })
      .then(modalElement => {
        modalElement.present();
        return modalElement.onDidDismiss();
      })
      .then(result => {
        if (result.role === "confirm") {
          this.loadingCtrl
            .create({
              message: "Please wait while we register you..."
            })
            .then(loadingEl => {
              loadingEl.present();
              this.bookingService
                .addBooking(
                  this.place,
                  result.data.regInfo.numberOfGuests,
                  result.data.regInfo.accommodations,
                  result.data.regInfo.stay,
                  result.data.regInfo.user
                )
                .subscribe(() => {
                  loadingEl.dismiss();
                  this.router.navigate(["places/tabs/offers"]);
                });
            });
        }
      });
  }
}
