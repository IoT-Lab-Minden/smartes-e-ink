import {Component} from '@angular/core';
import {NavController, ActionSheetController, AlertController} from 'ionic-angular';
import {StatusBar} from '@ionic-native/status-bar';
import {BLE} from '@ionic-native/ble';
import {Base64} from '@ionic-native/base64';
import {FileChooser} from '@ionic-native/file-chooser';
import {FilePath} from '@ionic-native/file-path';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  providers: [BLE, Base64, FileChooser, FilePath]
})

export class HomePage {

  devices: Array<any>;

  device = {
    'name': '',
    'id': '',
    'advertising': [2, 1, 6, 3, 3, 15, 24, 8, 9, 66, 97, 116, 116, 101, 114, 121],
    'rssi': -55,
    'services': [],
    'characteristics': []
  };

  connected = false;

  serviceUUID = "6E400001-B5A3-F393-E0A9-E50E24DCCA9E";
  characteristicUUID = "6E400002-B5A3-F393-E0A9-E50E24DCCA9E";

  imageURL = "";
  dataURL = "";

  constructor(public navCtrl: NavController, public alertCtrl: AlertController, public actionSheetCtrl: ActionSheetController,
              public  ble: BLE, private statusBar: StatusBar, private base64: Base64, private fileChooser: FileChooser, private filePath: FilePath) {
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

  onDeviceDiscovered(device) {
    //console.log(device);
    if (device.name != null) {
      this.devices.push(device);
    }
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

  connect(device) {
    console.log(device.id);
    this.ble.connect(device.id).subscribe(
      peripheral => this.onConnected(peripheral),
      error => console.log(error)
    );

  }

  onConnected(peripheral) {
    console.log("verbunden");
    //console.log(peripheral);
    this.device = peripheral;
    this.connected = true;
  }

  disconnect(device) {
    this.ble.disconnect(device.id).then(res => {
      this.connected = false;
      this.device = {
        'name': '',
        'id': '',
        'advertising': [2, 1, 6, 3, 3, 15, 24, 8, 9, 66, 97, 116, 116, 101, 114, 121],
        'rssi': -55,
        'services': [],
        'characteristics': []
      };
    }).catch(err => {
      this.showDisconnectError()
    })
  }

  choseImage() {
    this.fileChooser.open()
      .then(uri => this.filePath.resolveNativePath(uri)
        .then(filePath => this.imageURL = filePath)
        .catch(err => console.log(err)))
      .catch(e => console.log(e));
  }

  uploadData() {
    //console.log(this.device);
    //if (this.connected) {
    this.base64.encodeFile(this.imageURL).then((base64File: string) => {
      this.dataURL = base64File;
      this.sendData();
    }, (err) => {
      console.log(err);
    });
    //} else {
    //this.showNoConnectionError();
    //}
  }

  stringToBytes(string) {
    let array = new Uint8Array(string.length);
    for (let i = 0, l = string.length; i < l; i++) {
      array[i] = string.charCodeAt(i);
    }
    return array.buffer;
  }

  sendData() {
    fetch(this.dataURL.substring(0)).then(function (response) {
      return response.arrayBuffer()
    })
      .then(function (buffer) {
        console.log(new Uint8Array(buffer));
      });

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


}


