import { AlertController } from "@ionic/angular";
export class Alert {
  constructor(private alertCtrl: AlertController) {}
  show(header: string, message: string) {
    this.alertCtrl
      .create({
        header,
        message,
        buttons: ["Okay"]
      })
      .then(alertEl => {
        alertEl.present();
      });
  }
}
