import React, { useState, useEffect } from "react";
import { API_BASE_URL, getApiBaseUrl } from "../../config";
import {
  Home,
  BarChart2,
  CalendarOff,
  LogOut,
  Menu,
  X,
  QrCode,
  Download,
  FileText,
  ThumbsUp,
  Meh,
  ThumbsDown,
  Angry,
  MessageSquare,
  UtensilsCrossed,
  Bell,
  User,
  ChevronRight,
  Activity,
  IndianRupee,
  ArrowLeft,
  ChevronDown,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Coffee,
  Moon,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { QRCodeCanvas } from "qrcode.react";
import html2canvas from "html2canvas";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css"; // Add crop styles
import StudentComplaint from "./StudentComplaint";

// --- API SERVICE LAYER ---
const API_BASE_URL_LOCAL = API_BASE_URL;

const apiService = {
  fetchStudentData: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/student/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to fetch student data");
      }
      const data = await response.json();
      return data.success ? data.student : data;
    } catch (error) {
      console.error("Error fetching student data:", error);
      throw error;
    }
  },
  fetchMealHistory: async (token, month = null) => {
    try {
      const url =
        month !== null
          ? `${API_BASE_URL}/student/meals?month=${month}`
          : `${API_BASE_URL}/student/meals`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to fetch meal history");
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching meal history:", error);
      throw error;
    }
  },
  fetchMessOffRequests: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/mess-off/my-applications`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Failed to fetch mess off requests",
        );
      }
      const data = await response.json();
      return Array.isArray(data) ? data : data.data || [];
    } catch (error) {
      console.error("Error fetching mess off requests:", error);
      throw error;
    }
  },
  submitMessOff: async (token, data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/mess-off/apply`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Failed to submit mess off application",
        );
      }
      return await response.json();
    } catch (error) {
      console.error("Error submitting mess off:", error);
      throw error;
    }
  },
  uploadProfilePhoto: async (token, file) => {
    try {
      const formData = new FormData();
      formData.append("photo", file);
      const response = await fetch(`${API_BASE_URL}/student/upload-photo`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to upload photo");
      }
      return await response.json();
    } catch (error) {
      console.error("Error uploading photo:", error);
      throw error;
    }
  },
  submitFeedback: async (token, data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/feedback/submit`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to submit feedback");
      }
      return await response.json();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      throw error;
    }
  },
  fetchMenu: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/menu/current`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to fetch menu");
      }
      const data = await response.json();
      if (data && data.data) return data.data;
      return data;
    } catch (error) {
      console.error("Error fetching menu:", error);
      throw error;
    }
  },
  downloadReport: async (token, month) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/student/report/download?month=${month}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to download report");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `meal-report-${month}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading report:", error);
      throw error;
    }
  },
  fetchBill: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/bill/current`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to fetch bill");
      }
      const data = await response.json();
      return data.success ? data.data : data;
    } catch (error) {
      console.error("Error fetching bill:", error);
      throw error;
    }
  },
  getPhotoUrl: (photoPath) => {
    if (!photoPath) return "https://placehold.co/100x100/3B82F6/FFF?text=ST";
    if (photoPath.startsWith("http")) return photoPath;
    const baseUrl = API_BASE_URL.replace("/api", "");
    return `${baseUrl}${photoPath}`;
  },
};

// --- NAVIGATION COMPONENT ---
const NavItem = ({ icon, text, active, onClick, badge }) => (
  <li>
    <button
      onClick={onClick}
      className={`w-full flex items-center px-5 py-4 my-1.5 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
        active ? "text-white shadow-lg" : "text-slate-500 hover:bg-slate-50"
      }`}
      style={
        active
          ? {
              backgroundColor: "#1464aa",
              boxShadow: "0 4px 15px rgba(20,100,170,0.25)",
            }
          : {}
      }
    >
      <span
        className={`relative z-10 transition-transform duration-300 group-hover:scale-110 ${active ? "text-white" : "text-slate-400"}`}
      >
        {React.cloneElement(icon, { size: 22, strokeWidth: active ? 2.5 : 2 })}
      </span>
      <span
        className={`ml-4 font-semibold text-[15px] tracking-wide relative z-10`}
      >
        {text}
      </span>
      {badge && (
        <span className="ml-auto bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm relative z-10">
          {badge}
        </span>
      )}
      {active && (
        <div className="ml-auto relative z-10 opacity-80">
          <ChevronRight size={18} strokeWidth={3} />
        </div>
      )}
      {!active && (
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ backgroundColor: "rgba(20,100,170,0.05)" }}
        />
      )}
    </button>
  </li>
);

// --- MOBILE BOTTOM NAV COMPONENT ---
const BottomNavItem = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-full py-1 gap-0.5 transition-all duration-300 ${
      active ? "text-[#1464aa]" : "text-slate-400"
    }`}
  >
    <div className={`relative flex items-center justify-center transition-all duration-300 ${active ? "text-[#1464aa]" : "text-slate-400"}`}>
      {React.cloneElement(icon, { size: 20, strokeWidth: active ? 2.5 : 2 })}
    </div>
    <span className={`text-[10px] font-bold tracking-wide transition-colors duration-300 ${active ? "text-[#1464aa]" : "text-slate-400"}`}>
      {label}
    </span>
  </button>
);

// --- LOADING COMPONENT ---
const LoadingSpinner = ({ message = "Loading..." }) => (
  <div className="flex flex-col items-center justify-center h-full py-12">
    <div className="relative">
      <div
        className="absolute inset-0 rounded-full animate-ping opacity-20"
        style={{ backgroundColor: "rgba(20,100,170,0.3)" }}
      ></div>
      <div
        className="w-14 h-14 border-4 border-slate-100 rounded-full animate-spin shadow-sm"
        style={{ borderTopColor: "#1464aa" }}
      ></div>
    </div>
    <p className="mt-6 text-slate-500 font-medium text-sm tracking-wide animate-pulse">
      {message}
    </p>
  </div>
);

// --- DASHBOARD HOME ---
// --- DASHBOARD HOME ---
const StudentHome = ({
  student,
  token,
  onProfileUpdate,
  setActivePage,
  setShowQRModal,
  setIsSidebarOpen,
}) => {
  const getInitials = (name) => {
    if (!name) return "ST";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (
        parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
      ).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };
  const [mealHistory, setMealHistory] = useState([]);
  const [billData, setBillData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial data fetch
    Promise.all([
      apiService.fetchMealHistory(token),
      apiService.fetchBill(token),
    ])
      .then(([history, bill]) => {
        setMealHistory(Array.isArray(history) ? history.slice(0, 5) : []);
        setBillData(bill);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error loading dashboard data:", error);
        setLoading(false);
      });
  }, [token]);

  const quickActions = [
    {
      id: "scan",
      label: "QR Code",
      desc: "Scan member card",
      icon: <QrCode className="w-6 h-6 text-blue-600" />,
      bgClass: "from-blue-50/70 to-blue-50/20 border-blue-100",
      action: () => setShowQRModal(true),
    },
    {
      id: "messOff",
      label: "Mess Off",
      desc: "Apply leave status",
      icon: <CalendarOff className="w-6 h-6 text-pink-600" />,
      bgClass: "from-pink-50/70 to-pink-50/20 border-pink-100",
      action: () => setActivePage("messOff"),
    },
    {
      id: "feedback",
      label: "Feedback",
      desc: "Rate your meals",
      icon: <MessageSquare className="w-6 h-6 text-amber-600" />,
      bgClass: "from-amber-50/70 to-amber-50/20 border-amber-100",
      action: () => setActivePage("feedback"),
    },
    {
      id: "complaint",
      label: "Complain",
      desc: "Report food issues",
      icon: <AlertCircle className="w-6 h-6 text-sky-600" />,
      bgClass: "from-sky-50/70 to-sky-50/20 border-sky-100",
      action: () => setActivePage("complaint"),
    },
    {
      id: "history",
      label: "Meal History",
      desc: "Track your history",
      icon: <Clock className="w-6 h-6 text-emerald-600" />,
      bgClass: "from-emerald-50/70 to-emerald-50/20 border-emerald-100",
      action: () => setActivePage("reports"),
      colSpan: "col-span-2",
    },
  ];

  const totalBill = billData?.totalBill || student.bill || 0;
  const stats = [
    {
      label: "Total Bill",
      value: `₹${totalBill}`,
      icon: <IndianRupee />,
      grad: "from-blue-500 to-blue-600",
    },
    {
      label: "Total Meals",
      value: student.mealCount || 0,
      icon: <UtensilsCrossed />,
      grad: "from-green-500 to-emerald-600",
    },
    {
      label: "Avg/Meal",
      value: `₹${(totalBill / (student.mealCount || 1)).toFixed(2)}`,
      icon: <Activity />,
      grad: "from-purple-500 to-purple-600",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f5f9ff] md:bg-transparent -m-4 md:-m-0 pb-24 md:pb-0">
      {/* --- MOBILE ONLY VIEW --- */}
      <div className="md:hidden">
        {/* Removed duplicate utility bar */}

        {/* Mobile Header */}
        <div 
          className="bg-white/80 backdrop-blur-md px-4 py-2.5 flex items-center justify-between border-b border-slate-100/80 sticky top-0 z-[1001]" 
          style={{ paddingTop: "calc(0.75rem + env(safe-area-inset-top))" }}
        >
          <div className="flex items-center gap-2">
            <img src="/logo_250.png" alt="NITJ Logo" className="w-7 h-7 object-contain" />
            <span className="text-sm font-black text-slate-800 tracking-tight uppercase">
              NITJ <span className="text-[#E28122]">Mess</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500">
            <button
              onClick={() => setActivePage("reports")}
              className="p-2 hover:text-[#1464aa] hover:bg-slate-50 rounded-xl transition-all duration-200"
            >
              <BarChart2 size={20} strokeWidth={2.5} />
            </button>
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 hover:text-[#1464aa] hover:bg-slate-50 rounded-xl transition-all duration-200"
            >
              <Menu size={20} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* CSS Welcome Banner (Mobile) */}
          <div className="relative bg-[#0f172a] text-white rounded-[2rem] p-6 shadow-[0_15px_30px_rgba(15,23,42,0.25)] overflow-hidden group border border-slate-800">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"></div>
            <div className="absolute inset-0 w-full h-full bg-white/[0.02] backdrop-blur-xl pointer-events-none"></div>
            <div className="relative z-10">
              <div className="pr-[80px] md:pr-[90px]">
                <h1 className="text-xl md:text-2xl font-black mb-0.5">
                  Welcome back, {student.name.split(" ")[0]}! 👋
                </h1>
                <p className="text-blue-100 text-[9px] md:text-[10px] font-medium opacity-80 mb-3 md:mb-4">
                  Roll No: {student.rollNo}
                </p>
              </div>

              <div className="absolute top-1/2 -translate-y-1/2 right-0 w-[85px] h-[85px] rounded-full border-[3px] border-white overflow-hidden bg-white/10 shadow-lg">
                {student.photo ? (
                  <img
                    src={apiService.getPhotoUrl(student.photo)}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = 'https://placehold.co/100x100/3B82F6/FFF?text=ST'; }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg bg-blue-500">
                    {student.name ? student.name.charAt(0) : 'S'}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <div className="bg-white/15 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 text-center min-w-[70px]">
                  <p className="text-[8px] uppercase font-bold text-blue-200 mb-0.5">
                    Room
                  </p>
                  <p className="text-sm font-black">{student.roomNo}</p>
                </div>
                <div className="bg-white/15 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 text-center min-w-[70px]">
                  <p className="text-[8px] uppercase font-bold text-blue-200 mb-0.5">
                    Batch
                  </p>
                  <p className="text-sm font-black">
                    {student.rollNo.substring(0, 2)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-5 shadow-xl shadow-blue-100/50 border border-white">
            <h2 className="text-lg md:text-xl font-bold text-slate-800 mb-4 md:mb-5 px-1 flex items-center justify-between">
              Quick Actions
              <ChevronRight size={18} className="text-slate-400" />
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  onClick={action.action}
                  className={`flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-br border ${action.bgClass} ${action.colSpan || ""} active:scale-98 transition-all duration-200 text-left group shadow-sm`}
                >
                  <div className="flex flex-col justify-center min-w-0 pr-2">
                    <span className="text-xs font-black text-slate-800 tracking-tight leading-tight group-hover:text-[#1464aa] transition-colors">
                      {action.label}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold mt-1 leading-snug">
                      {action.desc}
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm border border-slate-100/60 group-hover:scale-105 transition-transform duration-300">
                    {action.icon}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Stats Grid */}
          <div className="grid grid-cols-3 gap-2 px-1">
            {stats.map((s, i) => (
                <div
                  key={i}
                  className="bg-white p-3 rounded-2xl border border-slate-50 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-2 min-h-[80px] justify-center sm:justify-start"
                >
                  <div
                    className={`w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-lg ${i === 1 ? "bg-emerald-500" : i === 2 ? "bg-purple-500" : "bg-blue-600"}`}
                  >
                    {React.cloneElement(s.icon, { size: 14, strokeWidth: 3 })}
                  </div>
                  <div className="text-center sm:text-left min-w-0">
                    <p className="text-[7px] font-black text-slate-400 uppercase tracking-tighter leading-none mb-1 truncate">
                      {s.label}
                    </p>
                    <p className="text-[12px] font-black text-slate-800 leading-none">
                      {s.value}
                    </p>
                  </div>
                </div>
              ))}
          </div>

          {/* Recent Activity */}
          <div className="w-full">
            <h2 className="text-lg md:text-xl font-bold text-slate-800 mb-3 md:mb-4 px-1 flex items-center justify-between">
              Recent Activity
              <button
                onClick={() => setActivePage("reports")}
                className="text-blue-600 text-xs font-bold bg-blue-50 px-3 py-1 rounded-full"
              >
                View All
              </button>
            </h2>
            <StudentReports
              mealHistory={mealHistory}
              studentName={student.name}
              isSummary={true}
              token={token}
            />
          </div>
        </div>
      </div>

      {/* --- DESKTOP ONLY VIEW (Original Design) --- */}
      <div className="hidden md:block space-y-8 animate-in fade-in duration-500">
        <div className="relative bg-[#0f172a] text-white rounded-[2.5rem] p-10 shadow-[0_20px_50px_rgba(15,23,42,0.3)] overflow-hidden group border border-slate-800">
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
          <div className="absolute bottom-0 left-0 w-full h-full bg-white/[0.02] backdrop-blur-xl pointer-events-none"></div>
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl lg:text-5xl font-black tracking-tight mb-2">
                Welcome back, {student.name.split(" ")[0]}! 👋
              </h1>
              <p className="text-blue-100 text-lg font-semibold opacity-95">
                Roll No: {student.rollNo} • Hostel {student.hostelNo}
              </p>
            </div>

            <div className="mt-8 lg:mt-0 flex items-center gap-6">
              <div className="w-[110px] h-[110px] rounded-full overflow-hidden border-4 border-white shadow-xl">
                {student.photo ? (
                  <img
                    src={apiService.getPhotoUrl(student.photo)}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = 'https://placehold.co/100x100/3B82F6/FFF?text=ST'; }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-600 font-bold text-xl">
                    {student.name ? student.name.charAt(0) : 'S'}
                  </div>
                )}
              </div>

              <div className="flex gap-6">
                <div className="bg-white/15 backdrop-blur-xl p-6 rounded-3xl border border-white/20 text-center min-w-[120px] hover:bg-white/20 transition-colors">
                <p className="text-xs uppercase tracking-[0.2em] font-bold text-blue-200 mb-1">
                  Room No
                </p>
                <p className="text-3xl font-black">{student.roomNo}</p>
              </div>
              <div className="bg-white/15 backdrop-blur-xl p-6 rounded-3xl border border-white/20 text-center min-w-[120px] hover:bg-white/20 transition-colors">
                <p className="text-xs uppercase tracking-[0.2em] font-bold text-blue-200 mb-1">
                  Batch
                </p>
                <p className="text-3xl font-black">
                  {student.rollNo.substring(0, 2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {stats.map((s, i) => (
            <div
              key={i}
              className="bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 group hover:-translate-y-2 transition-all duration-300"
            >
              <div
                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${s.grad} text-white flex items-center justify-center mb-6 shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform`}
              >
                {React.cloneElement(s.icon, { size: 24, strokeWidth: 2.5 })}
              </div>
              <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-1">
                {s.label}
              </p>
              <p className="text-3xl font-black text-slate-800 tracking-tight">
                {s.value}
              </p>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between mb-6 px-2">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
              Recent Activity
            </h2>
            <button
              onClick={() => setActivePage("reports")}
              className="text-[#1464aa] font-bold flex items-center gap-1 hover:gap-2 transition-all"
            >
              View Full History <ChevronRight size={20} />
            </button>
          </div>
          <StudentReports
            mealHistory={mealHistory}
            studentName={student.name}
            isSummary={true}
            token={token}
          />
        </div>
      </div>
    </div>
  );
};

// --- FEEDBACK COMPONENT ---
const StudentFeedback = ({ token }) => {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [selectedMealType, setSelectedMealType] = useState("");
  const [selectedMealName, setSelectedMealName] = useState("");
  const [rating, setRating] = useState("");
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [menu, setMenu] = useState({});

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const menuData = await apiService.fetchMenu(token);
        setMenu(menuData);
      } catch (error) {
        console.error("Error loading menu:", error);
      }
    };
    fetchMenu();
  }, [token]);

  const mealItems = selectedMealType ? menu[selectedMealType] || [] : [];

  const handleSubmit = async () => {
    if (!selectedDate || !selectedMealType || !rating) {
      alert("Please select date, meal type, and provide a rating.");
      return;
    }
    setLoading(true);
    try {
      await apiService.submitFeedback(token, {
        date: selectedDate,
        mealType: selectedMealType,
        mealItem: selectedMealName,
        rating,
        comment,
      });
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setSelectedMealType("");
        setSelectedMealName("");
        setRating("");
        setComment("");
      }, 3000);
    } catch (error) {
      alert(error.message || "Failed to submit feedback. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const ratingOptions = [
    {
      value: "Good",
      icon: <ThumbsUp size={28} />,
      color: "emerald",
      label: "Satisfied",
    },
    {
      value: "Average",
      icon: <Meh size={28} />,
      color: "blue",
      label: "Neutral",
    },
    {
      value: "Bad",
      icon: <ThumbsDown size={28} />,
      color: "orange",
      label: "Unsatisfied",
    },
    {
      value: "Very Bad",
      icon: <Angry size={28} />,
      color: "rose",
      label: "Disappointed",
    },
  ];

  const getRatingStyles = (color, isSelected) => {
    const styles = {
      emerald: isSelected
        ? "bg-emerald-500 border-emerald-500 text-white ring-4 ring-emerald-100"
        : "border-slate-200 hover:border-emerald-200 hover:bg-emerald-50 text-slate-400",
      blue: isSelected
        ? "bg-blue-500 border-blue-500 text-white ring-4 ring-blue-100"
        : "border-slate-200 hover:border-blue-200 hover:bg-blue-50 text-slate-400",
      orange: isSelected
        ? "bg-orange-500 border-orange-500 text-white ring-4 ring-orange-100"
        : "border-slate-200 hover:border-orange-200 hover:bg-orange-50 text-slate-400",
      rose: isSelected
        ? "bg-rose-500 border-rose-500 text-white ring-4 ring-rose-100"
        : "border-slate-200 hover:border-rose-200 hover:bg-rose-50 text-slate-400",
    };
    return styles[color];
  };

  return (
    <div className="max-w-7xl w-full mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/60 p-8 md:p-12 border border-slate-100 relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

        <div className="relative z-10">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center p-4 bg-blue-50 rounded-2xl mb-4 shadow-sm">
              <MessageSquare
                className="text-blue-600"
                size={32}
                strokeWidth={2.5}
              />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">
              We Value Your Feedback
            </h2>
            <p className="text-slate-400 mt-1.5 text-xs md:text-sm font-medium">
              Help us improve the dining experience for everyone.
            </p>
          </div>

          {submitted ? (
            <div className="bg-emerald-50 rounded-3xl p-12 text-center border border-emerald-100 animate-in zoom-in duration-500">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full mb-6 shadow-sm">
                <CheckCircle size={40} strokeWidth={3} />
              </div>
              <h3 className="text-2xl font-bold text-emerald-800 mb-2">
                Feedback Received!
              </h3>
              <p className="text-emerald-600">
                Thank you for taking the time to share your thoughts.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider ml-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="block w-full min-w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-slate-700 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider ml-1">
                    Meal
                  </label>
                  <select
                    value={selectedMealType}
                    onChange={(e) => {
                      setSelectedMealType(e.target.value);
                      setSelectedMealName("");
                    }}
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-slate-700 outline-none appearance-none"
                  >
                    <option value="">Select Meal Type</option>
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="snacks">Snacks</option>
                    <option value="dinner">Dinner</option>
                  </select>
                </div>
              </div>

              {selectedMealType && mealItems.length > 0 && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider ml-1">
                    Specific Item{" "}
                    <span className="text-slate-400 font-normal normal-case font-bold">
                      (Optional)
                    </span>
                  </label>
                  <select
                    value={selectedMealName}
                    onChange={(e) => setSelectedMealName(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-slate-700 outline-none appearance-none"
                  >
                    <option value="">Select an item...</option>
                    {mealItems.map((item) => (
                      <option key={item.name} value={item.name}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-4">
                <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider ml-1 text-center md:text-left">
                  How was your meal?
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {ratingOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setRating(option.value)}
                      className={`group relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 ${getRatingStyles(option.color, rating === option.value)} ${rating === option.value ? "scale-105 shadow-lg" : "hover:scale-105"}`}
                    >
                      <div className="mb-2 transition-transform duration-300 group-hover:-translate-y-1">
                        {option.icon}
                      </div>
                      <span className="text-xs font-bold tracking-wide">
                        {option.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider ml-1">
                  Comments
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-slate-700 outline-none resize-none min-h-[120px]"
                  placeholder="Tell us more about your experience..."
                ></textarea>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full text-white font-bold py-5 rounded-2xl transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg relative overflow-hidden group hover:brightness-110"
                style={{
                  backgroundColor: "#1464aa",
                  boxShadow: "0 4px 20px rgba(20,100,170,0.3)",
                }}
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <span className="relative flex items-center gap-2">
                  {loading ? (
                    <LoadingSpinner message="" />
                  ) : (
                    <>
                      Submit Feedback <ChevronRight size={20} strokeWidth={3} />
                    </>
                  )}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- REPORTS COMPONENT ---
const StudentReports = ({
  mealHistory,
  studentName,
  isSummary = false,
  token,
}) => {
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [isDownloading, setIsDownloading] = useState(false);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const availableMonths = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

  useEffect(() => {
    if (!isSummary) {
      const fetchMonthData = async () => {
        setLoading(true);
        try {
          const data = await apiService.fetchMealHistory(token, selectedMonth);
          setFilteredHistory(Array.isArray(data) ? data : []);
        } catch (error) {
          console.error("Error fetching month data:", error);
          setFilteredHistory([]);
        } finally {
          setLoading(false);
        }
      };
      fetchMonthData();
    } else {
      setFilteredHistory(mealHistory);
      setLoading(false);
    }
  }, [selectedMonth, isSummary, token, mealHistory]);

  const handleDownloadPdf = () => {
    try {
      const doc = new jsPDF();
      const year = new Date().getFullYear();

      if (filteredHistory.length === 0) {
        alert("No meal records found for selected month to export.");
        return;
      }

      // Header
      doc.setFillColor(37, 99, 235); // Blue 600
      doc.rect(0, 0, 210, 40, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text("MEAL REPORT", 14, 25);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 34);

      // Student Info
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(`Student: ${studentName || "N/A"}`, 14, 52);
      doc.setFont("helvetica", "normal");
      doc.text(`Period: ${monthNames[selectedMonth] || ""}, ${year}`, 14, 58);

      // Table
      const tableColumn = ["Date", "Meal Type", "Diet", "Items", "Total"];
      const tableRows = [];
      let grandTotal = 0;

      filteredHistory.forEach((meal) => {
        const cost = meal.totalCost || 0;
        grandTotal += cost;
        const itemsStr = (meal.items || [])
          .map((i) => `${i.name} (x${i.qty || 1})`)
          .join(", ");
        const mealData = [
          meal.date || "-",
          meal.type || "-",
          meal.dietCount !== undefined ? meal.dietCount : "-",
          itemsStr || "No items",
          `Rs ${cost}`,
        ];
        tableRows.push(mealData);
      });

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        foot: [["", "", "Grand Total", `Rs ${grandTotal}`]],
        startY: 65,
        theme: "grid",
        headStyles: {
          fillColor: [37, 99, 235],
          textColor: 255,
          fontStyle: "bold",
        },
        footStyles: {
          fillColor: [241, 245, 249],
          textColor: [0, 0, 0],
          fontStyle: "bold",
        },
        styles: { fontSize: 10, cellPadding: 4 },
        alternateRowStyles: { fillColor: [241, 245, 249] },
      });

      doc.save(`meal_report_${monthNames[selectedMonth]}_${year}.pdf`);
    } catch (error) {
      console.error("PDF Generation error:", error);
      alert("An error occurred while generating the PDF. Please try again.");
    }
  };

  const grandTotal = filteredHistory.reduce(
    (sum, meal) => sum + (meal.totalCost || 0),
    0,
  );

  const getMealTypeStyle = (type) => {
    const styles = {
      Breakfast: {
        bg: "bg-orange-50 text-orange-700 ring-orange-100",
        dot: "bg-orange-400",
      },
      Lunch: {
        bg: "bg-emerald-50 text-emerald-700 ring-emerald-100",
        dot: "bg-emerald-400",
      },
      Snacks: {
        bg: "bg-pink-50 text-pink-700 ring-pink-100",
        dot: "bg-pink-400",
      },
      Dinner: {
        bg: "bg-indigo-50 text-indigo-700 ring-indigo-100",
        dot: "bg-indigo-400",
      },
      Fine: {
        bg: "bg-rose-50 text-rose-700 ring-rose-100",
        dot: "bg-rose-400",
      },
    };
    return (
      styles[type] || {
        bg: "bg-slate-50 text-slate-700 ring-slate-100",
        dot: "bg-slate-400",
      }
    );
  };

  return (
    <div
      className={`bg-white rounded-3xl overflow-hidden border border-slate-100 ${!isSummary ? "shadow-xl shadow-slate-200/50 p-6" : ""}`}
    >
      {!isSummary && (
        <div className="w-full mb-8">
          {availableMonths.length > 0 && (
            <div className="grid grid-cols-2 gap-3 w-full">
              <div className="relative w-full">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full flex items-center justify-between pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-white focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none cursor-pointer text-left"
                >
                  <span>{monthNames[selectedMonth]}</span>
                  <ChevronRight
                    className={`absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none transition-transform duration-200 ${isDropdownOpen ? "-rotate-90" : "rotate-90"}`}
                    size={16}
                    strokeWidth={3}
                  />
                </button>

                {isDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsDropdownOpen(false)}
                    />
                    <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 py-1.5 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                      {availableMonths.map((month) => (
                        <button
                          key={month}
                          type="button"
                          onClick={() => {
                            setSelectedMonth(month);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-sm font-bold transition-all flex items-center justify-between ${
                            selectedMonth === month
                              ? "bg-blue-50 text-[#1464aa]"
                              : "text-slate-600 hover:bg-blue-50/50 hover:text-[#1464aa]"
                          }`}
                        >
                          <span>{monthNames[month]}</span>
                          {selectedMonth === month && (
                            <span className="w-1.5 h-1.5 bg-[#1464aa] rounded-full"></span>
                          )}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={handleDownloadPdf}
                className="w-full bg-[#1464aa] text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200/50 active:scale-95 transition-all flex items-center justify-center gap-2 text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={16} strokeWidth={2.5} />
                <span>Export PDF</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Transaction-style list for summary (home), full table for Reports page */}
      {isSummary ? (
        <>
          {/* ── MOBILE only: PhonePe-style card list ── */}
          <div className="md:hidden bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-lg">
            <div className="px-5 py-4 flex justify-between items-center border-b border-slate-100">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {new Date(0, new Date().getMonth()).toLocaleString(
                    "default",
                    { month: "long" },
                  )}{" "}
                  {new Date().getFullYear()}
                </p>
                <h3 className="text-lg font-bold text-slate-800 mt-0.5">
                  Recent Meals
                </h3>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400 font-medium">
                  Total Spent
                </p>
                <p
                  className="text-base font-extrabold"
                  style={{ color: "#1464aa" }}
                >
                  ₹{grandTotal}
                </p>
              </div>
            </div>
            {loading ? (
              <div className="p-8">
                <LoadingSpinner message="Loading meals..." />
              </div>
            ) : filteredHistory.length > 0 ? (
              <ul className="divide-y divide-slate-50">
                {filteredHistory.map((meal, index) => {
                  const style = getMealTypeStyle(meal.type);
                  const mealEmoji = {
                    Breakfast: "🌅",
                    Lunch: "🍱",
                    Snacks: "🍪",
                    Dinner: "🌙",
                    Fine: "⚠️",
                  };
                  const itemsStr =
                    meal.items && meal.items.length > 0
                      ? meal.items.map((i) => i.name).join(", ")
                      : (meal.dietCount > 0 ? "Standard Diet" : "No items recorded");
                  return (
                    <li
                      key={index}
                      className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors"
                    >
                      <div
                        className={`w-11 h-11 rounded-full flex items-center justify-center text-xl flex-shrink-0 ${style.bg}`}
                      >
                        {mealEmoji[meal.type] || "🍽️"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-slate-800 truncate">
                            {meal.type || "Meal"}
                          </p>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${style.bg} ${style.text}`}
                          >
                            {meal.type}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 truncate">
                          {meal.date} · {meal.time || ""}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">
                          {itemsStr}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-extrabold text-slate-800">
                          - ₹{meal.totalCost || 0}
                        </p>
                        {meal.dietCount !== undefined && (
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Diet: {meal.dietCount}
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center p-4 bg-slate-50 rounded-full mb-3">
                  <FileText size={28} className="text-slate-300" />
                </div>
                <p className="text-slate-500 font-medium text-sm">
                  No meals recorded yet
                </p>
              </div>
            )}
          </div>

          {/* ── DESKTOP only: original table (unchanged) ── */}
          <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-100">
            {loading ? (
              <div className="p-12">
                <LoadingSpinner message="Loading meals..." />
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100">
                    <th className="text-left py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Meal Type
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Diet
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider w-1/2">
                      Items
                    </th>
                    <th className="text-right py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredHistory.length > 0 ? (
                    <>
                      {filteredHistory.map((meal, index) => {
                        const style = getMealTypeStyle(meal.type);
                        return (
                          <tr
                            key={index}
                            className="hover:bg-blue-50/50 transition-colors group"
                          >
                            <td className="py-4 px-6">
                              <div className="flex flex-col">
                                <span className="text-sm font-semibold text-slate-700">
                                  {meal.date}
                                </span>
                                <span className="text-xs text-slate-400 mt-0.5">
                                  {meal.time || "12:00 PM"}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <span
                                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ring-1 ring-inset ${style.ring} ${style.bg} ${style.text}`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full mr-1.5 ${style.dot}`}
                                ></span>
                                {meal.type}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <span className="text-sm font-bold text-slate-700">
                                {meal.dietCount !== undefined
                                  ? meal.dietCount
                                  : "-"}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex flex-wrap gap-2">
                                {meal.items && meal.items.length > 0 ? (
                                  meal.items.map((item, idx) => (
                                    <span
                                      key={idx}
                                      className="inline-flex items-center text-sm font-medium text-slate-600 bg-slate-50 px-2 py-1 rounded-md border border-slate-100"
                                    >
                                      {item.name}
                                      <span className="ml-1.5 text-slate-400 text-xs">
                                        ×{item.qty}
                                      </span>
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-slate-400 text-sm italic">
                                    {meal.dietCount > 0 ? "Standard Diet" : "No items recorded"}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-6 text-right">
                              <span className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                ₹{meal.totalCost || 0}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                      <tr className="bg-slate-50/50 font-bold border-t-2 border-slate-100">
                        <td
                          colSpan="4"
                          className="py-4 px-6 text-right text-slate-500 uppercase text-xs tracking-wider"
                        >
                          Grand Total
                        </td>
                        <td
                          className="py-4 px-6 text-right text-lg"
                          style={{ color: "#1464aa" }}
                        >
                          ₹{grandTotal}
                        </td>
                      </tr>
                    </>
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-16">
                        <div className="inline-flex items-center justify-center p-4 bg-slate-50 rounded-full mb-3">
                          <FileText size={32} className="text-slate-300" />
                        </div>
                        <p className="text-slate-500 font-medium">
                          No meals recorded yet
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </>
      ) : (
        <div>
          {loading ? (
            <div className="p-12">
              <LoadingSpinner message="Loading meals..." />
            </div>
          ) : filteredHistory.length > 0 ? (
            <>
              {/* ── MOBILE: card list ── */}
              <div className="md:hidden bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-lg">
                {/* month + total header */}
                <div className="px-5 py-4 flex justify-between items-center border-b border-slate-100">
                  <h3 className="text-base font-bold text-slate-800">
                    {monthNames[selectedMonth]} {new Date().getFullYear()}
                  </h3>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Total Spent</p>
                    <p
                      className="text-sm font-extrabold"
                      style={{ color: "#1464aa" }}
                    >
                      ₹{grandTotal}
                    </p>
                  </div>
                </div>
                <ul className="divide-y divide-slate-50">
                  {filteredHistory.map((meal, index) => {
                    const style = getMealTypeStyle(meal.type);
                    const mealEmoji = {
                      Breakfast: "🌅",
                      Lunch: "🍱",
                      Snacks: "🍪",
                      Dinner: "🌙",
                      Fine: "⚠️",
                    };
                    const itemsStr =
                      meal.items && meal.items.length > 0
                        ? meal.items.map((i) => i.name).join(", ")
                        : (meal.dietCount > 0 ? "Standard Diet" : "No items recorded");
                    return (
                      <li
                        key={index}
                        className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors"
                      >
                        <div
                          className={`w-11 h-11 rounded-full flex items-center justify-center text-xl flex-shrink-0 ${style.bg}`}
                        >
                          {mealEmoji[meal.type] || "🍽️"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-slate-800 truncate">
                              {meal.type || "Meal"}
                            </p>
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${style.bg} ${style.text}`}
                            >
                              {meal.type}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5 truncate">
                            {meal.date} · {meal.time || ""}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5 truncate">
                            {itemsStr}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-extrabold text-slate-800">
                            - ₹{meal.totalCost || 0}
                          </p>
                          {meal.dietCount !== undefined && (
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              Diet: {meal.dietCount}
                            </p>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
                <div className="px-5 py-3 border-t border-slate-100 flex justify-between items-center bg-slate-50/60">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Grand Total
                  </span>
                  <span
                    className="text-base font-extrabold"
                    style={{ color: "#1464aa" }}
                  >
                    ₹{grandTotal}
                  </span>
                </div>
              </div>

              {/* ── DESKTOP: full table ── */}
              <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-100">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-100">
                      <th className="text-left py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="text-left py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Meal Type
                      </th>
                      <th className="text-left py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Diet
                      </th>
                      <th className="text-left py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider w-1/2">
                        Items
                      </th>
                      <th className="text-right py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredHistory.map((meal, index) => {
                      const style = getMealTypeStyle(meal.type);
                      return (
                        <tr
                          key={index}
                          className="hover:bg-blue-50/50 transition-colors group"
                        >
                          <td className="py-4 px-6">
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold text-slate-700">
                                {meal.date}
                              </span>
                              <span className="text-xs text-slate-400 mt-0.5">
                                {meal.time || "12:00 PM"}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ring-1 ring-inset ${style.ring} ${style.bg} ${style.text}`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full mr-1.5 ${style.dot}`}
                              ></span>
                              {meal.type}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-sm font-bold text-slate-700">
                              {meal.dietCount !== undefined
                                ? meal.dietCount
                                : "-"}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex flex-wrap gap-2">
                              {meal.items && meal.items.length > 0 ? (
                                meal.items.map((item, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-flex items-center text-sm font-medium text-slate-600 bg-slate-50 px-2 py-1 rounded-md border border-slate-100"
                                  >
                                    {item.name}
                                    <span className="ml-1.5 text-slate-400 text-xs">
                                      ×{item.qty}
                                    </span>
                                  </span>
                                ))
                              ) : (
                                <span className="text-slate-400 text-sm italic">
                                  {meal.dietCount > 0 ? "Standard Diet" : "No items recorded"}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <span className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                              ₹{meal.totalCost || 0}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="bg-slate-50/50 font-bold border-t-2 border-slate-100">
                      <td
                        colSpan="4"
                        className="py-4 px-6 text-right text-slate-500 uppercase text-xs tracking-wider"
                      >
                        Grand Total
                      </td>
                      <td
                        className="py-4 px-6 text-right text-lg"
                        style={{ color: "#1464aa" }}
                      >
                        ₹{grandTotal}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-100 text-center py-16">
              <div className="inline-flex items-center justify-center p-4 bg-slate-50 rounded-full mb-3">
                <FileText size={32} className="text-slate-300" />
              </div>
              <p className="text-slate-500 font-medium">
                No meal records found for this period.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// --- MESS OFF COMPONENTS ---
const MessOffPage = ({ studentName, token }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await apiService.fetchMessOffRequests(token);
        setRequests(data);
      } catch (error) {
        console.error("Error loading mess off requests:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, [token]);

  const refreshRequests = async () => {
    try {
      const data = await apiService.fetchMessOffRequests(token);
      setRequests(data);
    } catch (error) {
      console.error("Error refreshing requests:", error);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">
        <div className="lg:col-span-5 lg:sticky lg:top-8">
          <MessOffForm token={token} onSubmitSuccess={refreshRequests} />
        </div>
        <div className="lg:col-span-7">
          <MessOffStatus requests={requests} loading={loading} />
        </div>
      </div>
    </div>
  );
};

const MessOffForm = ({ token, onSubmitSuccess }) => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [startMeal, setStartMeal] = useState("Breakfast");
  const [endMeal, setEndMeal] = useState("Dinner");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const calculateMealsToSkip = (start, end, isSingleDay) => {
    const mealOrder = ["Breakfast", "Lunch", "Dinner"];
    const startIndex = mealOrder.indexOf(start);
    const endIndex = mealOrder.indexOf(end);
    
    if (isSingleDay) {
      if (startIndex <= endIndex) {
        return mealOrder.slice(startIndex, endIndex + 1);
      }
      return [];
    } else {
      const firstDayMeals = mealOrder.slice(startIndex);
      const lastDayMeals = mealOrder.slice(0, endIndex + 1);
      return Array.from(new Set([...firstDayMeals, ...lastDayMeals]));
    }
  };

  const handleSubmit = async () => {
    if (!fromDate || !toDate) {
      alert("Please select both From and To dates");
      return;
    }
    
    const isSingleDay = fromDate === toDate;
    const computedMeals = calculateMealsToSkip(startMeal, endMeal, isSingleDay);
    
    if (computedMeals.length === 0) {
      alert("Please select a valid meal range to skip (e.g. End Meal cannot be before Start Meal on a single day)");
      return;
    }
    
    setSubmitting(true);
    try {
      await apiService.submitMessOff(token, {
        fromDate,
        toDate,
        meals: computedMeals,
        reason,
      });
      alert("Mess off application submitted successfully!");
      setFromDate("");
      setToDate("");
      setStartMeal("Breakfast");
      setEndMeal("Dinner");
      setReason("");
      if (onSubmitSuccess) onSubmitSuccess();
    } catch (error) {
      alert(error.message || "Failed to submit application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl md:rounded-[2rem] shadow-lg md:shadow-xl shadow-blue-100/50 md:shadow-blue-200/40 p-5 md:p-8 border border-slate-100 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-40 h-40 bg-blue-50 rounded-full blur-3xl opacity-60 -mr-10 -mt-10 pointer-events-none"></div>

      <h2 className="text-lg font-extrabold text-slate-800 mb-5 flex items-center relative z-10 tracking-tight">
        <span className="w-1 h-5 bg-indigo-600 rounded-full mr-2.5"></span>
        New Application
      </h2>

      <div className="space-y-4 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">
              From Date
            </label>
            <div className="relative">
              {!fromDate && (
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
              )}
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className={`block w-full min-w-full ${fromDate ? 'pl-3.5' : 'pl-10'} pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-medium text-slate-700 text-sm`}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">
              To Date
            </label>
            <div className="relative">
              {!toDate && (
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
              )}
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className={`block w-full min-w-full ${toDate ? 'pl-3.5' : 'pl-10'} pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-medium text-slate-700 text-sm`}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">
              Start Off From
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "Breakfast", label: "Breakfast", icon: Coffee },
                { id: "Lunch", label: "Lunch", icon: UtensilsCrossed },
                { id: "Dinner", label: "Dinner", icon: Moon },
              ].map((meal) => {
                const isSelected = startMeal === meal.id;
                const Icon = meal.icon;
                return (
                  <button
                    key={meal.id}
                    type="button"
                    onClick={() => setStartMeal(meal.id)}
                    className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl border-2 transition-all duration-200 group active:scale-95 cursor-pointer ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/30"
                        : "border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200"
                    }`}
                  >
                    <Icon size={14} className={isSelected ? "text-blue-600" : "text-slate-400"} />
                    <span className={`text-[10px] font-black mt-1 ${isSelected ? "text-blue-900" : "text-slate-600"}`}>
                      {meal.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">
              End Off After
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "Breakfast", label: "Breakfast", icon: Coffee },
                { id: "Lunch", label: "Lunch", icon: UtensilsCrossed },
                { id: "Dinner", label: "Dinner", icon: Moon },
              ].map((meal) => {
                const isSelected = endMeal === meal.id;
                const Icon = meal.icon;
                return (
                  <button
                    key={meal.id}
                    type="button"
                    onClick={() => setEndMeal(meal.id)}
                    className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl border-2 transition-all duration-200 group active:scale-95 cursor-pointer ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/30"
                        : "border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200"
                    }`}
                  >
                    <Icon size={14} className={isSelected ? "text-blue-600" : "text-slate-400"} />
                    <span className={`text-[10px] font-black mt-1 ${isSelected ? "text-blue-900" : "text-slate-600"}`}>
                      {meal.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">
            Reason{" "}
            <span className="font-normal text-slate-400 normal-case">
              (Optional)
            </span>
          </label>
          <div className="relative">
            <MessageSquare className="absolute left-3.5 top-3.5 text-slate-400 w-4 h-4 pointer-events-none" />
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-medium text-slate-700 text-sm resize-none"
              rows="3"
              placeholder="e.g. Going home for weekend..."
            ></textarea>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full mt-2 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-200/50 hover:shadow-xl hover:shadow-blue-300/40 bg-gradient-to-r from-[#1464aa] to-indigo-600 hover:from-[#1e88e5] hover:to-indigo-500 flex items-center justify-center transition-all active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed group text-sm transform hover:-translate-y-0.5 duration-200"
        >
          {submitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
              Processing...
            </>
          ) : (
            <>
              Submit Application{" "}
              <ChevronRight
                className="ml-2 group-hover:translate-x-1 transition-transform"
                size={18}
                strokeWidth={3}
              />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

const MessOffStatus = ({ requests, loading }) => {
  const getStatusStyle = (status) => {
    const styles = {
      Approved: {
        bg: "bg-emerald-50 text-emerald-700 ring-emerald-100",
        icon: (
          <CheckCircle size={14} strokeWidth={3} className="text-emerald-500" />
        ),
      },
      Pending: {
        bg: "bg-amber-50 text-amber-700 ring-amber-100",
        icon: <Clock size={14} strokeWidth={3} className="text-amber-500" />,
      },
      Rejected: {
        bg: "bg-rose-50 text-rose-700 ring-rose-100",
        icon: <XCircle size={14} strokeWidth={3} className="text-rose-500" />,
      },
      Cancelled: {
        bg: "bg-slate-100 text-slate-600 ring-slate-200/50",
        icon: <XCircle size={14} strokeWidth={3} className="text-slate-400" />,
      },
    };
    return (
      styles[status] || {
        bg: "bg-slate-50 text-slate-700 ring-slate-100",
        icon: null,
      }
    );
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
      <div className="p-6 md:p-8 border-b border-slate-50 flex justify-between items-center bg-white">
        <h2 className="text-xl font-bold text-slate-800 flex items-center">
          <span className="w-1 h-6 bg-slate-200 rounded-full mr-3"></span>
          Application History
        </h2>
        <div className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-bold uppercase tracking-wider">
          {requests.length} Records
        </div>
      </div>

      <div className="p-2">
        {loading ? (
          <LoadingSpinner message="Loading applications..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-50">
                  <th className="text-left py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Meals
                  </th>
                  <th className="text-right py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {requests.length > 0 ? (
                  requests.map((req, index) => {
                    const style = getStatusStyle(req.status);
                    return (
                      <tr
                        key={index}
                        className="hover:bg-slate-50/50 transition-colors group"
                      >
                        <td className="py-5 px-6">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-700">
                              {req.fromDate || req.from}
                            </span>
                            <span className="text-xs font-medium text-slate-400 mt-1">
                              to {req.toDate || req.to}
                            </span>
                          </div>
                        </td>
                        <td className="py-5 px-6">
                          <div className="flex flex-wrap gap-1">
                            {(Array.isArray(req.meals)
                              ? req.meals
                              : [req.meals]
                            ).map((m, i) => (
                              <span
                                key={i}
                                className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded"
                              >
                                {m}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-5 px-6 text-right">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full ring-1 ring-inset ${style.bg} ${style.ring}`}
                          >
                            {style.icon}
                            {req.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center py-16">
                      <div className="inline-flex items-center justify-center p-4 bg-slate-50 rounded-full mb-3">
                        <FileText size={32} className="text-slate-300" />
                      </div>
                      <p className="text-slate-500 font-medium">
                        No application history found
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// --- MAIN DASHBOARD COMPONENT ---
function StudentDashboard() {
  const [student, setStudent] = useState(null);
  const [token, setToken] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");
  const [activePage, setActivePage] = useState("home");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile sidebar
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true); // Desktop sidebar
  const [showQRModal, setShowQRModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Check if user is logged in as student (redirect munshi to munshi dashboard)
  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    const storedUser = localStorage.getItem("authUser");
    const storedRole = localStorage.getItem("authRole");

    if (storedRole === "munshi") {
      window.location.href = "/munshi/dashboard";
      return;
    }

    if (storedToken && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setStudent(userData.student);
        setToken(storedToken);
      } catch (e) {
        console.error("Error parsing stored user data:", e);
        localStorage.removeItem("authToken");
        localStorage.removeItem("authUser");
        localStorage.removeItem("authRole");
        window.location.href = "/login";
      }
    } else {
      window.location.href = "/login";
    }

    setInitialLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    localStorage.removeItem("authRole");
    sessionStorage.removeItem("authUser");
    setStudent(null);
    setToken(null);
    window.location.href = "/login";
  };

  const getInitials = (name) => {
    if (!name) return "ST";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (
        parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
      ).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-slate-50">
        <LoadingSpinner message="Initializing dashboard..." />
      </div>
    );
  }

  if (!student || !token) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-slate-50">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 text-center max-w-md animate-in zoom-in duration-300">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="text-red-500" size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">
            Connection Issues
          </h3>
          <p className="text-slate-500 text-sm mb-6">
            We're having trouble loading your data. Please check your
            connection.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 text-white rounded-xl text-sm font-bold active:scale-95 transition-transform"
            style={{ backgroundColor: "#1464aa" }}
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activePage) {
      case "home":
        return (
          <StudentHome
            student={student}
            token={token}
            setActivePage={setActivePage}
            setShowQRModal={setShowQRModal}
            setIsSidebarOpen={setIsSidebarOpen}
          />
        );
      case "reports":
        return (
          <StudentReports
            mealHistory={student.mealHistory || []}
            studentName={student.name}
            token={token}
          />
        );
      case "messOff":
        return <MessOffPage studentName={student.name} token={token} />;
      case "feedback":
        return <StudentFeedback token={token} />;
      case "complaint":
        return <StudentComplaint token={token} onSuccess={() => {}} />;
      default:
        return (
          <StudentHome
            student={student}
            token={token}
            setActivePage={setActivePage}
            setShowQRModal={setShowQRModal}
            setIsSidebarOpen={setIsSidebarOpen}
          />
        );
    }
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans overflow-hidden">
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[1010] md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`bg-white w-80 fixed inset-y-0 left-0 transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:${desktopSidebarOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-300 ease-out z-[1020] md:z-50 shadow-2xl shadow-slate-200/50 flex flex-col border-r border-slate-100`}
      >
        <div className="p-8 pb-4 h-full flex flex-col overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between mb-8 shrink-0">
            <div className="flex items-center gap-3">
              <div
                className="text-white p-2.5 rounded-xl shadow-lg"
                style={{
                  backgroundColor: "#1464aa",
                  boxShadow: "0 4px 15px rgba(20,100,170,0.3)",
                }}
              >
                <UtensilsCrossed size={24} strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
                  NITJ MESS
                </h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Student Portal
                </p>
              </div>
            </div>
            {/* Mobile Close Button */}
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden p-2 text-slate-400 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
            {/* Desktop Close Button */}
            <button
              onClick={() => setDesktopSidebarOpen(false)}
              className="hidden md:block p-2 text-slate-400 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* User Profile Card */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6 flex items-center gap-4 relative overflow-hidden group">
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background:
                  "linear-gradient(to right, rgba(20,100,170,0.05), rgba(20,100,170,0.1))",
              }}
            ></div>
            <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md flex-shrink-0 bg-[#fce4ec] text-[#9c27b0] flex items-center justify-center font-bold text-xl">
              {getInitials(student.name)}
            </div>
            <div className="relative min-w-0">
              <h3 className="font-bold text-slate-800 truncate text-sm">
                {student.name}
              </h3>
              <p className="text-xs text-slate-500 font-medium truncate">
                {student.email}
              </p>
            </div>
          </div>

          <nav
            className="flex-1 overflow-y-auto scrollbar-hide"
            style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
          >
            <ul className="space-y-1">
              <div className="px-4 mb-2 mt-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Main Menu
                </p>
              </div>
              <NavItem
                icon={<Home />}
                text="Home"
                active={activePage === "home"}
                onClick={() => {
                  setActivePage("home");
                  setIsSidebarOpen(false);
                }}
              />

              <div className="px-4 mb-2 mt-6">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Quick Actions
                </p>
              </div>
              <NavItem
                icon={<QrCode />}
                text="QR Code"
                active={false}
                onClick={() => {
                  setShowQRModal(true);
                  setIsSidebarOpen(false);
                }}
              />
              <NavItem
                icon={<Clock />}
                text="Meal History"
                active={activePage === "reports"}
                onClick={() => {
                  setActivePage("reports");
                  setIsSidebarOpen(false);
                }}
              />
              <NavItem
                icon={<CalendarOff />}
                text="Mess Off"
                active={activePage === "messOff"}
                onClick={() => {
                  setActivePage("messOff");
                  setIsSidebarOpen(false);
                }}
              />


              <div className="px-4 mb-2 mt-6">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Support
                </p>
              </div>
              <NavItem
                icon={<MessageSquare />}
                text="Feedback"
                active={activePage === "feedback"}
                onClick={() => {
                  setActivePage("feedback");
                  setIsSidebarOpen(false);
                }}
              />
              <NavItem
                icon={<AlertCircle />}
                text="Complain"
                active={activePage === "complaint"}
                onClick={() => {
                  setActivePage("complaint");
                  setIsSidebarOpen(false);
                }}
              />
            </ul>
          </nav>

          <div className="mt-auto pt-6 border-t border-slate-100 shrink-0">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all font-bold text-sm group"
            >
              <LogOut
                size={20}
                className="group-hover:-translate-x-1 transition-transform"
              />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      <main
        className={`flex-1 overflow-auto bg-[#f8fafc] relative w-full transition-all duration-300 ease-in-out ${desktopSidebarOpen ? "md:ml-80" : "md:ml-0"} scrollbar-hide`}
        style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
      >
        <style>{`
                    .scrollbar-hide::-webkit-scrollbar {
                        display: none;
                    }
                    * {
                        -ms-overflow-style: none;
                        scrollbar-width: none;
                    }
                    *::-webkit-scrollbar {
                        display: none;
                    }
                `}</style>


        {/* Header */}
        <header
          className={`sticky top-0 z-30 bg-white px-4 py-3 md:px-6 md:pb-4 border-b border-slate-100 flex justify-between items-center ${activePage === "home" ? "md:flex hidden" : "flex"}`}
          style={{ paddingTop: "calc(0.75rem + env(safe-area-inset-top))" }}
        >
          <div className="flex items-center gap-3">
            {/* Mobile Back Button */}
            {activePage !== "home" && (
              <button
                onClick={() => setActivePage("home")}
                className="md:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors mr-1"
              >
                <ArrowLeft size={22} />
              </button>
            )}

            {/* Desktop Menu Toggle */}
            <button
              onClick={() => setDesktopSidebarOpen(!desktopSidebarOpen)}
              className="hidden md:block p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <Menu size={24} />
            </button>

            {/* Mobile dynamic page title */}
            <div className="flex items-center gap-2 md:hidden">
              <h1 className="font-black text-slate-800 whitespace-nowrap text-base tracking-tight">
                {activePage === "home" ? "NITJ MESS" : 
                 activePage === "messOff" ? "Mess Leave" : 
                 activePage === "feedback" ? "Feedback" : 
                 activePage === "reports" ? "History" : 
                 activePage === "complaint" ? "Complain" : 
                 activePage}
              </h1>
            </div>

            <div className="hidden md:block">
              <h2 className="text-xl font-bold text-slate-800 tracking-tight capitalize">
                {activePage === "messOff"
                  ? "Mess Leave Application"
                  : activePage}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-8 w-px bg-slate-200 mx-1 hidden md:block"></div>
            <div className="hidden md:flex items-center gap-2">
              <span className="text-sm font-bold text-slate-700">
                {student.rollNo}
              </span>
              <div className="w-8 h-8 rounded-full bg-[#1464aa] text-white border border-slate-200 overflow-hidden flex items-center justify-center font-bold text-sm">
                {student.photo ? (
                  <img
                    src={
                      student.photo.startsWith("http")
                        ? student.photo
                        : `${API_BASE_URL.replace("/api", "")}${student.photo}`
                    }
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                ) : null}
                <span
                  className="w-full h-full flex items-center justify-center"
                  style={{ display: student.photo ? "none" : "flex" }}
                >
                  {student.name.charAt(0)}
                </span>
              </div>
            </div>
          </div>
        </header>

        <div className="px-3 py-4 md:p-10 max-w-7xl mx-auto pb-32 md:pb-20">
          {renderContent()}
        </div>

        {/* QR Card Modal (Paytm Style) */}
        {showQRModal && (
          <div
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-6"
            style={{
              backgroundColor: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(8px)",
            }}
            onClick={() => setShowQRModal(false)}
          >
            <div
              className="w-full max-w-sm bg-white rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in slide-in-from-bottom-10 duration-500"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative p-8 flex flex-col items-center">
                {/* Close Button */}
                <button
                  onClick={() => setShowQRModal(false)}
                  className="absolute top-6 right-6 p-2 bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>

                <div className="text-center mb-8">
                  <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-black text-2xl border-4 border-white shadow-xl mx-auto mb-4 overflow-hidden">
                    {student.photo ? (
                      <img
                        src={apiService.getPhotoUrl(student.photo)}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      student.name.charAt(0)
                    )}
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                    {student.name}
                  </h3>
                  <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">
                    {student.rollNo} • {student.hostelNo} • Room {student.roomNo}
                  </p>
                </div>

                <div className="bg-white p-4 rounded-3xl shadow-xl border border-slate-50 mb-8 select-none">
                  <QRCodeCanvas
                    value={
                      student.qrCode ||
                      `${student.rollNo}-${student.hostelNo}-${student.roomNo}`
                    }
                    size={200}
                    level={"H"}
                    includeMargin={false}
                  />
                </div>

                <div className="w-full space-y-3">
                  <button
                    disabled={isDownloading}
                    onClick={async () => {
                      try {
                        setIsDownloading(true);
                        const element =
                          document.getElementById("printable-qr-card");
                        if (element) {
                          const clone = element.cloneNode(true);
                          clone.style.position = "fixed";
                          clone.style.top = "0";
                          clone.style.left = "0";
                          clone.style.zIndex = "-9999";
                          clone.style.transform = "none";
                          clone.style.visibility = "visible";
                          const originalCanvas =
                            element.querySelector("canvas");
                          const cloneCanvas = clone.querySelector("canvas");
                          if (originalCanvas && cloneCanvas) {
                            const ctx = cloneCanvas.getContext("2d");
                            ctx.drawImage(originalCanvas, 0, 0);
                          }
                          document.body.appendChild(clone);
                          await new Promise((resolve) =>
                            setTimeout(resolve, 500),
                          );
                          const canvas = await html2canvas(clone, {
                            backgroundColor: null,
                            scale: 4,
                            logging: false,
                            useCORS: false,
                            allowTaint: false,
                          });
                          document.body.removeChild(clone);
                          const pngUrl = canvas.toDataURL("image/png");
                          const a = document.createElement("a");
                          a.href = pngUrl;
                          a.download = `NITJ_Mess_Card_${student.rollNo}.png`;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                        }
                      } catch (err) {
                        alert("Failed to download. Please try again.");
                      } finally {
                        setIsDownloading(false);
                      }
                    }}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold bg-[#1464aa] text-white shadow-lg shadow-blue-200 hover:brightness-110 active:scale-95 transition-all disabled:opacity-60"
                  >
                    <Download size={20} strokeWidth={2.5} />
                    {isDownloading ? "Saving..." : "Download Card"}
                  </button>
                </div>
              </div>
              <div className="bg-slate-50 p-4 text-center">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
                  NITJ MESS PORTAL MEMBER
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Hidden printable card (for download) */}
        <div
          style={{
            position: "absolute",
            left: "-9999px",
            top: "0",
            zIndex: -10,
            visibility: "hidden",
          }}
        >
          <div
            id="printable-qr-card"
            style={{
              position: "relative",
              width: "320px",
              background: "linear-gradient(135deg, #1464aa, #0d3b6e)",
              borderRadius: "2.5rem",
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.1)",
              userSelect: "none",
              fontFamily: "sans-serif",
            }}
          >
            <div
              style={{
                position: "relative",
                zIndex: 10,
                padding: "2.5rem",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                <h2
                  style={{
                    fontSize: "1.75rem",
                    fontWeight: "bold",
                    color: "#ffffff",
                    marginBottom: "0.5rem",
                  }}
                >
                  {student.name}
                </h2>
                <p
                  style={{
                    color: "#BFDBFE",
                    fontSize: "1rem",
                    fontWeight: "bold",
                  }}
                >
                  {student.rollNo}
                </p>
              </div>
              <div
                style={{
                  background: "#ffffff",
                  padding: "1rem",
                  borderRadius: "2rem",
                  marginBottom: "2rem",
                }}
              >
                <QRCodeCanvas
                  value={
                    student.qrCode ||
                    `${student.rollNo}-${student.hostelNo}-${student.roomNo}`
                  }
                  size={200}
                  level={"H"}
                />
              </div>
              <p
                style={{
                  color: "#ffffff",
                  fontSize: "0.75rem",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  letterSpacing: "0.2em",
                }}
              >
                NITJ MESS PORTAL
              </p>
            </div>
          </div>
        </div>

        {/* --- MOBILE BOTTOM NAVIGATION --- */}
        <div 
          className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-100/80 z-[1000] flex justify-around items-center px-1 shadow-[0_-8px_30px_rgba(0,0,0,0.05)]"
          style={{ 
            height: "calc(60px + env(safe-area-inset-bottom))",
            paddingBottom: "env(safe-area-inset-bottom)" 
          }}
        >
          <BottomNavItem icon={<Home />} label="Home" active={activePage === "home"} onClick={() => setActivePage("home")} />
          <BottomNavItem icon={<Clock />} label="History" active={activePage === "reports"} onClick={() => setActivePage("reports")} />
          <div className="relative -top-4 px-1 flex-shrink-0">
            <button
              onClick={() => setShowQRModal(true)}
              className="w-13 h-13 bg-gradient-to-tr from-[#1464aa] to-[#1e88e5] rounded-full flex items-center justify-center text-white shadow-[0_6px_20px_rgba(20,100,170,0.4)] border-[3px] border-[#f8fafc] active:scale-95 transition-all"
            >
              <QrCode size={22} strokeWidth={2.5} />
            </button>
          </div>
          <BottomNavItem icon={<CalendarOff />} label="Leave" active={activePage === "messOff"} onClick={() => setActivePage("messOff")} />
          <BottomNavItem icon={<MessageSquare />} label="Feedback" active={activePage === "feedback"} onClick={() => setActivePage("feedback")} />
        </div>
      </main>
    </div>
  );
}

export default StudentDashboard;
