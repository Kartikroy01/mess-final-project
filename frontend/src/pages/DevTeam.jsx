import React, { useState } from "react";
import { Linkedin, Github, Instagram, User, GraduationCap, Briefcase, Twitter, Mail, Phone } from "lucide-react";

const teamData = {
  mentor: {
    name: "Dr. [Mentor Name]",
    role: "Mentor & Supervisor",
    batch: "Faculty Advisor",
    image: "/dev-team/mentor.jpg",
    linkedin: "#",
    github: "#",
  },
  developers: [
    {
      name: "Kartik Roy",
      role: "Lead Developer",
      batch: "2022-2026",
      image: "/dev-team/kartik.jpg",
      linkedin: "https://linkedin.com/in/kartikroy",
      github: "https://github.com/Kartikroy01",
      twitter: "#",
      email: "mailto:kartik@example.com",
      phone: "tel:+910000000000",
      instagram: "#",
      isLead: true,
    },
    {
      name: "[Developer 2]",
      role: "Full Stack Developer",
      batch: "2022-2026",
      image: "/dev-team/dev2.jpg",
      linkedin: "#",
      github: "#",
    },
    {
      name: "[Developer 3]",
      role: "Frontend Developer",
      batch: "2022-2026",
      image: "/dev-team/dev3.jpg",
      linkedin: "#",
      github: "#",
    },
  ],
};

const TeamCard = ({ member, isMentor = false }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div className={`bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-cyan-500/10 group ${isMentor ? 'md:max-w-xl mx-auto mb-12' : ''}`}>
      <div className="p-8 flex flex-col items-center">
        {/* Profile Image */}
        <div className={`relative mb-6 group`}>
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-full blur-2xl opacity-10 group-hover:opacity-30 transition-opacity duration-500"></div>
          <div className={`relative w-32 h-32 ${isMentor ? 'md:w-40 md:h-40' : ''} rounded-full border-4 border-white/5 overflow-hidden bg-nitj-dark flex items-center justify-center shadow-inner`}>
            {imgError || !member.image ? (
              <User className="w-1/2 h-1/2 text-white/20" />
            ) : (
              <img 
                src={member.image} 
                alt={member.name} 
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                onError={() => setImgError(true)}
              />
            )}
          </div>
          {isMentor && (
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-nitj-accent text-white text-[11px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-xl">
              Faculty Mentor
            </div>
          )}
        </div>

        {/* Member Info */}
        <h3 className={`text-white font-extrabold text-center ${isMentor ? 'text-2xl' : 'text-xl'} mb-2 tracking-tight`}>
          {member.name}
        </h3>
        
        <div className="flex items-center gap-2 text-cyan-400 font-medium text-sm mb-2">
          <Briefcase className="w-4 h-4" />
          <span>{member.role}</span>
        </div>

        <div className="flex items-center gap-2 text-slate-400 text-xs mb-6 px-4 py-1 bg-white/5 rounded-full">
          <GraduationCap className="w-4 h-4" />
          <span>{member.batch}</span>
        </div>

        {/* Social Links */}
        <div className="flex flex-wrap justify-center gap-4 mt-auto">
          {member.linkedin && (
            <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#0077b5] transform hover:scale-110 transition-all duration-300">
              <Linkedin className="w-6 h-6" />
            </a>
          )}
          {member.twitter && (
            <a href={member.twitter} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transform hover:scale-110 transition-all duration-300">
              <Twitter className="w-6 h-6" />
            </a>
          )}
          {member.email && (
            <a href={member.email} className="text-slate-400 hover:text-white transform hover:scale-110 transition-all duration-300 bg-transparent hover:bg-red-600 rounded-full p-1 border border-transparent hover:border-red-600">
              <Mail className="w-5 h-5" />
            </a>
          )}
          {member.phone && (
            <a href={member.phone} className="text-slate-400 hover:text-green-500 transform hover:scale-110 transition-all duration-300">
              <Phone className="w-6 h-6" />
            </a>
          )}
          {member.instagram && (
            <a href={member.instagram} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-pink-500 transform hover:scale-110 transition-all duration-300">
              <Instagram className="w-6 h-6" />
            </a>
          )}
          {member.github && !member.isLead && (
            <a href={member.github} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transform hover:scale-110 transition-all duration-300">
              <Github className="w-6 h-6" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default function DevTeam() {
  return (
    <div className="min-h-screen bg-[#0d1b2e] pt-32 pb-20 px-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-top-4 duration-700">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter uppercase italic">
            Mess Portal <span className="text-cyan-500">Dev Team</span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
            The dedicated team of students and faculty working to modernize the NIT Jalandhar hostel mess experience.
          </p>
          <div className="w-24 h-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 mx-auto mt-8 rounded-full"></div>
        </div>

        {/* Mentor Highlight */}
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          <TeamCard member={teamData.mentor} isMentor={true} />
        </div>

        {/* Developers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-500">
          {teamData.developers.map((dev, idx) => (
            <TeamCard key={idx} member={dev} />
          ))}
        </div>

        {/* Closing Footer */}
        <div className="mt-20 text-center text-slate-500 px-6 py-8 border-t border-white/5">
          <p className="text-sm font-medium italic opacity-60">"Building future-ready campus solutions, one line of code at a time."</p>
          <p className="mt-4 text-xs tracking-widest uppercase opacity-40">© {new Date().getFullYear()} NIT Jalandhar Digital Initiatives</p>
        </div>
      </div>
    </div>
  );
}
