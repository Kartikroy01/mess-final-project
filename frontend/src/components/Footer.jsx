import React from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer className="block border-t-4 border-blue-600 bg-gradient-to-b from-[#0f1d30] to-[#08111e] text-slate-300">
      {/* Main footer grid */}
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8 lg:gap-12">

          {/* Institute Section — with logo */}
          <div className="space-y-4">
            <div className="flex items-center gap-3.5">
              <img
                src="/logo_250.png"
                alt="NITJ Logo"
                className="w-14 h-14 object-contain shrink-0 bg-white/5 p-1 rounded-xl border border-white/10 shadow-md"
              />
              <div>
                <p className="text-[15px] font-bold text-white leading-snug tracking-tight">
                  Dr B R Ambedkar National Institute of Technology Jalandhar
                </p>
              </div>
            </div>

            <ul className="space-y-3.5 text-xs md:text-sm text-slate-400 mt-5">
              <li className="flex items-start gap-3 group">
                <MapPin className="w-4 h-4 mt-0.5 text-orange-500 shrink-0 group-hover:scale-110 transition-transform" />
                <span className="leading-relaxed">G.T Road, Amritsar Bypass, Jalandhar, Punjab, India-144008</span>
              </li>
              <li className="flex items-center gap-3 group">
                <Phone className="w-4 h-4 text-orange-500 shrink-0 group-hover:scale-110 transition-transform" />
                <a href="tel:+9101815037855" className="hover:text-white transition-colors">+91-0181-5037855, 2690301</a>
              </li>
              <li className="flex items-center gap-3 group">
                <Mail className="w-4 h-4 text-orange-500 shrink-0 group-hover:scale-110 transition-transform" />
                <a href="mailto:mess@nitj.ac.in" className="hover:text-white transition-colors">mess@nitj.ac.in</a>
              </li>
            </ul>

            {/* Social icons */}
            <div className="flex gap-3 mt-6 flex-wrap">
              {[
                { icon: <Facebook className="w-4 h-4" />, href: "#", color: "hover:bg-blue-600 hover:text-white" },
                { icon: <Instagram className="w-4 h-4" />, href: "#", color: "hover:bg-pink-600 hover:text-white" },
                { icon: <Twitter className="w-4 h-4" />, href: "#", color: "hover:bg-sky-500 hover:text-white" },
                { icon: <Linkedin className="w-4 h-4" />, href: "#", color: "hover:bg-blue-700 hover:text-white" },
                { icon: <Youtube className="w-4 h-4" />, href: "#", color: "hover:bg-red-600 hover:text-white" },
              ].map((s, i) => (
                <a
                  key={i}
                  href={s.href}
                  className={`w-9 h-9 rounded-xl bg-slate-800/80 flex items-center justify-center text-slate-300 transition-all duration-300 border border-slate-700/30 hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/10 active:scale-95 ${s.color}`}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Academics & Administration Subgrid (2 columns on mobile/tablet, spans 2 columns on desktop) */}
          <div className="grid grid-cols-2 gap-6 col-span-1 md:col-span-2">
            {/* Academics */}
            <div>
              <h3 className="text-base font-extrabold text-white mb-4 border-b border-blue-600 pb-1.5 w-full">
                Academics
              </h3>
              <ul className="space-y-3.5 text-xs md:text-sm">
                {[
                  { label: "Academic Calendar", href: "https://www.nitj.ac.in/index.php/nitj_cinfo/index/15" },
                  { label: "Admission", href: "https://www.nitj.ac.in/" },
                  { label: "Classroom Information", href: "https://www.nitj.ac.in/" },
                  { label: "Institute Timetable", href: "https://www.nitj.ac.in/" },
                  { label: "Library Resources", href: "https://www.nitj.ac.in/" },
                ].map((link, i) => (
                  <li key={i}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Administration */}
            <div>
              <h3 className="text-base font-extrabold text-white mb-4 border-b border-blue-600 pb-1.5 w-full">
                Administration
              </h3>
              <ul className="space-y-3.5 text-xs md:text-sm">
                {[
                  { label: "Academic Section Officials", href: "https://www.nitj.ac.in/" },
                  { label: "Deans", href: "https://www.nitj.ac.in/index.php/nitj_cinfo/index/11" },
                  { label: "Annual Reports", href: "https://www.nitj.ac.in/" },
                  { label: "Minutes of Meeting", href: "https://www.nitj.ac.in/" },
                  { label: "NIT Act and Statutes", href: "https://www.nitj.ac.in/" },
                  { label: "Rules/Policies", href: "https://www.nitj.ac.in/" },
                ].map((link, i) => (
                  <li key={i}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-base font-extrabold text-white mb-4 border-b border-blue-600 pb-1.5 w-full">
              Quick Links
            </h3>
            <ul className="space-y-3.5 text-xs md:text-sm">
              {[
                { label: "Other Charges Payment Link", href: "https://www.nitj.ac.in/" },
                { label: "NISP", href: "https://www.nitj.ac.in/" },
                { label: "Rankings", href: "https://www.nitj.ac.in/" },
                { label: "Virtual Labs", href: "https://www.nitj.ac.in/" },
                { label: "NITJ Compendium", href: "https://www.nitj.ac.in/index.php/nitj_cinfo/index/26" },
                { label: "Council of NITs", href: "https://www.nitj.ac.in/" },
              ].map((link, i) => (
                <li key={i}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>


      {/* Bottom copyright bar */}
      <div className="bg-[#070f1a] border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 gap-4">
          <p className="font-medium text-center md:text-left">© Copyright {new Date().getFullYear()}, All Rights Reserved NIT Jalandhar</p>
          <p className="flex items-center gap-1.5 font-medium justify-center">
            Developed in-house by{" "}
            <Link
              to="/dev-team"
              className="font-bold hover:brightness-125 transition-all text-orange-500 flex items-center gap-0.5 no-underline"
            >
              Mess Portal Dev Team
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}