import React, { useState } from 'react';
import { AlertCircle, ShieldAlert, Send, CheckCircle, MessageSquare, ChevronRight, Info } from 'lucide-react';
import { API_BASE_URL } from '../../config';

const StudentComplaint = ({ token, onSuccess }) => {
    const [category, setCategory] = useState('');
    const [message, setMessage] = useState('');
    const [isDirectToWarden, setIsDirectToWarden] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    const categories = [
        { id: 'Food Quality', label: 'Food Quality', icon: '🍲' },
        { id: 'Quantity', label: 'Quantity', icon: '⚖️' },
        { id: 'Hygiene', label: 'Hygiene', icon: '🧼' },
        { id: 'Mess Staff Behavior', label: 'Staff Behavior', icon: '👥' },
        { id: 'Other', label: 'Other Issues', icon: '📋' }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!category) {
            setError('Please select a category for your grievance');
            return;
        }
        if (!message || message.length < 10) {
            setError('Please provide a more detailed description (min 10 characters)');
            return;
        }

        setLoading(true);
        try {
            const API_URL = `${API_BASE_URL}/complaint/submit`;
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    category,
                    message,
                    isDirectToWarden
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to submit complaint');
            }

            setShowSuccess(true);
            if (onSuccess) onSuccess();
            
            // Reset form after 3 seconds
            setTimeout(() => {
                setShowSuccess(false);
                setCategory('');
                setMessage('');
                setIsDirectToWarden(false);
            }, 3000);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (showSuccess) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-emerald-100">
                    <CheckCircle size={48} strokeWidth={2.5} />
                </div>
                <h2 className="text-3xl font-black text-slate-800 mb-2">Complaint Submitted!</h2>
                <p className="text-slate-500 font-medium text-center max-w-md">
                    Your grievance has been registered successfully. The administration will look into it promptly.
                </p>
                <div className="mt-8 flex gap-4">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                        <div className="p-2.5 bg-[#1464aa] text-white rounded-2xl shadow-lg shadow-blue-100">
                            <MessageSquare size={28} strokeWidth={2.5} />
                        </div>
                        Grievance Portal
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium flex items-center gap-2">
                         Your identity will remain confidential with the warden.
                    </p>
                </div>

            </div>

            <div className="max-w-3xl mx-auto">
                {/* Form Section */}
                <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-50 p-8 md:p-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-40 -mr-20 -mt-20 pointer-events-none"></div>
                    
                    <form onSubmit={handleSubmit} className="relative z-10 space-y-8">
                        {/* Category Selection */}
                        <div>
                            <label className="block text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-1">
                                Select Category
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {categories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => setCategory(cat.id)}
                                        className={`flex flex-col items-center justify-center p-4 rounded-[1.5rem] border-2 transition-all duration-300 group ${
                                            category === cat.id 
                                                ? 'bg-[#1464aa] border-[#1464aa] text-white shadow-lg shadow-blue-200 scale-[1.02]' 
                                                : 'bg-slate-50 border-transparent text-slate-600 hover:bg-white hover:border-blue-100 hover:shadow-md'
                                        }`}
                                    >
                                        <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">{cat.icon}</span>
                                        <span className="text-xs font-bold tracking-tight">{cat.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Description Textarea */}
                        <div>
                            <label className="block text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-1">
                                Detailed Description
                            </label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Tell us exactly what happened... (e.g., date, time, meal type)"
                                className="w-full px-6 py-5 bg-slate-50 border-2 border-transparent focus:border-[#1464aa] focus:bg-white rounded-3xl h-48 resize-none transition-all outline-none text-slate-700 font-medium shadow-sm"
                            />
                        </div>

                        {/* Critical Flag Toggle */}
                        <div className={`flex items-center justify-between p-6 rounded-3xl border transition-all duration-500 ${isDirectToWarden ? 'bg-orange-50 border-orange-200 shadow-inner' : 'bg-slate-50 border-transparent'}`}>
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-2xl transition-colors duration-500 ${isDirectToWarden ? 'bg-orange-100 text-orange-600' : 'bg-slate-200 text-slate-400'}`}>
                                    <ShieldAlert size={24} />
                                </div>
                                <div className="pr-4 border-r border-slate-200">
                                    <p className={`text-sm font-black tracking-tight ${isDirectToWarden ? 'text-orange-900' : 'text-slate-600'}`}>Direct to Warden</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 whitespace-nowrap">High Priority Flag</p>
                                </div>
                                <p className="text-[10px] text-slate-500 font-medium max-w-[120px] leading-tight hidden sm:block">
                                    Use this only for serious issues that require immediate attention.
                                </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={isDirectToWarden}
                                    onChange={(e) => setIsDirectToWarden(e.target.checked)}
                                    className="sr-only peer" 
                                />
                                <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-7 after:transition-all peer-checked:bg-[#E28122]"></div>
                            </label>
                        </div>

                        {error && (
                            <div className="p-5 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 animate-pulse">
                                <AlertCircle size={24} className="shrink-0" />
                                <p className="text-sm font-bold tracking-tight">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-5 rounded-3xl font-black text-white flex items-center justify-center gap-3 shadow-xl transition-all active:scale-[0.98] disabled:opacity-50 group ${isDirectToWarden ? 'bg-orange-600 shadow-orange-100' : 'bg-[#1464aa] shadow-blue-100'}`}
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span>SUBMIT GRIEVANCE</span>
                                    <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default StudentComplaint;
