import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../../config";
import {
  IndianRupee,
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle,
  Users,
  User,
  Search,
  X,
  PlusCircle,
  ShoppingBag,
  AlertTriangle,
  Check,
} from "lucide-react";

const AddBillPage = () => {
  const [formData, setFormData] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    chargeType: "extras",
    amount: "",
    description: "",
    applyToAll: true,
  });
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const months = [
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

  // Fetch students when switching to individual mode
  useEffect(() => {
    if (!formData.applyToAll && students.length === 0) {
      fetchStudents();
    }
  }, [formData.applyToAll]);

  const fetchStudents = async () => {
    setLoadingStudents(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `${API_BASE_URL}/munshi/all-students`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = await response.json();
      if (response.ok && data.success) {
        setStudents(data.data || []);
      } else {
        setError(data.message || "Failed to load students");
      }
    } catch (err) {
      setError("Failed to load students");
      console.error("Error fetching students:", err);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
    setSuccess("");
  };

  const toggleStudent = (studentId) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId],
    );
  };

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.roomNo.toString().includes(searchTerm),
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError("Please enter a valid price greater than 0");
      return;
    }

    if (!formData.description || formData.description.trim() === "") {
      setError("Please enter an item name");
      return;
    }

    if (!formData.applyToAll && selectedStudents.length === 0) {
      setError("Please select at least one student");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("authToken");
      const payload = {
        month: parseInt(formData.month),
        year: parseInt(formData.year),
        chargeType: formData.chargeType,
        amount: parseFloat(formData.amount),
        description: formData.description,
      };

      if (!formData.applyToAll) {
        payload.studentIds = selectedStudents;
      }

      const response = await fetch(
        `${API_BASE_URL}/munshi/bill/add-charge`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add bill charge");
      }

      setSuccess(
        `Successfully added ${formData.chargeType} charge of ₹${formData.amount} to ${data.data.studentsAffected} student(s)`,
      );

      // Reset form
      setFormData({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        chargeType: "extras",
        amount: "",
        description: "",
        applyToAll: true,
      });
      setSelectedStudents([]);
      setSearchTerm("");
    } catch (err) {
      setError(err.message || "Failed to add bill charge");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Premium Header Widget */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-[#003B6F] to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-650/10 shrink-0">
            <IndianRupee size={26} className="stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
              Add Bill Charge
            </h2>
            <p className="text-slate-500 text-xs mt-0.5">
              Add custom extra charges or fines to student accounts in your hostel.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        {/* Alert Messages */}
        {error && (
          <div className="mb-6 p-4 bg-rose-50/50 border border-rose-100 rounded-2xl flex items-start gap-3 animate-in slide-in-from-top-2">
            <AlertCircle className="text-rose-600 shrink-0 mt-0.5" size={18} />
            <p className="text-rose-700 text-xs font-bold leading-normal">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex items-start gap-3 animate-in slide-in-from-top-2">
            <CheckCircle className="text-emerald-600 shrink-0 mt-0.5" size={18} />
            <p className="text-emerald-700 text-xs font-bold leading-normal">{success}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Apply To Selection */}
          <div>
            <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-3">
              Apply Charge To
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, applyToAll: true }))}
                className={`px-5 py-4 rounded-2xl font-bold transition-all border flex flex-col items-center gap-2 cursor-pointer ${
                  formData.applyToAll
                    ? "bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <Users size={22} className={formData.applyToAll ? "text-indigo-600" : "text-slate-400"} />
                <span className="text-sm">All Students</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, applyToAll: false }))}
                className={`px-5 py-4 rounded-2xl font-bold transition-all border flex flex-col items-center gap-2 cursor-pointer ${
                  !formData.applyToAll
                    ? "bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <User size={22} className={!formData.applyToAll ? "text-indigo-600" : "text-slate-400"} />
                <span className="text-sm">Select Students</span>
              </button>
            </div>
          </div>

          {/* Student Selector (only show if not applying to all) */}
          {!formData.applyToAll && (
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-4 animate-in slide-in-from-top-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                  Select Target Students ({selectedStudents.length} selected)
                </h3>
                {selectedStudents.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedStudents([])}
                    className="text-xs text-rose-600 hover:text-rose-700 font-bold cursor-pointer"
                  >
                    Clear All Selection
                  </button>
                )}
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search student by name, roll number, or room..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-indigo-400 outline-none transition text-sm text-slate-700"
                />
              </div>

              {/* Student List */}
              <div className="max-h-56 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {loadingStudents ? (
                  <div className="text-center py-8 text-slate-400 text-xs font-semibold">
                    <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Fetching student list...
                  </div>
                ) : filteredStudents.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs font-semibold">
                    No students matching your search criteria
                  </div>
                ) : (
                  filteredStudents.map((student) => {
                    const isSelected = selectedStudents.includes(student._id);
                    return (
                      <label
                        key={student._id}
                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
                          isSelected
                            ? "bg-indigo-50/50 border-indigo-200"
                            : "bg-white border-slate-150 hover:bg-slate-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleStudent(student._id)}
                          className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-700 text-sm truncate">
                            {student.name}
                          </p>
                          <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                            {student.rollNo} · Room {student.roomNo}
                          </p>
                        </div>
                        {isSelected && (
                          <span className="p-1 bg-indigo-100 rounded-lg text-indigo-600 shrink-0">
                            <Check size={12} />
                          </span>
                        )}
                      </label>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Month and Year Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">
                Billing Month
              </label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                <select
                  name="month"
                  value={formData.month}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-400 transition text-sm text-slate-700 bg-white cursor-pointer"
                  required
                >
                  {months.map((month, index) => (
                    <option key={index} value={index + 1}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">
                Billing Year
              </label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  min="2020"
                  max="2099"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-400 transition text-sm text-slate-700 bg-white"
                  required
                />
              </div>
            </div>
          </div>

          {/* Charge Type Card Group */}
          <div>
            <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-3">
              Charge Type
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, chargeType: 'extras' }))}
                className={`px-5 py-4 rounded-2xl font-bold transition-all border flex items-center justify-center gap-3 cursor-pointer ${
                  formData.chargeType === 'extras'
                    ? "bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <ShoppingBag size={18} className={formData.chargeType === 'extras' ? "text-indigo-600" : "text-slate-400"} />
                <span className="text-sm">Extra Items / Foods</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, chargeType: 'fines' }))}
                className={`px-5 py-4 rounded-2xl font-bold transition-all border flex items-center justify-center gap-3 cursor-pointer ${
                  formData.chargeType === 'fines'
                    ? "bg-rose-50 border-rose-500 text-rose-700 shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <AlertTriangle size={18} className={formData.chargeType === 'fines' ? "text-rose-600" : "text-slate-400"} />
                <span className="text-sm">Hostel Fines / Penalties</span>
              </button>
            </div>
          </div>

          {/* Amount / Price Field */}
          <div>
            <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">
              Price (₹)
            </label>
            <div className="relative">
              <div className="absolute left-0 top-0 bottom-0 px-4 bg-slate-50 border-r border-slate-200 rounded-l-xl flex items-center text-slate-500 font-bold text-sm">
                ₹
              </div>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="0.00"
                className="w-full pl-14 pr-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-400 transition text-sm text-slate-700 font-extrabold"
                required
              />
            </div>
          </div>

          {/* Item Name / Description Field */}
          <div>
            <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">
              Item Name / Reason
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              placeholder="e.g. Special Mess Feast, Room Heater Penalty, etc."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-400 transition text-sm text-slate-700 resize-none font-medium"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 text-white rounded-2xl font-bold transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
              formData.chargeType === 'fines'
                ? "bg-rose-600 hover:bg-rose-700 shadow-rose-600/10"
                : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-650/10"
            }`}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <PlusCircle size={20} className="stroke-[2.5]" />
                {formData.applyToAll
                  ? "Apply Charge to All Students"
                  : `Apply Charge to ${selectedStudents.length} Selected Student(s)`}
              </>
            )}
          </button>
        </form>

        {/* Informative Note Widget */}
        <div className="mt-6 p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-start gap-3">
          <FileText size={18} className="text-slate-400 shrink-0 mt-0.5" />
          <p className="text-slate-500 text-xs font-medium leading-relaxed">
            <strong>Billing Note:</strong>{" "}
            {formData.applyToAll
              ? "This charge will automatically post to the bill of all verified students assigned to your hostel."
              : "This charge will be applied only to the selected students for their current month billing cycles."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AddBillPage;
