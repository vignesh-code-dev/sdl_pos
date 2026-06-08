import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // ➡️ நம்முடைய குளோபல் அத்தெண்டிகேஷன் ஹூக்
import {
  LayoutDashboard,
  BarChart2,
  ShoppingCart,
  FileText,
  Wallet,
  DollarSign,
  PieChart,
  Package,
  ClipboardList,
  PlusCircle,
  History,
  AlertTriangle,
  Users,
  Truck,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";

const Sidebar = () => {
  // ➡️ குளோபல் காண்டெக்ஸ்ட்டில் இருந்து ஒரிஜினல் userRole, shopInfo மற்றும் logout ஃபங்க்ஷனை எடுக்கிறோம்
  const { userRole, shopInfo, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // டாக்குமெண்ட் படி மெனுக்களை குரூப் செய்துள்ளோம்
  const menuStructure = [
    {
      group: "Dashboard",
      roles: ["Admin", "Cashier"],
      items: [
        {
          name: "Overview",
          path: "/dashboard",
          icon: LayoutDashboard,
          roles: ["Admin", "Cashier"],
        },
        {
          name: "Analytics",
          path: "/analytics",
          icon: BarChart2,
          roles: ["Admin"],
        },
      ],
    },
    {
      group: "Sales",
      roles: ["Admin", "Cashier"],
      items: [
        {
          name: "POS Billing",
          path: "/pos",
          icon: ShoppingCart,
          roles: ["Admin", "Cashier"],
        },
        {
          name: "Invoices",
          path: "/invoices",
          icon: FileText,
          roles: ["Admin", "Cashier"],
        },
        { name: "Deposits", path: "/deposits", icon: Wallet, roles: ["Admin"] },
        {
          name: "Expenses",
          path: "/expenses",
          icon: DollarSign,
          roles: ["Admin"],
        },
        { name: "Reports", path: "/reports", icon: PieChart, roles: ["Admin"] },
      ],
    },
    {
      group: "Inventory",
      roles: ["Admin", "Cashier"],
      items: [
        {
          name: "Products",
          path: "/products",
          icon: Package,
          roles: ["Admin"],
        },
        {
          name: "Stock Count",
          path: "/stock-count",
          icon: ClipboardList,
          roles: ["Admin", "Cashier"],
        },
        {
          name: "Stock Entry",
          path: "/stock-entry",
          icon: PlusCircle,
          roles: ["Admin"],
        },
        {
          name: "Stock History",
          path: "/stock-history",
          icon: History,
          roles: ["Admin"],
        },
        {
          name: "Stock Alerts",
          path: "/stock-alerts",
          icon: AlertTriangle,
          roles: ["Admin"],
        },
      ],
    },
    {
      group: "People",
      roles: ["Admin"],
      items: [
        {
          name: "Customers",
          path: "/customers",
          icon: Users,
          roles: ["Admin", "Cashier"],
        },
        {
          name: "Suppliers",
          path: "/suppliers",
          icon: Truck,
          roles: ["Admin"],
        },
        {
          name: "User Management",
          path: "/users",
          icon: UserCheck,
          roles: ["Admin"],
        },
      ],
    },
  ];

  return (
    <div
      className={`h-screen bg-pos-card border-r border-pos-border text-slate-100 flex flex-col justify-between transition-all duration-300 shadow-xl ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* லோகோ மற்றும் சுருக்கும் பட்டன் */}
      <div>
        <div className="flex items-center justify-between p-4 border-b border-pos-border/60">
          {!isCollapsed && (
            <span className="text-sm font-black text-brand-primary tracking-wider uppercase font-mono truncate max-w-[170px]">
              {shopInfo?.shopName || "BillMate POS"}
            </span>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-full bg-brand-primary text-white hover:bg-brand-primary/90 transition-colors cursor-pointer"
          >
            {isCollapsed ? (
              <ChevronRight size={16} />
            ) : (
              <ChevronLeft size={16} />
            )}
          </button>
        </div>

        {/* மெனு லிஸ்ட் */}
        <div className="overflow-y-auto max-h-[calc(100vh-140px)] p-3 space-y-4 scrollbar-none">
          {menuStructure.map((section, idx) => {
            // லாகின் செய்த யூசருக்கு இந்த செக்ஷன் பார்க்க அனுமதி உண்டா என செக் செய்கிறது
            if (!section.roles.includes(userRole)) return null;

            return (
              <div key={idx} className="space-y-1">
                {!isCollapsed && (
                  <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-wide px-3 mb-1">
                    {section.group}
                  </p>
                )}
                {section.items.map((item, itemIdx) => {
                  // குறிப்பிட்ட மெனுவிற்கு ரோல் பெர்மிஷன் செக் செய்கிறது
                  if (!item.roles.includes(userRole)) return null;

                  return (
                    <NavLink
                      key={itemIdx}
                      to={item.path}
                      className={({ isActive }) => `
                        flex items-center gap-3 px-3 py-2.5 rounded text-sm font-bold tracking-wide transition-all duration-150 cursor-pointer
                        ${
                          isActive
                            ? "bg-brand-primary text-white shadow-lg shadow-emerald-500/10 font-bold"
                            : "text-brand-primary hover:bg-brand-primary hover:text-white border border-transparent hover:border-pos-border/40"
                        }
                      `}
                    >
                      <item.icon size={18} className="shrink-0" />
                      {!isCollapsed && <span>{item.name}</span>}
                    </NavLink>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-2 border-t border-pos-border flex gap-2">
        {/* ➡️ ஒரிஜினல் லாக்அவுட் ஃபங்க்ஷன் இங்கே இணைக்கப்பட்டுள்ளது */}
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-brand-danger hover:bg-rose-500/10 rounded border border-transparent hover:border-brand-danger/20 transition-all w-full cursor-pointer"
        >
          <LogOut size={18} className="shrink-0" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
