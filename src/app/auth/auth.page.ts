import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { LoadingController, AlertController } from "@ionic/angular";
import { Observable } from "rxjs";
import { NgForm } from "@angular/forms";

import { UserResponeInterface } from "./user-response.interface";
import { AuthService } from "./auth.service";
import { UserCredentials } from "./user-cred.interface";
import { Alert } from "../shared/alerts/alert";

@Component({
  selector: "app-auth",
  templateUrl: "./auth.page.html",
  styleUrls: ["./auth.page.scss"]
})
export class AuthPage implements OnInit {
  isLoading: boolean = false;
  isLogin: boolean = false;
  alert: Alert;

  constructor(
    private authService: AuthService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private alerCtrl: AlertController
  ) {}

  ngOnInit() {
    this.alert = new Alert(this.alerCtrl);
  }

  authenticate(userCred: UserCredentials) {
    this.isLoading = true;
    this.loadingCtrl
      .create({
        keyboardClose: true,
        message: "logging you in..."
      })
      .then(loadingEl => {
        loadingEl.present();
        let authObservable: Observable<UserResponeInterface>;
        if (this.isLogin) {
          authObservable = this.authService.login(userCred);
        } else {
          authObservable = this.authService.signUp(userCred);
        }
        authObservable.subscribe(
          responseData => {
            this.isLoading = false;
            loadingEl.dismiss();
            this.router.navigate(["/", "places", "tabs", "discover"]);
          },
          err => {
            loadingEl.dismiss();
            const codeMessage = err.error.error.message;
            let message;
            switch (codeMessage) {
              case "EMAIL_EXISTS":
                message = "This email already exists, please login.";
              case "EMAIL_NOT_FOUND":
                message =
                  "Something went wrong, the email provided was not found. Please try again";
              case "INVALID_PASSWORD":
                message =
                  "The password you entered does not match, please try again";
              default:
                message =
                  "Sorry Could not sign you up, please wait and try again...";
            }
            this.alert.show("Authentication Error", message);
          }
        );
      });
  }
  handleSwitchAuthMode() {
    this.isLogin = !this.isLogin;
  }

  onSubmit(form: NgForm) {
    if (!form.valid) {
      return;
    }
    const email: string = form.value.email;
    const password: string = form.value.pwd;
    if (this.isLogin) {
      // -->  send request to login
      this.authenticate({ email, password });
    } else {
      // --> send request to sign up
      this.authenticate({ email, password });
    }
    form.reset();
  }
}
