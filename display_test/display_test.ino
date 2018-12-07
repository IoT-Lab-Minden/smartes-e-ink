#include <SPI.h>
#include "image_1.c"
#include "image_2.c"

#define STATUS_PIN 5
#define CS_PIN 2

#define IMAGE_WIDTH 800
#define IMAGE_HEIGHT 600
#define SPI_MODE SPI_MODE1
#define REQUIRED_IMAGE_PASSES 11

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
    for (unsigned int imageByteIdx = 0, x = 0, y = 0; imageByteIdx < 120000; imageByteIdx++) {
      if(imageByteIdx < sizeof(gImage_image_2)){
        data = *(image+imageByteIdx);
      } else {
        data = 0x00;
      }
      SPI.transfer(data);

      while (digitalRead(STATUS_PIN) == DeviceStatus) { }
      DeviceStatus = !DeviceStatus;
    }    
  }
  
  digitalWrite(CS_PIN, HIGH);

  Serial.println("End sendImage.");
}

void setup() {
  Serial.begin(9600);
  while (!Serial) {};
  
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
  sendImage(gImage_image_2);
}

void loop() {
}
