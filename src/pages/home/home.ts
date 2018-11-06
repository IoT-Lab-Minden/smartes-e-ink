import {Component, OnInit} from '@angular/core';
import {NavController, ActionSheetController, AlertController} from 'ionic-angular';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnInit {
  devices: string[];

  constructor(public navCtrl: NavController, public alertCtrl: AlertController, public actionSheetCtrl: ActionSheetController) {
  }

  ngOnInit(): void {
    this.getDevices();
  }

  doRefresh(refresher) {
    console.log('Begin async operation', refresher);
  this.getDevices();
    setTimeout(() => {
      console.log('Async operation has ended');
      refresher.complete();
    }, 2000);
  }

  addLine() {
  }

  showConnectError() {
    let alert = this.alertCtrl.create({
      title: 'Fehler bei der Verbindung',
      subTitle: 'Es konnte sich nicht mit dem Gerät verbunden werden!',
      buttons: ['Ok.']
    });
    alert.present();
  }

  showDisconnectError() {
    let alert = this.alertCtrl.create({
      title: 'Fehler beim Trennen',
      subTitle: 'Es konnte sich nicht vom Gerät getrennt werden!',
      buttons: ['Ok.']
    });
    alert.present();
  }

  showNoConnectionError() {
    let alert = this.alertCtrl.create({
      title: 'Keine Verbindung',
      subTitle: 'Verbinde dich erst mit einem Gerät, um Daten zu übertragen!',
      buttons: ['Ok.']
    });
    alert.present();
  }

  uploadData() {
    this.showNoConnectionError();
  }

  connect() {
    this.showConnectError();
  }

  disconnect() {
    this.showDisconnectError();
  }

  showConnectDeviceDialog(s: string) {
    let actionSheet = this.actionSheetCtrl.create({
      title: s,
      buttons: [
        {
          text: 'Verbinden',
          handler: () => {
            this.connect();
          }
        },
        {
          text: 'Trennen',
          handler: () => {
            this.disconnect();
          }

        },
        {
          text: 'Abbrechen',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });

    actionSheet.present();
  }

  async getDevices() {
    const x = Math.floor(Math.random() * 6) + 1;
    this.devices = new Array(x);
    for (let i = 0; i < x; i++) {
      this.devices[i] = 'Display' + i;
    }
  }

}



