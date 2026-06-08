import React, { createContext, useContext, useState, useEffect } from "react";

// 1. முதலாவதாக அத்தெண்டிகேஷனுக்கான ஒரு கான்டெக்ஸ்ட்டை உருவாக்குகிறோம்
const AuthContext = createContext(null);

// 2. மொத்த அப்ளிகேஷனையும் கவர் செய்யக்கூடிய 'Provider' காம்போனன்ட்
export const AuthProvider = ({ children }) => {
  // பிரவுசர் ரிஃப்ரெஷ் ஆனாலும் லாக்அவுட் ஆகாமல் இருக்க LocalStorage மெமரியை செக் செய்கிறது
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("isLoggedIn") === "true";
  });

  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem("userRole") || "Guest";
  });

  const [shopInfo, setShopInfo] = useState(() => {
    const savedUser = localStorage.getItem("registeredUser");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // லாகின் வெற்றி அடையும் போது இயங்கும் ஃபங்க்ஷன்
  const login = (role, username) => {
    setIsAuthenticated(true);
    setUserRole(role);
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userRole", role);
  };

  // லாக்அவுட் செய்யும்போது இயங்கும் ஃபங்க்ஷன்
  const logout = () => {
    setIsAuthenticated(false);
    setUserRole("Guest");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userRole");
  };

  return (
    // இந்த வேல்யூக்கள் தான் ஆப் முழுக்க ஷேர் செய்யப்படப் போகிறது
    <AuthContext.Provider
      value={{ isAuthenticated, userRole, shopInfo, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// 3. இதர காம்போனன்ட்களில் எளிதாகப் பயன்படுத்த கஸ்டம் ஹூக் (Custom Hook)
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error(
      "useAuth-ஐ கண்டிப்பாக AuthProvider-க்குள் மட்டும்தான் பயன்படுத்த வேண்டும்!",
    );
  }
  return context;
};
