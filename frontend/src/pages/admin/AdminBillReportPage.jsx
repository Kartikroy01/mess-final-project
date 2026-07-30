import React, { useState, useEffect } from "react";
import { Calendar, Search, FileText, Download, TrendingUp, IndianRupee, Users, Building2, ShoppingBag } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { API_BASE_URL } from "../../config";

const Card = ({ children, className = "" }) => (
  <div className={`bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-indigo-100/50 border border-white/50 ${className}`}>
    {children}
  </div>
);

const HOSTELS_LIST = [
  "MBH-A", "MBH-B", "MBH-E", "MBH-F",
  "BH-1", "BH-2", "BH-3", "BH-4", "BH-5", "BH-6", "BH-7",
  "GH-1", "GH-2",
  "MGH-1", "MGH-2"
];

const AdminBillReportPage = () => {
  const today = new Date();
  const defaultMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;

  const [hostelNo, setHostelNo] = useState("MBH-A");
  const [month, setMonth] = useState(defaultMonth);
  const [dietRate, setDietRate] = useState("50");
  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const fetchReport = async () => {
    if (!hostelNo) return;
    setLoading(true);
    setError("");
    try {
      const authUserString = localStorage.getItem("authUser") || sessionStorage.getItem("authUser");
      const authUser = authUserString ? JSON.parse(authUserString) : null;
      const token = authUser?.token;

      const response = await fetch(
        `${API_BASE_URL}/admin/students-for-bill?hostelNo=${encodeURIComponent(hostelNo)}&month=${encodeURIComponent(month)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      if (response.ok && data.success) {
        setStudents(data.data || []);
      } else {
        setError(data.message || "Failed to load student bill report");
        setStudents([]);
      }
    } catch (err) {
      setError("Failed to fetch student bill report");
      setStudents([]);
      console.error("Error fetching report:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [hostelNo, month]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, hostelNo, month]);

  const calculateDietTotal = (diet) => Number(diet) * (Number(dietRate) || 0);
  const calculateTotal = (diet, extra) => calculateDietTotal(diet) + Number(extra || 0);

  const filtered = students.filter(s =>
    (s.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.rollNo || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.roomNo || "").toString().includes(searchTerm)
  );

  const grandDiets = filtered.reduce((sum, s) => sum + Number(s.diet || 0), 0);
  const grandDietCharges = grandDiets * (Number(dietRate) || 0);
  const grandExtras = filtered.reduce((sum, s) => sum + Number(s.extra || 0), 0);
  const grandTotal = grandDietCharges + grandExtras;

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStudents = filtered.slice(startIndex, startIndex + itemsPerPage);

  const handleDownloadPdf = () => {
    if (filtered.length === 0) return alert("No student records found to export.");
    const doc = new jsPDF();
    
    // Header styling
    doc.setFillColor(0, 59, 111); // #003B6F theme
    doc.rect(0, 0, 210, 40, "F");
    doc.setTextColor(255, 255, 255);
    
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("Hostel Bill Transparency Report", 14, 23);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Hostel: ${hostelNo}  |  Month: ${month}  |  Diet Rate: Rs ${dietRate || 0}`, 14, 32);

    const tableColumn = ["#", "Room", "Student Name", "Roll No", "Diet Count", "Diet Rate", "Diet Charges", "Extras Bill", "Total Bill"];
    const tableRows = [];
    
    filtered.forEach((s, idx) => {
      const dietCharge = calculateDietTotal(s.diet);
      const total = calculateTotal(s.diet, s.extra);
      tableRows.push([
        idx + 1,
        s.roomNo || "N/A",
        s.name || "N/A",
        s.rollNo || "N/A",
        s.diet || 0,
        `Rs ${dietRate || 0}`,
        `Rs ${dietCharge}`,
        `Rs ${Number(s.extra || 0)}`,
        `Rs ${total}`
      ]);
    });

    // Grand totals footer row
    tableRows.push([
      "",
      "",
      "GRAND TOTAL",
      "",
      grandDiets,
      "",
      `Rs ${grandDietCharges}`,
      `Rs ${grandExtras}`,
      `Rs ${grandTotal}`
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 48,
      theme: "grid",
      headStyles: { fillColor: [0, 59, 111] },
      footStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42] }
    });

    doc.save(`Bill_Report_${hostelNo}_${month}.pdf`);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="p-4 md:p-6 font-sans">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end mb-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 size={14} className="text-indigo-600" />
              Select Hostel
            </label>
            <select
              value={hostelNo}
              onChange={(e) => setHostelNo(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-100 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-slate-700 outline-none cursor-pointer"
            >
              {HOSTELS_LIST.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar size={14} className="text-indigo-600" />
              Select Month
            </label>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-100 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-slate-700 outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <IndianRupee size={14} className="text-indigo-600" />
              Diet Rate (₹)
            </label>
            <input
              type="number"
              value={dietRate}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "") {
                  setDietRate("");
                } else {
                  setDietRate(Math.max(0, Number(val)));
                }
              }}
              className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-100 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-slate-700 outline-none"
              placeholder="e.g. 50"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Search size={14} className="text-indigo-600" />
              Search Student
            </label>
            <input
              type="text"
              placeholder="Search by name, roll no, or room no..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-100 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-slate-700 outline-none"
            />
          </div>

          <button
            onClick={handleDownloadPdf}
            disabled={loading || filtered.length === 0}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 hover:shadow-indigo-200 transition-all active:scale-95 disabled:opacity-55 cursor-pointer border-none outline-none font-sans"
          >
            <Download size={16} strokeWidth={2.5} />
            Export PDF
          </button>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl flex items-center gap-2 text-sm font-medium mb-4">
            <span>⚠️ {error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 text-sm font-bold animate-pulse">Loading report data...</p>
          </div>
        ) : filtered.length > 0 ? (
          <div className="space-y-6">
            <div className="overflow-x-auto rounded-2xl border border-slate-100">
              <table className="w-full border-collapse text-left">
                <thead className="bg-slate-50 border-b border-slate-100 text-xs font-black text-slate-400 uppercase tracking-widest">
                  <tr>
                    <th className="px-6 py-4 text-center">#</th>
                    <th className="px-6 py-4 text-center">Room</th>
                    <th className="px-6 py-4">Student Name</th>
                    <th className="px-6 py-4 text-center">Roll No</th>
                    <th className="px-6 py-4 text-center">Diet Count</th>
                    <th className="px-6 py-4 text-center">Diet Rate</th>
                    <th className="px-6 py-4 text-right">Diet Charges</th>
                    <th className="px-6 py-4 text-right">Extras Bill</th>
                    <th className="px-6 py-4 text-right">Total Bill</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm font-bold text-slate-700 bg-white">
                  {paginatedStudents.map((s, idx) => {
                    const dietCharges = calculateDietTotal(s.diet);
                    const totalBill = calculateTotal(s.diet, s.extra);
                    return (
                      <tr key={s.studentId} className="hover:bg-indigo-50/20 transition-colors">
                        <td className="px-6 py-4 text-center text-slate-400 font-medium">{startIndex + idx + 1}</td>
                        <td className="px-6 py-4 text-center text-indigo-600 font-black">{s.roomNo}</td>
                        <td className="px-6 py-4 font-black text-slate-800">{s.name}</td>
                        <td className="px-6 py-4 text-center text-slate-505">{s.rollNo}</td>
                        <td className="px-6 py-4 text-center">
                          <span className="bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-lg text-xs">
                            {s.diet}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center text-slate-500">₹{dietRate || 0}</td>
                        <td className="px-6 py-4 text-right text-slate-600">₹{dietCharges}</td>
                        <td className="px-6 py-4 text-right text-slate-600">₹{Number(s.extra || 0)}</td>
                        <td className="px-6 py-4 text-right font-black text-slate-800 bg-slate-50/30">₹{totalBill}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 mt-4 text-sm font-bold text-slate-600">
                <div>
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filtered.length)} of {filtered.length} students
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border-2 border-slate-150 rounded-xl hover:bg-slate-50 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none bg-white text-slate-700 font-bold"
                  >
                    Previous
                  </button>
                  <span className="flex items-center px-4 bg-slate-50 rounded-xl border border-slate-200">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border-2 border-slate-150 rounded-xl hover:bg-slate-50 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none bg-white text-slate-700 font-bold"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Metrics cards for summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              <div className="bg-[#003B6F] text-white p-5 rounded-2xl flex items-center justify-between shadow-lg">
                <div>
                  <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-1">Total Diets</p>
                  <p className="text-2xl font-black">{grandDiets}</p>
                </div>
                <div className="bg-white/10 p-2.5 rounded-xl">
                  <Users size={20} className="text-indigo-200" />
                </div>
              </div>

              <div className="bg-indigo-600 text-white p-5 rounded-2xl flex items-center justify-between shadow-lg">
                <div>
                  <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-1">Diet Charges</p>
                  <p className="text-2xl font-black">₹{grandDietCharges}</p>
                </div>
                <div className="bg-white/10 p-2.5 rounded-xl">
                  <TrendingUp size={20} className="text-indigo-200" />
                </div>
              </div>

              <div className="bg-orange-500 text-white p-5 rounded-2xl flex items-center justify-between shadow-lg">
                <div>
                  <p className="text-[10px] font-black text-orange-100 uppercase tracking-widest mb-1">Extras Total</p>
                  <p className="text-2xl font-black">₹{grandExtras}</p>
                </div>
                <div className="bg-white/10 p-2.5 rounded-xl">
                  <ShoppingBag size={20} className="text-orange-100" />
                </div>
              </div>

              <div className="bg-emerald-600 text-white p-5 rounded-2xl flex items-center justify-between shadow-lg">
                <div>
                  <p className="text-[10px] font-black text-emerald-100 uppercase tracking-widest mb-1">Grand Total</p>
                  <p className="text-2xl font-black">₹{grandTotal}</p>
                </div>
                <div className="bg-white/10 p-2.5 rounded-xl">
                  <IndianRupee size={20} className="text-emerald-100" />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/50">
            <div className="w-16 h-16 bg-slate-100 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText size={32} />
            </div>
            <h4 className="font-bold text-slate-700 mb-1">No Student Records Found</h4>
            <p className="text-slate-400 text-sm max-w-sm mx-auto">Could not find any students matching your criteria in hostel {hostelNo} for the month of {month}.</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminBillReportPage;
