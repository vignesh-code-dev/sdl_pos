import React, { useState, useEffect, useRef } from "react";
import {
  Sun,
  Moon,
  Wifi,
  WifiOff,
  Clock,
  Calendar,
  LogOut,
  ChevronDown,
  User,
} from "lucide-react";
import { useAuth } from "../context/AuthContext"; // ➡️ ஒரிஜினல் அத்தெண்டிகேஷன் ஹூக்

const Navbar = () => {
  // ➡️ குளோபல் காண்டெக்ஸ்ட்டில் இருந்து தேவையான விபரங்களை எடுக்கிறோம்
  const { userRole, shopInfo, logout } = useAuth();

  const [isDarkMode, setIsDarkMode] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);

  // லைவ் டைம் அப்டேட் லாஜிக்
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // ஆன்லைன் / ஆஃப்லைன் ஸ்டேட்டஸ் லாஜிக்
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // டிராப்டவுன் பாக்ஸிற்கு வெளியே கிளிக் செய்தால் அது தானாக மூடப்பட வேண்டும்
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Time & Date Formats
  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      weekday: "short",
    });
  };

  return (
    <header className="bg-pos-card border-b border-pos-border px-6 py-3 flex justify-between items-center shrink-0 shadow-sm relative z-40">
      {/* 1. நெட்வொர்க் இன்டிகேட்டர் (LAN / OFFLINE) */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 bg- border border-pos-border px-2 py-1 rounded-xl">
          {isOnline ? (
            <>
              <Wifi size={14} className="text-brand-success" />
              <span className="text-[9px] font-semibold text-brand-success uppercase tracking-wide">
                Online LAN Mode
              </span>
            </>
          ) : (
            <>
              <WifiOff size={14} className="text-brand-danger animate-bounce" />
              <span className="text-[9px] font-semibold text-brand-danger animate-pulse uppercase tracking-wide">
                Offline Local Mode
              </span>
            </>
          )}
        </div>
      </div>

      {/* 2. டைம், தீம் மற்றும் பயனர் விவரங்கள் */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 text-xs font-bold border-r border-pos-border pr-4 hidden md:flex">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Calendar size={14} className="text-text-muted" />
            <span className="text-text-muted ">{formatDate(currentTime)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-brand-primary font-mono bg-emerald-500/5 px-2 py-1 rounded-full border border-brand-primary/10">
            <Clock size={14} />
            <span>{formatTime(currentTime)}</span>
          </div>
        </div>

        {/* டார்க் மோட் டாகுல் பட்டன் */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2 rounded-full bg-pos-bg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors border border-pos-border cursor-pointer"
          title={isDarkMode ? "Light Mode" : "Dark Mode"}
        >
          {isDarkMode ? (
            <Sun size={16} className="text-amber-400" />
          ) : (
            <Moon size={16} />
          )}
        </button>

        {/* 3. பிரீமியம் யூசர் டிராப்டவுன் மெனு */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2.5 bg-pos-bg hover:bg-slate-800 border border-pos-border pl-1.5 pr-3 py-1.5 rounded-xl transition-all cursor-pointer text-left"
          >
            {/* யூசர் முதல் எழுத்து லோகோ */}
            <div className="w-7 h-7 rounded-lg bg-brand-primary/10 text-brand-primary border border-brand-primary/20 flex items-center justify-center font-black text-xs uppercase">
              {shopInfo?.username[0] || "U"}
            </div>

            <div className="hidden sm:block">
              {/* ஒரிஜினல் லாகின் யூசர் பெயர் */}
              <span className="text-xs font-black text-slate-200 leading-none block capitalize">
                {shopInfo?.username || "Operator"}
              </span>
              <span className="text-[9px] text-brand-warning font-mono font-bold uppercase tracking-wider block mt-0.5">
                {userRole}
              </span>
            </div>
            <ChevronDown
              size={12}
              className={`text-slate-500 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
            />
          </button>

          {/* டிராப்டவுன் ஓபன் செய்யும்போது காட்டும் பாக்ஸ் */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-pos-card border border-pos-border rounded-xl shadow-2xl p-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-2 border-b border-pos-border/50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Account Actions
              </div>

              {/* லாக்அவுட் ஆக்சன் பட்டன் */}
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-brand-danger hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer text-left"
              >
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
