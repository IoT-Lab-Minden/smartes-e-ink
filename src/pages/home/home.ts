import {Component} from '@angular/core';
import {NavController, ActionSheetController, AlertController} from 'ionic-angular';
import {StatusBar} from '@ionic-native/status-bar';
import {BLE} from '@ionic-native/ble';
import {Base64} from '@ionic-native/base64';
import {FileChooser} from '@ionic-native/file-chooser';
import {FilePath} from '@ionic-native/file-path';
import {LoadingController} from 'ionic-angular';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  providers: [BLE, Base64, FileChooser, FilePath]
})

export class HomePage {

  /**
   * Liste aller gefundenen Geräte
   */
  devices: Array<any>;

  /**
   * Aktuell verbundenes Gerät
   * @type {{name: string; id: string; advertising: number[]; rssi: number; services: any[]; characteristics: any[]}}
   */
  device = {
    'name': '',
    'id': '',
    'advertising': [2, 1, 6, 3, 3, 15, 24, 8, 9, 66, 97, 116, 116, 101, 114, 121],
    'rssi': -55,
    'services': [],
    'characteristics': []
  };

  /**
   *
   * @type {boolean}
   */
  connected = false;

  /**
   * UUID des Services
   * @type {string}
   */
  serviceUUID = "6E400001-B5A3-F393-E0A9-E50E24DCCA9E";

  /**
   * UUID der zu ändernen Characteristik
   * @type {string}
   */
  characteristicUUID = "6E400002-B5A3-F393-E0A9-E50E24DCCA9E";

  /**
   * Pfad zum ausgewähltem Bild
   * @type {string}
   */
  imageURL = "";

  /**
   * Base64 String des Bildes
   * @type {string}
   */
  dataURL = "";

  data = new Uint8Array(2);

  /**
   * Konstruktor der Klasse
   * @param {NavController} navCtrl
   * @param {AlertController} alertCtrl Controller für Popups
   * @param {ActionSheetController} actionSheetCtrl Controller für Auswahlfenster
   * @param {BLE} ble Natives Bluetooth LE Plugin
   * @param {StatusBar} statusBar Native StatusBar
   * @param {Base64} base64 Base64 Encoder
   * @param {FileChooser} fileChooser Nativer Datenexplorer
   * @param {FilePath} filePath
   */
  constructor(public navCtrl: NavController, public alertCtrl: AlertController, public actionSheetCtrl: ActionSheetController,
              public  ble: BLE, private statusBar: StatusBar, private base64: Base64, private fileChooser: FileChooser,
              private filePath: FilePath, private loading: LoadingController) {
  }

  /**
   * Wird beim Start der App ausgeführt.
   * Initialisiert StatusBar und Geräteliste
   */
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

  /**
   * Scannt nach Bluetoothgeräten in der Umgebung
   * @param refresher Objekt im Frontend
   */
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

  /**
   * Fügt ein Gerät zur Liste hinzu, wenn es beim scannen entdeckt wurde.
   * @param device Entdecktes Gerät
   */
  onDeviceDiscovered(device) {
    if (device.name != null) {
      this.devices.push(device);
    }
  }

  /**
   * Öffnet einen Dialog um sich mit Gerät zu verbinden oder Vernindung zu trennen.
   * @param device Ausgewähltes Gerät
   */
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

  /**
   * Verbindet sich mit dem angegebenen Gerät
   * @param device Gerät mitdem sich verbunden werden soll
   */
  connect(device) {
    console.log(device.id);
    this.ble.connect(device.id).subscribe(
      peripheral => this.onConnected(peripheral),
      error => console.log(error)
    );

  }

  /**
   * Speichert das verbundene Gerät zwischen
   * @param peripheral Verbundene Gerät
   */
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

  /**
   * Öffnet die Bildergalerie und Speichert den Pfad des ausgewählten Bildes
   */
  choseImage() {
    this.fileChooser.open()
      .then(uri => this.filePath.resolveNativePath(uri)
        .then(filePath => this.imageURL = filePath)
        .catch(err => console.log(err)))
      .catch(e => console.log(e));
  }

  /**
   *
   */
  base64ToByteArray(ble: BLE, device, serviceUUID: string, characteristicUUID: string) {
    //console.log(this.device);
    //if (this.connected) {
    let data = new Uint8Array(2);
    this.base64.encodeFile(this.imageURL).then((base64File: string) => {
      this.dataURL = base64File;
      fetch(this.dataURL.substring(0)).then(function (response) {
        return response.arrayBuffer()
      }).then(function (buffer) {

      })

    }, (err) => {
      console.log(err);
    });
    //} else {
    //this.showNoConnectionError();
    //}
    console.log(data);
  }

  sendTest(){
    let data = new Uint8Array(30006);
    let index = 0;
    console.log(data);
    while (index < data.length) {
      let sendingData = ""
      for(let j = 0; j < 20 && index < data.length; j++){
        let value = 0;
        let block = new Uint8Array(4);
        //Umwandeln in Graustufen
        for(let i = 0; i < 4 && index < data.length; i++,index++){
          if(data[index] < 64){
            block[i] = 0;
          } else if(data[index] < 128){
            block[i] = 1;
          } else if(data[index] < 192){
            block[i] = 2;
          } else {
            block[i] = 3;
          }
        }
        //Zusammenfassen
        value = data[0] + data[1] * 4 + data[2] * 16 + data[3] * 64;
        sendingData += ""+value;
      }
      this.ble.write(this.device.id,this.serviceUUID,this.characteristicUUID,this.stringToBytes(sendingData));

    }
  }

  onUpload() {
    const loader = this.loading.create({
      content: "Sende Daten..."
    });
    loader.present();

    this.sendTest();

    loader.dismiss();
  }


  /**
   * Übersetzt einen String in ein Byte Array
   * @param string Zu Übersetzene String
   * @returns String als ArrayBuffer
   */
  stringToBytes(string) {
    let array = new Uint8Array(string.length);
    for (let i = 0, l = string.length; i < l; i++) {
      array[i] = string.charCodeAt(i);
    }
    return array.buffer;
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


