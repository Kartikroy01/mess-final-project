import React from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer style={{ backgroundColor: "#0d1b2e", color: "#d1d5db" }}>
      {/* Main footer grid */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid md:grid-cols-4 gap-8">

          {/* Institute Section — with logo */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img
                src="/logo_250.png"
                alt="NITJ Logo"
                style={{ width: "56px", height: "56px", objectFit: "contain", flexShrink: 0 }}
              />
              <div>
                <h2 className="text-sm font-bold text-white leading-tight">
                  Dr B R Ambedkar National Institute of Technology
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">Jalandhar</p>
              </div>
            </div>

            <ul className="space-y-2 text-sm text-gray-400 mt-4">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "#E28122" }} />
                <span>G.T Road, Amritsar Bypass, Jalandhar, Punjab, India-144008</span>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "#E28122" }} />
                <span>+91-0181-2690301</span>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "#E28122" }} />
                <span>mess@nitj.ac.in</span>
              </li>
            </ul>

            {/* Social icons */}
            <div className="flex gap-3 mt-5">
              {[
                { icon: <Facebook className="w-4 h-4" />, href: "#" },
                { icon: <Instagram className="w-4 h-4" />, href: "#" },
                { icon: <Twitter className="w-4 h-4" />, href: "#" },
                { icon: <Linkedin className="w-4 h-4" />, href: "#" },
                { icon: <Youtube className="w-4 h-4" />, href: "#" },
              ].map((s, i) => (
                <a
                  key={i}
                  href={s.href}
                  className="flex items-center justify-center rounded-full text-gray-300 transition-colors"
                  style={{ width: "32px", height: "32px", backgroundColor: "#1a2d42" }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = "#1464aa"}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = "#1a2d42"}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* NITJ Hostel Mess */}
          <div>
            <h3 className="text-base font-semibold mb-4 text-white border-b pb-2" style={{ borderColor: "#1464aa" }}>
              NITJ Hostel Mess
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Digital mess management system for efficient meal tracking, attendance monitoring, and comprehensive reporting for NITJ students.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-base font-semibold mb-4 text-white border-b pb-2" style={{ borderColor: "#1464aa" }}>
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm">
              {[
                { label: "Home", to: "/" },
                { label: "Weekly Menu", to: "/menu" },
                { label: "About Us", to: "/about" },
                { label: "Contact", to: "/contact" },
                { label: "NIT Jalandhar Website", href: "https://nitj.ac.in" },
              ].map((link, i) =>
                link.href ? (
                  <li key={i}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors"
                      style={{ "--hover-color": "#E28122" }}
                    >
                      <span style={{ color: "#E28122" }}>›</span> {link.label}
                    </a>
                  </li>
                ) : (
                  <li key={i}>
                    <Link
                      to={link.to}
                      className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors"
                    >
                      <span style={{ color: "#E28122" }}>›</span> {link.label}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Contact / Portal Links */}
          <div>
            <h3 className="text-base font-semibold mb-4 text-white border-b pb-2" style={{ borderColor: "#1464aa" }}>
              Portal Links
            </h3>
            <ul className="space-y-2 text-sm">
              {[
                { label: "Login", to: "/login" },
                { label: "Privacy Policy", to: "/privacy" },
                { label: "Terms of Service", to: "/terms" },
                { label: "Feedback", to: "/feedback" },
                { label: "Mess Schedule", to: "/menu" },
              ].map((link, i) => (
                <li key={i}>
                  <Link
                    to={link.to}
                    className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors"
                  >
                    <span style={{ color: "#E28122" }}>›</span> {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom copyright bar */}
      <div style={{ backgroundColor: "#091525", borderTop: "1px solid #1a2d42" }}>
        <div className="max-w-7xl mx-auto px-6 py-3 flex flex-col md:flex-row justify-between items-center text-xs text-gray-400 gap-2">
          <p>© Copyright {new Date().getFullYear()}, All Rights Reserved NIT Jalandhar</p>
          <p>
            Developed in-house by{" "}
            <Link
              to="/dev-team"
              className="font-semibold hover:brightness-125 transition-all active:scale-95 cursor-pointer no-underline"
              style={{ color: "#E28122" }}
            >
              Mess Portal Dev Team
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}