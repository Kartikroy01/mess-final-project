import React, { useState } from "react";

// Data from the image for the 7-day menu
const weeklyMenu = [
  {
    day: "Monday",
    breakfast: ["Poha", "Daliya", "Tea"],
    lunch: ["RAJMA", "ROTI", "RICE", "Masala Mix RAITA"],
    snacks: ["Hot DOG"],
    dinner: ["Mix Veg", "DAL MAKHNI", "ROTI", "RICE", "Gulab Jamun"],
  },
  {
    day: "Tuesday",
    breakfast: ["Besan Chilla", "Sweet and Green Chutney", "tea"],
    lunch: ["Paneer Butter Masala", "Masar Dal+Rice", "Mini papad"],
    snacks: ["Chana Samosa"],
    dinner: ["Gheeya Kofta", "Arhar dal", "roti", "Roti", "Kheer"],
  },
  {
    day: "Wednesday",
    breakfast: ["Vada Pav", "Green Chutney", "TEA"],
    lunch: ["Kadhi Pakoda", "Aloo Jeera", "RICE", "ROTI"],
    snacks: ["Chips", "Biscuits", "Thandai"],
    dinner: ["Kadhai Chicken/Paneer Chilli", "ROTI", "RICE", "Dal Tadka"],
  },
  {
    day: "Thursday",
    breakfast: ["IDLI", "VADA", "SAMBHAR", "TEA"],
    lunch: ["Gobi Aloo", "Boondi Raita", "Veg Pulao", "Moong Dal", "Roti"],
    snacks: ["Bread Pakoda"],
    dinner: [
      "Matar Mushroom",
      "Chana dal",
      "ROTI",
      "RICE",
      "White Sponge Rasgulla",
    ],
  },
  {
    day: "Friday",
    breakfast: ["Paneer Aloo Pyaz Paratha", "Butter", "Tea"],
    lunch: ["Aloo Bhujia", "Arhar Dal", "Rice", "Roti", "Fryum Chips"],
    snacks: ["Pyaz Aloo Kachori"],
    dinner: ["Malai Kofta/Egg Curry", "Masoor Dal", "ROTI", "RICE", "Rasmalai"],
  },
  {
    day: "Saturday",
    breakfast: ["DOSA", "UTTBAM", "CHUTNEY", "SAMBHAR", "TEA"],
    lunch: ["Chole Sabzi", "Pethe Ki Sabzi(Pumpkin)", "Poori", "RICE"],
    snacks: ["Red Sauce Pasta"],
    dinner: [
      "Veg Biryani",
      "Salan",
      "Chinese Mix Veg",
      "Roti",
      "Ice Cream Lababdar Chicken/Paneer Tikka Masala",
    ],
  },
  {
    day: "Sunday",
    breakfast: ["AMRITSARI NAAN", "CHHOLE", "BUTTER", "TEA"],
    lunch: ["Nutri Chura Bhurji", "Black Chana Gravy", "ROTI", "JEERA RICE"],
    snacks: ["TEA"],
    dinner: ["MOONG Masur DAL", "Tandoori Roti", "RICE"],
  },
];

// Data for the "DAILY" row
const dailyItems = [
  {
    name: "Breakfast",
    items: [
      "PICKLE",
      "TEA",
      "SAUCE",
      "JAM",
      "BREAD",
      "PEANUT BUTTER",
      "OMELETTE",
      "CORN FLAKES",
      "BUTTER",
      "CURD PACKET",
      "BREAD SLICES",
      "FRESH FRUITS",
      "BOILED EGGS",
    ],
  },
  {
    name: "Lunch",
    items: ["SALAD (KHHIRA, ONION, BeetRoot)", "PICKLE", "SAUNF"],
  },
  { name: "Snacks", items: ["TEA"] },
];

// Data for the "EXTRA" row
const extraItems = [
  { name: "Breakfast", items: ["OMELETTE", "EGG BHURJI"] },
  {
    name: "Lunch",
    items: ["CURD PACKET", "OMELETTE", "EGG BHURJI", "Lassi", "Seasonal Fruit"],
  },
  {
    name: "Dinner",
    items: [
      "MILK PACKET",
      "CURD PACKET",
      "HOT MILK",
      "OMELETTE",
      "EG G BHURJI",
    ],
  },
];

// Hostel list organized by type
const hostelData = {
  boys: ["MBH", "BH-1", "BH-2", "BH-3", "BH-4", "BH-5", "BH-6", "BH-7"],
  girls: ["GH-1", "GH-2", "MGH-1", "MGH-2"],
};

export default function Menu() {
  const [hostelType, setHostelType] = useState("boys");
  const [selectedHostel, setSelectedHostel] = useState(hostelData.boys[0]);

  // Handle hostel type change
  const handleHostelTypeChange = (type) => {
    setHostelType(type);
    setSelectedHostel(hostelData[type][0]); // Auto-select first hostel of that type
  };

  // Helper function to render meal lists
  const renderMealList = (title, items) => (
    <div className="mt-4 first:mt-0">
      <h3 className="text-lg font-semibold text-sky-800 uppercase tracking-wide border-b border-gray-200 pb-1">
        {title}
      </h3>
      <ul className="mt-2 text-gray-700 text-sm list-disc list-inside">
        {items.map((item, index) => (
          <li key={index} className="capitalize">
            {item.toLowerCase()}
          </li>
        ))}
      </ul>
    </div>
  );

  // Helper function to render simple item cards
  const renderItemCard = (meal) => (
    <div
      key={meal.name}
      className="bg-white shadow-xl rounded-2xl overflow-hidden hover:shadow-2xl transition"
    >
      <h2 className="bg-teal-600 text-white text-xl font-bold p-4 text-center">
        {meal.name}
      </h2>
      <ul className="p-5 text-gray-700 list-disc list-inside text-left">
        {meal.items.map((item, index) => (
          <li key={index} className="capitalize">
            {item.toLowerCase()}
          </li>
        ))}
      </ul>
    </div>
  );

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
          {hostelData[hostelType].map((hostel) => (
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
          {selectedHostel} Menu
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
