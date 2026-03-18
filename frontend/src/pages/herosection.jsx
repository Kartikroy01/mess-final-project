import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Users, Building2, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const slides = [
    {
      image: "/hero/hero1.jpg",
      heading: "Quality Nutrition, Healthy Campus Life",
      subheading: "Fueling your education with balanced and delicious meals every day.",
    },
    {
      image: "/hero/hero2.jpg",
      heading: "Home-Style Food served with Care",
      subheading: "Experience the warmth of home-cooked flavors in every bite.",
    },
    {
      image: "/hero/hero3.jpg",
      heading: "Nourishing Your Mind and Body",
      subheading: "Providing fresh, hygienic, and sustainable dining solutions for NITJ.",
    },
  ];

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <div className="relative h-[65vh] md:h-screen w-full overflow-hidden bg-gray-900">
      {/* Background Image Slider */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={slide.image}
            alt={`Hero Background ${index + 1}`}
            className="w-full h-full object-cover scale-105 animate-slow-zoom"
          />
        </div>
      ))}

      {/* Dark Overlay for Readability */}
      <div className="absolute inset-0 bg-black/55 backdrop-blur-[1px]"></div>

      {/* Main Content (Centered) */}
      <div className="relative h-full flex flex-col items-center justify-center text-center px-6 z-10">
        <div
          className={`max-w-4xl space-y-8 transition-all duration-1000 transform ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
          }`}
        >
          {/* Static Welcome Text */}
          <h2 className="text-3xl md:text-5xl lg:text-7xl font-extrabold text-white leading-tight tracking-tight drop-shadow-2xl mb-6 md:mb-8">
            Welcome to <span className="text-[#FF5722] whitespace-nowrap">NITJ MESS</span>
          </h2>

          <div className="relative w-full min-h-[100px] md:min-h-[140px] flex items-center justify-center">
            {/* Dynamic Content Cycling with Slider */}
            {slides.map((slide, index) => (
              <div
                key={index}
                className={`transition-all duration-700 absolute transition-all ease-in-out ${
                  index === currentSlide ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"
                }`}
              >
                <p className="text-lg md:text-2xl text-white font-medium italic drop-shadow-md px-4">
                  "{slide.heading}"
                </p>
                <p className="text-base md:text-xl text-slate-200 mt-2 md:mt-3 font-normal max-w-2xl mx-auto drop-shadow-sm px-4">
                  "{slide.subheading}"
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center gap-6 pt-8 md:pt-12">
            <Link
              to="/login"
              className="px-8 py-3 md:px-10 md:py-3.5 bg-transparent text-white border-[1.5px] border-[#FF5722] rounded-md font-bold text-base md:text-lg hover:bg-[#FF5722]/10 hover:border-[#FF7043] transition-all duration-300 transform active:scale-95 shadow-lg shadow-[#FF5722]/20"
            >
              Get In
            </Link>
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex gap-3 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2 transition-all duration-300 rounded-full ${
              index === currentSlide ? "w-8 bg-[#FF5722]" : "w-2 bg-white/40"
            }`}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes slow-zoom {
          0% { transform: scale(1); }
          100% { transform: scale(1.1); }
        }
        .animate-slow-zoom {
          animation: slow-zoom 20s linear infinite alternate;
        }
      `}</style>
    </div>
  );
}
