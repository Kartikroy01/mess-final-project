import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Link, NavLink } from "react-router-dom";

// Exact hex codes extracted from nitj.ac.in DevTools
const NITJ_UTILITY = "#144d8b"; // Top dark bar
const NITJ_BLUE = "#1464aa";    // Main nav bar
const NITJ_ORANGE = "#E28122";  // Accent / Login button

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinkClass =
    "px-4 py-3 font-bold text-[13px] text-white uppercase tracking-wider hover:text-yellow-300 transition-colors duration-150 whitespace-nowrap";
  const activeNavLinkClass =
    "px-4 py-3 font-bold text-[13px] text-yellow-300 uppercase tracking-wider whitespace-nowrap border-b-2 border-yellow-300";

  return (
    <>
      {/* ============================================================
          FULL HEADER — visible when at top of page
      ============================================================ */}
      <header 
        className="relative z-[1000] bg-white md:bg-transparent" 
        style={{ 
          fontFamily: "Arial, sans-serif",
          paddingTop: "calc(8px + env(safe-area-inset-top))"
        }}
      >
        
        {/* --- TOP DARK UTILITY BAR --- */}
        <div
          className="hidden md:flex relative z-[1100] w-full text-white text-[11px] px-4 py-1 items-center justify-between border-b border-white/5"
          style={{ backgroundColor: NITJ_UTILITY, minHeight: "32px" }}
        >
          <div className="flex items-center gap-3 md:gap-4 font-semibold tracking-wide">
            <span className="flex items-center gap-1 cursor-pointer hover:text-yellow-300 whitespace-nowrap">📋 MESS SCHEDULE</span>
            <span className="hidden md:flex items-center gap-1 cursor-pointer hover:text-yellow-300">📜 NOTICES</span>
            <span className="hidden md:flex items-center gap-1 cursor-pointer hover:text-yellow-300">📞 HELPDESK</span>
          </div>
          <div className="flex items-center gap-2 md:gap-3 font-semibold tracking-wide ml-auto">
            <a href="https://v1.nitj.ac.in/erp/login" target="_blank" rel="noreferrer" className="cursor-pointer hover:text-yellow-300">ERP</a>
            <span className="opacity-50">|</span>
            <span className="cursor-pointer hover:text-yellow-300 whitespace-nowrap">NITJ PORTAL</span>
            <span className="hidden md:inline opacity-50">|</span>
            <span className="hidden md:flex cursor-pointer hover:text-yellow-300">ISTEM</span>
          </div>
        </div>

        {/* --- WHITE IDENTITY STRIP --- */}
        <div className="bg-white relative">
          <div
            className="max-w-screen-xl mx-auto flex flex-col md:flex-row items-center px-4 md:px-6 relative"
            style={{ minHeight: "96px" }}
          >
            {/* MOBILE LAYOUT: Logo (left) + Names (right) */}
            <div className="flex w-full items-center gap-3.5 md:hidden py-3">
              <div className="flex-shrink-0 w-16 h-16">
                <Link to="/">
                  <img
                    src="/logo_250.png"
                    alt="NITJ Logo"
                    className="w-full h-full object-contain"
                  />
                </Link>
              </div>
              <div className="flex-1 leading-snug">
                <p className="text-[14px] font-semibold text-slate-600 leading-none">
                  डॉ बी आर अम्बेडकर
                </p>
                <p 
                  className="text-[16px] font-black tracking-tight mt-0.5 leading-tight"
                  style={{ color: NITJ_BLUE }}
                >
                  राष्ट्रीय प्रौद्योगिकी संस्थान जालंधर
                </p>
                <p className="text-[12px] font-bold text-slate-500 mt-1 leading-none tracking-wide">
                  Dr B R Ambedkar
                </p>
                <p 
                  className="text-[16px] font-black tracking-tight mt-0.5 leading-tight"
                  style={{ color: NITJ_BLUE }}
                >
                  National Institute of Technology Jalandhar
                </p>
              </div>
            </div>

            {/* DESKTOP LAYOUT (remains exactly as it was) */}
            {/* LEFT: Punjabi / Hindi name */}
            <div className="hidden md:block flex-1 leading-snug">
              <p className="text-[13px] font-bold text-gray-800">
                ਡਾ ਬੀ ਆਰ ਅੰਬੇਡਕਰ ਨੈਸ਼ਨਲ ਇੰਸਟੀਚਿਊਟ ਆਫ਼ ਟੈਕਨਾਲੋਜੀ
              </p>
              <p className="text-[13px] font-bold text-gray-800">
                ਜਲੰਧਰ
              </p>
            </div>

            {/* CENTER: Logo (Desktop Only) */}
            <div
              className="hidden md:block absolute left-1/2"
              style={{
                transform: "translateX(-50%)",
                bottom: "-50px",
                zIndex: 50,
                width: "132px",
                height: "132px",
              }}
            >
              <Link to="/">
                <img
                  src="/logo_250.png"
                  alt="NITJ Logo"
                  style={{
                    width: "132px",
                    height: "132px",
                    objectFit: "contain",
                    display: "block",
                    zIndex: 50
                  }}
                />
              </Link>
            </div>

            {/* RIGHT: English name (Desktop Only) */}
            <div className="hidden md:block flex-1 text-right leading-snug">
              <p className="text-[13px] font-bold text-gray-800 uppercase">
                DR B R Ambedkar National Institute of Technology
              </p>
              <p className="text-[13px] font-bold text-gray-800 uppercase">
                Jalandhar
              </p>
            </div>
          </div>
        </div>

        {/* --- BLUE NAV BAR with arch cutout for the logo --- */}
        <div className="relative" style={{ backgroundColor: NITJ_BLUE, zIndex: 10 }}>

          {/* EXACT arch image from nitj.ac.in — same PNG file used on their live website.
              Downloaded from: https://www.nitj.ac.in/public/assets/images/Rectangle%2047%20(1).png
              Saved to: /public/arch.png */}
          <div
            className="hidden md:block absolute left-1/2 top-0 pointer-events-none"
            style={{ transform: "translateX(-50%)", width: "230px", zIndex: 5 }}
          >
            <img
              src="/arch.png"
              alt=""
              style={{ width: "230px", display: "block" }}
            />
          </div>

          <nav
            className="max-w-screen-xl mx-auto flex items-center justify-between px-4 relative"
            style={{ minHeight: "52px", zIndex: 20 }}
          >
            {/* LEFT nav links */}
            <div className="hidden md:flex items-center gap-0">
              <NavLink to="/" end className={({ isActive }) => isActive ? activeNavLinkClass : navLinkClass}>HOME</NavLink>
              <NavLink to="/hostels" className={({ isActive }) => isActive ? activeNavLinkClass : navLinkClass}>HOSTELS</NavLink>
              <NavLink to="/menu" className={({ isActive }) => isActive ? activeNavLinkClass : navLinkClass}>MENU</NavLink>
              <NavLink to="/about" className={({ isActive }) => isActive ? activeNavLinkClass : navLinkClass}>ABOUT</NavLink>
            </div>

            {/* CENTER: spacer matching the arch width */}
            <div className="hidden md:block" style={{ width: "180px", flexShrink: 0 }} />

            {/* RIGHT nav links */}
            <div className="hidden md:flex items-center gap-0">
              <NavLink to="/contact" className={({ isActive }) => isActive ? activeNavLinkClass : navLinkClass}>CONTACT</NavLink>
              <a href="https://www.nitj.ac.in" target="_blank" rel="noreferrer" className={navLinkClass}>NITJ WEBSITE</a>
              <NavLink to="/login" className={({ isActive }) => isActive ? activeNavLinkClass : navLinkClass}>LOGIN</NavLink>
            </div>

            {/* Mobile toggle - Moved to left */}
            <button
              className="md:hidden text-white mr-auto z-30"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </nav>
        </div>

        {/* Mobile nav dropdown - Moved INSIDE header so it sticks too */}
        {isOpen && (
          <div
            className="md:hidden text-white border-t border-white/20 z-[90] relative shadow-2xl"
            style={{ backgroundColor: NITJ_BLUE }}
          >
            <div className="flex flex-col p-4 gap-2">
              <Link to="/" className="block px-3 py-2 rounded text-white font-bold text-sm uppercase hover:bg-white/20" onClick={() => setIsOpen(false)}>Home</Link>
              <Link to="/hostels" className="block px-3 py-2 rounded text-white font-bold text-sm uppercase hover:bg-white/20" onClick={() => setIsOpen(false)}>Hostels</Link>
              <Link to="/menu" className="block px-3 py-2 rounded text-white font-bold text-sm uppercase hover:bg-white/20" onClick={() => setIsOpen(false)}>Menu</Link>
              <Link to="/about" className="block px-3 py-2 rounded text-white font-bold text-sm uppercase hover:bg-white/20" onClick={() => setIsOpen(false)}>About</Link>
              <Link to="/contact" className="block px-3 py-2 rounded text-white font-bold text-sm uppercase hover:bg-white/20" onClick={() => setIsOpen(false)}>Contact</Link>
              <Link 
              to="/login" 
              className="block bg-white text-[#1464aa] px-3 py-2.5 rounded-xl font-bold text-center mt-3 text-sm uppercase shadow-lg shadow-black/10 hover:bg-white/90 active:scale-95 transition-all" 
              onClick={() => setIsOpen(false)}
            >
              Login / Register
            </Link>
            </div>
          </div>
        )}
      </header>

      {/* ============================================================
          STICKY NAV — same 2-tier design as full header (no utility bar)
          Slides in from top when user scrolls past 140px
      ============================================================ */}

    </>
  );
}