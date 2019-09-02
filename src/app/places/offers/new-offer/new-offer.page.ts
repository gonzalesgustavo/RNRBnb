import { Subscription } from "rxjs";
import { LoadingController, AlertController } from "@ionic/angular";
import { AuthService } from "./../../../auth/auth.service";
import { PlacesService } from "./../../places.service";
import { Component, OnInit, OnDestroy } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { Place } from "../../places.model";
import { Router } from "@angular/router";

import { Images } from "src/app/Helpers/images.helpers";
import { switchMap, take } from "rxjs/operators";

@Component({
  selector: "app-new-offer",
  templateUrl: "./new-offer.page.html",
  styleUrls: ["./new-offer.page.scss"]
})
export class NewOfferPage implements OnInit, OnDestroy {
  dateFrom = "2019-01-01";
  dateTo = "2020-01-01";
  form: FormGroup;
  imageFile: Blob;
  private placesSub: Subscription;

  constructor(
    private router: Router,
    private placesService: PlacesService,
    private authService: AuthService,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    // --> set up Reactive Form Controls
    this.form = new FormGroup({
      title: new FormControl(null, {
        updateOn: "blur",
        validators: [Validators.required]
      }),
      description: new FormControl(null, {
        updateOn: "blur",
        validators: [
          Validators.required,
          Validators.maxLength(150),
          Validators.minLength(1)
        ]
      }),
      price: new FormControl(null, {
        updateOn: "blur",
        validators: [Validators.required, Validators.min(10)]
      }),
      roomsAvailable: new FormControl(0, {
        updateOn: "blur",
        validators: [Validators.required]
      }),
      dateFrom: new FormControl(null, {
        updateOn: "blur",
        validators: [Validators.required]
      }),
      dateTo: new FormControl(null, {
        updateOn: "blur",
        validators: [Validators.required]
      }),
      image: new FormControl(null)
    });
  }

  ngOnDestroy(): void {
    // --> though the service is closed automatically (one time use) just as extra precaution
    if (this.placesSub) {
      this.placesSub.unsubscribe();
    }
  }

  handleCreateOffer() {
    // --> check if form is valid (date picker validity to be added later)
    if (!this.form.valid || !this.form.get("image").value) {
      return;
    }

    // --> create a spinner for better UI expierience
    this.loadingCtrl
      .create({
        message: "Saving Location ..."
      })
      .then(loadingEl => {
        // --> show loader
        loadingEl.present();
        //hold place
        let toSavePlace: Place;
        // --> using the form values to create a new place which will be passed to the service
        this.authService.userId
          .pipe(
            take(1),
            switchMap(userId => {
              if (!userId) {
                throw new Error("No user Id Found");
              }
              toSavePlace = new Place(
                userId,
                Math.random().toString(),
                this.form.value.title,
                this.form.value.description,
                this.imageFile,
                +this.form.value.price,
                +this.form.value.roomsAvailable,
                new Date(this.form.value.dateFrom),
                new Date(this.form.value.dateTo)
              );
              // --> pass in new place
              return this.placesService.addPlace(toSavePlace);
            })
          )
          .subscribe(() => {
            // --> dismiss loader and handle routing/form clearing
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
