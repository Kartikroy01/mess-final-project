import React, { useState, useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Fallback when API is down or no data
const FALLBACK_HOSTELS = {
  boys: ["MBH", "BH-1", "BH-2", "BH-3", "BH-4", "BH-5", "BH-6", "BH-7"],
  girls: ["GH-1", "GH-2", "MGH-1", "MGH-2"],
};

export default function Menu() {
  const [hostelType, setHostelType] = useState("boys");
  const [selectedHostel, setSelectedHostel] = useState(FALLBACK_HOSTELS.boys[0]);
  const [menuPage, setMenuPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`${API_BASE}/menu/public`)
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        if (!json.success || !json.data) {
          setError(json.message || "Invalid response");
          return;
        }
        setMenuPage(json.data);
        const hostels = json.data.hostels || FALLBACK_HOSTELS;
        const boys = hostels.boys || FALLBACK_HOSTELS.boys;
        const girls = hostels.girls || FALLBACK_HOSTELS.girls;
        setSelectedHostel((prev) => {
          const current = { boys, girls };
          const list = current[hostelType] || boys;
          return list.includes(prev) ? prev : list[0] || prev;
        });
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || "Failed to load menu");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  const hostelData = menuPage?.hostels
    ? { boys: menuPage.hostels.boys || [], girls: menuPage.hostels.girls || [] }
    : FALLBACK_HOSTELS;

  const handleHostelTypeChange = (type) => {
    setHostelType(type);
    const list = hostelData[type];
    setSelectedHostel(list && list.length > 0 ? list[0] : "");
  };

  const renderMealList = (title, items) => (
    <div className="mt-4 first:mt-0">
      <h3 className="text-lg font-semibold text-sky-800 uppercase tracking-wide border-b border-gray-200 pb-1">
        {title}
      </h3>
      <ul className="mt-2 text-gray-700 text-sm list-disc list-inside">
        {(items || []).map((item, index) => (
          <li key={index} className="capitalize">
            {String(item).toLowerCase()}
          </li>
        ))}
      </ul>
    </div>
  );

  const renderItemCard = (meal) => (
    <div
      key={meal.name}
      className="bg-white shadow-xl rounded-2xl overflow-hidden hover:shadow-2xl transition"
    >
      <h2 className="bg-teal-600 text-white text-xl font-bold p-4 text-center">
        {meal.name}
      </h2>
      <ul className="p-5 text-gray-700 list-disc list-inside text-left">
        {(meal.items || []).map((item, index) => (
          <li key={index} className="capitalize">
            {String(item).toLowerCase()}
          </li>
        ))}
      </ul>
    </div>
  );

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto bg-sky-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-10 h-10 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sky-800 font-semibold">Loading menu…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-7xl mx-auto bg-sky-50 min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <p className="text-red-600 font-semibold mb-2">Could not load menu</p>
          <p className="text-gray-600 text-sm mb-4">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const weeklyMenu = menuPage?.weeklyMenu || [];
  const dailyItems = menuPage?.dailyItems || [];
  const extraItems = menuPage?.extraItems || [];

  return (
    <div className="p-8 max-w-7xl mx-auto bg-sky-50 min-h-screen">
      <h1 className="text-4xl font-bold text-center text-sky-800 mb-4">
        Weekly Mess Menu
      </h1>

      {/* Hostel Type Selector - Boys/Girls */}
      <div className="mb-6">
        <div className="flex justify-center gap-4">
          <button
            onClick={() => handleHostelTypeChange("boys")}
            className={`px-12 py-4 text-xl font-bold rounded-xl transition-all ${
              hostelType === "boys"
                ? "bg-blue-600 text-white shadow-xl scale-105"
                : "bg-white text-blue-600 border-2 border-blue-300 hover:border-blue-600 hover:shadow-lg"
            }`}
          >
            Boys Hostel
          </button>
          <button
            onClick={() => handleHostelTypeChange("girls")}
            className={`px-12 py-4 text-xl font-bold rounded-xl transition-all ${
              hostelType === "girls"
                ? "bg-pink-600 text-white shadow-xl scale-105"
                : "bg-white text-pink-600 border-2 border-pink-300 hover:border-pink-600 hover:shadow-lg"
            }`}
          >
            Girls Hostel
          </button>
        </div>
      </div>

      {/* Hostel Selector */}
      <div className="mb-8">
        <label className="block text-lg font-semibold text-sky-800 mb-4 text-center">
          Select Your Hostel
        </label>
        <div className="flex flex-wrap justify-center gap-4">
          {(hostelData[hostelType] || []).map((hostel) => (
            <button
              key={hostel}
              onClick={() => setSelectedHostel(hostel)}
              className={`px-8 py-3 text-lg font-semibold rounded-lg transition-all ${
                selectedHostel === hostel
                  ? "bg-sky-700 text-white shadow-lg scale-105"
                  : "bg-white text-sky-700 border-2 border-sky-300 hover:border-sky-600 hover:shadow-md"
              }`}
            >
              {hostel}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Hostel Display */}
      <div className="text-center mb-8">
        <span className="inline-block bg-sky-700 text-white px-6 py-2 rounded-full text-xl font-bold">
          {selectedHostel || "Menu"} Menu
        </span>
      </div>

      {/* Weekly Menu Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {weeklyMenu.map((day) => (
          <div
            key={day.day}
            className="bg-white shadow-xl rounded-2xl overflow-hidden hover:shadow-2xl transition"
          >
            <h2 className="text-2xl font-bold text-center text-white bg-sky-700 p-4">
              {day.day}
            </h2>
            <div className="p-6">
              {renderMealList("Breakfast", day.breakfast)}
              {renderMealList("Lunch", day.lunch)}
              {renderMealList("Snacks", day.snacks)}
              {renderMealList("Dinner", day.dinner)}
            </div>
          </div>
        ))}
      </div>

      {/* Daily Items Section */}
      <h2 className="text-3xl font-bold text-center text-sky-800 mt-16 mb-8">
        Daily Available Items
      </h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
        {dailyItems.map(renderItemCard)}
      </div>

      {/* Extra Items Section */}
      <h2 className="text-3xl font-bold text-center text-sky-800 mt-16 mb-8">
        Extra Items (Paid)
      </h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
        {extraItems.map(renderItemCard)}
      </div>
    </div>
  );
}
