import { AuthService } from "src/app/auth/auth.service";
import { Injectable } from "@angular/core";
import { Place } from "./places.model";
import { BehaviorSubject, of } from "rxjs";
import { take, map, tap, switchMap } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";
import { ResultDataInterface } from "./resultdata.interface";
import { UpdatePlaceInterface } from "./update-place.interface";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root"
})
export class PlacesService {
  private _places = new BehaviorSubject<Place[]>([]);
  constructor(
    private httpClient: HttpClient,
    private authService: AuthService
  ) {}
  // --> get all places (subscribable)
  get places() {
    return this._places.asObservable();
  }
  getAllPlaces() {
    return this.authService.token.pipe(
      take(1),
      switchMap(token => {
        return this.httpClient.get<{ [key: string]: ResultDataInterface }>(
          `${environment.fireBaseUrl}offered-places.json?auth=${token}`
        );
      }),
      map(response => {
        const places = [];
        for (const key in response) {
          if (response.hasOwnProperty(key)) {
            places.push(
              new Place(
                response[key].userId,
                key,
                response[key].title,
                response[key].description,
                response[key].image,
                response[key].price,
                response[key].roomsAvailable,
                new Date(response[key].availableFrom),
                new Date(response[key].availableTo)
              )
            );
          }
        }
        return places;
      }),
      tap(places => this._places.next(places))
    );
  }
  // --> get a single place
  getPlace(id: string) {
    return this.authService.token.pipe(
      take(1),
      switchMap(token => {
        return this.httpClient.get<ResultDataInterface>(
          `${environment.fireBaseUrl}offered-places/${id}.json?auth=${token}`
        );
      }),
      map(placeData => {
        if (!placeData) {
          return new Place(
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null
          );
        } else {
          return new Place(
            placeData.userId,
            id,
            placeData.title,
            placeData.description,
            placeData.image,
            placeData.price,
            placeData.roomsAvailable,
            new Date(placeData.availableFrom),
            new Date(placeData.availableTo)
          );
        }
      })
    );
  }
  // --> add a place
  addPlace(place: Place) {
    let id: string;
    return this.authService.token.pipe(
      take(1),
      switchMap(token => {
        return this.httpClient.post<{ name: string }>(
          `${environment.fireBaseUrl}offered-places.json?auth=${token}`,
          {
            ...place,
            id: null
          }
        );
      }),
      switchMap(results => {
        id = results.name;
        return this.places;
      }),
      take(1),
      tap(places => {
        place.id = id;
        this._places.next(places.concat(place));
      })
    );
  }
  // --> update a place
  updatePlace(place: UpdatePlaceInterface) {
    //set empty array for the new updated places
    let updatedPlaces: Place[];
    //get a copy of the token to use later on the chain
    let fetchedToken: string;
    //get token from authservice
    return this.authService.token.pipe(
      take(1),
      switchMap(token => {
        fetchedToken = token;
        return this.places;
      }),
      take(1),
      switchMap(places => {
        // --> Check if places exist
        if (!places || places.length <= 0) {
          return this.getAllPlaces();
        } else {
          return of(places);
        }
      }),
      switchMap(places => {
        // --> get the index of the location to be edited
        const index = places.findIndex(pl => pl.id === place.placeId);
        // --> create a copy to prevent unwanted mutation
        updatedPlaces = [...places];
        // --> save a reference to the orginal item for elements the user cannot change
        const old = updatedPlaces[index];
        // --> replace the old place with the new information passed in
        updatedPlaces[index] = new Place(
          old.userId,
          old.id,
          place.title,
          place.description,
          place.image,
          place.price,
          place.roomsAvailable,
          place.availableFrom,
          place.availableTo
        );
        //post new place to back end including the key
        return this.httpClient.put(
          environment.fireBaseUrl +
            `offered-places/${place.placeId}.json?auth=${fetchedToken}`,
          {
            ...updatedPlaces[index],
            id: null
          }
        );
      }),
      tap(responseData => {
        this._places.next(updatedPlaces);
      })
    );
  }
  //delete an offered place
  deletePlace(placeId: string) {
    return this.authService.token.pipe(
      take(1),
      switchMap(token => {
        return this.httpClient.delete(
          `${
            environment.fireBaseUrl
          }offered-places/${placeId}.json?auth=${token}`
        );
      }),
      switchMap(() => {
        return this.places;
      }),
      take(1),
      tap(places => {
        this._places.next(places.filter(p => p.id !== placeId));
      })
    );
  }
}
