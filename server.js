const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000; // ✅ Use Render's PORT or fallback to 3000

app.use(express.static("public"));

// ✅ Root route
app.get("/", (req, res) => {
  res.send("🌤️ Weather API is running! Use /weather?city=Delhi");
});

// ✅ Weather by city
app.get("/weather", async (req, res) => {
  // Accept both ?city= and ?q= for flexibility
  const { city, q } = req.query;
  const cityName = city || q;

  if (!cityName) {
    return res.status(400).json({ error: "City name required" });
  }

  try {
    // Step 1: Geocode city → lat, lon
    const geoRes = await axios.get("https://nominatim.openstreetmap.org/search", {
      params: {
        q: cityName,
        format: "json",
        limit: 1,
      },
    });

    if (!geoRes.data.length) {
      return res.status(404).json({ error: "City not found" });
    }

    const { lat, lon, display_name } = geoRes.data[0];

    // Step 2: Get weather from Open-Meteo
    const weatherRes = await axios.get(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
    );

    res.json({
      city: display_name,
      ...weatherRes.data.current_weather,
    });
  } catch (error) {
    console.error("❌ API Error:", error.message);
    res.status(500).json({ error: "API error" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
