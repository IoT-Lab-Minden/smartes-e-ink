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

  /**
   * List of found devices
   */
  devices: Array<any>;

  /**
   * Data of the connected device
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
   * Shows if device is connected
   * @type {boolean}
   */
  connected = false;

  /**
   * Adress of service on bluetooth device
   * @type {string}
   */
  serviceUUID = "6E400001-B5A3-F393-E0A9-E50E24DCCA9E";

  /**
   * Adress of characteristic on bluetooth device where image is send to
   * @type {string}
   */
  sendUUID = "6E400002-B5A3-F393-E0A9-E50E24DCCA9E";

  /**
   * Saves the lines that are written in the canvas
   */
  lines: string[];

  /**
   * Saves what and where needs to be saved in lines next
   * @type {{line: number; text: string}}
   */
  newLine = {
    line: 0,
    text: ''
  }

  /**
   * X Position of Finger while drawing on canvas
   */
  saveX: number;

  /**
   *  Y Position of Finger while drawing on canvas
   */
  saveY: number;

  /**
   * Font Color
   * @type {string}
   */
  selectedColor = '#000000';

  /**
   * Background color of canvas
   * @type {string}
   */
  backgroundColor = '#ffffff';

  /**
   * Array filled with colors that can be selected
   * @type {string[]}
   */
  colors = ['#ffffff', '#C0C0C0', '#808080', '#000000'];

  @ViewChild('canvas') canvasEl: ElementRef;
  /**
   *
   */
  private canvas: any;
  /**
   *
   */
  private context: any;


  constructor(public navCtrl: NavController, public alertCtrl: AlertController, public actionSheetCtrl: ActionSheetController,
              public  ble: BLE, private statusBar: StatusBar, private loading: LoadingController) {
  }


  /**
   * Called when smartphones opens app. Initializes Status Bar and scans for 2 seconds for devices
   */
  ionViewDidLoad() {

    this.statusBar.overlaysWebView(true);
    this.statusBar.styleBlackTranslucent();
    this.statusBar.backgroundColorByHexString('#ffffff');

    this.devices = new Array<any>(0);
    this.ble.scan([], 2).subscribe(
      device => this.onDeviceDiscovered(device),
      error => {
        let alert = this.alertCtrl.create({
          title: 'Error while scanning',
          subTitle: error,
          buttons: ['Ok']
        });
        alert.present();
      }
    );

    this.initLines();

    this.canvas = this.canvasEl.nativeElement;
    this.canvas.width = 400;
    this.canvas.height = 300;

    this.initialiseCanvas();
  }

  /**
   * Initializes lines Array
   */
  initLines() {
    this.lines = Array(7);
    for (let i = 0; i < this.lines.length; i++) {
      this.lines[i] = "";
    }
  }

  /**
   * Initialize canvas with selected background color and size 400x300
   */
  initialiseCanvas() {
    if (this.canvas.getContext) {
      this.context = this.canvas.getContext('2d');
      this.context.fillStyle = this.backgroundColor;
      this.context.fillRect(0, 0, 400, 300);
    }
  }

  /**
   * Clears the canvas with the selected background color
   */
  clearCanvas() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.initialiseCanvas();
  }

  /**
   * Adds newline.text to position newLine.line in the lines array
   */
  addLine() {
    if (this.newLine.line <= this.lines.length) {
      this.lines[this.newLine.line - 1] = this.newLine.text;
    }
    this.drawText();
  }

  /**
   * Draws the content of lines on the canvas
   */
  drawText() {
    this.clearCanvas();
    this.context.fillStyle = this.selectedColor;
    this.context.font = '30px Arial';

    for (let i = 0; i < this.lines.length; i++) {
      this.context.fillText(this.lines[i], 5, 10 + (35 * i));
    }
  }

  /**
   * Changes the selected font color
   * @param color
   */
  selectColor(color) {
    this.selectedColor = color;
  }

  /**
   * Changes teh selected background color and resets canvas
   * @param color
   */
  selectBackground(color) {
    this.backgroundColor = color;
    this.clearCanvas();
  }

  /**
   * Saves finger position on canvas in saveX and saveY
   * @param ev touch event on canvas
   */
  startDrawing(ev) {
    var canvasPosition = this.canvas.getBoundingClientRect();

    this.saveX = ev.touches[0].pageX - canvasPosition.x;
    this.saveY = ev.touches[0].pageY - canvasPosition.y;
  }

  /**
   * Draws a line when moved over the canvas
   * @param ev touch event on canvas
   */
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

  /**
   * Scans for 2 seconds for devices
   * @param refresher refresher ui element
   */
  doRefresh(refresher) {
    this.devices = new Array<any>(0);
    this.ble.scan([], 2).subscribe(
      device => this.onDeviceDiscovered(device),
      error => {
        let alert = this.alertCtrl.create({
          title: 'Error while scanning',
          subTitle: error,
          buttons: ['Ok']
        });
        alert.present();
      }
    );
    setTimeout(() => {
      refresher.complete();
    }, 2000);
  }

  /**
   * Saves the found device in devices
   * @param device found device
   */
  onDeviceDiscovered(device) {
    if (device.name != null) {
      this.devices.push(device);
    }
  }

  /**
   * Shows a dialog to connect or disconnect from a device
   * @param device device to connect or disconnect
   */
  showConnectDeviceDialog(device) {
    let actionSheet = this.actionSheetCtrl.create({
      title: device.name,
      buttons: [
        {
          text: 'Connect',
          handler: () => {
            this.connect(device);
          }
        },
        {
          text: 'Disconnect',
          handler: () => {
            this.disconnect(device);
          }

        },
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {

          }
        }
      ]
    });

    actionSheet.present();
  }

  /**
   * Connects to the given device
   * @param device device to connect to
   */
  connect(device) {
    console.log(device.id);
    this.ble.connect(device.id).subscribe(
      peripheral => this.onConnected(peripheral),
      error => {
        let alert = this.alertCtrl.create({
          title: 'Error while Connecting',
          subTitle: error,
          buttons: ['Ok']
        });
        alert.present();
      }
    );
  }

  /**
   * Saves the connected device in device
   * @param peripheral connected device
   */
  onConnected(peripheral) {
    this.device = peripheral;
    this.connected = true;
  }

  /**
   * Disconnects from the connected device and saves in device dummy values
   * @param device connected device
   */
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

    })
  }

  /**
   * Sends the image via ble to the connected device. The image is mirrored and only 80 pixels are send at once.
   */
  sendImage() {
    let imageData = this.context.getImageData(0, 0, 400, 300);
    let data = imageData.data;
    let start = 1600;
    let end = 3;
    let i = 0;
    for (let row = 0; row < 300; row++, start += 1600, end += 1600) {
      i = start;
      for (let blocks = 0; blocks < 5; blocks++) {
        let sendingData = "";
        for (let b = 0; b < 20; b++) {
          let block = new Uint8Array(4);
          for (let pixel = 0; pixel < 4; pixel++, i = i - 4) {
            let gray = data[i];
            if (gray == 0) {
              block[pixel] = 3;
            } else if (gray == 128) {
              block[pixel] = 2;
            } else if (gray == 192) {
              block[pixel] = 1;
            } else if (gray == 255) {
              block[pixel] = 0;
            } else {
              block[pixel] = 3;
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
            title: 'Error while sending image',
            subTitle: err,
            buttons: ['Ok']
          });
          alert.present();
        });

        let currentTime = new Date().getTime();
        while (currentTime + 500 >= new Date().getTime()) {
        }
      }
    }
  }

    /**
     * Shows a loading screen and calls the send image function.
     */
    onUpload()
    {
      const loader = this.loading.create({
        content: "Sending Data..."
      });
      loader.present();

      this.sendImage();

      loader.dismiss();
    }

    /**
     * Converts a string into a byte array.
     * @param string string that needs to be converted
     * @returns {ArrayBufferLike}
     */
    stringToBytes(string)
    {
      let array = new Uint8Array(string.length);
      for (let i = 0, l = string.length; i < l; i++) {
        array[i] = string.charCodeAt(i);
      }
      return array.buffer;
    }


  }


