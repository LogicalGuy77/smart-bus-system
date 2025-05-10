#include <WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>

// WiFi settings
const char *ssid = "1i";
const char *password = "qwerty1234";

// MQTT Broker settings (Raspberry Pi)
const char *mqtt_server = "192.168.43.68";
const int mqtt_port = 1883;

const char *mqtt_topic = "esp32/sensors";
const char *mqtt_client_id = "ESP32_Publisher";

// DHT sensor settings
#define DHTPIN 4                   // Digital pin connected to the DHT sensor
#define DHTTYPE DHT22              // DHT 22 (AM2302)
const float TEMP_THRESHOLD = 28.0; // Temperature threshold for AC (LED) in °C

// LED settings
#define LED_PIN 2 // GPIO pin for LED indicating AC status

// Ultrasonic sensor settings for Seat 1
#define TRIG_PIN_1 5                      // Trigger pin for HC-SR04 (Seat 1)
#define ECHO_PIN_1 18                     // Echo pin for HC-SR04 (Seat 1)
const float OCCUPANCY_THRESHOLD_1 = 30.0; // Distance in cm to detect seat 1 occupancy

// Ultrasonic sensor settings for Seat 2
#define TRIG_PIN_2 19                     // Trigger pin for HC-SR04 (Seat 2)
#define ECHO_PIN_2 21                     // Echo pin for HC-SR04 (Seat 2)
const float OCCUPANCY_THRESHOLD_2 = 30.0; // Distance in cm to detect seat 2 occupancy

// Update interval
const long interval = 5000; // Publish every 5 seconds
unsigned long previousMillis = 0;

// Initialize WiFi client
WiFiClient espClient;
// Initialize MQTT client
PubSubClient client(espClient);
// Initialize DHT sensor
DHT dht(DHTPIN, DHTTYPE);

// Function to measure distance using ultrasonic sensor
float getDistance(int trigPin, int echoPin)
{
  // Send trigger pulse
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  // Measure echo pulse duration
  long duration = pulseIn(echoPin, HIGH);

  // Calculate distance (speed of sound = 343 m/s, so distance = duration * 0.0343 / 2)
  float distance = duration * 0.0343 / 2;

  return distance;
}

void setup_wifi()
{
  delay(10);
  // Connect to WiFi network
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

void reconnect()
{
  // Loop until reconnected to MQTT broker
  while (!client.connected())
  {
    Serial.print("Attempting MQTT connection...");
    if (client.connect(mqtt_client_id))
    {
      Serial.println("connected");
    }
    else
    {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}

void setup()
{
  Serial.begin(115200);

  // Initialize ultrasonic sensor pins for Seat 1
  pinMode(TRIG_PIN_1, OUTPUT);
  pinMode(ECHO_PIN_1, INPUT);

  // Initialize ultrasonic sensor pins for Seat 2
  pinMode(TRIG_PIN_2, OUTPUT);
  pinMode(ECHO_PIN_2, INPUT);

  // Initialize LED pin
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW); // Start with LED off

  // Initialize WiFi, MQTT, and DHT
  setup_wifi();
  client.setServer(mqtt_server, mqtt_port);
  dht.begin();
}

void loop()
{
  if (!client.connected())
  {
    reconnect();
  }
  client.loop();

  unsigned long currentMillis = millis();

  if (currentMillis - previousMillis >= interval)
  {
    previousMillis = currentMillis;

    // Read DHT sensor values
    float humidity = dht.readHumidity();
    float temperature = dht.readTemperature();

    // Check if DHT reads failed
    if (isnan(humidity) || isnan(temperature))
    {
      Serial.println("Failed to read from DHT sensor!");
      return;
    }

    // Control LED based on temperature threshold
    if (temperature > TEMP_THRESHOLD)
    {
      digitalWrite(LED_PIN, HIGH); // Turn on LED (AC on)
      Serial.println("Temperature above threshold, LED turned ON");
    }
    else
    {
      digitalWrite(LED_PIN, LOW); // Turn off LED (AC off)
      Serial.println("Temperature below threshold, LED turned OFF");
    }

    // Read distance from ultrasonic sensor for Seat 1
    float distance1 = getDistance(TRIG_PIN_1, ECHO_PIN_1);

    // Determine seat 1 occupancy
    bool isOccupied1 = distance1 < OCCUPANCY_THRESHOLD_1;

    // Read distance from ultrasonic sensor for Seat 2
    float distance2 = getDistance(TRIG_PIN_2, ECHO_PIN_2);

    // Determine seat 2 occupancy
    bool isOccupied2 = distance2 < OCCUPANCY_THRESHOLD_2;

    // Create JSON formatted string with temperature, humidity, and both seats' data
    char message[200];
    snprintf(message, sizeof(message),
             "{\"temperature\":%.1f,\"humidity\":%.1f,\"seat1\":{\"distance\":%.1f,\"occupied\":%s},\"seat2\":{\"distance\":%.1f,\"occupied\":%s}}",
             temperature, humidity,
             distance1, isOccupied1 ? "true" : "false",
             distance2, isOccupied2 ? "true" : "false");

    // Publish message
    Serial.print("Publishing message: ");
    Serial.println(message);
    client.publish(mqtt_topic, message);
  }
}