#include <SPI.h>
#include <Wire.h>
#include <SparkFun_APDS9960.h>
#include <sstream>
#include "image_1.h"
#include "image_2.h"
#include "image_3.h"

#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

#define STATUS_PIN 5
#define CS_PIN 2
#define GESTURE_INT 15

#define IMAGE_WIDTH 800
#define IMAGE_HEIGHT 600
#define SPI_MODE SPI_MODE1
#define REQUIRED_IMAGE_PASSES 11
#define MAX_IMAGES 3

#define SERVICE_UUID           "6E400001-B5A3-F393-E0A9-E50E24DCCA9E"
#define CHARACTERISTIC_UUID_RX "6E400002-B5A3-F393-E0A9-E50E24DCCA9E"
#define CHARACTERISTIC_UUID_TX "6E400003-B5A3-F393-E0A9-E50E24DCCA9E"

/**
 * The BLE characteristic
 */
BLECharacteristic *pCharacteristic;

/**
 * device conncected flag
 */
bool deviceConnected = false;

/**
 * number of bytes received via BLE
 */
int pos=0;

/**
 * The APDS9960 gsésture sensor
 */
SparkFun_APDS9960 apds = SparkFun_APDS9960();

/**
 * interrupt flag for gesture sensor
 */
int isr_flag = 0;

/**
 * ciurrently shown picture number
 */
int picture=0;

/**
 * array that contains the pictures
 */
const unsigned char *pictures[MAX_IMAGES];

/**
 * Picture to override
 */
unsigned int overwriteNr=0;

/**
 * Displays an image on the display
 * @param image The image to be displayed
 */
void sendImage(const unsigned char *image) {
  bool DeviceStatus;
  
  unsigned char data;
    
  Serial.println("Start sendImage.");

  DeviceStatus = digitalRead(STATUS_PIN);
  digitalWrite(CS_PIN, LOW);
  SPI.transfer(4);
  while (digitalRead(STATUS_PIN) == DeviceStatus) { }
  DeviceStatus = !DeviceStatus;

  for (unsigned int pass = 0; pass < REQUIRED_IMAGE_PASSES; pass++) 
  {
    for (unsigned int imageByteIdx = 0; imageByteIdx < 30000; imageByteIdx=imageByteIdx+100)
    {
      for (unsigned int j=0;j<2;j++)
      {
        for(unsigned int i=0;i<100;i++)
        {
         if(imageByteIdx < sizeof(gImage_image_1)){
          data = *(image+imageByteIdx+i);
         }
         else 
         {
           data = 0x00;
         }
         SPI.transfer(data);
         while (digitalRead(STATUS_PIN) == DeviceStatus) { }
         DeviceStatus = !DeviceStatus;
         SPI.transfer(data);
         while (digitalRead(STATUS_PIN) == DeviceStatus) { }
         DeviceStatus = !DeviceStatus;
        }
      }
    }    
  }
  
  digitalWrite(CS_PIN, HIGH);

  Serial.println("End sendImage.");
}

/**
 * Callback class for BLE server
 */
class MyServerCallbacks: public BLEServerCallbacks
{
    /**
     * Set the device connection to true and disabled the gesture interrupt
     */
    void onConnect(BLEServer* pServer)
    {
      deviceConnected = true;
      detachInterrupt(GESTURE_INT);
    };

    /**
     * Set the device connection to false and enabled the gesture interrupt
     */
    void onDisconnect(BLEServer* pServer)
    {
      deviceConnected = false;
      attachInterrupt(GESTURE_INT, interruptRoutine, FALLING);
    }
};

/**
 * Callback class for BLE characteristic
 */
class MyCallbacks: public BLECharacteristicCallbacks
{

    /**
     * receive 20 bytes of data and stores them in image array
     */
    void onWrite(BLECharacteristic *pCharacteristic)
    {
      Serial.println("Empfange...");
      std::string rxValue = pCharacteristic->getValue();
      std::stringstream sstream;
      
      for (int i=0;i<60;i+=3)
      {
        sstream << std::hex << atoi(rxValue.substr(i,3).c_str())<<" ";
      }
      std::string result = sstream.str();
      std::istringstream hex_chars_stream(result);
      unsigned int c;
      
      while (hex_chars_stream >> std::hex >> c)
      {
        if(pos<30000)
        {
          if(overwriteNr==0)
          {
            gImage_image_1[pos]=c;
          }
          else if(overwriteNr==1)
          {
            gImage_image_2[pos]=c;
          }
          else
          {
            gImage_image_3[pos]=c;
          }
          //Serial.println(result.c_str());
          pos++;
         // Serial.println(pos);
          if(pos==30000)
          {
           clearScreen();
           clearScreen();
           clearScreen();
           clearScreen();
           clearScreen();
           clearScreen();
           clearScreen();
           clearScreen();
           clearScreen();
           clearScreen();
           if(overwriteNr==2)
           {
            overwriteNr=0;
           }
           else
           {
            overwriteNr++;
           }
           sendImage(pictures[0]);
          }
        }
      }
    }
};

/**
 * clear display screen
 */
void clearScreen(void)
{
  bool DeviceStatus;
  
  DeviceStatus = digitalRead(STATUS_PIN);
  digitalWrite(CS_PIN, LOW);
  SPI.transfer(3); 
  while (digitalRead(STATUS_PIN) == DeviceStatus) { }
  digitalWrite(CS_PIN, HIGH);
}

/**
 * Set image size
 * @param isWidth If true value is the width of the image else value is the height
 * @value image width or height
 */
void setImageDimension(bool isWidth, unsigned int value)
{
  bool DeviceStatus;
  
  DeviceStatus = digitalRead(STATUS_PIN);
  digitalWrite(CS_PIN, LOW);
  SPI.transfer(isWidth ? 2 : 1);
  while (digitalRead(STATUS_PIN) == DeviceStatus) { }
  DeviceStatus = !DeviceStatus;
  SPI.transfer(value >> 8);
  while (digitalRead(STATUS_PIN) == DeviceStatus) { }
  DeviceStatus = !DeviceStatus;  
  SPI.transfer(value & 0xFF);
  while (digitalRead(STATUS_PIN) == DeviceStatus) { }
  digitalWrite(CS_PIN, HIGH);
}

/**
 * Set the width of the image
 * @param width Image width
 */
void setImageWidth(unsigned int width)
{
  setImageDimension(true, width);
}

/**
 * Set the height of the image
 * @param width Image height
 */
void setImageHeight(unsigned int height)
{
  setImageDimension(false, height);
}

/**
 * check which gesture was performed
 */
void handleGesture()
{
  if (apds.isGestureAvailable())
  {
	  switch (apds.readGesture()) 
	  {
	    case DIR_UP:
			  Serial.println("UP");
			  break;
		  case DIR_DOWN:
			  Serial.println("DOWN");
			  break;
		  case DIR_LEFT:
			  Serial.println("LEFT");
        picture--;
			  if(picture==-1)
			  {
				  picture=MAX_IMAGES-1;
			  }
			  clearScreen();
        sendImage(pictures[picture]);
			  break;
		  case DIR_RIGHT:
			  Serial.println("RIGHT");
        picture++;
			  if(picture==MAX_IMAGES)
			  {
				  picture=0;
			  }
			  clearScreen();
        sendImage(pictures[picture]);
			  break;
		  case DIR_NEAR:
			  Serial.println("NEAR");
		    break;
		  case DIR_FAR:
			  Serial.println("FAR");
			  break;
		  default:
			  Serial.println("NONE");
		}
	}
}

/*
 * set interrupt flag to 1
 */
void interruptRoutine()
{
  isr_flag = 1;
}

/**
 * Initialise BLE, gesture sensor and display
 */
void setup() 
{
  Serial.begin(115200);
  while (!Serial) {};
  pictures[0]=gImage_image_1;
  pictures[1]=gImage_image_2;
  pictures[2]=gImage_image_3; 

  BLEDevice::init("Smartes E-INK Display");

  // Create the BLE Server
  BLEServer *pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());

  // Create the BLE Service
  BLEService *pService = pServer->createService(SERVICE_UUID);

  // Create a BLE Characteristic
  pCharacteristic = pService->createCharacteristic(
                      CHARACTERISTIC_UUID_TX,
                      BLECharacteristic::PROPERTY_NOTIFY
                    );
                      
  pCharacteristic->addDescriptor(new BLE2902());

  BLECharacteristic *pCharacteristic = pService->createCharacteristic(
                                         CHARACTERISTIC_UUID_RX,
                                         BLECharacteristic::PROPERTY_WRITE
                                       );

  pCharacteristic->setCallbacks(new MyCallbacks());

  // Start the service
  pService->start();

  // Start advertising
  pServer->getAdvertising()->start();
  Serial.println("Waiting a client connection to notify...");
  

  if (apds.init())
  {
    Serial.println("APDS-9960 initialization complete");
  }
  else 
  {
    Serial.println("Something went wrong during APDS-9960 init!");
    ESP.restart();
  }
  if (apds.enableGestureSensor(true)) 
  {
    Serial.println("Gesture sensor is now running");
  }
  else 
  {
    Serial.println("Something went wrong during gesture sensor init!");
    ESP.restart();
  }
  
  pinMode(STATUS_PIN, INPUT); 
  digitalWrite(STATUS_PIN, HIGH);
  pinMode(CS_PIN, OUTPUT); 
  digitalWrite(CS_PIN, HIGH);

  SPI.begin();
  SPI.setBitOrder(MSBFIRST);
  SPI.setDataMode(SPI_MODE);
  SPI.setClockDivider(SPI_CLOCK_DIV4);  

  Serial.println("Rendering image.");
  setImageWidth(IMAGE_WIDTH);
  setImageHeight(IMAGE_HEIGHT);
  clearScreen();
  clearScreen();
  clearScreen();
  clearScreen();
  clearScreen();
  clearScreen();
  clearScreen();
  clearScreen();
  clearScreen();
  clearScreen();
  sendImage(gImage_image_1);
  attachInterrupt(GESTURE_INT, interruptRoutine, FALLING);
}

/**
 * check the interrupt flag in a loop
 */
void loop()
{
  delay(20);
  if( isr_flag == 1 ) 
  {
    detachInterrupt(GESTURE_INT);
    handleGesture();
    isr_flag = 0;
    attachInterrupt(GESTURE_INT, interruptRoutine, FALLING);
  }
}
