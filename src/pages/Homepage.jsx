// Homepage.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

import {
  FaChartLine,
  FaBell,
  FaTint,
  FaMicroscope,
  FaSeedling,
  FaDatabase,
  FaUsers,
  FaRobot,
  FaBrain,
  FaArrowRight,
  FaSearch,
  FaCloudSun,
  FaWater,
  FaLeaf,
  FaBolt
} from 'react-icons/fa';

import Navbar from '../components/Navbar';
import WeatherCard from '../components/WeatherCard';

const FeatureCard = ({
  icon: Icon,
  title,
  description,
  path,
  color
}) => {
  const navigate = useNavigate();

  return (
    <motion.div
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(path)}
      className="
        bg-white
        border border-[#DDE5D5]
        rounded-3xl
        p-6
        hover:shadow-xl
        transition-all duration-300
        cursor-pointer
        group
        relative
        overflow-hidden
      "
    >
      {/* Top Border */}
      <div className={`absolute top-0 left-0 h-1 w-full ${color}`} />

      {/* Icon */}
      <div
        className="
          w-14 h-14 rounded-2xl
          bg-[#EEF3EA]
          flex items-center justify-center
          text-[#4F6F52]
          text-2xl mb-5
        "
      >
        <Icon />
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold text-[#2F3E2C] mb-2">
        {title}
      </h3>

      {/* Description */}
      <p className="text-[#5C715E] text-sm leading-relaxed mb-6">
        {description}
      </p>

      {/* Button */}
      <div className="flex items-center text-[#4F6F52] font-semibold text-sm">
        Open Service

        <FaArrowRight
          className="
            ml-2
            group-hover:translate-x-1
            transition duration-300
          "
        />
      </div>
    </motion.div>
  );
};

const QuickAction = ({
  title,
  icon: Icon,
  path
}) => {
  const navigate = useNavigate();

  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(path)}
      className="
        flex items-center gap-3
        px-5 py-4 rounded-2xl
        bg-white
        border border-[#DDE5D5]
        text-[#2F3E2C]
        hover:bg-[#EEF3EA]
        transition-all duration-300
      "
    >
      <Icon className="text-[#4F6F52]" />

      {title}
    </motion.button>
  );
};

const StatCard = ({
  icon: Icon,
  title,
  value
}) => {
  return (
    <div
      className="
        bg-white
        border border-[#DDE5D5]
        rounded-3xl
        p-5
        hover:shadow-lg
        transition-all duration-300
      "
    >
      <div className="flex items-center justify-between mb-4">
        <Icon className="text-[#4F6F52] text-2xl" />

        <span
          className="
            text-xs font-semibold
            bg-[#EEF3EA]
            text-[#4F6F52]
            px-2 py-1 rounded-full
          "
        >
          LIVE
        </span>
      </div>

      <h3 className="text-[#739072] text-sm mb-2">
        {title}
      </h3>

      <p className="text-3xl font-bold text-[#2F3E2C]">
        {value}
      </p>
    </div>
  );
};

const Homepage = () => {

  const aiFeatures = [
    {
      icon: FaBrain,
      title: 'Agrimitra AI',
      description:
        'AI-powered agriculture assistant with smart farming knowledge.',
      path: '/ragchat',
      color: 'bg-[#4F6F52]'
    },

    {
      icon: FaMicroscope,
      title: 'Disease Detection',
      description:
        'Detect plant diseases instantly using AI image analysis.',
      path: '/disease-detection',
      color: 'bg-[#739072]'
    },

    {
      icon: FaSeedling,
      title: 'Crop Suggestion',
      description:
        'Get personalized crop recommendations based on farm conditions.',
      path: '/CropSuggestion',
      color: 'bg-[#A7C4A0]'
    },{
  icon: FaChartLine,
  title: 'Crop Sell Advisor',
  description:
    'AI agent that suggests whether to sell or hold crops based on mandi prices and weather.',
  path: '/crop-advisor',
  color: 'bg-[#5C715E]'
}
  ];

  const monitoringFeatures = [
    {
      icon: FaTint,
      title: 'Smart Irrigation',
      description:
        'Monitor and optimize irrigation systems efficiently.',
      path: '/Irrigation',
      color: 'bg-[#5C715E]'
    },

    {
      icon: FaBell,
      title: 'Disaster Alerts',
      description:
        'Receive instant weather and disaster notifications.',
      path: '/DisasterAlerts',
      color: 'bg-[#8AA17B]'
    },

    {
      icon: FaChartLine,
      title: 'Farm Analytics',
      description:
        'Track agricultural performance using visual analytics.',
      path: '/Charts',
      color: 'bg-[#4F6F52]'
    }
  ];

  const communityFeatures = [
    {
      icon: FaUsers,
      title: 'Expert Connect',
      description:
        'Connect with agriculture professionals and experts.',
      path: '/Expert',
      color: 'bg-[#739072]'
    },

    {
      icon: FaDatabase,
      title: 'Crop Database',
      description:
        'Access detailed crop information and agricultural datasets.',
      path: '/cropdata',
      color: 'bg-[#A7C4A0]'
    }
  ];

  return (
    <div
      className="
        min-h-screen
        bg-[#F4F7F1]
        relative
        overflow-hidden
      "
    >

      {/* Background Grid */}
      <div
        className="
          absolute inset-0 opacity-[0.03]
          bg-[linear-gradient(to_right,#4F6F52_1px,transparent_1px),
          linear-gradient(to_bottom,#4F6F52_1px,transparent_1px)]
          bg-[size:80px_80px]
        "
      />

      {/* Background Blur */}
      <div
        className="
          absolute top-[-150px] right-[-100px]
          w-[400px] h-[400px]
          bg-[#A7C4A0]
          rounded-full blur-3xl opacity-20
        "
      />

      <Navbar />

      <div className="relative z-10 container mx-auto px-4 pt-28 pb-24">

        {/* HERO SECTION */}
        <section className="mb-20">

          <div
            className="
              grid lg:grid-cols-2
              gap-14
              items-center
            "
          >

            {/* LEFT */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
            >

              <div
                className="
                  inline-flex items-center gap-2
                  bg-[#DCE8D5]
                  text-[#3A5A40]
                  px-4 py-2 rounded-full
                  text-sm font-semibold mb-6
                "
              >
                <FaLeaf />
                Smart Agriculture Intelligence Platform
              </div>

              <h1
                className="
                  text-5xl md:text-7xl
                  font-black
                  leading-tight
                  text-[#2F3E2C]
                  mb-6
                "
              >
                Agrimitra
              </h1>

              <p
                className="
                  text-lg md:text-xl
                  text-[#5C715E]
                  leading-relaxed
                  mb-10
                  max-w-2xl
                "
              >
                Empowering farmers with AI-driven crop insights,
                smart irrigation, weather analytics, disease
                detection, and intelligent agricultural assistance.
              </p>

              {/* SEARCH */}
              <div
                className="
                  bg-white
                  border border-[#DDE5D5]
                  rounded-2xl
                  p-2
                  flex items-center
                  max-w-2xl
                  mb-8
                "
              >
                <FaSearch className="ml-4 text-[#739072]" />

                <input
                  type="text"
                  placeholder="Search crops, diseases, tools..."
                  className="
                    w-full bg-transparent
                    px-4 py-3 outline-none
                    text-[#2F3E2C]
                    placeholder:text-[#739072]
                  "
                />

                <button
                  className="
                    px-6 py-3 rounded-xl
                    bg-[#4F6F52]
                    hover:bg-[#3A5A40]
                    text-white
                    font-semibold
                    transition duration-300
                  "
                >
                  Search
                </button>
              </div>

              {/* CTA BUTTONS */}
              <div className="flex flex-wrap gap-4">

                <button
                  className="
                    px-7 py-4 rounded-2xl
                    bg-[#4F6F52]
                    hover:bg-[#3A5A40]
                    text-white font-semibold
                    transition duration-300
                  "
                >
                  Explore Dashboard
                </button>

                <button
                  className="
                    px-7 py-4 rounded-2xl
                    border border-[#B7C8B5]
                    bg-white
                    hover:bg-[#EEF3EA]
                    text-[#3A5A40]
                    font-semibold
                    transition duration-300
                  "
                >
                  Ask Agrimitra AI
                </button>

              </div>
            </motion.div>

            {/* RIGHT */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
            >

              <div
                className="
                  bg-white
                  border border-[#DDE5D5]
                  rounded-3xl
                  p-8
                  shadow-lg
                "
              >

                <div className="grid grid-cols-2 gap-5">

                  <div className="bg-[#F4F7F1] rounded-2xl p-5">
                    <p className="text-sm text-[#739072] mb-2">
                      Soil Moisture
                    </p>

                    <h3 className="text-3xl font-bold text-[#2F3E2C]">
                      72%
                    </h3>
                  </div>

                  <div className="bg-[#F4F7F1] rounded-2xl p-5">
                    <p className="text-sm text-[#739072] mb-2">
                      Weather
                    </p>

                    <h3 className="text-3xl font-bold text-[#2F3E2C]">
                      32°C
                    </h3>
                  </div>

                  <div className="bg-[#F4F7F1] rounded-2xl p-5">
                    <p className="text-sm text-[#739072] mb-2">
                      Alerts
                    </p>

                    <h3 className="text-3xl font-bold text-[#2F3E2C]">
                      03
                    </h3>
                  </div>

                  <div className="bg-[#F4F7F1] rounded-2xl p-5">
                    <p className="text-sm text-[#739072] mb-2">
                      Crop Health
                    </p>

                    <h3 className="text-3xl font-bold text-[#2F3E2C]">
                      Good
                    </h3>
                  </div>

                </div>

              </div>
            </motion.div>

          </div>

        </section>

        {/* STATS */}
        <div
          className="
            grid grid-cols-2 lg:grid-cols-4
            gap-5 mb-16
          "
        >
          <StatCard
            icon={FaCloudSun}
            title="Weather"
            value="32°C"
          />

          <StatCard
            icon={FaWater}
            title="Soil Moisture"
            value="72%"
          />

          <StatCard
            icon={FaBell}
            title="Alerts"
            value="03"
          />

          <StatCard
            icon={FaBolt}
            title="AI Insights"
            value="12"
          />
        </div>

        {/* QUICK ACTIONS */}
        <section className="mb-20">

          <h2
            className="
              text-3xl font-bold
              text-[#2F3E2C]
              mb-3
            "
          >
            Quick Actions
          </h2>

          <p className="text-[#5C715E] mb-8">
            Access important farming tools instantly
          </p>

          <div className="flex flex-wrap gap-4">

            <QuickAction
              title="Detect Disease"
              icon={FaMicroscope}
              path="/disease-detection"
            />

            <QuickAction
              title="Ask Agrimitra AI"
              icon={FaBrain}
              path="/ragchat"
            />

            <QuickAction
              title="View Analytics"
              icon={FaChartLine}
              path="/Charts"
            />

            <QuickAction
              title="Crop Suggestions"
              icon={FaSeedling}
              path="/CropSuggestion"
            />

          </div>

        </section>

        {/* WEATHER */}
        <div className="mb-20">
          <WeatherCard />
        </div>

        {/* AI TOOLS */}
        <section className="mb-20">

          <h2
            className="
              text-3xl font-bold
              text-[#2F3E2C]
              mb-3
            "
          >
            AI Farming Services
          </h2>

          <p className="text-[#5C715E] mb-8">
            Intelligent tools for modern agriculture
          </p>

          <div
            className="
              grid grid-cols-1
              md:grid-cols-2
              xl:grid-cols-3
              gap-6
            "
          >
            {aiFeatures.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>

        </section>

        {/* MONITORING */}
        <section className="mb-20">

          <h2
            className="
              text-3xl font-bold
              text-[#2F3E2C]
              mb-3
            "
          >
            Monitoring & Automation
          </h2>

          <p className="text-[#5C715E] mb-8">
            Monitor and automate farm operations efficiently
          </p>

          <div
            className="
              grid grid-cols-1
              md:grid-cols-2
              xl:grid-cols-3
              gap-6
            "
          >
            {monitoringFeatures.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>

        </section>

        {/* COMMUNITY */}
        <section>

          <h2
            className="
              text-3xl font-bold
              text-[#2F3E2C]
              mb-3
            "
          >
            Community & Data
          </h2>

          <p className="text-[#5C715E] mb-8">
            Connect with experts and explore agricultural data
          </p>

          <div
            className="
              grid grid-cols-1
              md:grid-cols-2
              xl:grid-cols-3
              gap-6
            "
          >
            {communityFeatures.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>

        </section>

      </div>

      {/* FLOATING AI BUTTON */}
      <motion.button
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => window.location.href = '/ragchat'}
        className="
          fixed bottom-6 right-6 z-50
          bg-[#4F6F52]
          hover:bg-[#3A5A40]
          text-white
          px-6 py-4
          rounded-2xl
          shadow-lg
          transition-all duration-300
          flex items-center gap-3
        "
      >
        <FaRobot />

        Agrimitra AI
      </motion.button>

    </div>
  );
};

export default Homepage;