import { HttpClient } from "@angular/common/http";
import { User } from "./user.model";
import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { take, tap, switchMap, map } from "rxjs/operators";

import { AuthService } from "./../auth/auth.service";
import { Place } from "./../places/places.model";
import { Booking } from "./booking.model";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root"
})
export class BookingsService {
  private _bookings = new BehaviorSubject<Booking[]>([]);

  constructor(
    private authService: AuthService,
    private httpClient: HttpClient
  ) {}

  get bookings() {
    return this._bookings.asObservable();
  }

  fetchAllBookings() {
    let fetchedUserId: string;
    return this.authService.userId.pipe(
      take(1),
      switchMap(userId => {
        if (!userId) {
          throw new Error("User was not found");
        }
        fetchedUserId = userId;
        return this.authService.token;
      }),
      take(1),
      switchMap(token => {
        return this.httpClient.get(
          `${
            environment.fireBaseUrl
          }bookings.json?orderBy="userId"&equalTo="${fetchedUserId}"&auth=${token}`
        );
      }),
      map(bookingResponse => {
        const bookings = [];
        for (const key in bookingResponse) {
          if (bookingResponse.hasOwnProperty(key)) {
            bookings.push(
              new Booking(
                key,
                bookingResponse[key].userId,
                bookingResponse[key].accommodations,
                bookingResponse[key].guestNumber,
                bookingResponse[key].stay,
                bookingResponse[key].user,
                bookingResponse[key].place
              )
            );
          }
        }
        return bookings;
      }),
      tap(bookings => {
        this._bookings.next(bookings);
      })
    );
  }

  addBooking(
    place: Place,
    guestNumber: number,
    accommodations: string,
    stay: object,
    user: User
  ) {
    let fetchedUserId: string;
    let generatedId;
    let newBooking: Booking;
    return this.authService.userId.pipe(
      take(1),
      switchMap(userId => {
        if (!userId) {
          throw new Error("No user ID found!");
        }
        fetchedUserId = userId;
        return this.authService.token;
      }),
      take(1),
      switchMap(token => {
        newBooking = new Booking(
          Math.floor(1000000 + Math.random() * 900000).toString(),
          accommodations,
          guestNumber,
          fetchedUserId,
          stay,
          user,
          place
        );
        return this.httpClient.post<{ name: string }>(
          `${environment.fireBaseUrl}bookings.json?auth=${token}`,
          {
            ...newBooking,
            id: null
          }
        );
      }),
      switchMap(responseData => {
        generatedId = responseData.propertyIsEnumerable;
        return this.bookings;
      }),
      tap(bookings => {
        newBooking.id = generatedId;
        this._bookings.next(bookings.concat(newBooking));
      })
    );
  }

  cancel(bookingId: string) {
    return this.authService.token.pipe(
      take(1),
      switchMap(token => {
        return this.httpClient.delete(
          `${environment.fireBaseUrl}bookings.json?auth=${token}`
        );
      }),
      switchMap(() => {
        return this.bookings;
      }),
      take(1),
      tap(bookings => {
        this._bookings.next(bookings.filter(b => b.id !== bookingId));
      })
    );
  }
}
