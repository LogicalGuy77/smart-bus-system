import React, { useState, useEffect } from "react";

function App() {
  const [sensorData, setSensorData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [latestData, setLatestData] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:5000/api/data");

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setSensorData(data);

        // Set the latest data for the main display
        if (data.length > 0) {
          setLatestData(data[0]);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch sensor data");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    // Set up polling every 5 seconds
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Smart Bus Monitoring System
          </h1>
        </header>

        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6 text-center">
            {error}
          </div>
        )}

        {loading && !latestData ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : latestData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Environment Data Card */}
            <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
              <h2 className="text-xl font-semibold mb-4 text-blue-400">
                Environment Data
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-700/50 p-4 rounded-lg flex flex-col items-center">
                  <div className="text-gray-400 mb-1">Temperature</div>
                  <div className="text-3xl font-bold">
                    {latestData.temperature}°C
                  </div>
                </div>
                <div className="bg-gray-700/50 p-4 rounded-lg flex flex-col items-center">
                  <div className="text-gray-400 mb-1">Humidity</div>
                  <div className="text-3xl font-bold">
                    {latestData.humidity}%
                  </div>
                </div>
              </div>
            </div>

            {/* Occupancy Card */}
            <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
              <h2 className="text-xl font-semibold mb-4 text-blue-400">
                Seat Occupancy
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div
                  className={`p-4 rounded-lg flex flex-col items-center ${
                    latestData.seat1.occupied
                      ? "bg-red-500/20 border border-red-500"
                      : "bg-green-500/20 border border-green-500"
                  }`}
                >
                  <div className="text-gray-300 mb-1">Seat 1</div>
                  <div className="text-2xl font-bold">
                    {latestData.seat1.occupied ? "Occupied" : "Empty"}
                  </div>
                  <div className="text-sm mt-1">
                    Distance: {latestData.seat1.distance.toFixed(1)} cm
                  </div>
                </div>
                <div
                  className={`p-4 rounded-lg flex flex-col items-center ${
                    latestData.seat2.occupied
                      ? "bg-red-500/20 border border-red-500"
                      : "bg-green-500/20 border border-green-500"
                  }`}
                >
                  <div className="text-gray-300 mb-1">Seat 2</div>
                  <div className="text-2xl font-bold">
                    {latestData.seat2.occupied ? "Occupied" : "Empty"}
                  </div>
                  <div className="text-sm mt-1">
                    Distance: {latestData.seat2.distance.toFixed(1)} cm
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Recent Data */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-blue-400">
            Recent Readings
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-700/20 rounded-lg">
              <thead>
                <tr>
                  <th className="py-3 px-4 text-left">Time</th>
                  <th className="py-3 px-4 text-left">Temp</th>
                  <th className="py-3 px-4 text-left">Humidity</th>
                  <th className="py-3 px-4 text-left">Seat 1</th>
                  <th className="py-3 px-4 text-left">Seat 2</th>
                </tr>
              </thead>
              <tbody>
                {sensorData.map((reading) => (
                  <tr key={reading._id} className="border-t border-gray-700">
                    <td className="py-3 px-4">
                      {formatTime(reading.timestamp)}
                    </td>
                    <td className="py-3 px-4">{reading.temperature}°C</td>
                    <td className="py-3 px-4">{reading.humidity}%</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          reading.seat1.occupied
                            ? "bg-red-500/30 text-red-200"
                            : "bg-green-500/30 text-green-200"
                        }`}
                      >
                        {reading.seat1.occupied ? "Occupied" : "Empty"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          reading.seat2.occupied
                            ? "bg-red-500/30 text-red-200"
                            : "bg-green-500/30 text-green-200"
                        }`}
                      >
                        {reading.seat2.occupied ? "Occupied" : "Empty"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
