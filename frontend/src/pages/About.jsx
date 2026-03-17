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
      icon: <ShieldCheck className="w-8 h-8 text-nitj-accent" />,
      title: "Transparency",
      description: "Real-time tracking of meal attendance and billing ensures complete trust between students and administration."
    },
    {
      icon: <Zap className="w-8 h-8 text-nitj-accent" />,
      title: "Efficiency",
      description: "Streamlined processes for requesting mess-off and managing daily menus reduce manual paperwork and delays."
    },
    {
      icon: <Cpu className="w-8 h-8 text-nitj-accent" />,
      title: "Digitalization",
      description: "A paperless environment for all hostel operations, from menu planning to monthly bill generation."
    },
    {
      icon: <Users2 className="w-8 h-8 text-nitj-accent" />,
      title: "User-Centric",
      description: "Designed specifically for the NITJ community, catering to the unique needs of both students and mess staff."
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
          <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 transform hover:-translate-y-1 transition-all duration-300">
            <div className="w-14 h-14 bg-nitj-primary/10 rounded-2xl flex items-center justify-center mb-6">
              <Eye className="w-8 h-8 text-nitj-primary" />
            </div>
            <h2 className="text-2xl font-bold text-nitj-dark mb-4">Our Vision</h2>
            <p className="text-slate-600 leading-relaxed italic">
              "To create a world-class digital ecosystem for NITJ hostels where technology 
              seamlessly integrates with daily campus life, ensuring health, convenience, 
              and transparency for every student."
            </p>
          </div>

          {/* Mission Card */}
          <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 transform hover:-translate-y-1 transition-all duration-300">
            <div className="w-14 h-14 bg-[#FF5722]/10 rounded-2xl flex items-center justify-center mb-6">
              <Target className="w-8 h-8 text-[#FF5722]" />
            </div>
            <h2 className="text-2xl font-bold text-nitj-dark mb-4">Our Mission</h2>
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
              <div key={index} className="p-8 rounded-2xl bg-slate-50 hover:bg-white hover:shadow-lg transition-all border border-transparent hover:border-slate-100 text-center group">
                <div className="mb-6 inline-block p-4 bg-white rounded-xl shadow-sm group-hover:bg-nitj-accent transition-colors">
                  <div className="group-hover:text-white transition-colors duration-300">
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

      {/* Footer Call to Action */}
      <section className="bg-nitj-dark py-20 text-center px-6">
        <h2 className="text-3xl font-bold text-white mb-8">Ready to experience the future of dining?</h2>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/login" className="px-8 py-3 bg-nitj-accent text-white font-bold rounded-xl hover:bg-[#FF7043] transition-all transform hover:scale-105 shadow-xl">
            Get Started Now
          </Link>
          <a href="mailto:mess.nitj@gmail.com" className="px-8 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all border border-white/20">
            Contact Administration
          </a>
        </div>
      </section>
    </div>
  );
}
