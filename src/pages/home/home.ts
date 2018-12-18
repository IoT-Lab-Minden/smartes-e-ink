import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {NavController, ActionSheetController, AlertController} from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import {BLE} from '@ionic-native/ble';
import { Base64 } from '@ionic-native/base64';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  providers: [BLE, Base64]
})

export class HomePage implements OnInit {
  devices: Array<any>;

  lines: string[];

  newLine = {
    line: 0,
    text: ''
  }

  device = {};

  @ViewChild('canvas') canvasEl: ElementRef;
  private _CANVAS: any;
  private _CONTEXT: any;


  constructor(public navCtrl: NavController, public alertCtrl: AlertController, public actionSheetCtrl: ActionSheetController,
              public  ble: BLE, private statusBar: StatusBar, private base64: Base64)
 {
  }

  ngOnInit(): void {

    this.ionViewDidLoad();

  }

  onDeviceDiscovered(device) {
    //console.log(device);
    if (device.name!=null) {
      this.devices.push(device);
    }
  }

  initLines() {
    this.lines = Array(5);
    for (let i = 0; i < this.lines.length; i++) {
      this.lines[i] = "";
    }
  }

  doRefresh(refresher) {
    this.devices = new Array<any>(0);
    this.ble.scan([], 2).subscribe(
      device => this.onDeviceDiscovered(device),
      error => this.showBluetoothError()
    );
    setTimeout(() => {
      refresher.complete();
    }, 2000);
  }

  showBluetoothError() {
    let alert = this.alertCtrl.create({
      title: 'Fehler beim Scannen',
      subTitle: 'Beim Scannen ist ein Fehler aufgetreten!',
      buttons: ['Ok.']
    });
    alert.present();
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

  connect(device) {
    if(this.device != {}) {
      this.ble.connect(device.id).subscribe(
        peripheral => this.onConnected(peripheral),
        error => this.showConnectError()
      );
    }
  }

  onConnected(peripheral){
    this.device = peripheral;
    console.log("Verbunden");
  }

  disconnect(device) {
   this.ble.disconnect(device.id).then(res => {
     this.device = {};
   }).catch(err => {
     this.showDisconnectError()
   })
  }

  showConnectDeviceDialog(device) {
    let actionSheet = this.actionSheetCtrl.create({
      title: device.name,
      buttons: [
        {
          text: 'Verbinden',
          handler: () => {
            this.connect(device);
          }
        },
        {
          text: 'Trennen',
          handler: () => {
            this.disconnect(device);
          }

        },
        {
          text: 'Abbrechen',
          role: 'cancel',
          handler: () => {

          }
        }
      ]
    });

    actionSheet.present();
  }

  ionViewDidLoad() {

    this.statusBar.overlaysWebView(true);
    this.statusBar.styleBlackTranslucent();
    this.statusBar.backgroundColorByHexString('#ffffff');

    this.devices = new Array<any>(0);
    this.ble.scan([], 2).subscribe(
      device => this.onDeviceDiscovered(device),
      error => this.showBluetoothError()
    );

    this.initLines();

    this._CANVAS = this.canvasEl.nativeElement;
    this._CANVAS.width = 500;
    this._CANVAS.height = 500;

    this.initialiseCanvas();
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

  addLine() {
    if (this.newLine.line <= this.lines.length) {
      this.lines[this.newLine.line - 1] = this.newLine.text;
    }
    this.drawText();
  }

  drawText() {
    this.clearCanvas();
    this._CONTEXT.fillStyle = '#ffffff';
    this._CONTEXT.font = '30px Arial';

    for (let i = 0; i < this.lines.length; i++) {
      this._CONTEXT.fillText(this.lines[i], 10, 50 + (35 * i));
    }
  }

  sendData(data: string){
    var index = 0;
    while(data.length > index){
      var string = new  Array<any>(20);
      for(let i = 0; i < 20; i++, index++){
        string[i] = data[index];
      }
      //Daten senden
    }
  }

}



