import { Subscription } from "rxjs";
import { AuthService } from "./auth/auth.service";
import { Component, OnInit, OnDestroy } from "@angular/core";

//capacitor splash and status
import { Plugins, Capacitor } from "@capacitor/core";
import { Platform } from "@ionic/angular";
import { Router } from "@angular/router";

@Component({
  selector: "app-root",
  templateUrl: "app.component.html"
})
export class AppComponent implements OnInit, OnDestroy {
  private sub: Subscription;
  private previousAuthState: boolean = false;
  constructor(
    private platform: Platform,
    private router: Router,

    private authService: AuthService
  ) {
    this.initializeApp();
  }

  ngOnInit(): void {
    this.sub = this.authService.userIsAuthenticated.subscribe(isAuth => {
      if (!isAuth && this.previousAuthState !== isAuth) {
        this.router.navigateByUrl("/auth");
      }
      this.previousAuthState = isAuth;
    });
  }
  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
  initializeApp() {
    this.platform.ready().then(() => {
      if (Capacitor.isPluginAvailable("SplashScreen")) {
        Plugins.SplashScreen.hide();
      }
    });
  }
  handleLogOut() {
    this.authService.logOut();
    this.router.navigateByUrl("/auth");
  }
}
