import React, { useState } from 'react';
import { API_BASE_URL } from '../../config';
import { AlertCircle, CheckCircle, Send, X, ShieldAlert } from 'lucide-react';

const ComplaintForm = ({ token, onClose, onSuccess }) => {
    const [category, setCategory] = useState('');
    const [message, setMessage] = useState('');
    const [isDirectToWarden, setIsDirectToWarden] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const categories = [
        'Food Quality',
        'Quantity',
        'Hygiene',
        'Mess Staff Behavior',
        'Other'
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!category) {
            setError('Please select a category');
            return;
        }
        if (!message) {
            setError('Please describe your concern');
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

            if (onSuccess) onSuccess();
            if (onClose) onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-lg w-full">
            <div className="p-6 bg-rose-600 text-white flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-xl">
                        <AlertCircle size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">Register Complaint</h2>
                        <p className="text-rose-100 text-xs mt-0.5 font-medium">Your grievance will be handled seriously</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <X size={20} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Issue Category</label>
                    <div className="grid grid-cols-2 gap-2">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => setCategory(cat)}
                                className={`px-4 py-3 rounded-xl text-xs font-bold transition-all border-2 ${
                                    category === cat 
                                        ? 'bg-rose-50 border-rose-500 text-rose-600' 
                                        : 'bg-slate-50 border-transparent text-slate-500 hover:bg-slate-100'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Please provide details about your complaint..."
                        className="w-full px-4 py-4 bg-slate-50 border-2 border-transparent focus:border-rose-500 focus:bg-white rounded-2xl h-32 resize-none transition-all outline-none text-slate-700 text-sm"
                        required
                    />
                </div>

                <div className="flex items-center justify-between p-4 bg-amber-50 rounded-2xl border border-amber-100 group">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 text-amber-600 rounded-lg group-hover:scale-110 transition-transform">
                            <ShieldAlert size={20} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-amber-900 leading-none mb-1">Direct to Warden</p>
                            <p className="text-[10px] text-amber-700 font-medium tracking-wide leading-tight">Flag as critical for administration</p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={isDirectToWarden}
                            onChange={(e) => setIsDirectToWarden(e.target.checked)}
                            className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
                    </label>
                </div>

                {error && (
                    <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 animate-pulse">
                        <AlertCircle size={20} className="shrink-0" />
                        <p className="text-sm font-bold">{error}</p>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-rose-200 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                            <Send size={18} />
                            Submit Complaint
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default ComplaintForm;
