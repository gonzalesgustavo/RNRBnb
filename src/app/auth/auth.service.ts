import { BehaviorSubject, from } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { Injectable, OnDestroy } from "@angular/core";
import { Router } from "@angular/router";
import { environment as env } from "src/environments/environment";
import { map, tap } from "rxjs/operators";
import { Plugins as device } from "@capacitor/core";

import { User } from "./user.model";
import { UserCredentials } from "./user-cred.interface";
import { UserResponeInterface } from "./user-response.interface";

interface StorageInterface {
  userId: string;
  email: string;
  token: string;
  tokenExpiration: string;
}

@Injectable({
  providedIn: "root"
})
export class AuthService implements OnDestroy {
  private _user: BehaviorSubject<User> = new BehaviorSubject<User>(null);
  private activeTimer: any;

  constructor(private router: Router, private httpclient: HttpClient) {}

  ngOnDestroy(): void {
    if (this.activeTimer) {
      clearTimeout(this.activeTimer);
    }
  }

  get userIsAuthenticated() {
    return this._user.asObservable().pipe(
      map(user => {
        if (user) {
          return !!user.token;
        } else {
          return false;
        }
      })
    );
  }

  get token() {
    return this._user.asObservable().pipe(
      map(user => {
        if (user) {
          return user.token;
        } else {
          return null;
        }
      })
    );
  }

  get userId() {
    return this._user.asObservable().pipe(
      map(user => {
        if (user) {
          return user.id;
        } else {
          return null;
        }
      })
    );
  }

  signUp(user: UserCredentials) {
    return this.httpclient
      .post<UserResponeInterface>(
        `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${
          env.firebaseWepKey
        }`,
        {
          email: user.email,
          password: user.password,
          returnSecureToken: true
        }
      )
      .pipe(tap(this.setUser.bind(this)));
  }

  login(user: UserCredentials) {
    return this.httpclient
      .post<UserResponeInterface>(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${
          env.firebaseWepKey
        }`,
        {
          email: user.email,
          password: user.password,
          returnSecureToken: true
        }
      )
      .pipe(tap(this.setUser.bind(this)));
  }
  autoLogin() {
    return from(device.Storage.get({ key: "authData" })).pipe(
      map(storedData => {
        if (!storedData || !storedData.value) {
          return null;
        }
        const parseResponse = JSON.parse(storedData.value) as StorageInterface;
        const tokenExpiration = new Date(parseResponse.tokenExpiration);
        if (tokenExpiration <= new Date()) {
          return null;
        }
        const user = new User(
          parseResponse.userId,
          parseResponse.email,
          parseResponse.token,
          tokenExpiration
        );
        return user;
      }),
      tap(user => {
        if (user) {
          this._user.next(user);
          this.autoLogout(user.tokenDuration);
        }
      }),
      map(user => {
        return !!user;
      })
    );
  }

  logOut() {
    if (this.activeTimer) {
      clearTimeout(this.activeTimer);
    }
    this._user.next(null);
    device.Storage.remove({ key: "authData" });
  }

  private autoLogout(duration: number): void {
    this.activeTimer = setTimeout(() => {}, duration);
  }
  private setUser(userData: UserResponeInterface) {
    const expirationTime = new Date(
      new Date().getTime() + +userData.expiresIn * 1000
    );

    this.storeAuthData({
      userId: userData.localId,
      token: userData.idToken,
      email: userData.email,
      tokenExpiration: expirationTime.toISOString()
    });
    const user = new User(
      userData.localId,
      userData.email,
      userData.idToken,
      expirationTime
    );
    this._user.next(user);
    this.autoLogout(user.tokenDuration);
  }
  // private getAuthData(): object {}
  private storeAuthData(authData: StorageInterface): void {
    const data = JSON.stringify(authData);
    device.Storage.set({
      key: "authData",
      value: data
    });
  }
}
