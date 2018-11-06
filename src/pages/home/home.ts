import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {NavController, ActionSheetController, AlertController} from 'ionic-angular';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnInit {
  devices: string[];

  @ViewChild('canvas') canvasEl: ElementRef;
  private _CANVAS: any;
  private _CONTEXT: any;

  constructor(public navCtrl: NavController, public alertCtrl: AlertController, public actionSheetCtrl: ActionSheetController) {
  }

  ngOnInit(): void {
    this.getDevices();
    this.ionViewDidLoad();
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

  ionViewDidLoad() {
    this._CANVAS = this.canvasEl.nativeElement;
    this._CANVAS.width = 500;
    this._CANVAS.height = 500;

    this.initialiseCanvas();
    this.drawCircle();
  }

  initialiseCanvas() {
    if (this._CANVAS.getContext) {
      this.setupCanvas();
    }
  }

  setupCanvas() {
    this._CONTEXT = this._CANVAS.getContext('2d');
    this._CONTEXT.fillStyle = '#3e3e3e';
    this._CONTEXT.fillRect(0, 0, 500, 500);
  }

  clearCanvas() {
    this._CONTEXT.clearRect(0, 0, this._CANVAS.width, this._CANVAS.height);
    this.setupCanvas();
  }

  drawCircle() {
    this.clearCanvas();
    this._CONTEXT.beginPath();

    // x, y, radius, startAngle, endAngle
    this._CONTEXT.arc(this._CANVAS.width / 2, this._CANVAS.height / 2, 80, 0, 2 * Math.PI);
    this._CONTEXT.lineWidth = 1;
    this._CONTEXT.strokeStyle = '#ffffff';
    this._CONTEXT.stroke();
  }

}



