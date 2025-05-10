const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for your React app
app.use(cors());

// MongoDB connection string
const uri =
  "mongodb+srv://apj:123@cluster0.uqfjik2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// const uri =
//   "mongodb+srv://23ucc626:shail%401234@cluster0.yc5bc3b.mongodb.net/?retryWrites=true&w=majority&appName=cluster0";

// API endpoint to get sensor data
app.get("/api/data", async (req, res) => {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    //const db = client.db("smartCampusLighting");
    const db = client.db("iot_test");
    const coll = db.collection("esp32_data");
    //const coll = db.collection("SENSOR_READINGS");

    // Get latest 10 readings, sorted by timestamp descending
    const result = await coll
      .find()
      .sort({ timestamp: -1 })
      .limit(10)
      .toArray();
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch data from database" });
  } finally {
    await client.close();
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
