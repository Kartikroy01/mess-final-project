import React from "react";
import { 
  Target, 
  Eye, 
  ShieldCheck, 
  Zap, 
  Cpu, 
  Users2, 
  ArrowRight,
  ClipboardCheck,
  Globe
} from "lucide-react";
import { Link } from "react-router-dom";

export default function About() {
  const features = [
    {
      icon: <ShieldCheck className="w-8 h-8" />,
      title: "Transparency",
      description: "Real-time tracking of meal attendance and billing ensures complete trust between students and administration.",
      colorClass: "text-blue-600 group-hover:text-white",
      bgClass: "bg-blue-50 group-hover:bg-blue-600",
      borderClass: "hover:border-blue-100 hover:shadow-blue-200/40",
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Efficiency",
      description: "Streamlined processes for requesting mess-off and managing daily menus reduce manual paperwork and delays.",
      colorClass: "text-amber-500 group-hover:text-white",
      bgClass: "bg-amber-50 group-hover:bg-amber-500",
      borderClass: "hover:border-amber-100 hover:shadow-amber-200/40",
    },
    {
      icon: <Cpu className="w-8 h-8" />,
      title: "Digitalization",
      description: "A paperless environment for all hostel operations, from menu planning to monthly bill generation.",
      colorClass: "text-teal-600 group-hover:text-white",
      bgClass: "bg-teal-50 group-hover:bg-teal-600",
      borderClass: "hover:border-teal-100 hover:shadow-teal-200/40",
    },
    {
      icon: <Users2 className="w-8 h-8" />,
      title: "User-Centric",
      description: "Designed specifically for the NITJ community, catering to the unique needs of both students and mess staff.",
      colorClass: "text-violet-600 group-hover:text-white",
      bgClass: "bg-violet-50 group-hover:bg-violet-600",
      borderClass: "hover:border-violet-100 hover:shadow-violet-200/40",
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative py-20 bg-nitj-dark overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-nitj-accent rounded-full filter blur-[100px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-nitj-primary rounded-full filter blur-[100px]"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
            About <span className="text-nitj-accent">Smart Hostel Mess</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Revolutionizing the dining experience at NIT Jalandhar through innovation, 
            transparency, and digital excellence.
          </p>
        </div>
      </section>

      {/* Vision & Mission Cards */}
      <section className="py-16 px-6 -mt-10">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Vision Card */}
          <div className="bg-gradient-to-br from-white via-white to-blue-50/30 p-10 rounded-3xl shadow-[0_15px_35px_rgba(37,99,235,0.04)] border border-blue-100/50 transform hover:-translate-y-1.5 hover:border-blue-200/80 hover:shadow-2xl hover:shadow-blue-200/20 transition-all duration-300">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-200/50 text-white">
              <Eye className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-4">Our Vision</h2>
            <p className="text-slate-600 leading-relaxed italic">
              "To create a world-class digital ecosystem for NITJ hostels where technology 
              seamlessly integrates with daily campus life, ensuring health, convenience, 
              and transparency for every student."
            </p>
          </div>

          {/* Mission Card */}
          <div className="bg-gradient-to-br from-white via-white to-orange-50/30 p-10 rounded-3xl shadow-[0_15px_35px_rgba(249,115,22,0.04)] border border-orange-100/50 transform hover:-translate-y-1.5 hover:border-orange-200/80 hover:shadow-2xl hover:shadow-orange-200/20 transition-all duration-300">
            <div className="w-14 h-14 bg-orange-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-orange-200/50 text-white">
              <Target className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-4">Our Mission</h2>
            <p className="text-slate-600 leading-relaxed">
              We aim to eliminate traditional bottlenecks in mess management by providing 
              automated record-keeping, intelligent menu forecasting, and integrated 
              feedback mechanisms to enhance food quality.
            </p>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="py-20 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-nitj-dark mb-4">Engineered for Excellence</h2>
            <div className="w-20 h-1.5 bg-nitj-accent mx-auto rounded-full"></div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className={`p-8 rounded-3xl bg-slate-50/50 hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent ${feature.borderClass} text-center group transform hover:-translate-y-1.5`}
              >
                <div className={`mb-6 inline-block p-4 rounded-2xl shadow-sm ${feature.bgClass} transition-colors duration-300`}>
                  <div className={`${feature.colorClass} transition-colors duration-300`}>
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-nitj-dark mb-3">{feature.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* System Impact Section */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2">
            <h2 className="text-3xl md:text-4xl font-bold text-nitj-dark mb-8 leading-tight">
              A Strategic Move Towards a 
              <span className="text-nitj-primary"> Digital Campus</span>
            </h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center mt-1">
                  <ClipboardCheck className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-nitj-dark">Reduced Food Waste</h4>
                  <p className="text-slate-600 text-sm">Mess-off requests help staff predict exact consumption, cutting down significant biological waste.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center mt-1">
                  <Globe className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-nitj-dark">Eco-Friendly Operations</h4>
                  <p className="text-slate-600 text-sm">Complete transition to digital registers saves thousands of paper sheets every semester.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center mt-1">
                  <Cpu className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-nitj-dark">Data-Driven Quality</h4>
                  <p className="text-slate-600 text-sm">Systematic feedback analysis allows the administration to monitor and improve caterer performance.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:w-1/2 relative">
            <div className="bg-nitj-primary rounded-3xl overflow-hidden shadow-2xl">
              <img 
                src="/hero/hero1.jpg" 
                alt="NITJ Campus Life" 
                className="w-full h-full object-cover opacity-80 mix-blend-overlay"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-nitj-dark/80 to-transparent p-12 flex flex-col justify-end">
                <p className="text-white text-2xl font-serif italic mb-4">
                  "Health is wealth, and balanced nutrition is the foundation of student success."
                </p>
                <p className="text-slate-300 font-bold uppercase tracking-widest text-sm">— NITJ Mess Administration</p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
