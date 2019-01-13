#include <SPI.h>
#include <Wire.h>
#include <SparkFun_APDS9960.h>
#include "image_1.c"
#include "image_2.c"
#include "image_3.c"

#define STATUS_PIN 5
#define CS_PIN 2
#define GESTURE_INT 15

#define IMAGE_WIDTH 800
#define IMAGE_HEIGHT 600
#define SPI_MODE SPI_MODE1
#define REQUIRED_IMAGE_PASSES 11
#define MAX_IMAGES 3 

SparkFun_APDS9960 apds = SparkFun_APDS9960();
int isr_flag = 0;
int picture=0;
const unsigned char *pictures[MAX_IMAGES];

void clearScreen(void) {
  bool DeviceStatus;
  
  DeviceStatus = digitalRead(STATUS_PIN);
  digitalWrite(CS_PIN, LOW);
  SPI.transfer(3); 
  while (digitalRead(STATUS_PIN) == DeviceStatus) { }
  digitalWrite(CS_PIN, HIGH);
}

void setImageDimension(bool isWidth, unsigned int value) {
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

void setImageWidth(unsigned int width) {
  setImageDimension(true, width);
}

void setImageHeight(unsigned int height) {
  setImageDimension(false, height);
}

void sendImage(const unsigned char *image) {
  bool DeviceStatus;
  unsigned char data;
    
  Serial.println("Start sendImage.");

  DeviceStatus = digitalRead(STATUS_PIN);
  digitalWrite(CS_PIN, LOW);
  SPI.transfer(4);
  while (digitalRead(STATUS_PIN) == DeviceStatus) { }
  DeviceStatus = !DeviceStatus;

  for (unsigned int pass = 0; pass < REQUIRED_IMAGE_PASSES; pass++) {
    for (unsigned int imageByteIdx = 0; imageByteIdx < 30000; imageByteIdx=imageByteIdx+100) {
      for(unsigned int i=0;i<100;i++)
      {
        if(imageByteIdx < sizeof(gImage_image_1)){
         data = *(image+imageByteIdx+i);
        } else {
          data = 0x00;
        }
        SPI.transfer(data);
        while (digitalRead(STATUS_PIN) == DeviceStatus) { }
        DeviceStatus = !DeviceStatus;
        SPI.transfer(data);
        while (digitalRead(STATUS_PIN) == DeviceStatus) { }
        DeviceStatus = !DeviceStatus;
      }
      for(unsigned int i=0;i<100;i++)
      {
        if(imageByteIdx < sizeof(gImage_image_1)){
         data = *(image+imageByteIdx+i);
        } else {
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
  
  digitalWrite(CS_PIN, HIGH);

  Serial.println("End sendImage.");
}

void handleGesture() {
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
			//sendImage(gImage_image_1);
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
			//sendImage(gImage_image_2);
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

void interruptRoutine()
{
  isr_flag = 1;
}

void setup() {
  pictures[0]=gImage_image_1;
  pictures[1]=gImage_image_2;
  pictures[2]=gImage_image_3; 
  
  Serial.begin(9600);
  while (!Serial) {};

  if (apds.init())
  {
    Serial.println("APDS-9960 initialization complete");
  }
  else 
  {
    Serial.println("Something went wrong during APDS-9960 init!");
  }
  if (apds.enableGestureSensor(true)) 
  {
    Serial.println("Gesture sensor is now running");
  }
  else 
  {
    Serial.println("Something went wrong during gesture sensor init!");
  }
  
  pinMode(STATUS_PIN, INPUT); 
  digitalWrite(STATUS_PIN, HIGH);
  pinMode(CS_PIN, OUTPUT); 
  digitalWrite(CS_PIN, HIGH);

  SPI.begin();
  SPI.setBitOrder(LSBFIRST);
  SPI.setDataMode(SPI_MODE);
  SPI.setClockDivider(SPI_CLOCK_DIV4);  

  Serial.println("Rendering image.");
  setImageWidth(IMAGE_WIDTH);
  setImageHeight(IMAGE_HEIGHT);
  clearScreen();
  sendImage(gImage_image_1);
  attachInterrupt(GESTURE_INT, interruptRoutine, FALLING);
}

void loop() {
  if( isr_flag == 1 ) {
    detachInterrupt(GESTURE_INT);
    handleGesture();
    isr_flag = 0;
    attachInterrupt(GESTURE_INT, interruptRoutine, FALLING);
  }
}