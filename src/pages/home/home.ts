import {Component, ElementRef, ViewChild} from '@angular/core';
import {NavController, ActionSheetController, AlertController} from 'ionic-angular';
import {StatusBar} from '@ionic-native/status-bar';
import {BLE} from '@ionic-native/ble';
import {LoadingController} from 'ionic-angular';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  providers: [BLE]
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

  sendUUID = "6E400002-B5A3-F393-E0A9-E50E24DCCA9E";
  statusUUID = "6E400003-B5A3-F393-E0A9-E50E24DCCA9E";

  deviceStatus = true;

  lines: string[];

  newLine = {
    line: 0,
    text: ''
  }

  saveX: number;
  saveY: number;

  selectedColor = '#000000';

  backgroundColor = '#ffffff';

  colors = ['#ffffff', '#C0C0C0', '#808080', '#000000'];

  @ViewChild('canvas') canvasEl: ElementRef;
  private canvas: any;
  private context: any;


  constructor(public navCtrl: NavController, public alertCtrl: AlertController, public actionSheetCtrl: ActionSheetController,
              public  ble: BLE, private statusBar: StatusBar, private loading: LoadingController) {
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

    this.canvas = this.canvasEl.nativeElement;
    this.canvas.width = 400;
    this.canvas.height = 300;

    this.initialiseCanvas();
  }

  initLines() {
    this.lines = Array(7);
    for (let i = 0; i < this.lines.length; i++) {
      this.lines[i] = "";
    }
  }

  initialiseCanvas() {
    if (this.canvas.getContext) {
      this.context = this.canvas.getContext('2d');
      this.context.fillStyle = this.backgroundColor;
      this.context.fillRect(0, 0, 400, 300);
    }
  }

  clearCanvas() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.initialiseCanvas();
  }

  addLine() {
    if (this.newLine.line <= this.lines.length) {
      this.lines[this.newLine.line - 1] = this.newLine.text;
    }
    this.drawText();
  }

  drawText() {
    this.clearCanvas();
    this.context.fillStyle = this.selectedColor;
    this.context.font = '30px Arial';

    for (let i = 0; i < this.lines.length; i++) {
      this.context.fillText(this.lines[i], 5, 10 + (35 * i));
    }
  }

  selectColor(color) {
    this.selectedColor = color;
  }

  selectBackground(color) {
    this.backgroundColor = color;
    this.clearCanvas();
  }

  startDrawing(ev) {
    var canvasPosition = this.canvas.getBoundingClientRect();

    this.saveX = ev.touches[0].pageX - canvasPosition.x;
    this.saveY = ev.touches[0].pageY - canvasPosition.y;
  }

  moved(ev) {
    var canvasPosition = this.canvas.getBoundingClientRect();

    let ctx = this.canvas.getContext('2d');
    let currentX = ev.touches[0].pageX - canvasPosition.x;
    let currentY = ev.touches[0].pageY - canvasPosition.y;

    ctx.lineJoin = 'round';
    ctx.strokeStyle = this.selectedColor;
    ctx.lineWidth = 5;

    ctx.beginPath();
    ctx.moveTo(this.saveX, this.saveY);
    ctx.lineTo(currentX, currentY);
    ctx.closePath();

    ctx.stroke();

    this.saveX = currentX;
    this.saveY = currentY;
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

  sendImage() {
    let imageData = this.context.getImageData(0, 0, 400, 300);
    let data = imageData.data;
    let error = false;
    let i = 0;
    let t = 0;
    while(i < data.length){
      let sendingData = "";
      for (let j = 0; j < 20 && i < data.length; i = i + 4, j++) {
        t++;
        let block = new Uint8Array(4);
        for (let k = 0; k < 4; k++) {
          let gray = ((data[i] + data[i + 1] + data[i + 2]) / 3);
          if (gray == 0) {
            imageData.data[i] = 0;
            imageData.data[i+1] = 0;
            imageData.data[i+2] = 0;
            block[k] = 0;
          } else if (gray == 128) {
            imageData.data[i] = 128;
            imageData.data[i+1] = 128;
            imageData.data[i+2] = 128;
            block[k] = 1;
          } else if (gray == 192) {
            imageData.data[i] = 192;
            imageData.data[i+1] = 192;
            imageData.data[i+2] = 192;
            block[k] = 2;
          } else if(gray == 255){
            imageData.data[i] = 255;
            imageData.data[i+1] = 255;
            imageData.data[i+2] = 255;
            block[k] = 3;
          } else {
            imageData.data[i] = 0;
            imageData.data[i+1] = 0;
            imageData.data[i+2] = 0;
            block[k] = 3  ;
          }
        }
        let pixelBlock = (block[0] + (block[1] * 4) + (block[2] * 16) + (block[3] * 64)).toString();
        while (pixelBlock.length < 3) {
          pixelBlock = 0 + "" + pixelBlock;
        }
        sendingData += pixelBlock;
      }

      this.ble.write(this.device.id, this.serviceUUID, this.sendUUID, this.stringToBytes(sendingData)).catch(err => {
        let alert = this.alertCtrl.create({
          title: 'Fehler beim Übertragen',
          subTitle: err,
          buttons: ['Ok']
        });
        alert.present();
        error = true;
      });

      let currentTime = new Date().getTime();
      while (currentTime + 500 >= new Date().getTime()) {
      }
    }
    //imageData.data = data;
    this.context.putImageData(imageData, 0, 0);
    console.log(t);
  }


  onUpload() {
    const loader = this.loading.create({
      content: "Sende Daten..."
    });
    loader.present();

    this.sendImage();

    loader.dismiss();
  }

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


