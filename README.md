![image](https://github.com/user-attachments/assets/ad47391b-ee6e-4d44-84f6-3095ef8647f0)

## Project Overview
This project creates a data pipeline for IoT sensor data collection using ESP32 microcontrollers, MQTT messaging protocol, and MongoDB Atlas cloud database. The system collects environmental sensor data (temperature, humidity, etc.) from ESP32 devices and stores it in a cloud database for further analysis.

## System Architecture
The project consists of three main components:

#### ESP32 Sensor Node: Collects data from attached sensors (DHT22) and publishes it to the MQTT broker.
#### Raspberry Pi MQTT Broker: Acts as middleware to receive, process, and forward sensor data.
#### MongoDB Atlas: Cloud database that stores all sensor readings for long-term persistence.

## Components
#### ESP32 Publisher
* Connects to WiFi network and MQTT broker on Raspberry Pi
* Reads temperature and humidity from DHT22 sensor
* Formats data as JSON
* Publishes readings to esp32/sensors topic every 5 seconds

#### Raspberry Pi MQTT Subscriber
* Runs Mosquitto MQTT broker service
* Subscribes to esp32/sensors topic
* Processes incoming JSON data
* Adds timestamps to readings
* Stores data in MongoDB Atlas

#### MongoDB Atlas
* Cloud-hosted database for IoT data
* iot_test database with esp32_data collection
* Stores sensor readings with timestamps
  
### How it Works
#### Startup:
- ESP32 connects to WiFi and the MQTT broker on Raspberry Pi
- Raspberry Pi runs the Mosquitto broker and subscriber script
- Subscriber script connects to MongoDB Atlas
  
#### Data Flow:
- ESP32 reads sensor data every 5 seconds
- Data is formatted as JSON and published to MQTT broker
- Raspberry Pi subscriber receives the JSON data
- Subscriber parses the JSON, adds a timestamp, and stores it in MongoDB
- Subscriber displays the received data in the terminal

#### Data Storage:
- All readings are stored with UTC timestamps in MongoDB Atlas
- Data remains accessible for historical analysis and visualization
