import React, { useState } from "react";
import HeroSection from "./herosection.jsx";

const menuItems = [
  { name: "Paneer Masala", desc: "Rich and creamy cottage cheese curry.", price: 60, type: "Dinner", image: "/images/menu/paneer_masala.png" },
  { name: "Veg Biryani", desc: "Fragrant rice with vegetables.", price: 80, type: "Lunch", image: "/images/menu/veg_biryani.png" },
  { name: "Aloo Paratha", desc: "Wheat bread with spiced potatoes.", price: 40, type: "Breakfast", image: "/images/menu/aloo_paratha.png" },
  { name: "Gulab Jamun", desc: "Soft fried dough balls in syrup.", price: 25, type: "Snacks", image: "/images/menu/gulab_jamun.png" },
  { name: "Masala Dosa", desc: "Crispy crepe with potato filling.", price: 40, type: "Breakfast", image: "/images/menu/masala_dosa.png" },
  { name: "Samosa", desc: "Crispy pastry with chickpeas.", price: 20, type: "Snacks", image: "/images/menu/samosa.png" },
  { name: "Rajma Chawal", desc: "Kidney beans curry with rice.", price: 70, type: "Lunch", image: "/images/menu/rajma_chawal.png" },
  { name: "Poha", desc: "Flattened rice cooked with spices.", price: 30, type: "Breakfast", image: "/images/menu/poha.png" },
  { name: "Vada Pav", desc: "Spicy potato fritter in a bun.", price: 25, type: "Snacks", image: "/images/menu/vada_pav.png" },
  { name: "Dal Makhani", desc: "Creamy black lentil curry.", price: 65, type: "Dinner", image: "/images/menu/dal_makhani.png" },
  { name: "Chai", desc: "Indian spiced tea.", price: 15, type: "Snacks", image: "/images/menu/chai.png" },
  { name: "Butter Chicken", desc: "Creamy tomato-based chicken curry.", price: 90, type: "Dinner", image: "/images/menu/butter_chicken.png" },
];

export default function Home() {
  const [filter, setFilter] = useState("All");

  const filteredItems =
    filter === "All"
      ? menuItems
      : menuItems.filter((item) => item.type === filter);

  return (
    <div className="bg-slate-50 min-h-screen">
      <HeroSection />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Our Curated Menu</h2>
            <p className="text-slate-500 mt-1">Savor the authentic taste of NITJ favorites</p>
          </div>
          <div className="flex justify-center items-center gap-2 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 flex-wrap">
            {["All", "Breakfast", "Lunch", "Snacks", "Dinner"].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                  filter === type
                    ? "bg-indigo-600 text-white shadow-indigo-200 shadow-lg scale-105"
                    : "bg-transparent text-slate-600 hover:bg-slate-50"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredItems.map((item, i) => (
            <div
              key={i}
              className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(79,70,229,0.1)] transition-all duration-500 overflow-hidden group border border-slate-100/50"
            >
              <div className="h-56 overflow-hidden relative">
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="absolute top-4 left-4">
                   <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-sm border border-white/20">
                    <span className="text-indigo-600 text-[10px] uppercase font-black tracking-widest leading-none">
                      {item.type}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-8">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-2xl font-black text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">
                    {item.name}
                  </h3>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-2">
                  {item.desc}
                </p>

                <div className="flex justify-between items-center pt-6 border-t border-slate-50">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Price</span>
                    <span className="text-3xl font-black text-indigo-600 tracking-tight">
                      ₹{item.price}
                    </span>
                  </div>
                  <button className="bg-slate-900 text-white p-3.5 rounded-2xl hover:bg-indigo-600 transition-all duration-300 active:scale-95 shadow-lg shadow-slate-200">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
