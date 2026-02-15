import React, { useState, useEffect } from "react";
import { munshiApi } from "./api";
import { 
  LogOut, 
  Download, 
  Users, 
  FileText, 
  Plus, 
  BarChart3, 
  Trash2, 
  Menu, 
  X, 
  Check,
  RotateCw,
  ChevronRight, 
  User, 
  Home,
  CheckCircle,
  AlertCircle
} from "lucide-react";

// ==================== UI COMPONENTS ====================
const Card = ({ children, className = "" }) => (
  <div
    className={`bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-indigo-100/50 border border-white/50 ${className}`}
  >
    {children}
  </div>
);

const Button = ({
  children,
  onClick,
  variant = "primary",
  className = "",
  icon: Icon,
  disabled,
}) => {
  const variants = {
    primary:
      "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/30",
    secondary:
      "bg-white text-slate-700 border-2 border-slate-100 hover:border-indigo-100 hover:bg-indigo-50",
    danger: "bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100",
    success:
      "bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-500/30",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-6 py-3 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    >
      {Icon && (
        <Icon
          size={20}
          className={
            variant === "primary" || variant === "success" ? "stroke-[2.5]" : ""
          }
        />
      )}
      {children}
    </button>
  );
};

const Badge = ({ children, variant = "info" }) => {
  const variants = {
    info: "bg-blue-50 text-blue-700 border-blue-100",
    success: "bg-emerald-50 text-emerald-700 border-emerald-100",
    warning: "bg-orange-50 text-orange-700 border-orange-100",
    danger: "bg-rose-50 text-rose-700 border-rose-100",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-bold border ${variants[variant]}`}
    >
      {children}
    </span>
  );
};

export default function ClerkDashboard() {
  const [activeTab, setActiveTab] = useState("bill");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [month, setMonth] = useState("");
  const [students, setStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch all students when tab changes to 'students'
  useEffect(() => {
    if (activeTab === 'students') {
        fetchAllStudents();
    }
  }, [activeTab]);

  const fetchAllStudents = async () => {
    try {
        setLoading(true);
        const res = await munshiApi.getAllStudents();
        if (res.success) {
            setAllStudents(res.data);
        }
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
  };

  const handleVerifyStudent = async (studentId, action) => {
    try {
        setLoading(true);
        const res = await munshiApi.verifyStudent(studentId, action);
        if (res.success) {
            setSuccessMessage(res.message);
            setTimeout(() => setSuccessMessage(""), 3000);
            fetchAllStudents(); // Refresh list
        }
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
  };
  const [hostel, setHostel] = useState("");
  const [clerkName, setClerkName] = useState("");
  const [mealRate, setMealRate] = useState(0);
  const [billItems, setBillItems] = useState([]);
  const [currentBillName, setCurrentBillName] = useState("");
  const [currentBillAmount, setCurrentBillAmount] = useState("");
  const [extraCharges, setExtraCharges] = useState([]);
  const [specialCharges, setSpecialCharges] = useState([]);
  const [newExtraName, setNewExtraName] = useState("");
  const [newExtraRate, setNewExtraRate] = useState("");
  const [newChargesName, setNewChargesName] = useState("");
  const [newChargesAmount, setNewChargesAmount] = useState("");

  useEffect(() => {
    const auth = JSON.parse(localStorage.getItem("authUser")) || {};
    const storedHostel = localStorage.getItem("hostel");
    const munshi = auth.munshi || {};
    setHostel(storedHostel || munshi.hostel || "Unknown");
    setClerkName(munshi.name || "Clerk");
    if (auth.role !== "munshi") window.location.href = "/login";
    const saved = localStorage.getItem("clerkCharges");
    if (saved) {
      const { extra, special, meal } = JSON.parse(saved);
      setExtraCharges(extra || []);
      setSpecialCharges(special || []);
      setMealRate(meal || 0);
    }
  }, []);

  const saveCharges = (extra, special, meal) => {
    localStorage.setItem("clerkCharges", JSON.stringify({ extra, special, meal }));
    setSuccessMessage("Charges saved successfully!");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const fetchStudents = async () => {
    setError(null);
    if (!month) return setError("Select month");
    setLoading(true);
    try {
      const data = await munshiApi.getStudentsForBill(month);
      setStudents(data);
    } catch(e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const generateBill = async () => {
    setError(null);
    if (!month) return setError("Select month");
    if (!mealRate) return setError("Set meal rate first");
    if (students.length === 0) return setError("Fetch students first");
    setLoading(true);
    try {
      const blob = await munshiApi.generateBill(month, Number(mealRate), billItems);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${hostel}_${month}_Bill.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setSuccessMessage("Bill downloaded successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch(e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const addBillItem = () => {
      if (!currentBillName || !currentBillAmount) return setError("Enter bill item name and amount");
      setBillItems([...billItems, { id: Date.now(), name: currentBillName, amount: Number(currentBillAmount) }]);
      setCurrentBillName("");
      setCurrentBillAmount("");
  };

  const removeBillItem = (id) => {
      setBillItems(billItems.filter(item => item.id !== id));
  };


  const addExtraCharge = () => {
    if (!newExtraName || !newExtraRate) return setError("Enter name and rate");
    const updated = [...extraCharges, { id: Date.now(), name: newExtraName, rate: Number(newExtraRate) }];
    setExtraCharges(updated);
    saveCharges(updated, specialCharges, mealRate);
    setNewExtraName("");
    setNewExtraRate("");
  };

  const removeExtraCharge = (id) => {
    const updated = extraCharges.filter(c => c.id !== id);
    setExtraCharges(updated);
    saveCharges(updated, specialCharges, mealRate);
  };

  const addSpecialCharge = () => {
    if (!newChargesName || !newChargesAmount) return setError("Enter name and amount");
    const updated = [...specialCharges, { id: Date.now(), name: newChargesName, amount: Number(newChargesAmount) }];
    setSpecialCharges(updated);
    saveCharges(extraCharges, updated, mealRate);
    setNewChargesName("");
    setNewChargesAmount("");
  };

  const removeSpecialCharge = (id) => {
    const updated = specialCharges.filter(c => c.id !== id);
    setSpecialCharges(updated);
    saveCharges(extraCharges, updated, mealRate);
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const calculateDietTotal = (diet) => Number(diet) * (Number(mealRate) || 0);
  const calculateTotal = (diet, extra) => {
    let total = calculateDietTotal(diet) + Number(extra || 0);
    extraCharges.forEach(c => total += c.rate);
    billItems.forEach(item => total += item.amount);
    return total;
  };

  const grandTotal = students.reduce((sum, s) => sum + calculateTotal(s.diet, s.extra), 0);

  const tabs = [
    { key: "students", label: "Students", icon: Users },
    { key: "charges", label: "Charges", icon: Plus },
    { key: "reports", label: "Reports", icon: BarChart3 },
    { key: "bill", label: "Generate Bill", icon: FileText },
  ];

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
       {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-slate-100 transform transition-transform duration-300 ease-in-out ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"} md:${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="p-8 h-full flex flex-col">
          <div className="flex items-center justify-between mb-10 px-2">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                <FileText size={20} />
                </div>
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                Clerk<span className="text-indigo-600">Dash</span>
                </h1>
            </div>
            <button 
                onClick={() => {
                    setSidebarOpen(false);
                    setMobileMenuOpen(false);
                }}
                className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
            >
                <X size={20} />
            </button>
          </div>

          <div className="px-2 mb-8 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50 group hover:bg-white hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-indigo-500 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-indigo-200">
                {clerkName ? clerkName.charAt(0).toUpperCase() : "C"}
              </div>
              <div className="overflow-hidden">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-0.5">
                  Clerk Profile
                </p>
                <h4 className="text-sm font-black text-slate-800 truncate leading-tight group-hover:text-indigo-600 transition-colors">
                  {clerkName}
                </h4>
                 <div className="flex items-center gap-1.5 mt-1">
                  <Home size={10} className="text-slate-400" />
                  <p className="text-[10px] font-bold text-slate-500 truncate">
                    {hostel || "Hostel"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <nav className="space-y-2 flex-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => {
                    setActiveTab(tab.key);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 font-bold text-sm relative overflow-hidden group ${isActive ? "bg-indigo-600 text-white shadow-xl shadow-indigo-200" : "text-slate-500 hover:bg-slate-50 hover:text-indigo-600"}`}
                >
                  <Icon
                    size={20}
                    className={`relative z-10 transition-transform group-hover:scale-110 ${isActive ? "stroke-[2.5]" : ""}`}
                  />
                  <span className="relative z-10">{tab.label}</span>
                  {isActive && (
                    <div className="absolute inset-0 bg-white/20 blur-xl"></div>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="mt-auto pt-8 border-t border-slate-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-slate-500 font-bold hover:bg-rose-50 hover:text-rose-600 transition-all active:scale-95"
            >
              <LogOut size={20} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-30 md:hidden"
        ></div>
      )}

      {/* Main Content */}
      <main className={`flex-1 min-h-screen relative transition-all duration-300 ease-in-out ${sidebarOpen ? "md:ml-72" : "md:ml-0"}`}>
         {/* Header */}
        <header className="sticky top-0 z-20 bg-[#F8FAFC]/80 backdrop-blur-md px-8 py-5 flex items-center gap-4">
          <div className="flex items-center gap-4">
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hidden md:block p-2 text-slate-600 hover:bg-white rounded-xl transition-colors"
            >
                <Menu size={24} />
            </button>
            <div className="md:hidden">
                <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 text-slate-600 hover:bg-white rounded-xl transition-colors"
                >
                <Menu size={24} />
                </button>
            </div>
          </div>

          <div className="">
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
              {tabs.find((t) => t.key === activeTab)?.label}
            </h2>
            <p className="text-slate-400 text-sm font-medium">
              Manage hostel billing and reports
            </p>
          </div>
        </header>

        <div className="p-6 md:p-8 pt-4 pb-24 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 text-rose-600 flex items-center gap-3 font-bold border border-rose-100 animate-in slide-in-from-top-2">
              <AlertCircle size={20} />
              {error}
            </div>
          )}
          
          {successMessage && (
             <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center gap-3 font-bold border border-emerald-100 animate-in slide-in-from-top-2">
              <CheckCircle size={20} />
              {successMessage}
            </div>
          )}

          {activeTab === "bill" && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <Card className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-indigo-50 rounded-2xl">
                             <FileText className="w-6 h-6 text-indigo-600"/>
                        </div>
                         <div>
                            <h2 className="text-xl font-bold text-slate-800">
                              Bill Settings
                            </h2>
                            <p className="text-slate-500 text-sm">
                              Set rates and select month
                            </p>
                         </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Meal Rate (₹)</label>
                            <div className="flex gap-4">
                                <input 
                                    type="number" 
                                    value={mealRate} 
                                    onChange={(e) => setMealRate(e.target.value)} 
                                    placeholder="0" 
                                    className="flex-1 px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold outline-none text-slate-800"
                                />
                                <Button onClick={() => saveCharges(extraCharges, specialCharges, mealRate)}>
                                    Save
                                </Button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Month</label>
                            <div className="flex gap-4">
                                <input 
                                    type="month" 
                                    value={month} 
                                    onChange={(e) => setMonth(e.target.value)} 
                                    className="flex-1 px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold outline-none text-slate-800"
                                />
                                <Button 
                                    onClick={fetchStudents} 
                                    disabled={loading}
                                    variant="secondary"
                                >
                                    {loading ? "Loading..." : "Fetch Data"}
                                </Button>
                            </div>
                        </div>
                    </div>
                 </Card>

                 <Card className="p-8 flex flex-col justify-center">
                    <div className="w-full space-y-6">
                        <div className="flex items-center gap-4 mb-2">
                             <div className="p-2 bg-orange-50 rounded-xl text-orange-600">
                                <Plus size={20} />
                             </div>
                             <h3 className="text-lg font-bold text-slate-800">Add Bill Item</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Item Name</label>
                                <input 
                                    type="text" 
                                    value={currentBillName} 
                                    onChange={(e) => setCurrentBillName(e.target.value)} 
                                    placeholder="e.g. Electricity" 
                                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium outline-none text-slate-800"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Amount (₹)</label>
                                <input 
                                    type="number" 
                                    value={currentBillAmount} 
                                    onChange={(e) => setCurrentBillAmount(e.target.value)} 
                                    placeholder="0" 
                                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold outline-none text-slate-800"
                                />
                            </div>
                        </div>

                        <Button 
                            onClick={addBillItem} 
                            disabled={loading || !currentBillName || !currentBillAmount}
                            variant="primary"
                            className="w-full py-3"
                        >
                            Add Item
                        </Button>
                        
                        {billItems.length > 0 && (
                            <div className="space-y-3 mt-4 max-h-40 overflow-y-auto">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Added Items</h4>
                                {billItems.map(item => (
                                    <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl text-sm font-medium">
                                        <span className="text-slate-800">{item.name}</span>
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold text-indigo-600">₹{item.amount}</span>
                                            <button onClick={() => removeBillItem(item.id)} className="text-rose-500 hover:bg-rose-100 p-1.5 rounded-lg transition-colors">
                                                <Trash2 size={14}/>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                         )}

                         <div className="pt-4 border-t border-slate-100 mt-2">
                             <Button 
                                onClick={generateBill} 
                                disabled={loading || students.length === 0}
                                variant="success"
                                className="w-full py-4 text-base"
                                icon={Download}
                             >
                                {loading ? "Generating..." : "Generate & Download Bill"}
                             </Button>
                         </div>
                    </div>
                 </Card>
              </div>

              {students.length > 0 && (
                <Card className="overflow-hidden">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h2 className="font-bold text-slate-800 text-lg">Bill Preview</h2>
                    <Badge variant="info">{students.length} Students</Badge>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold">
                        <tr>
                          <th className="px-6 py-4 text-center">#</th>
                          <th className="px-6 py-4 text-center">Room</th>
                          <th className="px-6 py-4 text-left">Student Name</th>
                          <th className="px-6 py-4 text-center">Roll No</th>
                          <th className="px-6 py-4 text-center">Diet</th>
                          <th className="px-6 py-4 text-center">Diet Rate</th>
                          <th className="px-6 py-4 text-right">D* Rate</th>
                          <th className="px-6 py-4 text-right">Extra</th>
                          {billItems.map(item => (
                             <th key={item.id} className="px-6 py-4 text-right bg-orange-50 text-orange-600 whitespace-nowrap">{item.name}</th>
                          ))}
                          <th className="px-6 py-4 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                        {students.map((s, idx) => {
                          const dt = calculateDietTotal(s.diet);
                          const t = calculateTotal(s.diet, s.extra);
                          return (
                            <tr key={s.studentId} className="hover:bg-indigo-50/30 transition-colors">
                              <td className="px-6 py-4 text-center text-slate-400">{idx + 1}</td>
                              <td className="px-6 py-4 text-center font-bold text-slate-800">{s.roomNo}</td>
                              <td className="px-6 py-4 font-bold text-slate-800">{s.name}</td>
                              <td className="px-6 py-4 text-center text-slate-500">{s.rollNo}</td>
                              <td className="px-6 py-4 text-center">
                                <span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg">{s.diet}</span>
                              </td>
                              <td className="px-6 py-4 text-center text-slate-500">{mealRate}</td>
                              <td className="px-6 py-4 text-right text-slate-500">{dt.toFixed(2)}</td>
                              <td className="px-6 py-4 text-right text-slate-500">{Number(s.extra || 0).toFixed(2)}</td>
                              {billItems.map(item => (
                                 <td key={item.id} className="px-6 py-4 text-right font-bold text-orange-600 bg-orange-50/30">{Number(item.amount).toFixed(2)}</td>
                              ))}
                              <td className="px-6 py-4 text-right font-black text-slate-800 bg-slate-50/50">{t.toFixed(2)}</td>
                            </tr>
                          );
                        })}
                        <tr className="bg-slate-900 text-white">
                          <td colSpan={8 + billItems.length} className="px-6 py-4 text-right font-bold uppercase tracking-wider text-xs">Grand Total</td>
                          <td className="px-6 py-4 text-right font-black text-lg">₹{grandTotal.toFixed(2)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}
            </div>
          )}

          {activeTab === "students" && (
            <div className="space-y-6">
               <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Student Verification</h2>
                        <p className="text-slate-500">Manage student access and verifications</p>
                    </div>
                    <Button onClick={fetchAllStudents} disabled={loading} variant="secondary" icon={RotateCw}>
                        Refresh List
                    </Button>
               </div>

               {loading ? (
                   <div className="text-center py-20">
                       <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                       <p className="text-slate-500">Loading students...</p>
                   </div>
               ) : allStudents.length > 0 ? (
                <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold">
                                <tr>
                                    <th className="px-6 py-4 text-left">Student Name</th>
                                    <th className="px-6 py-4 text-left">Roll No</th>
                                    <th className="px-6 py-4 text-left">Room</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm font-medium">
                                {allStudents.map((s) => (
                                    <tr key={s._id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-800">{s.name}</div>
                                            <div className="text-xs text-slate-400">{s.email}</div>
                                        </td>
                                        <td className="px-6 py-4 text-left text-slate-600">{s.rollNo}</td>
                                        <td className="px-6 py-4 text-left font-bold text-slate-800">{s.roomNo}</td>
                                        <td className="px-6 py-4 text-center">
                                            {s.isVerified ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                                    Verified
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                                    Pending
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {!s.isVerified && (
                                                <div className="flex items-center justify-end gap-2">
                                                    <button 
                                                        onClick={() => handleVerifyStudent(s._id, 'approve')}
                                                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                        title="Approve"
                                                    >
                                                        <Check size={18} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleVerifyStudent(s._id, 'reject')}
                                                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                        title="Reject"
                                                    >
                                                        <X size={18} />
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
               ) : (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                      <Users size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700 mb-1">No Students Found</h3>
                    <p className="text-slate-400">There are no students registered in your hostel yet.</p>
                </div>
               )}
            </div>
          )}

          {activeTab === "charges" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Extra Charges Section */}
                <div className="space-y-4">
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white relative overflow-hidden">
                         <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                         <div className="relative z-10">
                            <h2 className="text-xl font-bold mb-1">Extra Charges</h2>
                            <p className="text-indigo-100/80 text-sm font-medium">Per student charges (e.g. Fine, Late fee)</p>
                         </div>
                    </div>
                    
                    <Card className="p-6">
                        <div className="flex gap-3 mb-6">
                            <input 
                                type="text" 
                                value={newExtraName} 
                                onChange={(e) => setNewExtraName(e.target.value)} 
                                placeholder="Charge name" 
                                className="flex-[2] px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium outline-none text-slate-800 text-sm"
                            />
                            <input 
                                type="number" 
                                value={newExtraRate} 
                                onChange={(e) => setNewExtraRate(e.target.value)} 
                                placeholder="₹" 
                                className="flex-1 px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium outline-none text-slate-800 text-sm"
                            />
                            <Button onClick={addExtraCharge} className="bg-indigo-600 px-4 rounded-xl">
                                <Plus size={20} />
                            </Button>
                        </div>
                        
                        <div className="space-y-3">
                             {extraCharges.length === 0 ? (
                                <p className="text-center text-slate-400 text-sm py-4">No extra charges added</p>
                             ) : (
                                extraCharges.map(c => (
                                    <div key={c.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl hover:bg-white border border-transparent hover:border-slate-100 hover:shadow-sm transition-all">
                                        <div>
                                            <p className="font-bold text-slate-800 text-sm">{c.name}</p>
                                            <p className="text-xs text-slate-400 font-bold mt-0.5">₹{c.rate.toFixed(2)} / student</p>
                                        </div>
                                        <button 
                                            onClick={() => removeExtraCharge(c.id)}
                                            className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))
                             )}
                        </div>
                    </Card>
                </div>

                {/* Special Charges Section */}
                <div className="space-y-4">
                    <div className="bg-gradient-to-br from-orange-400 to-pink-500 rounded-3xl p-6 text-white relative overflow-hidden">
                         <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                         <div className="relative z-10">
                            <h2 className="text-xl font-bold mb-1">Special Charges</h2>
                            <p className="text-orange-100/80 text-sm font-medium">Universal charges for all (e.g. Feast)</p>
                         </div>
                    </div>
                    
                    <Card className="p-6">
                        <div className="flex gap-3 mb-6">
                            <input 
                                type="text" 
                                value={newChargesName} 
                                onChange={(e) => setNewChargesName(e.target.value)} 
                                placeholder="Charge name" 
                                className="flex-[2] px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all font-medium outline-none text-slate-800 text-sm"
                            />
                            <input 
                                type="number" 
                                value={newChargesAmount} 
                                onChange={(e) => setNewChargesAmount(e.target.value)} 
                                placeholder="₹" 
                                className="flex-1 px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all font-medium outline-none text-slate-800 text-sm"
                            />
                            <Button onClick={addSpecialCharge} className="bg-orange-500 hover:bg-orange-600 px-4 rounded-xl">
                                <Plus size={20} />
                            </Button>
                        </div>
                        
                        <div className="space-y-3">
                             {specialCharges.length === 0 ? (
                                <p className="text-center text-slate-400 text-sm py-4">No special charges added</p>
                             ) : (
                                specialCharges.map(c => (
                                    <div key={c.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl hover:bg-white border border-transparent hover:border-slate-100 hover:shadow-sm transition-all">
                                        <div>
                                            <p className="font-bold text-slate-800 text-sm">{c.name}</p>
                                            <p className="text-xs text-slate-400 font-bold mt-0.5">₹{c.amount.toFixed(2)} (All students)</p>
                                        </div>
                                        <button 
                                            onClick={() => removeSpecialCharge(c.id)}
                                            className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))
                             )}
                        </div>
                    </Card>
                </div>
            </div>
          )}

          {activeTab === "reports" && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500 mb-6 animate-pulse">
                    <BarChart3 size={40} />
                </div>
                <h1 className="text-3xl font-black text-slate-800 mb-2">Reports Coming Soon</h1>
                <p className="text-slate-500 max-w-md">
                    We are building comprehensive analytics and reporting tools to help you manage your mess better. Stay tuned!
                </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
