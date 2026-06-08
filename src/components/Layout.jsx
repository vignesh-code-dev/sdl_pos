import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = ({ children, userRole, onRoleChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-pos-bg text-slate-100 font-sans overflow-hidden">
      
      {/* 1. இடதுபக்க மெனு */}
      <Sidebar 
        userRole={userRole} 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed} 
      />

      {/* 2. வலதுபக்க மெயின் பகுதி */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* டாப் பார் */}
        <Navbar userRole={userRole} onRoleChange={onRoleChange} />

        {/* ஒவ்வொரு மாடியூலின் பக்கங்களும் மாறும் இடம் */}
        <main className="flex-1 overflow-y-auto bg-pos-bg/20">
          {children}
        </main>

      </div>
    </div>
  );
};

export default Layout;