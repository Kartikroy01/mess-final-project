import React, { useEffect, useRef } from "react";
import { ChevronDown, Users, Building2, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

export default function HeroSection() {
  const lottieContainer = useRef(null);
  const [isVisible, setIsVisible] = React.useState(false);

  useEffect(() => {
    setIsVisible(true);

    // Load Lottie animation
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/bodymovin/5.12.2/lottie.min.js";
    script.async = true;

    script.onload = () => {
      if (window.lottie && lottieContainer.current) {
        window.lottie.loadAnimation({
          container: lottieContainer.current,
          renderer: "svg",
          loop: true,
          autoplay: true,
          path: "https://lottie.host/4f0c5e3c-5e6e-4d8e-9c3e-8f3b8c7e5d4e/rKJqXzRzYE.json",
        });
      }
    };

    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-gradient-to-br from-nitj-dark to-nitj-primary">
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>

      {/* Main content */}
      <div className="relative h-full flex items-center justify-center px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center w-full">
          {/* Left side - Text content */}
          <div
            className={`text-left space-y-8 transition-all duration-1000 transform ${
              isVisible
                ? "translate-x-0 opacity-100"
                : "-translate-x-12 opacity-0"
            }`}
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
              Welcome to
              <span className="block mt-2 text-nitj-accent">
                NITJ Mess Portal
              </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-300 leading-relaxed max-w-xl">
              Experience seamless mess management with real-time meal tracking, 
              transparent billing, and instant feedback. Your campus dining made simple.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <Link
                to="/login"
                className="group px-8 py-4 bg-nitj-accent text-white rounded-xl font-semibold text-lg hover:brightness-110 transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-nitj-accent/30"
              >
                <span className="flex items-center gap-2">
                  Get Started
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Link>
              <button className="px-8 py-4 bg-white/10 backdrop-blur-md border-2 border-white/30 text-white rounded-xl font-semibold text-lg hover:bg-white/20 transform hover:scale-105 transition-all duration-300">
                Learn More
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="text-center p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                <div className="flex items-center justify-center mb-2">
                  <Users className="w-6 h-6 text-nitj-accent" />
                </div>
                <div className="text-3xl font-bold text-white">5000+</div>
                <div className="text-sm text-slate-400">Students</div>
              </div>
              <div className="text-center p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                <div className="flex items-center justify-center mb-2">
                  <Building2 className="w-6 h-6 text-nitj-accent" />
                </div>
                <div className="text-3xl font-bold text-white">13+</div>
                <div className="text-sm text-slate-400">Hostels</div>
              </div>
              <div className="text-center p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="w-6 h-6 text-nitj-accent" />
                </div>
                <div className="text-3xl font-bold text-white">99%</div>
                <div className="text-sm text-slate-400">Satisfaction</div>
              </div>
            </div>
          </div>

          {/* Right side - Lottie Animation */}
          <div
            className={`relative transition-all duration-1000 delay-300 transform ${
              isVisible
                ? "translate-x-0 opacity-100"
                : "translate-x-12 opacity-0"
            }`}
          >
            <div className="relative">
              {/* Glowing effect behind animation */}
              <div className="absolute inset-0 bg-nitj-accent rounded-full filter blur-3xl opacity-20 animate-pulse"></div>

              {/* Lottie container */}
              <div
                ref={lottieContainer}
                className="relative w-full h-96 md:h-[500px]"
              ></div>

              {/* Fallback content if Lottie doesn't load */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-white/20 text-9xl">🍽️</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <ChevronDown className="w-8 h-8 text-white/60" />
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}
