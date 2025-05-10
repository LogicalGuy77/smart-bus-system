import paho.mqtt.client as mqtt
from pymongo import MongoClient
from datetime import datetime
import json

# MongoDB Atlas connection
mongo_client = MongoClient("mongodb+srv://apj:123@cluster0.uqfjik2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
db = mongo_client["iot_test"]
collection = db["esp32_data"]  # Changed collection name to be more descriptive

# MQTT settings
MQTT_BROKER = "localhost"
MQTT_PORT = 1883
MQTT_TOPIC = "esp32/sensors"  # Updated to match ESP32's publishing topic

def on_connect(client, userdata, flags, rc, properties=None):
    print(f"Connected with result code {rc}")
    client.subscribe(MQTT_TOPIC)
    print(f"Subscribed to: {MQTT_TOPIC}")

def on_message(client, userdata, msg):
    payload = msg.payload.decode()
    print(f"Received from ESP32: {payload}")

    try:
        # Parse JSON data from ESP32
        data = json.loads(payload)
        
        # Print each value from the received data
        print("\n----- ESP32 SENSOR DATA -----")
        for key, value in data.items():
            print(f"{key.capitalize()}: {value}")
        print("----------------------------\n")
        
        # Insert into MongoDB with timestamp
        data["timestamp"] = datetime.utcnow()
        collection.insert_one(data)
        print(f"Stored ESP32 data in MongoDB Atlas (Collection: {collection.name})")
    except json.JSONDecodeError:
        print("Error: Received invalid JSON data")
    except Exception as e:
        print(f"Error storing data: {e}")

# Use MQTT v5 client
mqtt_client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
mqtt_client.on_connect = on_connect
mqtt_client.on_message = on_message
mqtt_client.connect(MQTT_BROKER, MQTT_PORT, 60)

print("Raspberry Pi MQTT Subscriber running. Waiting for ESP32 data...")
mqtt_client.loop_forever()