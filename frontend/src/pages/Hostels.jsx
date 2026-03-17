import React from "react";
import { Building2, Users, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const hostels = [
  { name: "Boys Hostel 1", type: "Boys", capacity: 250, students: 245 },
  { name: "Boys Hostel 2", type: "Boys", capacity: 300, students: 290 },
  { name: "Boys Hostel 3", type: "Boys", capacity: 280, students: 275 },
  { name: "Boys Hostel 4", type: "Boys", capacity: 400, students: 395 },
  { name: "Boys Hostel 5", type: "Boys", capacity: 320, students: 310 },
  { name: "Boys Hostel 6", type: "Boys", capacity: 350, students: 342 },
  { name: "Boys Hostel 7 & 7E", type: "Boys", capacity: 450, students: 430 },
  { name: "Mega Hostel Boys Block-A", type: "Boys", capacity: 800, students: 780 },
  { name: "Mega Hostel Boys Block-B", type: "Boys", capacity: 800, students: 795 },
  { name: "Mega Hostel Boys Block-E", type: "Boys", capacity: 800, students: 785 },
  { name: "Mega Hostel Boys Block-F", type: "Boys", capacity: 800, students: 790 },
  { name: "GH1 (Girls Hostel 1)", type: "Girls", capacity: 200, students: 195 },
  { name: "GH2 (Girls Hostel 2)", type: "Girls", capacity: 250, students: 242 },
  { name: "MGH (Mega Girls Hostel)", type: "Girls", capacity: 600, students: 585 },
];

export default function Hostels() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">NITJ Hostels Information</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {hostels.map((hostel, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow p-6 border border-gray-100 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${hostel.type === 'Boys' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'}`}>
                  <Building2 className="w-6 h-6" />
                </div>
                <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                  hostel.type === 'Boys' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
                }`}>
                  {hostel.type}
                </span>
              </div>

              <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-nitj-blue transition-colors">
                {hostel.name}
              </h3>

              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">Student Capacity: {hostel.capacity}</span>
              </div>
              
              <div className="flex items-center gap-2 text-gray-600">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium">Total Registered: {hostel.students}</span>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-50 flex items-center justify-between">
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${hostel.type === 'Boys' ? 'bg-blue-500' : 'bg-pink-500'}`}
                    style={{ width: `${(hostel.students / hostel.capacity) * 100}%` }}
                  />
                </div>
                <span className="ml-4 text-sm font-bold text-gray-700">
                  {Math.round((hostel.students / hostel.capacity) * 100)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Simple internal icon for trending
function TrendingUp({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  );
}
