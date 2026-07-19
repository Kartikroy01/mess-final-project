import React, { useState } from "react";
import { Linkedin, Github, User, GraduationCap, Briefcase, Mail } from "lucide-react";

const teamData = {
  mentor: {
    name: "Dr. [Mentor Name]",
    role: "Faculty Advisor",
    batch: "Faculty Mentor",
    image: "/dev-team/mentor.jpg",
    linkedin: "#",
    github: "#",
    isMentor: true
  },
  developers: [
    {
      name: "Kartik Roy",
      role: "Lead Developer",
      batch: "Batch of 2026",
      image: "/dev-team/kartik.jpg",
      linkedin: "https://linkedin.com/in/kartikroy",
      github: "https://github.com/Kartikroy01",
      email: "mailto:kartik@example.com",
      isLead: true,
    },
    {
      name: "[Developer 2]",
      role: "Full Stack Developer",
      batch: "Batch of 2026",
      image: "/dev-team/dev2.jpg",
      linkedin: "#",
      github: "#",
      email: "mailto:dev2@example.com",
    },
    {
      name: "[Developer 3]",
      role: "Frontend Developer",
      batch: "Batch of 2026",
      image: "/dev-team/dev3.jpg",
      linkedin: "#",
      github: "#",
      email: "mailto:dev3@example.com",
    }
  ]
};

export default function DevTeam() {
  const [imgErrors, setImgErrors] = useState({});

  const handleImgError = (name) => {
    setImgErrors(prev => ({ ...prev, [name]: true }));
  };

  const allMembers = [teamData.mentor, ...teamData.developers];

  return (
    <div className="h-screen w-screen bg-white flex flex-col justify-between p-6 overflow-hidden relative font-sans text-slate-800 select-none">
      
      {/* Background Decorative Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-50/50 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-50/50 rounded-full blur-[120px] pointer-events-none"></div>



      {/* Middle Section: Profiles grid */}
      <div className="flex-1 flex flex-col justify-start pt-6 max-w-7xl w-full mx-auto my-4 z-10">
        
        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-1 uppercase italic">
            Meet The <span className="text-indigo-650 font-black">Dev Team</span>
          </h1>
          <p className="text-slate-500 text-xs md:text-sm max-w-lg mx-auto font-medium">
            Building a seamless digital dining experience for Dr. B. R. Ambedkar NIT Jalandhar.
          </p>
        </div>

        {/* 4-column Grid matching the screen height perfectly */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full items-stretch">
          {allMembers.map((member) => (
            <div 
              key={member.name}
              className={`relative bg-white border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-100 rounded-2xl p-5 flex flex-col justify-between items-center group overflow-hidden ${
                member.isMentor 
                  ? 'border-indigo-100 bg-gradient-to-b from-indigo-50/40 to-white shadow-md' 
                  : 'border-slate-100 shadow-sm'
              }`}
            >
              {/* Highlight background lines for mentor */}
              {member.isMentor && (
                <div className="absolute top-0 right-0 bg-indigo-600 text-[9px] font-black tracking-widest text-white px-3 py-1 rounded-bl-xl uppercase">
                  Mentor
                </div>
              )}

              <div className="w-full flex flex-col items-center">
                {/* Avatar with glow */}
                <div className="relative mb-4 mt-2">
                  <div className={`absolute inset-0 rounded-full blur-xl opacity-20 transition-opacity duration-300 group-hover:opacity-40 bg-gradient-to-tr ${
                    member.isMentor ? 'from-indigo-100 to-purple-100' : 'from-blue-50 to-indigo-50'
                  }`}></div>
                  <div className={`relative w-22 h-22 rounded-full overflow-hidden border-2 flex items-center justify-center bg-slate-50 ${
                    member.isMentor ? 'border-indigo-200/50' : 'border-slate-200/60'
                  }`}>
                    {imgErrors[member.name] || !member.image ? (
                      <User className="w-10 h-10 text-slate-400" />
                    ) : (
                      <img 
                        src={member.image} 
                        alt={member.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={() => handleImgError(member.name)}
                      />
                    )}
                  </div>
                </div>

                {/* Info Text */}
                <h3 className="text-sm font-extrabold text-slate-800 text-center tracking-tight mb-1 group-hover:text-indigo-650 transition-colors">
                  {member.name}
                </h3>
                
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-650 mb-2">
                  <Briefcase size={11} className="text-indigo-550" />
                  <span>{member.role}</span>
                </div>

                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-50 border border-slate-100 text-[9px] font-medium text-slate-500">
                  <GraduationCap size={10} className="text-slate-400" />
                  <span>{member.batch}</span>
                </div>
              </div>

              {/* Social Links Row */}
              <div className="flex items-center gap-3 mt-5 pt-4 border-t border-slate-100 w-full justify-center">
                {member.linkedin && member.linkedin !== '#' && (
                  <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#0077b5] transition-colors p-1.5 hover:bg-slate-50 rounded-lg" title="LinkedIn">
                    <Linkedin size={15} />
                  </a>
                )}
                {member.github && member.github !== '#' && (
                  <a href={member.github} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-800 transition-colors p-1.5 hover:bg-slate-50 rounded-lg" title="GitHub">
                    <Github size={15} />
                  </a>
                )}
                {member.email && member.email !== '#' && (
                  <a href={member.email} className="text-slate-400 hover:text-red-500 transition-colors p-1.5 hover:bg-slate-50 rounded-lg" title="Email">
                    <Mail size={15} />
                  </a>
                )}
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* Footer bar */}
      <footer className="w-full flex items-center justify-center text-[10px] text-slate-400 border-t border-slate-100 pt-4 max-w-7xl mx-auto z-10">
        <span>© 2026 NITJ Hostel Mess Portal</span>
      </footer>

    </div>
  );
}
