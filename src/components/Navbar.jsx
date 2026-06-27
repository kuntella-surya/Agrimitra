// Navbar.jsx

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

import {
  FaArrowRight,
  FaBars,
  FaTimes,
  FaLeaf
} from 'react-icons/fa';

import {
  motion,
  AnimatePresence
} from 'framer-motion';

const Navbar = () => {

  const [isOpen, setIsOpen] = useState(false);

  const [scrolled, setScrolled] = useState(false);

  const location = useLocation();

  const navLinks = [
    { title: 'Home', path: '/' },
    { title: 'About', path: '/about' },
    { title: 'Services', path: '/services' },
    { title: 'Gallery', path: '/gallery' }
  ];

  useEffect(() => {

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);

  }, []);

  return (
    <>

      {/* NAVBAR */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className={`
          fixed top-0 left-0 right-0 z-50
          transition-all duration-300
          px-4 md:px-8 py-4
        `}
      >

        <div
          className={`
            max-w-7xl mx-auto
            rounded-2xl
            border border-[#DDE5D5]
            bg-white/95
            backdrop-blur-sm
            transition-all duration-300
            ${scrolled ? 'shadow-lg' : ''}
          `}
        >

          <div className="flex items-center justify-between h-16 px-6">

            {/* LOGO */}
            <Link
              to="/"
              className="flex items-center gap-3"
            >

              <div
                className="
                  w-11 h-11 rounded-xl
                  bg-[#EEF3EA]
                  flex items-center justify-center
                "
              >
                <FaLeaf className="text-[#4F6F52] text-lg" />
              </div>

              <div>
                <h1
                  className="
                    text-2xl font-black
                    text-[#2F3E2C]
                    leading-none
                  "
                >
                  Agrimitra
                </h1>

                <p
                  className="
                    text-xs
                    text-[#739072]
                    font-medium
                  "
                >
                  Smart Farming Platform
                </p>
              </div>

            </Link>

            {/* DESKTOP MENU */}
            <div className="hidden md:flex items-center gap-10">

              {navLinks.map((link, index) => (

                <div
                  key={index}
                  className="relative"
                >

                  <Link
                    to={link.path}
                    className={`
                      text-[15px] font-semibold
                      transition-all duration-300
                      hover:text-[#4F6F52]
                      ${
                        location.pathname === link.path
                          ? 'text-[#4F6F52]'
                          : 'text-[#5C715E]'
                      }
                    `}
                  >

                    {link.title}

                  </Link>

                  {location.pathname === link.path && (

                    <motion.div
                      layoutId="navbar-indicator"
                      className="
                        absolute -bottom-2 left-0
                        w-full h-[3px]
                        rounded-full
                        bg-[#4F6F52]
                      "
                    />

                  )}

                </div>

              ))}

            </div>

            {/* RIGHT SIDE */}
            <div className="hidden md:flex items-center gap-4">

              <Link
                to="/contact"
                className="
                  px-6 py-3 rounded-xl
                  bg-[#4F6F52]
                  hover:bg-[#3A5A40]
                  text-white font-semibold
                  transition-all duration-300
                  flex items-center gap-2
                "
              >

                Contact

                <FaArrowRight className="text-sm" />

              </Link>

            </div>

            {/* MOBILE BUTTON */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="
                md:hidden
                w-11 h-11 rounded-xl
                bg-[#EEF3EA]
                flex items-center justify-center
                text-[#2F3E2C]
              "
            >

              {isOpen ? (
                <FaTimes className="text-lg" />
              ) : (
                <FaBars className="text-lg" />
              )}

            </button>

          </div>

        </div>

      </motion.nav>

      {/* MOBILE MENU */}
      <AnimatePresence>

        {isOpen && (

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="
              fixed top-24 left-4 right-4
              z-40 md:hidden
            "
          >

            <div
              className="
                bg-white
                border border-[#DDE5D5]
                rounded-3xl
                shadow-xl
                overflow-hidden
              "
            >

              {/* MOBILE LINKS */}
              <div className="p-3">

                {navLinks.map((link, index) => (

                  <Link
                    key={index}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`
                      block px-5 py-4 rounded-2xl
                      text-[15px] font-semibold
                      transition-all duration-300
                      mb-2
                      ${
                        location.pathname === link.path
                          ? 'bg-[#EEF3EA] text-[#4F6F52]'
                          : 'text-[#5C715E] hover:bg-[#F4F7F1]'
                      }
                    `}
                  >

                    {link.title}

                  </Link>

                ))}

              </div>

              {/* CONTACT BUTTON */}
              <div className="p-4 border-t border-[#EEF3EA]">

                <Link
                  to="/contact"
                  onClick={() => setIsOpen(false)}
                  className="
                    w-full flex items-center justify-center gap-2
                    px-5 py-4 rounded-2xl
                    bg-[#4F6F52]
                    hover:bg-[#3A5A40]
                    text-white font-semibold
                    transition-all duration-300
                  "
                >

                  Contact Us

                  <FaArrowRight className="text-sm" />

                </Link>

              </div>

            </div>

          </motion.div>

        )}

      </AnimatePresence>

    </>
  );
};

export default Navbar;