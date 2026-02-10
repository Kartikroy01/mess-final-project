import React, { useState, useEffect } from "react";
import {
  Search,
  X,
  CheckCircle,
  ShoppingBag,
  LogOut,
  Menu,
  Calendar,
  TrendingUp,
  Plus,
  User,
  FileText,
  ChevronRight,
  ChevronDown,
  Bell,
  UtensilsCrossed,
  Home,
  DollarSign,
  QrCode,
  Trash2,
  Edit2,
} from "lucide-react";
import MessOffRequestsPage from "./MessOffRequest";
import ReportsPage from "./MunshiReport";
import AddMealPage from "./MunshiAddMeal";
import { munshiApi } from "./api";
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";

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
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-bold border ${variants[variant]}`}
    >
      {children}
    </span>
  );
};

// ==================== MEAL SELECTION PAGE ====================
const MealSelectionPage = ({ onSelectMeal, munshiName }) => {
  const mealTypes = [
    {
      id: "breakfast",
      label: "Breakfast",
      icon: "🌅",
      color: "from-orange-400 to-pink-500",
      time: "7:30 AM - 9:30 AM",
    },
    {
      id: "lunch",
      label: "Lunch",
      icon: "☀️",
      color: "from-yellow-400 to-orange-500",
      time: "12:30 PM - 2:30 PM",
    },
    {
      id: "snacks",
      label: "Snacks",
      icon: "🍵",
      color: "from-green-400 to-teal-500",
      time: "4:30 PM - 6:00 PM",
    },
    {
      id: "dinner",
      label: "Dinner",
      icon: "🌙",
      color: "from-indigo-400 to-purple-500",
      time: "7:30 PM - 9:30 PM",
    },
  ];

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F8FAFC]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
      </div>

      <div className="w-full max-w-5xl p-6 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl mb-8 shadow-xl shadow-indigo-100 animate-in zoom-in duration-700">
            <UtensilsCrossed className="w-10 h-10 text-indigo-600" />
          </div>
          
          <div className="mb-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
            <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-sm font-black uppercase tracking-widest border border-indigo-100 shadow-sm">
                Welcome back 👋
            </span>
          </div>

          <h2 className="text-5xl font-black text-slate-800 mb-4 tracking-tighter animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
            Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">{munshiName || "Munshi"}</span>
          </h2>
          
          <p className="text-slate-500 text-lg font-medium max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
            Choose the current meal type to begin processing student orders for today.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mealTypes.map((meal) => (
            <button
              key={meal.id}
              onClick={() => onSelectMeal(meal.id)}
              className="group relative overflow-hidden bg-white hover:bg-slate-50 border border-slate-100 rounded-[2rem] p-6 text-left transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1"
            >
              <div
                className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${meal.color} opacity-10 rounded-bl-[4rem] transition-opacity group-hover:opacity-20`}
              ></div>

              <div className="relative z-10">
                <div className="text-4xl mb-4 bg-slate-50 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm">
                  {meal.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-1">
                  {meal.label}
                </h3>
                <p className="text-sm text-slate-400 font-medium">
                  {meal.time}
                </p>

                <div className="mt-6 flex items-center gap-2 text-indigo-600 font-bold text-sm opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                  <span>Start Session</span>
                  <ChevronRight size={16} />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ==================== QR SCANNER COMPONENT ====================
const QRScanner = ({ onScanSuccess, onScanError }) => {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
      supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
      showTorchButtonIfSupported: true,
    });

    scanner.render(onScanSuccess, onScanError);

    return () => {
      scanner.clear().catch((error) => {
        console.error("Failed to clear html5QrcodeScanner. ", error);
      });
    };
  }, [onScanSuccess, onScanError]);

  return (
    <div className="overflow-hidden rounded-2xl border-2 border-slate-100 bg-slate-50">
      <div id="reader" className="w-full"></div>
    </div>
  );
};

// ==================== DASHBOARD VIEW ====================
const DashboardView = ({
  sessionMeal,
  onStudentScan,
  scannedStudent,
  clearScannedStudent,
  onAddExtraItems,
  meals,
  scanLoading,
  menuLoading,
  munshiName,
  munshiHostel,
  onDeleteMeal,
  onEditMeal,
}) => {
  const [studentIdInput, setStudentIdInput] = useState("");
  const [error, setError] = useState("");
  const [extraItems, setExtraItems] = useState([]);
  const [notification, setNotification] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [showDeleteId, setShowDeleteId] = useState(null);

  const handleScan = async (e) => {
    e.preventDefault();
    setError("");
    const student = await onStudentScan(studentIdInput);
    if (!student) {
      setError("Student ID, Roll Number or Room Number not found.");
    }
  };

  const handleClear = () => {
    setStudentIdInput("");
    setError("");
    setExtraItems([]);
    clearScannedStudent();
    setShowDeleteId(null);
  };

  const toggleExtraItem = (item) => {
    setExtraItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.filter((i) => i.id !== item.id);
      } else {
        return [...prev, { ...item, qty: 1 }];
      }
    });
  };

  const updateItemQty = (id, delta) => {
    setExtraItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(1, item.qty + delta);
          return { ...item, qty: newQty };
        }
        return item;
      }),
    );
  };

  const calculateItemPrice = (item) => {
    // Special pricing logic: if item price is 15 and qty is 2, total for that item is 25
    if (item.price === 15 && item.qty === 2) return 25;
    // General rule for multiples of 2 if we want to be proactive?
    // The user specifically mentioned 2 piece for 25.
    // Let's stick to the specific rule or maybe (Math.floor(item.qty/2)*25 + (item.qty%2)*15)
    // Actually, I'll stick to the user's specific example for now.
    if (item.price === 15 && item.qty > 1) {
      const bundles = Math.floor(item.qty / 2);
      const remaining = item.qty % 2;
      return bundles * 25 + remaining * 15;
    }
    return item.price * item.qty;
  };

  const handleSubmitExtras = async () => {
    if (!scannedStudent || extraItems.length === 0) return;
    try {
      // Send items with their calculated total price or send qty and let backend handle?
      // Our backend now handles qty and special pricing, so we should send qty.
      await onAddExtraItems(scannedStudent.id, extraItems);
      setNotification({
        type: "success",
        message: `Marked ${extraItems.length} item(s) for ${scannedStudent.name}`,
      });
      handleClear();
      setTimeout(() => {
        setNotification(null);
      }, 1500);
    } catch (err) {
      setNotification({
        type: "error",
        message: err.message || "Failed to process order.",
      });
    }
  };

  const totalAmount = extraItems.reduce(
    (sum, item) => sum + calculateItemPrice(item),
    0,
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {notification && (
        <div
          className={`fixed bottom-6 right-6 p-4 rounded-2xl shadow-2xl flex items-center gap-3 z-50 animate-in slide-in-from-right duration-300 ${
            notification.type === "success"
              ? "bg-emerald-600 text-white"
              : "bg-rose-600 text-white"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle size={24} />
          ) : (
            <X size={24} />
          )}
          <span className="font-bold">{notification.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Student Lookup */}
          <Card className="p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-indigo-50 rounded-2xl">
                <Search className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Student Lookup
                </h2>
                <p className="text-slate-500 text-sm">
                  Scan QR or enter details to find student
                </p>
              </div>
            </div>

            {!scannedStudent ? (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <form onSubmit={handleScan} className="flex-1 relative group">
                    <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                      type="text"
                      placeholder="Enter Roll No or Room No..."
                      value={studentIdInput}
                      onChange={(e) => setStudentIdInput(e.target.value)}
                      className="w-full pl-14 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-800 outline-none text-lg"
                      autoFocus
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Button
                        type="submit"
                        disabled={scanLoading}
                        className="py-2 px-4 text-sm rounded-xl"
                      >
                        {scanLoading ? "Wait..." : "Find"}
                      </Button>
                    </div>
                  </form>

                  <Button
                    variant={isScanning ? "danger" : "secondary"}
                    onClick={() => setIsScanning(!isScanning)}
                    className="sm:w-auto px-8"
                    icon={isScanning ? X : QrCode}
                  >
                    {isScanning ? "Close Scanner" : "Scan QR"}
                  </Button>
                </div>

                {isScanning && (
                  <div className="animate-in fade-in zoom-in duration-300">
                    <QRScanner
                      onScanSuccess={(decodedText) => {
                        onStudentScan(decodedText);
                        setIsScanning(false);
                      }}
                      onScanError={(err) => console.warn(err)}
                    />
                    <p className="text-center text-slate-400 text-xs mt-3 font-medium">
                      Point your camera at the student's QR code
                    </p>
                  </div>
                )}

                {error && (
                  <div className="mt-3 flex items-center gap-2 text-rose-600 bg-rose-50 px-4 py-2 rounded-xl text-sm font-medium inline-flex">
                    <X size={16} />
                    <span>{error}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-3xl p-6 border border-indigo-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm text-indigo-600 text-xl font-bold">
                      {scannedStudent.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-800">
                        {scannedStudent.name}
                      </h3>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="info">
                          {scannedStudent.rollNumber}
                        </Badge>
                        <Badge variant="warning">
                          Room {scannedStudent.roomNumber}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 bg-white/60 p-4 rounded-2xl backdrop-blur-sm">
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Balance
                      </p>
                      <p
                        className={`text-xl font-bold ${scannedStudent.balance > 0 ? "text-emerald-600" : "text-slate-800"}`}
                      >
                        ₹{scannedStudent.balance}
                      </p>
                    </div>
                    <div className="h-8 w-px bg-slate-200"></div>
                    <button
                      onClick={handleClear}
                      className="p-2 hover:bg-white rounded-xl transition-colors text-slate-400 hover:text-rose-500"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Menu Items */}
          <Card className="p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-50 rounded-2xl">
                  <UtensilsCrossed className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">
                    Available Menu
                  </h2>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-1">
                    Session:{" "}
                    <span className="text-indigo-600">{sessionMeal}</span>
                  </p>
                </div>
              </div>
              {scannedStudent && extraItems.length > 0 && (
                <Badge variant="success">{extraItems.length} selected</Badge>
              )}
            </div>

            {menuLoading ? (
              <div className="text-center py-12 text-slate-400">
                Loading menu...
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(meals[sessionMeal] || []).map((item) => {
                  const isSelected = extraItems.find((i) => i.id === item.id);
                  const showDelete = showDeleteId === item.id;
                  
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        if (scannedStudent) {
                          toggleExtraItem(item);
                        } else {
                          setShowDeleteId(showDelete ? null : item.id);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      className={`group relative overflow-hidden rounded-2xl border-2 text-left transition-all duration-300 cursor-pointer ${
                        isSelected
                          ? "border-indigo-500 bg-indigo-50/50"
                          : "border-slate-100 bg-white hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/5"
                      } ${!scannedStudent && !showDelete ? "hover:border-rose-200" : ""}`}
                    >
                      <div className="aspect-[4/3] overflow-hidden relative">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-indigo-900/20 flex items-center justify-center backdrop-blur-[2px]">
                            <div className="bg-white rounded-full p-2 text-indigo-600 shadow-xl scale-100 animate-in zoom-in duration-200">
                              <CheckCircle
                                size={24}
                                fill="currentColor"
                                className="text-white"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className={`font-bold transition-colors ${showDelete ? 'text-rose-600' : 'text-slate-800 group-hover:text-indigo-700'}`}>
                            {item.name}
                          </h3>
                          <div className="bg-slate-100 px-2 py-1 rounded-lg text-xs font-bold text-slate-600">
                            ₹{item.price}
                          </div>
                        </div>

                        {showDelete && !scannedStudent && (
                          <div className="flex gap-2 mt-2 animate-in fade-in slide-in-from-top-2 duration-200">
                             <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const newPrice = prompt(`Enter new price for ${item.name}:`, item.price);
                                if (newPrice !== null && !isNaN(newPrice)) {
                                  onEditMeal(sessionMeal, item.id, { price: Number(newPrice) });
                                  setShowDeleteId(null);
                                }
                              }}
                              className="flex-1 py-2 flex items-center justify-center gap-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl transition-colors text-xs font-bold"
                            >
                              <Edit2 size={14} />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm(`Are you sure you want to delete ${item.name}?`)) {
                                  onDeleteMeal(sessionMeal, item.id);
                                  setShowDeleteId(null);
                                }
                              }}
                              className="flex-1 py-2 flex items-center justify-center gap-1 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl transition-colors text-xs font-bold"
                            >
                              <Trash2 size={14} />
                              Delete
                            </button>
                          </div>
                        )}
                        
                        {!scannedStudent && !showDelete && (
                          <p className="text-[10px] text-slate-400 font-medium mt-1">Click to manage</p>
                        )}
                      </div>
                    </div>
                  );
                })}
                {(meals[sessionMeal] || []).length === 0 && (
                  <div className="col-span-full py-12 text-center text-slate-400 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                    No items available for this session.
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar Order Summary */}
        <div className="space-y-6">
          <Card className="p-6 sticky top-8 border-indigo-100 shadow-indigo-100/50">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <ShoppingBag className="text-indigo-600" size={20} />
              Current Order
            </h3>

            {scannedStudent && extraItems.length > 0 ? (
              <>
                <div className="space-y-3 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {extraItems.map((item) => {
                    const itemTotal = calculateItemPrice(item);
                    return (
                      <div
                        key={item.id}
                        className="flex flex-col p-4 bg-slate-50 rounded-2xl group hover:bg-white hover:shadow-md border border-transparent hover:border-slate-100 transition-all gap-3"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-slate-700 font-bold text-sm tracking-tight">
                            {item.name}
                          </span>
                          <button
                            onClick={() => toggleExtraItem(item)}
                            className="text-slate-300 hover:text-rose-500 transition-colors p-1 rounded-lg hover:bg-rose-50"
                          >
                            <X size={16} />
                          </button>
                        </div>

                        <div className="flex justify-between items-center bg-white/50 p-2 rounded-xl border border-slate-100/50">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => updateItemQty(item.id, -1)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-indigo-600 hover:text-white transition-all active:scale-95 disabled:opacity-30"
                              disabled={item.qty <= 1}
                            >
                              -
                            </button>
                            <span className="w-10 text-center font-black text-slate-800">
                              {item.qty}
                            </span>
                            <button
                              onClick={() => updateItemQty(item.id, 1)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-indigo-600 hover:text-white transition-all active:scale-95"
                            >
                              +
                            </button>
                          </div>
                          <div className="text-right">
                            <span className="text-indigo-600 font-black text-sm">
                              ₹{itemTotal}
                            </span>
                            {item.qty > 1 && item.price === 15 && (
                              <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-tighter">
                                Bundle Applied
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-slate-900 rounded-2xl p-5 text-white mb-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
                  <div className="flex justify-between items-end relative z-10">
                    <div>
                      <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-1">
                        Total Amount
                      </p>
                      <p className="text-3xl font-bold">₹{totalAmount}</p>
                    </div>
                    <div className="bg-white/10 p-2 rounded-lg">
                      <DollarSign size={20} />
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleSubmitExtras}
                  variant="success"
                  className="w-full py-4 text-lg shadow-emerald-200"
                >
                  Process Order
                </Button>
              </>
            ) : (
              <div className="text-center py-12 px-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                  <ShoppingBag size={24} />
                </div>
                <p className="text-slate-400 font-medium text-sm">
                  Select a student and add items to create an order.
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
const EMPTY_MEALS = { breakfast: [], lunch: [], snacks: [], dinner: [] };

// ==================== MAIN COMPONENT ====================
const MunshiDashboard = ({ onLogout: onLogoutProp }) => {
  const [sessionMeal, setSessionMeal] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scannedStudent, setScannedStudent] = useState(null);
  const [messOffRequests, setMessOffRequests] = useState([]);
  const [orders, setOrders] = useState([]);
  const [meals, setMeals] = useState(EMPTY_MEALS);
  const [loading, setLoading] = useState(false);
  const [menuLoading, setMenuLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [munshiName, setMunshiName] = useState("");
  const [munshiHostel, setMunshiHostel] = useState("");
  const [isSessionMenuOpen, setIsSessionMenuOpen] = useState(false);


  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "/login";
  };
  const onLogout = onLogoutProp || handleLogout;

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const role = localStorage.getItem("authRole");
    if (!token || role !== "munshi") {
      window.location.href = "/login";
      return;
    }

    try {
      const authUserStr = localStorage.getItem("authUser");
      if (authUserStr) {
        const authData = JSON.parse(authUserStr);
        // Based on Login.jsx, the user object can be in .munshi or .user
        const name = authData.munshi?.name || authData.user?.name || "";
        const hostel = authData.munshi?.hostel || authData.user?.hostel || "";
        setMunshiName(name);
        setMunshiHostel(hostel);
      }
    } catch (err) {
      console.error("Error parsing authUser:", err);
    }

    setAuthChecked(true);
  }, []);

  useEffect(() => {
    if (!authChecked || !sessionMeal) return;
    setMenuLoading(true);
    munshiApi
      .getMenu()
      .then(setMeals)
      .catch(() => setMeals(EMPTY_MEALS))
      .finally(() => setMenuLoading(false));
  }, [authChecked, sessionMeal]);

  const refreshOrders = () =>
    munshiApi
      .getOrders()
      .then(setOrders)
      .catch(() => setOrders([]));
  const refreshMessOffRequests = () =>
    munshiApi
      .getMessOffRequests()
      .then(setMessOffRequests)
      .catch(() => setMessOffRequests([]));

  useEffect(() => {
    if (activeTab === "reports") refreshOrders();
    if (activeTab === "messoffrequest") refreshMessOffRequests();
  }, [activeTab]);

  const handleStudentScan = async (q) => {
    if (!q?.trim()) return null;
    setLoading(true);
    try {
      const student = await munshiApi.lookupStudent(q);
      setScannedStudent(student);
      return student;
    } catch {
      setScannedStudent(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAction = async (id, status, reason) => {
    await munshiApi.updateMessOffStatus(id, status, reason);
    setMessOffRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r)),
    );
  };

  const handleAddExtraItems = async (studentId, items) => {
    await munshiApi.createOrder(studentId, items, sessionMeal);
    refreshOrders();
  };

  const handleAddMeal = async (type, meal) => {
    const response = await munshiApi.addMealItem({ ...meal, mealType: type });
    // Backend returns { mealType, item }, we need just the item
    const newItem = response.item || response;
    setMeals((prev) => ({
      ...prev,
      [type]: [
        ...(prev[type] || []),
        { ...newItem, id: newItem._id || newItem.id || Date.now() },
      ],
    }));
  };

  if (!authChecked)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );


  const handleDeleteMeal = async (mealType, itemId) => {
    try {
      await munshiApi.deleteMealItem(mealType, itemId);
      
      setMeals((prev) => ({
        ...prev,
        [mealType]: prev[mealType].filter((item) => String(item.id) !== String(itemId)),
      }));
    } catch (err) {
      console.error("Failed to delete meal:", err);
      alert("Failed to delete meal item: " + err.message);
    }
  };

  const handleEditMeal = async (mealType, itemId, updates) => {
    try {
      const response = await munshiApi.updateMealItem(mealType, itemId, updates);
      // Backend returns { success, message, data: updatedItem }
       const updatedItem = response.data || response;
      setMeals((prev) => ({
        ...prev,
        [mealType]: prev[mealType].map((item) => 
          (item.id === itemId || item._id === itemId) ? { ...item, ...updatedItem, id: item.id } : item
        ),
      }));
    } catch (err) {
      console.error("Failed to edit meal:", err);
      alert("Failed to update meal item: " + err.message);
    }
  };

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: ShoppingBag },
    { id: "messoffrequest", label: "Mess Off", icon: Calendar },
    { id: "reports", label: "Reports", icon: TrendingUp },
    { id: "addmeal", label: "Add Meal", icon: Plus },
  ];

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-slate-100 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="p-8 h-full flex flex-col">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <UtensilsCrossed size={20} />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              Munshi<span className="text-indigo-600">Dash</span>
            </h1>
          </div>

          {/* New Upper Sidebar Profile Section */}
          <div className="px-2 mb-8 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50 group hover:bg-white hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-indigo-500 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-indigo-200">
                {munshiName ? munshiName.charAt(0).toUpperCase() : "M"}
              </div>
              <div className="overflow-hidden">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-0.5">
                  Munshi Profile
                </p>
                <h4 className="text-sm font-black text-slate-800 truncate leading-tight group-hover:text-indigo-600 transition-colors">
                  {munshiName || "Munshi"}
                </h4>
                <div className="flex items-center gap-1.5 mt-1">
                  <Home size={10} className="text-slate-400" />
                  <p className="text-[10px] font-bold text-slate-500 truncate">
                    {munshiHostel || "Hostel"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <nav className="space-y-2 flex-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
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

          <div className="mt-auto pt-8 border-t border-slate-100 flex flex-col gap-4">
            {/* Current Session Indicator */}
            <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3 border border-slate-100/50">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-500 font-bold shadow-sm">
                <Calendar size={18} />
              </div>
              <div className="overflow-hidden">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Session
                </p>
                <p className="text-xs text-slate-700 font-bold capitalize truncate">
                  {sessionMeal}
                </p>
              </div>
            </div>

            <button
              onClick={onLogout}
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
      <main className="flex-1 md:ml-72 min-h-screen relative">

        
        {/* Header */}
        <header className="sticky top-0 z-20 bg-[#F8FAFC]/80 backdrop-blur-md px-8 py-5 flex items-center justify-between">
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 text-slate-600 hover:bg-white rounded-xl transition-colors"
            >
              <Menu size={24} />
            </button>
          </div>

          <div className="hidden md:block">
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
              {tabs.find((t) => t.id === activeTab)?.label}
            </h2>
            <p className="text-slate-400 text-sm font-medium">
              Manage your mess operations efficiently
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* SESSION DROPDOWN */}
            <div className="relative">
              <button
                onClick={() => setIsSessionMenuOpen(!isSessionMenuOpen)}
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:border-indigo-200 hover:text-indigo-600 transition-all shadow-sm"
              >
                <Calendar size={16} />
                <span className="capitalize">{sessionMeal || "Select Session"}</span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${isSessionMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {isSessionMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                  {["breakfast", "lunch", "snacks", "dinner"].map((meal) => (
                    <button
                      key={meal}
                      onClick={() => {
                        setSessionMeal(meal);
                        setIsSessionMenuOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors flex items-center justify-between ${
                        sessionMeal === meal
                          ? "bg-indigo-50 text-indigo-600"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <span className="capitalize">{meal}</span>
                      {sessionMeal === meal && <CheckCircle size={14} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="w-10 h-10 bg-white rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm">
              <Bell size={20} />
            </div>
          </div>
        </header>

        <div className="p-6 md:p-8 md:pt-4 pb-24 max-w-7xl mx-auto">
          {activeTab === "dashboard" && (
            <DashboardView
              sessionMeal={sessionMeal}
              onStudentScan={handleStudentScan}
              scannedStudent={scannedStudent}
              clearScannedStudent={() => setScannedStudent(null)}
              onAddExtraItems={handleAddExtraItems}
              meals={meals}
              scanLoading={loading}
              menuLoading={menuLoading}
              munshiName={munshiName}
              munshiHostel={munshiHostel}
              onEditMeal={handleEditMeal}
            />
          )}
          {activeTab === "messoffrequest" && (
            <MessOffRequestsPage
              requests={messOffRequests}
              handleAction={handleRequestAction}
            />
          )}
          {activeTab === "reports" && <ReportsPage orders={orders} />}
          {activeTab === "addmeal" && <AddMealPage onAddMeal={handleAddMeal} />}
        </div>
      </main>
    </div>
  );
};

export default MunshiDashboard;
