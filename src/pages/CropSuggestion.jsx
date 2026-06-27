import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';

import {
  FaSeedling,
  FaThermometerHalf,
  FaWater,
  FaCloudRain,
  FaSearch,
  FaMapMarkerAlt,
  FaStar,
  FaLocationArrow
} from 'react-icons/fa';

const CropSuggestion = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  

  const [weatherData, setWeatherData] = useState(null);
  const [soilData, setSoilData] = useState(null);

  const [recommendations, setRecommendations] = useState([]);

  const [searchLocation, setSearchLocation] = useState('');
  const [currentLocation, setCurrentLocation] = useState(null);

  // =========================================
  // CROP DATABASE
  // =========================================

  const cropDatabase = {
    rice: {
      minTemp: 20,
      maxTemp: 38,
      minRain: 1000,
      maxRain: 3500,
      moistureNeed: 0.55,
      regions: ['wet', 'tropical', 'coastal'],
      description:
        'Staple grain crop requiring abundant water and warm temperatures.',
      season: 'Kharif',
      tips:
        'Maintain standing water during early growth stages.'
    },

    wheat: {
      minTemp: 10,
      maxTemp: 25,
      minRain: 300,
      maxRain: 1000,
      moistureNeed: 0.30,
      regions: ['dry', 'cool'],
      description:
        'Winter cereal crop suited for cool and dry climates.',
      season: 'Rabi',
      tips:
        'Avoid excessive irrigation during grain filling stage.'
    },

    maize: {
      minTemp: 18,
      maxTemp: 32,
      minRain: 500,
      maxRain: 1200,
      moistureNeed: 0.40,
      regions: ['moderate'],
      description:
        'Widely grown cereal crop requiring moderate rainfall.',
      season: 'Kharif',
      tips:
        'Ensure proper drainage to prevent root rot.'
    },

    cotton: {
      minTemp: 20,
      maxTemp: 35,
      minRain: 500,
      maxRain: 1200,
      moistureNeed: 0.30,
      regions: ['dry', 'hot'],
      description:
        'Fiber crop preferring warm climate and low humidity.',
      season: 'Kharif',
      tips:
        'Avoid waterlogging conditions.'
    },

    sugarcane: {
      minTemp: 22,
      maxTemp: 38,
      minRain: 900,
      maxRain: 2500,
      moistureNeed: 0.50,
      regions: ['wet', 'tropical'],
      description:
        'High water demanding commercial crop.',
      season: 'Kharif',
      tips:
        'Needs fertile soil and regular irrigation.'
    },

    banana: {
      minTemp: 20,
      maxTemp: 38,
      minRain: 1000,
      maxRain: 3000,
      moistureNeed: 0.60,
      regions: ['wet', 'tropical', 'coastal'],
      description:
        'Tropical fruit crop needing consistent moisture.',
      season: 'All Season',
      tips:
        'Apply mulch to retain soil moisture.'
    },

    coconut: {
      minTemp: 22,
      maxTemp: 36,
      minRain: 1400,
      maxRain: 4000,
      moistureNeed: 0.60,
      regions: ['coastal', 'wet', 'tropical'],
      description:
        'Coastal tropical crop with high humidity requirement.',
      season: 'All Season',
      tips:
        'Performs best in coastal sandy soils.'
    },

    chilli: {
      minTemp: 20,
      maxTemp: 32,
      minRain: 500,
      maxRain: 1200,
      moistureNeed: 0.35,
      regions: ['moderate', 'hot'],
      description:
        'Spice crop suitable for warm climate.',
      season: 'Kharif',
      tips:
        'Avoid overwatering during fruiting stage.'
    },

    tomato: {
      minTemp: 18,
      maxTemp: 30,
      minRain: 400,
      maxRain: 1000,
      moistureNeed: 0.40,
      regions: ['moderate'],
      description:
        'Vegetable crop requiring balanced irrigation.',
      season: 'Rabi',
      tips:
        'Support plants using stakes.'
    }
  };
const [npkInput, setNpkInput] = useState({
  N: '',
  P: '',
  K: '',
  humidity: ''
});

const [mlResult, setMlResult] = useState(null);
const [mlLoading, setMlLoading] = useState(false); 
const getMlRecommendation = async () => {
  try {
    setMlLoading(true);
    setMlResult(null);

    
   const payload = {
  N: Number(npkInput.N),
  P: Number(npkInput.P),
  K: Number(npkInput.K),
  temperature: weatherData?.avgTemp || 25,
  humidity: Number(npkInput.humidity),
  ph: soilData?.ph || 6.5,
  rainfall: weatherData?.totalRain || 1000
};

    const response = await fetch("http://localhost:5000/recommend", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    setMlResult(data);
  } catch (err) {
    console.error("ML Error:", err);
    setMlResult("Error getting prediction");
  } finally {
    setMlLoading(false);
  }
};
  // =========================================
  // GET CURRENT LOCATION
  // =========================================

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        try {
          const geoUrl = `
https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}&language=en
`;

          const geoResponse = await fetch(geoUrl);

          const geoData = await geoResponse.json();

          const locationName =
            geoData?.results?.[0]?.name ||
            'Current Location';

          const country =
            geoData?.results?.[0]?.country || '';

          setCurrentLocation({
            latitude,
            longitude,
            name: locationName,
            country
          });

          fetchWeatherData(
            latitude,
            longitude,
            `${locationName}, ${country}`
          );

        } catch (err) {
          console.error(err);

          fetchWeatherData(
            latitude,
            longitude,
            'Current Location'
          );
        }
      },

      (err) => {
        console.error(err);

        setLoading(false);

        setError(
          'Unable to access your location'
        );
      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // =========================================
  // SEARCH LOCATION
  // =========================================

  const searchByLocation = async (query) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          query
        )}&count=1`
      );

      if (!response.ok) {
        throw new Error('Location search failed');
      }

      const data = await response.json();

      if (!data.results?.[0]) {
        throw new Error('Location not found');
      }

      const {
        latitude,
        longitude,
        name,
        country
      } = data.results[0];

      setCurrentLocation({
        latitude,
        longitude,
        name,
        country
      });

      fetchWeatherData(
        latitude,
        longitude,
        `${name}, ${country}`
      );

    } catch (err) {
      console.error(err);

      setError(err.message);

      setLoading(false);
    }
  };

  // =========================================
  // FETCH SOIL DATA
  // =========================================
// =========================================
// FETCH SOIL DATA
// =========================================

const fetchSoilData = async (
  latitude,
  longitude
) => {
  try {

    const url = `
https://rest.isric.org/soilgrids/v2.0/properties/query?lon=${longitude}&lat=${latitude}&property=phh2o&property=clay&property=sand&property=soc&depth=0-5cm&value=mean
`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Soil API failed');
    }

    const data = await response.json();

    const layers =
      data.properties?.layers || [];

    // =========================================
    // GET LAYER VALUE
    // =========================================

    const getValue = (name) => {
      const layer = layers.find(
        (l) => l.name === name
      );

      return (
        layer?.depths?.[0]?.values?.mean ||
        0
      );
    };

    // =========================================
    // FIXED CONVERSIONS
    // =========================================

    const soilInfo = {

      // pH stored as x10
      ph: parseFloat(
        (getValue('phh2o') / 10).toFixed(1)
      ),

      // clay & sand stored in g/kg
      // convert to %

      clay: parseFloat(
        (getValue('clay') / 10).toFixed(1)
      ),

      sand: parseFloat(
        (getValue('sand') / 10).toFixed(1)
      ),

      // organic carbon
      // convert dg/kg → g/kg

      organicCarbon: parseFloat(
        (getValue('soc') / 10).toFixed(1)
      )
    };

    console.log(
      'Corrected Soil Data:',
      soilInfo
    );

    setSoilData(soilInfo);

    return soilInfo;

  } catch (err) {

    console.error(err);

    // =========================================
    // FALLBACK SOIL DATA
    // =========================================

    const fallbackSoil = {
      ph: 6.8,
      clay: 29.3,
      sand: 36.0,
      organicCarbon: 31.5
    };

    setSoilData(fallbackSoil);

    return fallbackSoil;
  }
};
  // =========================================
  // FETCH WEATHER DATA
  // =========================================

  const fetchWeatherData = async (
    latitude,
    longitude,
    locationName = ''
  ) => {
    try {
      setLoading(true);

      const soilInfo =
        await fetchSoilData(
          latitude,
          longitude
        );

      const url = `
https://archive-api.open-meteo.com/v1/archive?latitude=${latitude}&longitude=${longitude}&start_date=2023-01-01&end_date=2025-12-31&daily=temperature_2m_mean,precipitation_sum&timezone=auto
`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Weather fetch failed');
      }

      const data = await response.json();

      const temps =
        data.daily?.temperature_2m_mean || [];

      const rainfall =
        data.daily?.precipitation_sum || [];

      const avgTemp =
        temps.reduce((a, b) => a + b, 0) /
        temps.length;

      const totalRainfall =
        rainfall.reduce((a, b) => a + b, 0);

      const yearlyRainfall =
        totalRainfall / 3;

      let soilMoisture = 0.4;

      if (yearlyRainfall > 2000) {
        soilMoisture = 0.75;
      } else if (yearlyRainfall > 1500) {
        soilMoisture = 0.65;
      } else if (yearlyRainfall > 1000) {
        soilMoisture = 0.55;
      } else if (yearlyRainfall > 700) {
        soilMoisture = 0.45;
      } else {
        soilMoisture = 0.30;
      }

      const processedData = {
        avgTemp: parseFloat(
          avgTemp.toFixed(1)
        ),

        totalRain: parseFloat(
          yearlyRainfall.toFixed(0)
        ),

        soilMoisture: parseFloat(
          soilMoisture.toFixed(2)
        ),

        locationName
      };

      setWeatherData(processedData);

      generateRecommendations(
        processedData,
        soilInfo
      );

      setError(null);

    } catch (err) {
      console.error(err);

      setError(
        'Unable to fetch weather data.'
      );

      const fallbackData = {
        avgTemp: 28,
        totalRain: 1400,
        soilMoisture: 0.60
      };

      setWeatherData(fallbackData);

      generateRecommendations(
        fallbackData,
        soilData
      );

    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // SMART RECOMMENDATION ENGINE
  // =========================================

  const generateRecommendations = (
    data,
    soil
  ) => {
    try {
      const scoredCrops = Object.entries(
        cropDatabase
      ).map(([cropName, crop]) => {

        let score = 0;

        // TEMP SCORE

        if (
          data.avgTemp >= crop.minTemp &&
          data.avgTemp <= crop.maxTemp
        ) {
          score += 40;
        } else {
          const tempDiff = Math.min(
            Math.abs(
              data.avgTemp - crop.minTemp
            ),
            Math.abs(
              data.avgTemp - crop.maxTemp
            )
          );

          score += Math.max(
            0,
            40 - tempDiff * 4
          );
        }

        // RAIN SCORE

        const idealRain =
          (crop.minRain + crop.maxRain) / 2;

        const rainDiff = Math.abs(
          data.totalRain - idealRain
        );

        score += Math.max(
          0,
          40 - rainDiff / 50
        );

        // MOISTURE SCORE

        const moistureScore = Math.max(
          0,
          20 -
            Math.abs(
              data.soilMoisture -
                crop.moistureNeed
            ) *
              100
        );

        score += moistureScore;

        // TROPICAL BONUS

        if (
          data.avgTemp >= 24 &&
          data.totalRain >= 1200
        ) {
          if (
            crop.regions.includes('wet') ||
            crop.regions.includes('tropical')
          ) {
            score += 25;
          }
        }

        // COASTAL BONUS

        if (
          data.totalRain >= 1500 &&
          crop.regions.includes('coastal')
        ) {
          score += 20;
        }

        // =========================================
        // SOIL SCORING
        // =========================================

        if (
          cropName === 'rice' &&
          soil?.clay >= 35
        ) {
          score += 20;
        }

        if (
          cropName === 'cotton' &&
          soil?.clay >= 25 &&
          soil?.clay <= 45
        ) {
          score += 15;
        }

        if (
          cropName === 'wheat' &&
          soil?.ph >= 6 &&
          soil?.ph <= 7.5
        ) {
          score += 15;
        }

        if (
          cropName === 'coconut' &&
          soil?.sand >= 45
        ) {
          score += 20;
        }

        if (
          cropName === 'banana' &&
          soil?.organicCarbon >= 100
        ) {
          score += 15;
        }

        return {
          cropName,
          score: Math.round(score),
          data: crop
        };
      });

      const filtered = scoredCrops
        .filter((crop) => crop.score > 45)
        .sort((a, b) => b.score - a.score)
        .slice(0, 6);

      setRecommendations(filtered);

    } catch (err) {
      console.error(err);

      setRecommendations([]);
    }
  };

  // =========================================
  // AUTO LOAD LOCATION
  // =========================================

  useEffect(() => {
    getCurrentLocation();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pt-20 bg-gradient-to-br from-black via-gray-900 to-black"
    >
      <Navbar />

      <div className="container mx-auto px-4 py-8">

        {/* TITLE */}

        <div className="text-center mb-12">

          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 bg-clip-text text-transparent">
            Smart Crop Recommendations
          </h1>

          <p className="text-white/60 text-lg">
            AI-powered crop suitability engine
          </p>

        </div>

        {/* SEARCH */}

        <div className="max-w-2xl mx-auto mb-10">

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">

            <form
              onSubmit={(e) => {
                e.preventDefault();

                if (searchLocation.trim()) {
                  searchByLocation(searchLocation);
                }
              }}
              className="flex gap-3"
            >
              <input
                type="text"
                value={searchLocation}
                onChange={(e) =>
                  setSearchLocation(e.target.value)
                }
                placeholder="Enter city name..."
                className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white outline-none"
              />

              <button
                type="submit"
                className="bg-gradient-to-r from-purple-500 to-blue-500 px-6 rounded-lg text-white"
              >
                <FaSearch />
              </button>
            </form>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={getCurrentLocation}
              className="mt-4 w-full flex items-center justify-center gap-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl"
            >
              <FaLocationArrow />
              Use Current Location
            </motion.button>

          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: 'linear'
              }}
              className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full"
            />
          </div>
        ) : (
          <>
            {/* WEATHER */}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <p className="text-white/60 mb-2">
                  Temperature
                </p>

                <p className="text-4xl font-bold text-white">
                  {weatherData?.avgTemp}°C
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <p className="text-white/60 mb-2">
                  Rainfall
                </p>

                <p className="text-4xl font-bold text-white">
                  {weatherData?.totalRain} mm
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <p className="text-white/60 mb-2">
                  Soil Moisture
                </p>

                <p className="text-4xl font-bold text-white">
                  {(
                    weatherData?.soilMoisture * 100
                  ).toFixed(0)}
                  %
                </p>
              </div>

            </div>

            {/* SOIL DATA */}

           {/* SOIL DATA */}

{soilData && (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">

    {/* PH */}

    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">

      <p className="text-white/60 mb-2">
        Soil pH
      </p>

      <p className="text-3xl font-bold text-white">
        {soilData.ph}
      </p>

    </div>

    {/* CLAY */}

    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">

      <p className="text-white/60 mb-2">
        Clay Content (%)
      </p>

      <p className="text-3xl font-bold text-white">
        {soilData.clay}%
      </p>

    </div>

    {/* SAND */}

    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">

      <p className="text-white/60 mb-2">
        Sand Content (%)
      </p>

      <p className="text-3xl font-bold text-white">
        {soilData.sand}%
      </p>

    </div>

    {/* ORGANIC CARBON */}

    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">

      <p className="text-white/60 mb-2">
        Organic Carbon (g/kg)
      </p>

      <p className="text-3xl font-bold text-white">
        {soilData.organicCarbon}
      </p>

    </div>

  </div>
)}
{/* 🌱 ML INPUT SECTION */}
<div className="max-w-3xl mx-auto mb-10 bg-white/5 border border-white/10 rounded-2xl p-6">

  <h2 className="text-xl text-white mb-4 font-semibold">
    🌿 Soil Nutrient Input (For ML Prediction)
  </h2>

  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

    <input
      placeholder="Nitrogen (N)"
      className="p-3 rounded bg-black/40 text-white border border-white/10"
      value={npkInput.N}
      onChange={(e) => setNpkInput({ ...npkInput, N: e.target.value })}
    />

    <input
      placeholder="Phosphorus (P)"
      className="p-3 rounded bg-black/40 text-white border border-white/10"
      value={npkInput.P}
      onChange={(e) => setNpkInput({ ...npkInput, P: e.target.value })}
    />

    <input
      placeholder="Potassium (K)"
      className="p-3 rounded bg-black/40 text-white border border-white/10"
      value={npkInput.K}
      onChange={(e) => setNpkInput({ ...npkInput, K: e.target.value })}
    />

    <input
      placeholder="Humidity (%)"
      className="p-3 rounded bg-black/40 text-white border border-white/10"
      value={npkInput.humidity}
      onChange={(e) => setNpkInput({ ...npkInput, humidity: e.target.value })}
    />

  </div>

  <button
    onClick={getMlRecommendation}
    className="mt-4 w-full bg-gradient-to-r from-green-500 to-emerald-600 py-3 rounded-xl text-white font-semibold"
  >
    {mlLoading ? "Predicting..." : "Get ML Crop Recommendation"}
  </button>

</div>
{mlResult && (
  <div className="max-w-2xl mx-auto mb-10 bg-green-500/10 border border-green-500/20 p-6 rounded-2xl">

    <h2 className="text-white text-xl mb-2">
      🤖 ML Recommended Crop
    </h2>

    <p className="text-3xl text-green-400 font-bold capitalize">
  {typeof mlResult === "string"
    ? mlResult
    : mlResult?.prediction ||
      mlResult?.result ||
      mlResult?.crop ||
      JSON.stringify(mlResult)}
</p>

  </div>
)}

            {/* RECOMMENDATIONS */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {recommendations.map((crop) => (
                <motion.div
                  key={crop.cropName}
                  whileHover={{
                    scale: 1.02,
                    y: -5
                  }}
                  className="bg-white/5 border border-white/10 rounded-2xl p-6"
                >
                  <div className="flex justify-between items-center mb-4">

                    <div className="flex items-center gap-3">
                      <FaSeedling className="text-green-500 text-3xl" />

                      <h3 className="text-2xl text-white capitalize font-semibold">
                        {crop.cropName}
                      </h3>
                    </div>

                    <div className="bg-green-500/20 px-3 py-1 rounded-full">
                      <span className="text-white">
                        {crop.score}
                      </span>
                    </div>

                  </div>

                  <p className="text-white/80 mb-4">
                    {crop.data.description}
                  </p>

                  <div className="bg-black/40 rounded-xl p-4 mb-4 space-y-2">

                    <p className="text-white/70">
                      Season:
                      <span className="text-white ml-2">
                        {crop.data.season}
                      </span>
                    </p>

                    <p className="text-white/70">
                      Temperature:
                      <span className="text-white ml-2">
                        {crop.data.minTemp}°C -
                        {crop.data.maxTemp}°C
                      </span>
                    </p>

                  </div>

                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">

                    <p className="text-green-400 text-sm">
                      {crop.data.tips}
                    </p>

                  </div>

                </motion.div>
              ))}

            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default CropSuggestion;