
// --- IMPORTS ---
import React, { useState, useEffect } from 'react';
import { Home, BarChart2, CalendarOff, LogOut, Menu, X, QrCode, Download, FileText, ThumbsUp, Meh, ThumbsDown, Angry, MessageSquare, UtensilsCrossed, Bell, User, ChevronRight, Activity, DollarSign, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';

// --- API SERVICE LAYER ---
const API_BASE_URL = 'http://localhost:5000/api';

const apiService = {
  fetchStudentData: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/student/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch student data');
      const data = await response.json();
      return data.success ? data.student : data;
    } catch (error) {
      console.error('Error fetching student data:', error);
      throw error;
    }
  },
  fetchMealHistory: async (token, month = null) => {
    try {
      const url = month !== null ? `${API_BASE_URL}/student/meals?month=${month}` : `${API_BASE_URL}/student/meals`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch meal history');
      return await response.json();
    } catch (error) {
      console.error('Error fetching meal history:', error);
      throw error;
    }
  },
  fetchMessOffRequests: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/mess-off/my-applications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch mess off requests');
      const data = await response.json();
      return Array.isArray(data) ? data : data.data || [];
    } catch (error) {
      console.error('Error fetching mess off requests:', error);
      throw error;
    }
  },
  submitMessOff: async (token, data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/mess-off/apply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to submit mess off application');
      return await response.json();
    } catch (error) {
      console.error('Error submitting mess off:', error);
      throw error;
    }
  },
  submitFeedback: async (token, data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/feedback/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to submit feedback');
      return await response.json();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw error;
    }
  },
  fetchMenu: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/menu/current`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch menu');
      const data = await response.json();
      if (data && data.data) return data.data;
      return data;
    } catch (error) {
      console.error('Error fetching menu:', error);
      throw error;
    }
  },
  downloadReport: async (token, month) => {
    try {
      const response = await fetch(`${API_BASE_URL}/student/report/download?month=${month}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to download report');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `meal-report-${month}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading report:', error);
      throw error;
    }
  }
};

// --- NAVIGATION COMPONENT ---
const NavItem = ({ icon, text, active, onClick, badge }) => (
    <li>
        <button 
            onClick={onClick} 
            className={`w-full flex items-center px-4 py-3.5 my-1 rounded-xl transition-all duration-300 group ${
                active 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/50 scale-105' 
                    : 'text-gray-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100'
            }`}
        >
            <span className={`${active ? 'text-white' : 'text-gray-400 group-hover:text-blue-600'} transition-colors`}>
                {icon}
            </span>
            <span className="ml-3 font-semibold text-sm">{text}</span>
            {badge && <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">{badge}</span>}
            {active && <ChevronRight className="ml-auto" size={18} />}
        </button>
    </li>
);

// --- LOADING COMPONENT ---
const LoadingSpinner = ({ message = "Loading..." }) => (
    <div className="flex flex-col items-center justify-center h-full py-12">
        <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-indigo-600 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
        </div>
        <p className="mt-4 text-gray-600 font-medium">{message}</p>
    </div>
);

// --- DASHBOARD HOME ---
const StudentHome = ({ student, token }) => {
    const [mealHistory, setMealHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const meals = await apiService.fetchMealHistory(token);
                setMealHistory(Array.isArray(meals) ? meals.slice(0, 5) : []);
            } catch (error) {
                console.error('Error loading dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [token]);

    const avgMealCost = student.mealCount > 0 ? (student.bill / student.mealCount).toFixed(2) : 0;
    
    const stats = [
        { 
            label: 'Total Bill', 
            value: `₹${student.bill || 0}`, 
            icon: <DollarSign size={24} />, 
            gradient: 'from-blue-500 to-blue-600',
            bgGradient: 'from-blue-50 to-blue-100',
            change: '+12%',
            changePositive: false
        },
        { 
            label: 'Total Meals', 
            value: student.mealCount || 0, 
            icon: <UtensilsCrossed size={24} />, 
            gradient: 'from-green-500 to-emerald-600',
            bgGradient: 'from-green-50 to-green-100',
            change: '+5',
            changePositive: true
        },
        { 
            label: 'Avg per Meal', 
            value: `₹${avgMealCost}`, 
            icon: <Activity size={24} />, 
            gradient: 'from-purple-500 to-purple-600',
            bgGradient: 'from-purple-50 to-purple-100',
            change: '-3%',
            changePositive: true
        }
    ];

    return (
        <div className="space-y-8">
            <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white rounded-3xl p-8 shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full -mr-48 -mt-48"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -ml-32 -mb-32"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight">
                            Welcome back, {student.name.split(' ')[0]}! 👋
                        </h1>
                        <p className="text-blue-100 text-lg font-medium">
                            Your mess management dashboard is ready
                        </p>
                    </div>
                    <div className="mt-6 md:mt-0 bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 border border-white border-opacity-20">
                        <div className="text-sm text-blue-100 mb-1">Student ID</div>
                        <div className="text-3xl font-bold mb-2">{student.rollNo}</div>
                        <div className="flex items-center text-sm text-blue-100">
                            <Calendar size={14} className="mr-2" />
                            {student.hostelNo} • Room {student.roomNo}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:-translate-y-1">
                        <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-50`}></div>
                        <div className="relative p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                                    <div className="text-white">{stat.icon}</div>
                                </div>
                                <div className={`px-2 py-1 rounded-full text-xs font-bold ${stat.changePositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {stat.change}
                                </div>
                            </div>
                            <p className="text-sm font-semibold text-gray-600 mb-1">{stat.label}</p>
                            <p className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</p>
                            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                                <div className={`h-full bg-gradient-to-r ${stat.gradient} rounded-full transition-all duration-500 group-hover:w-full`} style={{ width: '60%' }}></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    {loading ? (
                        <div className="bg-white rounded-2xl shadow-lg p-6"><LoadingSpinner message="Loading meal history..." /></div>
                    ) : (
                        <StudentReports mealHistory={mealHistory} studentName={student.name} isSummary={true} token={token} />
                    )}
                </div>
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl p-6 border border-gray-200">
                        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg mr-3"><QrCode className="text-blue-600" size={20} /></div>
                            Your Mess QR Code
                        </h3>
                        <div className="flex justify-center mb-6">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-2xl blur-xl opacity-30"></div>
                                <div className="relative w-52 h-52 bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center rounded-2xl border-4 border-white shadow-2xl">
                                    <QrCode size={160} className="text-blue-600"/>
                                </div>
                            </div>
                        </div>
                        <div className="text-center bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                            <p className="text-xs text-gray-500 mb-1 font-semibold">QR Code ID</p>
                            <p className="text-sm font-mono font-bold text-gray-800 tracking-wider">{student.qrCode}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- FEEDBACK COMPONENT ---
const StudentFeedback = ({ token }) => { 
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
    const [selectedMealType, setSelectedMealType] = useState('');
    const [selectedMealName, setSelectedMealName] = useState('');
    const [rating, setRating] = useState('');
    const [comment, setComment] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [menu, setMenu] = useState({});
    
    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const menuData = await apiService.fetchMenu(token);
                setMenu(menuData);
            } catch (error) {
                console.error('Error loading menu:', error);
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
            await apiService.submitFeedback(token, { date: selectedDate, mealType: selectedMealType, mealItem: selectedMealName, rating, comment });
            setSubmitted(true);
            setTimeout(() => {
                setSubmitted(false);
                setSelectedMealType('');
                setSelectedMealName('');
                setRating('');
                setComment('');
            }, 3000);
        } catch (error) {
            alert('Failed to submit feedback. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const ratingOptions = [
        { value: 'Good', icon: <ThumbsUp size={32}/>, gradient: 'from-green-500 to-emerald-600', bg: 'from-green-50 to-emerald-50' },
        { value: 'Average', icon: <Meh size={32}/>, gradient: 'from-blue-500 to-blue-600', bg: 'from-blue-50 to-blue-50' },
        { value: 'Bad', icon: <ThumbsDown size={32}/>, gradient: 'from-yellow-500 to-orange-500', bg: 'from-yellow-50 to-orange-50' },
        { value: 'Very Bad', icon: <Angry size={32}/>, gradient: 'from-red-500 to-red-600', bg: 'from-red-50 to-red-50' },
    ];
    
    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 border border-gray-100">
                <div className="flex items-center mb-8">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mr-4 shadow-lg"><MessageSquare className="text-white" size={28} /></div>
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800">Submit Meal Feedback</h2>
                        <p className="text-gray-600 mt-1">Help us improve your dining experience</p>
                    </div>
                </div>
                {submitted ? (
                    <div className="text-center py-16">
                        <div className="relative inline-block mb-6">
                            <div className="absolute inset-0 bg-green-400 rounded-full blur-2xl opacity-30 animate-pulse"></div>
                            <div className="relative bg-gradient-to-br from-green-400 to-emerald-500 w-24 h-24 rounded-full flex items-center justify-center shadow-2xl"><CheckCircle className="text-white" size={48} /></div>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-800 mb-3">Thank You!</h3>
                        <p className="text-gray-600 text-lg">Your valuable feedback has been submitted successfully.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-3">Select Date</label>
                                <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"/>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-3">Meal Type</label>
                                <select value={selectedMealType} onChange={(e) => { setSelectedMealType(e.target.value); setSelectedMealName(''); }} className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all">
                                    <option value="">Select meal type</option>
                                    <option value="breakfast">Breakfast</option>
                                    <option value="lunch">Lunch</option>
                                    <option value="snacks">Snacks</option>
                                    <option value="dinner">Dinner</option>
                                </select>
                            </div>
                        </div>
                        {selectedMealType && mealItems.length > 0 && (
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-gray-700 mb-3">Specific Item (Optional)</label>
                                <select value={selectedMealName} onChange={(e) => setSelectedMealName(e.target.value)} className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all">
                                    <option value="">Select an item...</option>
                                    {mealItems.map(item => <option key={item.name} value={item.name}>{item.name}</option>)}
                                </select>
                            </div>
                        )}
                        <div className="mb-8">
                            <label className="block text-sm font-bold text-gray-700 mb-4">Rate Your Experience</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {ratingOptions.map((option) => (
                                    <button key={option.value} onClick={() => setRating(option.value)} className={`relative flex flex-col items-center p-6 rounded-2xl border-2 transition-all duration-300 ${rating === option.value ? `bg-gradient-to-br ${option.bg} border-transparent shadow-2xl scale-110 -translate-y-2` : `border-gray-200 hover:border-gray-300 hover:shadow-xl hover:scale-105 bg-white`}`}>
                                        {rating === option.value && <div className={`absolute -top-2 -right-2 bg-gradient-to-br ${option.gradient} w-8 h-8 rounded-full flex items-center justify-center shadow-lg`}><CheckCircle className="text-white" size={18} /></div>}
                                        <div className={`${rating === option.value ? `bg-gradient-to-br ${option.gradient}` : 'bg-gray-100'} p-4 rounded-xl mb-3 transition-all`}><div className={rating === option.value ? 'text-white' : 'text-gray-400'}>{option.icon}</div></div>
                                        <span className={`text-sm font-bold ${rating === option.value ? 'text-gray-800' : 'text-gray-600'}`}>{option.value}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="mb-8">
                            <label className="block text-sm font-bold text-gray-700 mb-3">Additional Comments</label>
                            <textarea value={comment} onChange={(e) => setComment(e.target.value)} className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all resize-none" rows="5" placeholder="Share your experience..."></textarea>
                        </div>
                        <button onClick={handleSubmit} disabled={loading} className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold py-5 rounded-xl hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 transition-all shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg">
                            {loading ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>Submitting...</> : <>Submit Feedback<ChevronRight className="ml-2" size={20} /></>}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

// --- REPORTS COMPONENT ---
const StudentReports = ({ mealHistory, studentName, isSummary = false, token }) => {
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [filteredHistory, setFilteredHistory] = useState(mealHistory);
    const [loading, setLoading] = useState(false);
    const [downloading, setDownloading] = useState(false);

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const availableMonths = [...new Set(mealHistory.map(meal => new Date(meal.date).getMonth()))];

    useEffect(() => {
        if (!isSummary) {
            const fetchMonthData = async () => {
                setLoading(true);
                try {
                    const data = await apiService.fetchMealHistory(token, selectedMonth);
                    setFilteredHistory(Array.isArray(data) ? data : []);
                } catch (error) {
                    console.error('Error fetching month data:', error);
                    setFilteredHistory([]);
                } finally {
                    setLoading(false);
                }
            };
            fetchMonthData();
        } else {
            setFilteredHistory(mealHistory);
        }
    }, [selectedMonth, isSummary, token, mealHistory]);
    
    const handleDownloadPdf = async () => { 
        setDownloading(true);
        try {
            await apiService.downloadReport(token, selectedMonth);
        } catch (error) {
            alert('Failed to download report.');
        } finally {
            setDownloading(false);
        }
    };

    const getMealTypeStyle = (type) => {
        const styles = {
            'Breakfast': { bg: 'from-yellow-100 to-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
            'Lunch': { bg: 'from-green-100 to-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
            'Snacks': { bg: 'from-purple-100 to-pink-100', text: 'text-purple-700', border: 'border-purple-200' },
            'Dinner': { bg: 'from-blue-100 to-indigo-100', text: 'text-blue-700', border: 'border-blue-200' },
        };
        return styles[type] || { bg: 'from-gray-100 to-gray-200', text: 'text-gray-700', border: 'border-gray-200' };
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b">
                <div className="flex flex-wrap justify-between items-center">
                    <div className="flex items-center mb-4 md:mb-0">
                        <div className="p-2 bg-blue-600 rounded-xl mr-3"><BarChart2 className="text-white" size={24} /></div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">{isSummary ? "Recent Meal History" : "Detailed Meal Reports"}</h2>
                            <p className="text-sm text-gray-600">Track your dining activity</p>
                        </div>
                    </div>
                    {!isSummary && availableMonths.length > 0 && (
                        <div className="flex items-center gap-3">
                            <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))} className="px-4 py-2 border-2 border-gray-200 rounded-xl bg-white text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                {availableMonths.map(month => <option key={month} value={month}>{monthNames[month]}</option>)}
                            </select>
                            <button onClick={handleDownloadPdf} disabled={downloading || filteredHistory.length === 0} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2 rounded-xl hover:from-blue-700 hover:to-indigo-700 flex items-center gap-2 font-medium transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                                {downloading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div></> : <><Download size={18}/> Export PDF</>}
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <div className="overflow-x-auto">
                {loading ? (
                    <div className="p-8"><LoadingSpinner message="Loading meals..." /></div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                                <th className="text-left p-4 text-sm font-bold text-gray-700">Date</th>
                                <th className="text-left p-4 text-sm font-bold text-gray-700">Meal Type</th>
                                <th className="text-left p-4 text-sm font-bold text-gray-700">Items Ordered</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredHistory.length > 0 ? filteredHistory.map((meal, index) => { 
                                const style = getMealTypeStyle(meal.type);
                                return (
                                    <tr key={index} className="border-b hover:bg-blue-50 transition-colors">
                                        <td className="p-4 text-sm text-gray-700 font-medium">{meal.date}</td>
                                        <td className="p-4"><span className={`px-3 py-1.5 text-xs font-bold rounded-full border-2 bg-gradient-to-r ${style.bg} ${style.text} ${style.border}`}>{meal.type}</span></td>
                                        <td className="p-4 text-sm text-gray-600">
                                            {meal.items && meal.items.length > 0 ? (
                                                meal.items.map((item, idx) => (
                                                    <span key={idx} className="inline-block mr-2 mb-1">
                                                        {item.name} <span className="text-gray-400 font-semibold">×{item.qty}</span>
                                                        {idx < meal.items.length - 1 ? ',' : ''}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-gray-400">No items</span>
                                            )}
                                        </td>
                                    </tr>
                                ); 
                            }) : <tr><td colSpan="3" className="text-center p-12"><FileText size={48} className="mx-auto mb-4 text-gray-300"/><p className="text-gray-500 font-medium">No meal records found</p></td></tr>}
                        </tbody>
                    </table>
                )}
            </div>
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
                console.error('Error loading mess off requests:', error);
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
            console.error('Error refreshing requests:', error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center mb-6">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mr-4 shadow-lg"><CalendarOff className="text-white" size={28} /></div>
                <div><h1 className="text-3xl font-bold text-gray-800">Mess Off Application</h1><p className="text-gray-600 mt-1">Apply for leave and track your applications</p></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"> 
                <MessOffForm token={token} onSubmitSuccess={refreshRequests} /> 
                <MessOffStatus requests={requests} loading={loading} /> 
            </div> 
        </div>
    );
};

const MessOffForm = ({ token, onSubmitSuccess }) => {
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [meals, setMeals] = useState([]);
    const [reason, setReason] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleMealToggle = (meal) => { 
        setMeals(prev => prev.includes(meal) ? prev.filter(m => m !== meal) : [...prev, meal]); 
    };

    const handleSubmit = async () => {
        if (!fromDate || !toDate || meals.length === 0) { 
            alert('Please fill in all required fields'); 
            return; 
        }
        setSubmitting(true);
        try {
            await apiService.submitMessOff(token, { fromDate, toDate, meals, reason });
            alert('Mess off application submitted successfully!');
            setFromDate(''); 
            setToDate(''); 
            setMeals([]); 
            setReason('');
            if (onSubmitSuccess) onSubmitSuccess();
        } catch (error) {
            alert('Failed to submit application. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100"> 
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center"><CalendarOff className="mr-2 text-blue-600" size={22} />Apply for Mess Leave</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"> 
                <div><label className="block text-sm font-bold text-gray-700 mb-2">From Date</label><input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"/></div> 
                <div><label className="block text-sm font-bold text-gray-700 mb-2">To Date</label><input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"/></div> 
            </div> 
            <div className="mb-6"> 
                <label className="block text-sm font-bold text-gray-700 mb-3">Select Meals to Skip</label> 
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3"> 
                    {['Breakfast', 'Lunch', 'Dinner'].map(meal => (
                        <label key={meal} className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${meals.includes(meal) ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}>
                            <input type="checkbox" checked={meals.includes(meal)} onChange={() => handleMealToggle(meal)} className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 mr-3"/><span className="font-semibold text-gray-700">{meal}</span>
                        </label>
                    ))}
                </div> 
            </div> 
            <div className="mb-6"><label className="block text-sm font-bold text-gray-700 mb-2">Reason (Optional)</label><textarea value={reason} onChange={(e) => setReason(e.target.value)} className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all resize-none" rows="3" placeholder="Enter your reason..."></textarea></div> 
            <button onClick={handleSubmit} disabled={submitting} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center transition-all hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed">
                {submitting ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>Submitting...</> : <>Submit Application<ChevronRight className="ml-2" size={20} /></>}
            </button>
        </div>
    );
};

const MessOffStatus = ({ requests, loading }) => {
    const getStatusStyle = (status) => {
        const styles = {
            'Approved': { bg: 'from-green-100 to-emerald-100', text: 'text-green-700', border: 'border-green-200', icon: <CheckCircle size={16} /> },
            'Pending': { bg: 'from-yellow-100 to-orange-100', text: 'text-yellow-700', border: 'border-yellow-200', icon: <Clock size={16} /> },
            'Rejected': { bg: 'from-red-100 to-red-100', text: 'text-red-700', border: 'border-red-200', icon: <XCircle size={16} /> },
        };
        return styles[status] || { bg: 'from-gray-100 to-gray-200', text: 'text-gray-700', border: 'border-gray-200', icon: null };
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100"> 
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center"><FileText className="mr-2 text-blue-600" size={22} />Application History</h2>
            {loading ? (
                <LoadingSpinner message="Loading applications..." />
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                                <th className="text-left p-3 text-sm font-bold text-gray-700">From</th>
                                <th className="text-left p-3 text-sm font-bold text-gray-700">To</th>
                                <th className="text-left p-3 text-sm font-bold text-gray-700">Meals</th>
                                <th className="text-left p-3 text-sm font-bold text-gray-700">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.length > 0 ? requests.map((req, index) => { 
                                const style = getStatusStyle(req.status); 
                                return (
                                    <tr key={index} className="border-b hover:bg-gray-50 transition-colors">
                                        <td className="p-3 text-sm text-gray-700">{req.fromDate || req.from}</td>
                                        <td className="p-3 text-sm text-gray-700">{req.toDate || req.to}</td>
                                        <td className="p-3 text-sm text-gray-600">{Array.isArray(req.meals) ? req.meals.join(', ') : req.meals}</td>
                                        <td className="p-3">
                                            <span className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-full border-2 bg-gradient-to-r ${style.bg} ${style.text} ${style.border}`}>
                                                {style.icon}{req.status}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan="4" className="text-center p-8">
                                        <FileText size={40} className="mx-auto mb-2 text-gray-300"/>
                                        <p className="text-gray-500">No applications found</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

// --- MAIN DASHBOARD COMPONENT ---
function StudentDashboard() {
    const [student, setStudent] = useState(null);
    const [token, setToken] = useState(null);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState('');
    const [activePage, setActivePage] = useState('home');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Check if user is logged in as student (redirect munshi to munshi dashboard)
    useEffect(() => {
        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('authUser');
        const storedRole = localStorage.getItem('authRole');

        if (storedRole === 'munshi') {
            window.location.href = '/munshi/dashboard';
            return;
        }

        if (storedToken && storedUser) {
            try {
                const userData = JSON.parse(storedUser);
                setStudent(userData.student);
                setToken(storedToken);
            } catch (e) {
                console.error('Error parsing stored user data:', e);
                localStorage.removeItem('authToken');
                localStorage.removeItem('authUser');
                localStorage.removeItem('authRole');
                window.location.href = '/login';
            }
        } else {
            window.location.href = '/login';
        }

        setInitialLoading(false);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        localStorage.removeItem('authRole');
        sessionStorage.removeItem('authUser');
        setStudent(null);
        setToken(null);
        window.location.href = '/login';
    };

    if (initialLoading) {
        return (
            <div className="flex items-center justify-center h-screen w-full bg-gray-100">
                <LoadingSpinner message="Loading dashboard..." />
            </div>
        );
    }

    if (!student || !token) {
        return (
            <div className="flex items-center justify-center h-screen w-full bg-gray-100">
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200 text-center max-w-md">
                    <p className="text-red-600 font-semibold mb-2">Unable to load student data.</p>
                    <p className="text-gray-600 text-sm mb-4">Please check that the backend is running and try refreshing the page.</p>
                    <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold">Reload</button>
                </div>
            </div>
        );
    }

    const renderContent = () => {
        switch (activePage) {
            case 'home': 
                return <StudentHome student={student} token={token} />;
            case 'reports': 
                return <StudentReports mealHistory={student.mealHistory || []} studentName={student.name} token={token} />;
            case 'messOff': 
                return <MessOffPage studentName={student.name} token={token} />;
            case 'feedback': 
                return <StudentFeedback token={token} />;
            default: 
                return <StudentHome student={student} token={token} />;
        }
    };

    return (
        <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-sans overflow-hidden">
            <aside className={`bg-white w-72 fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out z-50 shadow-2xl flex flex-col`}>
                <div className="p-6 border-b bg-gradient-to-r from-blue-600 to-indigo-700">
                    <div className="flex items-center justify-between text-white">
                        <div className="flex items-center">
                            <div className="bg-white bg-opacity-20 p-2 rounded-xl mr-3">
                                <UtensilsCrossed size={28} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">MessHub</h1>
                                <p className="text-xs text-blue-100">Student Portal</p>
                            </div>
                        </div>
                        <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-2 rounded-lg transition-all">
                            <X size={24} />
                        </button>
                    </div>
                </div>
                <div className="p-6 border-b bg-gradient-to-br from-gray-50 to-white">
                    <div className="flex items-center">
                        <img src={student.photo} alt={student.name} className="w-16 h-16 rounded-full border-4 border-blue-100 shadow-lg"/>
                        <div className="ml-4 flex-1">
                            <h2 className="font-bold text-gray-800 text-lg">{student.name}</h2>
                            <p className="text-sm text-gray-500">{student.rollNo}</p>
                        </div>
                    </div>
                </div>
                <nav className="flex-1 p-4 overflow-y-auto">
                    <ul className="space-y-1">
                        <NavItem icon={<Home size={20} />} text="Dashboard" active={activePage === 'home'} onClick={() => { setActivePage('home'); setIsSidebarOpen(false); }} />
                        <NavItem icon={<BarChart2 size={20} />} text="Reports" active={activePage === 'reports'} onClick={() => { setActivePage('reports'); setIsSidebarOpen(false); }} />
                        <NavItem icon={<CalendarOff size={20} />} text="Mess Off" active={activePage === 'messOff'} onClick={() => { setActivePage('messOff'); setIsSidebarOpen(false); }} />
                        <NavItem icon={<MessageSquare size={20} />} text="Feedback" active={activePage === 'feedback'} onClick={() => { setActivePage('feedback'); setIsSidebarOpen(false); }} />
                    </ul>
                </nav>
                <div className="p-4 border-t bg-gray-50">
                    <button onClick={handleLogout} className="w-full flex items-center justify-center px-4 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all font-semibold shadow-sm">
                        <LogOut size={20} className="mr-2" />Logout
                    </button>
                </div>
            </aside>
            {isSidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white shadow-md border-b z-30">
                    <div className="flex items-center justify-between p-4">
                        <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 hover:bg-gray-100 rounded-xl">
                            <Menu size={24} className="text-gray-700" />
                        </button>
                        <div className="hidden md:block">
                            <h1 className="text-xl font-bold text-gray-800 uppercase tracking-wide">{activePage}</h1>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors relative">
                                <Bell size={22} className="text-gray-600" />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                            </button>
                            <div className="hidden sm:flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-xl">
                                <User size={18} className="text-gray-600" />
                                <span className="text-sm font-medium text-gray-700">{student.name.split(' ')[0]}</span>
                            </div>
                        </div>
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100">
                    <div className="p-4 md:p-8">{renderContent()}</div>
                </main>
            </div>
        </div>
    );
}

export default StudentDashboard;