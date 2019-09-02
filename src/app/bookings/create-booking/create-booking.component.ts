import { ModalController } from "@ionic/angular";
import { Component, OnInit, Input, ViewChild } from "@angular/core";
import { Place } from "src/app/places/places.model";
import { NgForm } from "@angular/forms";
import { User } from "../user.model";
import { AuthService } from "src/app/auth/auth.service";

@Component({
  selector: "app-create-booking",
  templateUrl: "./create-booking.component.html",
  styleUrls: ["./create-booking.component.scss"]
})
export class CreateBookingComponent implements OnInit {
  @Input() location: Place;
  @Input() selectedMode: "select" | "standard";
  @ViewChild("bookForm") form: NgForm;

  startDate: string;
  endDate: string;
  constructor(
    private modalCtrl: ModalController,
    private authService: AuthService
  ) {}

  ngOnInit() {
    console.log(this.location);
    const availableFrom = new Date(this.location.availableFrom);
    const availableTo = new Date(this.location.availableTo);
    if (this.selectedMode === "standard") {
      this.startDate = new Date(
        availableFrom.getTime() +
          Math.random() *
            (availableTo.getTime() -
              7 * 24 * 60 * 1000 -
              // --> d/w hrs  sec  ms
              availableFrom.getTime())
      ).toISOString();
      this.endDate = new Date(
        new Date(this.startDate).getTime() +
          Math.random() *
            (new Date(this.startDate).getTime() +
              6 * 24 * 60 * 60 * 1000 -
              new Date(this.startDate).getTime())
      ).toISOString();
    }
  }
  getRoomsAvailable() {
    this.location.roomsAvailable;
    let roomsAvailable = [];
    for (let i = 0; i <= this.location.roomsAvailable; i++) {
      roomsAvailable.push(i);
    }
    return roomsAvailable.slice(1);
  }

  handleBookingSubmit() {
    if (!this.form.valid || !this.datesValidor) {
      return;
    }
    let user = new User(this.form.value.fName, this.form.value.lName);
    this.handleRegisterBooking({
      user,
      numberOfGuests: +this.form.value.guestNum,
      accommodations: this.form.value.acomod,
      stay: {
        dateFrom: new Date(this.form.value.dateFrom),
        dateTo: new Date(this.form.value.dateTo)
      }
    });
  }

  handleRegisterBooking(regInfo: object) {
    this.modalCtrl.dismiss({ regInfo }, "confirm");
  }
  handleCancelClose() {
    this.modalCtrl.dismiss(null, "cancel");
  }
  datesValidor() {
    const startDate = new Date(this.form.value.dateFrom);
    const endDate = new Date(this.form.value.dateTo);
    return endDate < startDate;
  }
}
