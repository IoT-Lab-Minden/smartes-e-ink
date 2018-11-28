#include <SPI.h>

#define IMAGE_WIDE 600
#define IMAGE_HIGH 800

#define STATUS_PIN 5
#define CS_PIN 2
#define MOSI_PIN 23
#define MISO_PIN 19
#define SCK_PIN 18

#define FRAME_END_LEN  11

#define USE_HARDWARE_SPI 1
#define SPI_MODE SPI_MODE1

void setup() {
  Serial.begin(115200);
  pinMode(STATUS_PIN, INPUT); 
  pinMode(CS_PIN, OUTPUT); 
  pinMode(MOSI_PIN, OUTPUT); 
  pinMode(MISO_PIN, INPUT); 
  pinMode(SCK_PIN, OUTPUT); 
  digitalWrite(CS_PIN,HIGH);
  digitalWrite(STATUS_PIN,HIGH);
  digitalWrite(SCK_PIN,LOW);
#if(USE_HARDWARE_SPI) 
  Serial.println("Test");
  SPI.begin();
  SPI.setBitOrder(MSBFIRST);
  SPI.setDataMode(SPI_MODE);
  SPI.setClockDivider(SPI_CLOCK_DIV8);  
#endif

}

void loop() {
  // put your main code here, to run repeatedly:

}
