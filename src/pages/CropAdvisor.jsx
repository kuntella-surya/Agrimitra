import React, { useState, useEffect } from 'react';

const CropAdvisor = () => {
  const [cropAdviceLoading, setCropAdviceLoading] = useState(false);
  const [cropAdvice, setCropAdvice] = useState(null);
  const [cropAdviceError, setCropAdviceError] = useState(null);
  
const states = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Lakshadweep",
  "Puducherry",
  "Ladakh"
];
  const [formData, setFormData] = useState({
    crop: '',
    location: '',
    quantity: '',
    storage: 'yes'
  });


  const [commodities, setCommodities] = useState([]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!formData.crop) {
      setCropAdviceError("Please select a crop");
      return;
    }

    try {
      setCropAdviceLoading(true);
      setCropAdvice(null);
      setCropAdviceError(null);

      const response = await fetch("http://localhost:5000/crop-advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Failed to get advice");

      setCropAdvice(data);
    } catch (error) {
      console.error(error);
      setCropAdviceError(error.message);
    } finally {
      setCropAdviceLoading(false);
    }
  };

  useEffect(() => {
    const loadCommodities = async () => {
      try {
        const res = await fetch("http://localhost:5000/commodities");
        const data = await res.json();
        setCommodities(data.data || []);
      } catch (err) {
        console.error("Failed to load commodities", err);
      }
    };
    loadCommodities();
  }, []);

  return (
    <div className="min-h-screen bg-[#F4F7F1] p-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-3xl p-8 border border-[#DDE5D5]">
          <h1 className="text-4xl font-bold text-[#2F3E2C] mb-3">Crop Sell Advisor</h1>
          <p className="text-[#5C715E] mb-8">AI agent that suggests whether to sell or hold crops.</p>

          {/* Crop Selection */}
          <div className="mb-6">
            <label className="block mb-2 text-[#2F3E2C] font-semibold">Crop</label>
            <select
              name="crop"
              value={formData.crop}
              onChange={handleChange}
              className="w-full p-4 rounded-2xl border border-[#DDE5D5] outline-none"
            >
              <option value="">Select Crop</option>
              {commodities.map((crop) => (
                <option key={crop.id} value={crop.id}>
                  {crop.cmdt_name}
                </option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div className="mb-6">
            <label className="block mb-2 text-[#2F3E2C] font-semibold">State</label>
            <select
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full p-4 rounded-2xl border border-[#DDE5D5] outline-none"
            >
              <option value="">Select State</option>
              {states.map((state) => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>

          {/* Quantity & Storage */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block mb-2 text-[#2F3E2C] font-semibold">Quantity (quintals)</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                className="w-full p-4 rounded-2xl border border-[#DDE5D5] outline-none"
                placeholder="Enter quantity"
              />
            </div>

            <div>
              <label className="block mb-2 text-[#2F3E2C] font-semibold">Storage Available?</label>
              <select
                name="storage"
                value={formData.storage}
                onChange={handleChange}
                className="w-full p-4 rounded-2xl border border-[#DDE5D5] outline-none"
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={cropAdviceLoading || !formData.crop}
            className="w-full bg-[#4F6F52] hover:bg-[#3A5A40] text-white py-4 rounded-2xl font-semibold transition disabled:opacity-60"
          >
            {cropAdviceLoading ? "🤖 AI Agent Thinking..." : "Get AI Recommendation"}
          </button>

          {/* Loading */}
          {cropAdviceLoading && (
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-lg font-semibold">AI Agent Analyzing Market...</p>
            </div>
          )}

          {/* Error */}
          {cropAdviceError && (
            <div className="mt-8 bg-red-50 border border-red-200 rounded-2xl p-6">
              <p className="text-red-600">{cropAdviceError}</p>
            </div>
          )}

          {/* Success - AI Advice */}
          {cropAdvice?.success && (
            <div className="mt-8 bg-green-50 border border-green-200 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-green-800 mb-6">🌾 AI Recommendation</h2>

              {/* Market Summary Cards */}
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-4 rounded-xl">
                  <p className="text-gray-500">Current Price</p>
                  <p className="text-xl font-bold">₹{cropAdvice.market?.current_price}</p>
                  <p className="text-xs text-gray-500">as of {cropAdvice.market?.current_date}</p>
                </div>

                <div className="bg-white p-4 rounded-xl">
                  <p className="text-gray-500">7-Day Avg Price</p>
                  <p className="text-xl font-bold">₹{cropAdvice.market?.avg_price_7d}</p>
                </div>

                <div className="bg-white p-4 rounded-xl">
                  <p className="text-gray-500">Trend</p>
                  <p className="text-xl font-bold capitalize">{cropAdvice.market?.trend}</p>
                </div>
              </div>

              {/* Weather Analysis */}
              <div className="bg-blue-50 p-5 rounded-xl mb-6">
                <h3 className="font-semibold mb-3">🌤️ Weather Outlook</h3>
                <p className="text-gray-700">{cropAdvice.weather?.summary}</p>
                
                {cropAdvice.weather?.total_rain && (
                  <p className="text-sm mt-2 text-gray-600">
                    Total Rain: {cropAdvice.weather.total_rain}mm | 
                    Max Temp: {cropAdvice.weather.max_temp}°C
                  </p>
                )}
              </div>

              {/* AI Advice */}
              <div className="bg-white p-6 rounded-xl">
                <h3 className="font-semibold mb-4">🤖 AI Advice</h3>
                <pre className="whitespace-pre-wrap font-sans text-gray-800 leading-relaxed">
                  {cropAdvice.advice}
                </pre>
              </div>

              {/* Disclaimer */}
              <p className="text-xs text-gray-500 mt-6 text-center">
                This is AI-assisted advisory only. Please use your own judgment and consult local experts.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CropAdvisor;
