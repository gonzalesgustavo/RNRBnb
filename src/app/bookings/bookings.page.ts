import { Subscription } from "rxjs";
import { Component, OnInit, OnDestroy } from "@angular/core";
import { IonItemSliding, LoadingController } from "@ionic/angular";

import { BookingsService } from "./bookings.service";
import { Booking } from "./booking.model";

@Component({
  selector: "app-bookings",
  templateUrl: "./bookings.page.html",
  styleUrls: ["./bookings.page.scss"]
})
export class BookingsPage implements OnInit, OnDestroy {
  loadedBooking: Booking[];
  isLoading: boolean = false;
  private bookingSub: Subscription;

  constructor(
    private bookingService: BookingsService,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {
    this.isLoading = true;
    this.loadingCtrl
      .create({
        message: "getting all your bookings. Please wait ..."
      })
      .then(loadingEl => {
        loadingEl.present();
        this.bookingSub = this.bookingService.bookings.subscribe(bookings => {
          this.loadedBooking = bookings;
          this.isLoading = false;
          loadingEl.dismiss();
        });
      });
  }
  ionViewWillEnter() {
    this.isLoading = true;
    this.loadingCtrl
      .create({
        message: "getting all your bookings. Please wait ..."
      })
      .then(loadingEl => {
        loadingEl.present();
        this.bookingService.fetchAllBookings().subscribe(() => {
          this.isLoading = false;
          loadingEl.dismiss();
        });
      });
  }

  ngOnDestroy(): void {
    if (this.bookingService) {
      this.bookingSub.unsubscribe();
    }
  }

  handleCancelBooking(id: string, slidingBooking: IonItemSliding) {
    slidingBooking.close();
    this.loadingCtrl
      .create({
        message: "Canceling Booking!"
      })
      .then(loadingEl => {
        loadingEl.present();
        this.bookingService.cancel(id).subscribe(() => {
          loadingEl.dismiss();
        });
      });
  }
}
