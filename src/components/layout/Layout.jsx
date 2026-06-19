import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = ({ children, userRole, onRoleChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const isPosPage = location.pathname === "/pos";

  return (
    <div className="flex h-screen bg-pos-bg text-slate-100 font-sans overflow-hidden">
      
      {/* 1. Left Menu (Sidebar) */}
      <Sidebar 
        userRole={userRole} 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed} 
      />

      {/* 2. Right Main Section */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Navbar / Top Bar */}
        <Navbar userRole={userRole} onRoleChange={onRoleChange} />

        {/* Page Content Render Area */}
        <main className={`flex-1 bg-pos-bg/20 ${isPosPage ? "overflow-hidden flex flex-col" : "overflow-y-auto"}`}>
          {children}
        </main>

      </div>
    </div>
  );
};

export default Layout;