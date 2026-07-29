import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, XCircle, Search, X, CalendarPlus, Check, User, AlertCircle, List } from 'lucide-react';
import { Card, Badge } from './components/UIComponents';
import { munshiApi } from './api';

const MessOffRequestsPage = ({ requests, handleAction, refreshRequests }) => {
  const [activeSubTab, setActiveSubTab] = useState('list'); // 'list', 'current', or 'manual'
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  // Date format helper (IST safe)
  const getTodayString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [fromDate, setFromDate] = useState(getTodayString());
  const [toDate, setToDate] = useState(getTodayString());
  const [selectedMeals, setSelectedMeals] = useState(['Breakfast', 'Lunch', 'Dinner']);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);

  // Fetch all students on mount
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoadingStudents(true);
    try {
      const res = await munshiApi.getAllStudents();
      if (res && res.success) {
        // Filter to only verified students
        setStudents((res.data || []).filter(s => s.isVerified));
      }
    } catch (err) {
      console.error("Failed to load students:", err);
      setAlertMessage({ type: 'error', text: 'Failed to load students list' });
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleResetForm = () => {
    setSelectedStudent(null);
    setSearchTerm("");
    setFromDate(getTodayString());
    setToDate(getTodayString());
    setSelectedMeals(['Breakfast', 'Lunch', 'Dinner']);
    setReason("");
  };

  const handleSubmitManualMessOff = async (e) => {
    e.preventDefault();
    if (!selectedStudent) {
      setAlertMessage({ type: 'error', text: 'Please select a student' });
      return;
    }
    if (selectedMeals.length === 0) {
      setAlertMessage({ type: 'error', text: 'Please select at least one meal' });
      return;
    }
    if (new Date(fromDate) > new Date(toDate)) {
      setAlertMessage({ type: 'error', text: 'From date cannot be after to date' });
      return;
    }

    setSubmitting(true);
    setAlertMessage(null);

    try {
      const payload = {
        studentId: selectedStudent._id,
        fromDate,
        toDate,
        meals: selectedMeals,
        reason: reason || 'Manual Mess Off by Munshi'
      };

      await munshiApi.createManualMessOff(payload);
      
      // Success handling
      handleResetForm();
      if (refreshRequests) {
        await refreshRequests();
      }
      
      // Switch to the 'current' tab so they see it is now active
      setActiveSubTab('current');
      alert('Manual mess off applied successfully!');
    } catch (err) {
      console.error(err);
      setAlertMessage({ type: 'error', text: err.message || 'Failed to apply manual mess off' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleMessOn = async (studentId) => {
    if (!window.confirm("Are you sure you want to enable mess (Mess On) for this student? This will end their current mess-off period immediately.")) return;
    try {
      await munshiApi.enableMessOn(studentId);
      alert("Mess enabled successfully for the student.");
      if (refreshRequests) {
        await refreshRequests();
      }
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to enable mess.");
    }
  };

  // Filter students based on room number, roll no or name (for applying manual mess off)
  const filteredStudents = students.filter(
    (student) =>
      (student.roomNo || '').toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.rollNo || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter requests that are currently active today
  const todayStr = getTodayString();
  const currentMessOffRequests = requests.filter(req => {
    if (req.status !== 'Approved') return false;
    return todayStr >= req.from && todayStr <= req.to;
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Premium Tab Switcher Button Bar */}
      <div className="flex justify-start mb-2">
        <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1 border border-slate-200/50 shadow-sm">
          <button
            onClick={() => {
              setActiveSubTab('list');
              setAlertMessage(null);
            }}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all flex items-center gap-2 ${
              activeSubTab === 'list'
                ? 'bg-white text-indigo-600 shadow-md shadow-indigo-100/50'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
            }`}
          >
            <List size={16} />
            Requests List
          </button>

          <button
            onClick={() => {
              setActiveSubTab('current');
              setAlertMessage(null);
            }}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all flex items-center gap-2 ${
              activeSubTab === 'current'
                ? 'bg-white text-indigo-600 shadow-md shadow-indigo-100/50'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
            }`}
          >
            <CheckCircle size={16} />
            Current Mess Off ({currentMessOffRequests.length})
          </button>

          <button
            onClick={() => {
              setActiveSubTab('manual');
              setAlertMessage(null);
              handleResetForm();
            }}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all flex items-center gap-2 ${
              activeSubTab === 'manual'
                ? 'bg-white text-indigo-600 shadow-md shadow-indigo-100/50'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
            }`}
          >
            <CalendarPlus size={16} />
            Apply Manual Mess Off
          </button>
        </div>
      </div>

      {alertMessage && (
        <div className={`p-4 rounded-2xl text-sm font-medium flex items-start gap-3 border ${
          alertMessage.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
            : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          <AlertCircle className={alertMessage.type === 'success' ? 'text-emerald-600' : 'text-rose-600'} size={20} />
          <p>{alertMessage.text}</p>
        </div>
      )}

      {/* Conditionally Render Sub-Tabs */}
      {activeSubTab === 'manual' && (
        /* Tab: Apply Manual Mess Off */
        <Card className="p-6 border border-slate-100 bg-white/90 shadow-lg shadow-slate-100/50 rounded-3xl animate-in fade-in duration-200">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
            <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
              <CalendarPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Apply Manual Mess Off</h3>
              <p className="text-xs text-slate-400 font-semibold">Directly apply approved mess off for a student by searching their room number</p>
            </div>
          </div>

          <form onSubmit={handleSubmitManualMessOff} className="space-y-6">
            {/* Student Search & Selection */}
            {!selectedStudent ? (
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Search Student by Room Number
                </label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Type Room Number (e.g. 428) or Name..."
                    className="w-full pl-12 pr-4 py-3 rounded-2xl border-2 border-slate-200 bg-slate-50 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none font-medium transition-all text-slate-700 text-sm"
                  />
                </div>

                {/* Search Results */}
                {searchTerm.trim().length > 0 && (
                  <div className="max-h-60 overflow-y-auto space-y-2 border-2 border-slate-100 rounded-2xl p-3 bg-slate-50/50">
                    {loadingStudents ? (
                      <div className="text-center py-6 text-slate-400 text-sm font-medium">Loading hostel students...</div>
                    ) : filteredStudents.length === 0 ? (
                      <div className="text-center py-6 text-slate-400 text-sm font-medium">
                        No students found matching search query
                      </div>
                    ) : (
                      filteredStudents.map((student) => (
                        <button
                          type="button"
                          key={student._id}
                          onClick={() => {
                            setSelectedStudent(student);
                            setSearchTerm(""); // Reset search term
                          }}
                          className="w-full text-left flex items-center justify-between p-3 bg-white hover:bg-indigo-50 border border-slate-100 hover:border-indigo-200 rounded-xl transition-all shadow-sm group"
                        >
                          <div>
                            <p className="font-bold text-slate-800 text-sm group-hover:text-indigo-600">{student.name}</p>
                            <p className="text-xs text-slate-400 font-mono">{student.rollNo}</p>
                          </div>
                          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
                            Room {student.roomNo || 'N/A'}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* Selected Student Info & Expanded Form */
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Selected Student Box */}
                <div className="bg-indigo-50/30 border border-indigo-100 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center">
                      <User size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{selectedStudent.name}</h4>
                      <p className="text-xs text-slate-400 font-medium">
                        Roll: {selectedStudent.rollNo} • Room {selectedStudent.roomNo || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedStudent(null)}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg border border-indigo-200 transition-all active:scale-95"
                  >
                    Change Student
                  </button>
                </div>

                {/* Form Fields: Dates, Meals, Reason */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">From Date</label>
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className="block w-full min-w-full px-4 py-3 rounded-2xl bg-slate-50/50 border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none font-medium transition-all text-sm text-slate-700"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">To Date</label>
                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className="block w-full min-w-full px-4 py-3 rounded-2xl bg-slate-50/50 border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none font-medium transition-all text-sm text-slate-700"
                      required
                    />
                  </div>
                </div>

                {/* Meals Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                    Meals to Include
                  </label>
                  <div className="flex gap-4">
                    {['Breakfast', 'Lunch', 'Dinner'].map((meal) => {
                      const isChecked = selectedMeals.includes(meal);
                      return (
                        <button
                          type="button"
                          key={meal}
                          onClick={() => {
                            setSelectedMeals(prev =>
                              isChecked ? prev.filter(m => m !== meal) : [...prev, meal]
                            );
                          }}
                          className={`flex-1 py-3 rounded-2xl border font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                            isChecked
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200'
                              : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {isChecked && <Check size={16} />}
                          {meal}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Reason */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Reason</label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={2}
                    placeholder="e.g. Official Leave, Going home, Medical"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50/50 border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none font-medium transition-all text-sm resize-none text-slate-700"
                  />
                </div>

                {/* Form Actions */}
                <div className="flex gap-4 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all active:scale-95 text-sm"
                  >
                    Reset Form
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || selectedMeals.length === 0}
                    className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95 text-sm"
                  >
                    {submitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Apply Mess Off'
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </Card>
      )}

      {activeSubTab === 'current' && (
        /* Tab: Current Mess Off list */
        <Card className="p-6 border border-slate-100 bg-white/90 shadow-lg shadow-slate-100/50 rounded-3xl animate-in fade-in duration-200">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Students Currently On Mess Off</h3>
              <p className="text-xs text-slate-400 font-semibold">Active leave list for today ({todayStr})</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            {currentMessOffRequests.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm font-medium">
                No students are currently on mess off today.
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 md:py-4 px-1 md:px-4 font-bold text-slate-500 text-[10px] md:text-sm uppercase tracking-wider">Student</th>
                    <th className="text-left py-3 md:py-4 px-1 md:px-4 font-bold text-slate-500 text-[10px] md:text-sm uppercase tracking-wider">Roll</th>
                    <th className="text-left py-3 md:py-4 px-1 md:px-4 font-bold text-slate-500 text-[10px] md:text-sm uppercase tracking-wider">Room</th>
                    <th className="text-left py-3 md:py-4 px-1 md:px-4 font-bold text-slate-500 text-[10px] md:text-sm uppercase tracking-wider">Duration</th>
                    <th className="text-left py-3 md:py-4 px-1 md:px-4 font-bold text-slate-500 text-[10px] md:text-sm uppercase tracking-wider">Reason</th>
                    <th className="text-center py-3 md:py-4 px-1 md:px-4 font-bold text-slate-500 text-[10px] md:text-sm uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentMessOffRequests.map(req => (
                    <tr key={req.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4 text-sm md:text-base font-medium text-gray-900">
                        {req.studentName}
                      </td>
                      <td className="py-3 md:py-4 px-1 md:px-4">
                        <span className="bg-slate-50 text-slate-500 px-2 py-1 rounded text-xs font-mono font-bold border border-slate-100">
                          {req.studentRollNo}
                        </span>
                      </td>
                      <td className="py-3 md:py-4 px-1 md:px-4 text-sm font-bold text-gray-700">
                        {req.studentRoomNo || 'N/A'}
                      </td>
                      <td className="py-3 md:py-4 px-1 md:px-4 text-sm text-gray-600">
                        {req.from} to {req.to}
                      </td>
                      <td className="py-3 md:py-4 px-1 md:px-4 text-sm text-gray-600 max-w-[200px] truncate">
                        {req.reason}
                      </td>
                      <td className="py-3 md:py-4 px-1 md:px-4 text-center">
                        <button
                          onClick={() => handleMessOn(req.studentId)}
                          className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 rounded-xl text-xs font-bold transition-all active:scale-95 whitespace-nowrap"
                        >
                          Mess On
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      )}

      {activeSubTab === 'list' && (
        /* Tab: Mess Off Requests Table */
        <Card className="p-6 border border-slate-100 bg-white/90 shadow-lg shadow-slate-100/50 rounded-3xl animate-in fade-in duration-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Calendar className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Mess Off Requests</h2>
              <p className="text-sm text-gray-500">Review and manage student leave requests</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 md:py-4 px-1 md:px-4 font-bold text-slate-500 text-[10px] md:text-sm uppercase tracking-wider">Student</th>
                  <th className="text-left py-3 md:py-4 px-1 md:px-4 font-bold text-slate-500 text-[10px] md:text-sm uppercase tracking-wider">Roll</th>
                  <th className="text-left py-3 md:py-4 px-1 md:px-4 font-bold text-slate-500 text-[10px] md:text-sm uppercase tracking-wider">Room</th>
                  <th className="text-left py-3 md:py-4 px-1 md:px-4 font-bold text-slate-500 text-[10px] md:text-sm uppercase tracking-wider">Duration</th>
                  <th className="text-left py-3 md:py-4 px-1 md:px-4 font-bold text-slate-500 text-[10px] md:text-sm uppercase tracking-wider">Reason</th>
                  <th className="text-left py-3 md:py-4 px-1 md:px-4 font-bold text-slate-500 text-[10px] md:text-sm uppercase tracking-wider">Status</th>
                  <th className="text-center py-3 md:py-4 px-1 md:px-4 font-bold text-slate-500 text-[10px] md:text-sm uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(req => (
                  <tr key={req.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 text-sm md:text-base">
                      <div>
                        <p className="font-medium text-gray-900">
                          <span className="md:hidden">{(req.studentName || '').split(' ')[0]}</span>
                          <span className="hidden md:inline">{req.studentName}</span>
                        </p>
                      </div>
                    </td>
                    <td className="py-3 md:py-4 px-1 md:px-4">
                      <span className="bg-slate-50 text-slate-500 px-1 py-0.5 md:px-2 md:py-1 rounded text-[9px] md:text-xs font-bold font-mono border border-slate-100">
                        {req.studentRollNo}
                      </span>
                    </td>
                    <td className="py-3 md:py-4 px-1 md:px-4">
                      <span className="text-[10px] md:text-sm font-bold text-gray-700">
                        {req.studentRoomNo || 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 md:py-4 px-1 md:px-4">
                      <div className="flex items-center gap-1 md:gap-2 text-[9px] md:text-sm whitespace-nowrap">
                        <Calendar className="w-3 h-3 md:w-4 md:h-4 text-gray-400" />
                        <span>
                          <span className="md:hidden">
                            {(() => {
                              const f = new Date(req.from).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }).toLowerCase();
                              const t = new Date(req.to).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }).toLowerCase();
                              return `${f} - ${t}`;
                            })()}
                          </span>
                          <span className="hidden md:inline">{req.from} to {req.to}</span>
                        </span>
                      </div>
                    </td>
                    <td className="py-3 md:py-4 px-1 md:px-4 max-w-[50px] md:max-w-none">
                      <p className="text-[9px] md:text-sm text-gray-600 truncate md:whitespace-normal">{req.reason}</p>
                    </td>
                    <td className="py-3 md:py-4 px-1 md:px-4">
                      <div className="scale-75 md:scale-100 origin-left">
                        <Badge variant={
                          req.status === 'Pending' ? 'warning' :
                          req.status === 'Approved' ? 'success' :
                          req.status === 'Cancelled' ? 'info' : 'danger'
                        }>
                          {req.status}
                        </Badge>
                      </div>
                    </td>
                    <td className="py-3 md:py-4 px-1 md:px-4">
                      {req.status === 'Pending' && (
                        <div className="flex items-center justify-center gap-1 md:gap-2">
                          <button
                            onClick={() => handleAction(req.id, 'Approved')}
                            className="p-1 md:p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Approve"
                          >
                            <CheckCircle className="w-4 h-4 md:w-5 md:h-5" />
                          </button>
                          <button
                            onClick={() => handleAction(req.id, 'Rejected')}
                            className="p-1 md:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4 md:w-5 md:h-5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default MessOffRequestsPage;