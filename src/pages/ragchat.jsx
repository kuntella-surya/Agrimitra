// RagChat.jsx

import React, {
  useState,
  useRef,
  useEffect
} from 'react';

import { motion } from 'framer-motion';

import {
  FaPaperPlane,
  FaRobot,
  FaUser,
  FaLeaf,
  FaSeedling,
  FaCloudSun
} from 'react-icons/fa';

import Navbar from '../components/Navbar';

const RagChat = () => {

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        'Hello 👋 I am Agrimitra AI. Ask me anything about crops, irrigation, fertilizers, plant diseases, weather conditions, or farming practices.'
    }
  ]);

  const [input, setInput] = useState('');

  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  // AUTO SCROLL
  useEffect(() => {

    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });

  }, [messages]);

  // SEND MESSAGE
  const handleSend = async () => {

    if (!input.trim()) return;

    const userMessage = {
      role: 'user',
      content: input
    };

    setMessages((prev) => [
      ...prev,
      userMessage
    ]);

    setInput('');

    setLoading(true);

    try {

      // CHANGE THIS URL TO YOUR BACKEND
      const response = await fetch(
        'http://localhost:5000/rag-chat',
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json'
          },

          body: JSON.stringify({
            question: input
          })
        }
      );

      const data = await response.json();

      const botMessage = {
        role: 'assistant',

        content:
          data.answer ||
          'Sorry, I could not find relevant agricultural information.'
      };

      setMessages((prev) => [
        ...prev,
        botMessage
      ]);

    } catch (error) {

      console.error(error);

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',

          content:
            'Unable to connect to Agrimitra AI backend. Please ensure the server is running.'
        }
      ]);

    }

    setLoading(false);

  };

  // ENTER KEY
  const handleKeyDown = (e) => {

    if (e.key === 'Enter') {
      handleSend();
    }

  };

  return (

    <div
      className="
        min-h-screen
        bg-[#F4F7F1]
        relative
        overflow-hidden
      "
    >

      {/* BACKGROUND GRID */}
      <div
        className="
          absolute inset-0 opacity-[0.03]
          bg-[linear-gradient(to_right,#4F6F52_1px,transparent_1px),
          linear-gradient(to_bottom,#4F6F52_1px,transparent_1px)]
          bg-[size:80px_80px]
        "
      />

      {/* BACKGROUND BLUR */}
      <div
        className="
          absolute top-[-100px] right-[-100px]
          w-[350px] h-[350px]
          bg-[#A7C4A0]
          rounded-full blur-3xl opacity-20
        "
      />

      <Navbar />

      <div
        className="
          relative z-10
          max-w-7xl mx-auto
          px-4 pt-28 pb-10
        "
      >

        {/* HEADER */}
        <motion.div
          initial={{
            opacity: 0,
            y: -20
          }}

          animate={{
            opacity: 1,
            y: 0
          }}

          className="mb-8"
        >

          <div
            className="
              bg-white
              border border-[#DDE5D5]
              rounded-[32px]
              p-8
              shadow-lg
            "
          >

            <div
              className="
                flex flex-col lg:flex-row
                lg:items-center
                lg:justify-between
                gap-8
              "
            >

              {/* LEFT */}
              <div>

                <div
                  className="
                    inline-flex items-center gap-2
                    bg-[#DCE8D5]
                    text-[#3A5A40]
                    px-4 py-2 rounded-full
                    text-sm font-semibold
                    mb-5
                  "
                >
                  <FaLeaf />
                  Retrieval Augmented Agriculture Assistant
                </div>

                <h1
                  className="
                    text-4xl md:text-5xl
                    font-black
                    text-[#2F3E2C]
                    mb-3
                  "
                >
                  Agrimitra AI
                </h1>

                <p
                  className="
                    text-[#5C715E]
                    text-lg
                    max-w-3xl
                    leading-relaxed
                  "
                >
                  AI-powered agricultural knowledge assistant
                  using RAG technology for intelligent crop,
                  disease, irrigation, fertilizer, and farming
                  support.
                </p>

              </div>

              {/* RIGHT STATS */}
              <div
                className="
                  grid grid-cols-2 gap-4
                  min-w-[280px]
                "
              >

                <div
                  className="
                    bg-[#F4F7F1]
                    rounded-2xl
                    p-5
                  "
                >

                  <div className="flex items-center gap-3 mb-3">

                    <FaSeedling className="text-[#4F6F52]" />

                    <span
                      className="
                        text-sm font-semibold
                        text-[#739072]
                      "
                    >
                      Crop Support
                    </span>

                  </div>

                  <h3
                    className="
                      text-2xl font-bold
                      text-[#2F3E2C]
                    "
                  >
                    Active
                  </h3>

                </div>

                <div
                  className="
                    bg-[#F4F7F1]
                    rounded-2xl
                    p-5
                  "
                >

                  <div className="flex items-center gap-3 mb-3">

                    <FaCloudSun className="text-[#4F6F52]" />

                    <span
                      className="
                        text-sm font-semibold
                        text-[#739072]
                      "
                    >
                      AI Status
                    </span>

                  </div>

                  <h3
                    className="
                      text-2xl font-bold
                      text-[#2F3E2C]
                    "
                  >
                    Online
                  </h3>

                </div>

              </div>

            </div>

          </div>

        </motion.div>

        {/* CHAT CONTAINER */}
        <div
          className="
            bg-white
            border border-[#DDE5D5]
            rounded-[32px]
            shadow-lg
            overflow-hidden
          "
        >

          {/* TOP BAR */}
          <div
            className="
              px-6 py-5
              border-b border-[#EEF3EA]
              bg-[#FAFCF8]
              flex items-center justify-between
            "
          >

            <div className="flex items-center gap-4">

              <div
                className="
                  w-12 h-12 rounded-2xl
                  bg-[#EEF3EA]
                  flex items-center justify-center
                "
              >
                <FaRobot className="text-[#4F6F52] text-xl" />
              </div>

              <div>

                <h2
                  className="
                    text-lg font-bold
                    text-[#2F3E2C]
                  "
                >
                  Agrimitra Knowledge Assistant
                </h2>

                <p
                  className="
                    text-sm text-[#739072]
                  "
                >
                  Powered by RAG + Agricultural Knowledge Base
                </p>

              </div>

            </div>

            <div
              className="
                hidden md:flex
                items-center gap-2
                bg-[#EEF3EA]
                text-[#4F6F52]
                px-4 py-2
                rounded-full
                text-sm font-semibold
              "
            >
              ● Live AI
            </div>

          </div>

          {/* CHAT MESSAGES */}
          <div
            className="
              h-[65vh]
              overflow-y-auto
              p-6 md:p-8
              space-y-6
              bg-[#FCFDFC]
            "
          >

            {messages.map((msg, index) => (

              <motion.div
                key={index}

                initial={{
                  opacity: 0,
                  y: 10
                }}

                animate={{
                  opacity: 1,
                  y: 0
                }}

                className={`
                  flex items-end gap-4
                  ${
                    msg.role === 'user'
                      ? 'justify-end'
                      : 'justify-start'
                  }
                `}
              >

                {/* AI AVATAR */}
                {msg.role === 'assistant' && (

                  <div
                    className="
                      min-w-[48px]
                      h-[48px]
                      rounded-2xl
                      bg-[#EEF3EA]
                      flex items-center justify-center
                    "
                  >
                    <FaRobot className="text-[#4F6F52]" />
                  </div>

                )}

                {/* MESSAGE */}
                <div
                  className={`
                    max-w-[80%]
                    px-5 py-4
                    rounded-[24px]
                    text-sm md:text-base
                    leading-relaxed
                    shadow-sm
                    ${
                      msg.role === 'user'
                        ? `
                          bg-[#4F6F52]
                          text-white
                        `
                        : `
                          bg-white
                          border border-[#DDE5D5]
                          text-[#2F3E2C]
                        `
                    }
                  `}
                >

                  {msg.role === 'assistant' && (

                    <div
                      className="
                        flex items-center gap-2
                        text-[#4F6F52]
                        font-semibold
                        mb-2
                      "
                    >
                      <FaLeaf />

                      Agrimitra AI
                    </div>

                  )}

                  {msg.content}

                </div>

                {/* USER AVATAR */}
                {msg.role === 'user' && (

                  <div
                    className="
                      min-w-[48px]
                      h-[48px]
                      rounded-2xl
                      bg-[#4F6F52]
                      flex items-center justify-center
                    "
                  >
                    <FaUser className="text-white" />
                  </div>

                )}

              </motion.div>

            ))}

            {/* LOADING */}
            {loading && (

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="
                  flex items-center gap-4
                "
              >

                <div
                  className="
                    min-w-[48px]
                    h-[48px]
                    rounded-2xl
                    bg-[#EEF3EA]
                    flex items-center justify-center
                  "
                >
                  <FaRobot className="text-[#4F6F52]" />
                </div>

                <div
                  className="
                    px-5 py-4
                    rounded-[24px]
                    bg-white
                    border border-[#DDE5D5]
                    text-[#5C715E]
                  "
                >
                 Generating insights...
                </div>

              </motion.div>

            )}

            <div ref={messagesEndRef} />

          </div>

          {/* INPUT AREA */}
          <div
            className="
              border-t border-[#EEF3EA]
              bg-white
              p-5
            "
          >

            <div
              className="
                flex items-center gap-3
                bg-[#F4F7F1]
                border border-[#DDE5D5]
                rounded-2xl
                p-2
              "
            >

              <input
                type="text"

                placeholder="Ask about crops, fertilizers, irrigation, plant diseases..."

                value={input}

                onChange={(e) =>
                  setInput(e.target.value)
                }

                onKeyDown={handleKeyDown}

                className="
                  flex-1
                  bg-transparent
                  px-4 py-3
                  outline-none
                  text-[#2F3E2C]
                  placeholder:text-[#739072]
                "
              />

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}

                onClick={handleSend}

                disabled={loading}

                className="
                  px-6 py-4
                  rounded-2xl
                  bg-[#4F6F52]
                  hover:bg-[#3A5A40]
                  text-white
                  transition-all duration-300
                  flex items-center justify-center
                  disabled:opacity-50
                "
              >

                <FaPaperPlane />

              </motion.button>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default RagChat;