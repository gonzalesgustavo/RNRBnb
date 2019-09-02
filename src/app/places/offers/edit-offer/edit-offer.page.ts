import { Subscription } from "rxjs";
import { Validators } from "@angular/forms";
import { FormGroup, FormControl } from "@angular/forms";
import {
  NavController,
  LoadingController,
  AlertController
} from "@ionic/angular";
import { ActivatedRoute, Router } from "@angular/router";
import { Component, OnInit, OnDestroy } from "@angular/core";

import { PlacesService } from "../../places.service";
import { Place } from "../../places.model";
import { UpdatePlaceInterface } from "../../update-place.interface";

@Component({
  selector: "app-edit-offer",
  templateUrl: "./edit-offer.page.html",
  styleUrls: ["./edit-offer.page.scss"]
})
export class EditOfferPage implements OnInit, OnDestroy {
  currentPlace: Place;
  form: FormGroup;
  placeId: string;
  imageFile: Blob;
  isLoading: boolean = false;
  private setImage;
  private placesSub: Subscription;
  dateFrom = "2019-01-01";
  dateTo = "2020-01-01";

  constructor(
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private placesService: PlacesService,
    private router: Router,
    private loadingCntrl: LoadingController,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if (!paramMap.has("locationId")) {
        this.navCtrl.navigateBack("/places/tabs/offers");
        return;
      }
      this.placeId = paramMap.get("locationId");

      this.loadingCntrl
        .create({
          message: "Getting place from server..."
        })
        .then(loadingEl => {
          this.isLoading = true;
          loadingEl.present();
          this.placesSub = this.placesService
            .getPlace(paramMap.get("locationId"))
            .subscribe(
              place => {
                this.currentPlace = place;
                this.isLoading = false;
                loadingEl.dismiss();
                if (this.currentPlace.userId === null) {
                  this.alertCtrl
                    .create({
                      header: "We're Sorry Something Went Wrong!",
                      message:
                        "Place could not be found or fetched from the server, please try again later.",
                      buttons: [
                        {
                          text: "Return",
                          handler: () => {
                            this.router.navigate(["/places/tabs/offers"]);
                          }
                        }
                      ]
                    })
                    .then(alertEl => {
                      alertEl.present();
                    });
                }
                this.form = new FormGroup({
                  title: new FormControl(this.currentPlace.title, {
                    updateOn: "blur",
                    validators: [Validators.required, Validators.minLength(5)]
                  }),
                  description: new FormControl(this.currentPlace.description, {
                    updateOn: "blur",
                    validators: [
                      Validators.required,
                      Validators.maxLength(150),
                      Validators.minLength(1)
                    ]
                  }),
                  price: new FormControl(this.currentPlace.price, {
                    updateOn: "blur",
                    validators: [Validators.required, Validators.min(10)]
                  }),
                  roomsAvailable: new FormControl(
                    `${this.currentPlace.roomsAvailable}`,
                    {
                      updateOn: "blur",
                      validators: [Validators.required]
                    }
                  ),
                  dateFrom: new FormControl(
                    new Date(this.currentPlace.availableFrom).toISOString(),
                    {
                      updateOn: "blur",
                      validators: [Validators.required]
                    }
                  ),
                  dateTo: new FormControl(
                    new Date(this.currentPlace.availableTo).toISOString(),
                    {
                      updateOn: "blur",
                      validators: [Validators.required]
                    }
                  ),
                  image: new FormControl(this.currentPlace.image)
                });
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
                          this.router.navigate(["/places/tabs/offers"]);
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

  handleOnSave() {
    if (!this.form.valid) {
      return;
    }
    this.loadingCntrl
      .create({
        message: "Updating Location..."
      })
      .then(loadingEl => {
        loadingEl.present();

        if (!this.form.get("image").value) {
          this.setImage = this.currentPlace.image;
        } else {
          this.setImage = this.form.get("image").value;
        }
        let updatedFields: UpdatePlaceInterface = {
          placeId: this.currentPlace.id,
          title: this.form.value.title,
          description: this.form.value.description,
          image: this.setImage,
          price: this.form.value.price,
          roomsAvailable: this.form.value.roomsAvailable,
          availableFrom: this.form.value.dateFrom,
          availableTo: this.form.value.dateTo
        };
        this.placesSub = this.placesService
          .updatePlace(updatedFields)
          .subscribe(() => {
            loadingEl.dismiss();
            this.form.reset();
            this.router.navigate(["/places/tabs/offers"]);
          });
      });
  }
  handleImagePick(imageData: Blob) {
    try {
      this.imageFile = imageData;
    } catch (error) {
      console.log("error" + error);
    }
    this.form.patchValue({ image: imageData });
  }
}
