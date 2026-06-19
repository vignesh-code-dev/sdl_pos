import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // ➡️ Our global authentication hook
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
  const { userRole, shopInfo, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

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
      {/* Logo and Collapse Button */}
      <div>
        <div className="flex items-center justify-between p-4 border-b border-pos-border/60">
          {!isCollapsed && (
            <span className="text-sm font-black text-brand-500 tracking-wider uppercase font-mono truncate max-w-[170px]">
              {shopInfo?.shopName || "BillMate POS"}
            </span>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-full bg-brand-500 text-white hover:bg-brand-500/90 transition-colors cursor-pointer"
          >
            {isCollapsed ? (
              <ChevronRight size={16} />
            ) : (
              <ChevronLeft size={16} />
            )}
          </button>
        </div>

        {/* Menu List */}
        <div className="overflow-y-auto max-h-[calc(100vh-140px)] p-3 space-y-4 scrollbar-none">
          {menuStructure.map((section, idx) => {
            // Check if the logged-in user has permission to view this section
            if (!section.roles.includes(userRole)) return null;

            return (
              <div key={idx} className="space-y-1">
                {!isCollapsed && (
                  <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-wide px-3 mb-1">
                    {section.group}
                  </p>
                )}
                {section.items.map((item, itemIdx) => {
                  // Check role permission for specific menu item
                  if (!item.roles.includes(userRole)) return null;

                  return (
                    <NavLink
                      key={itemIdx}
                      to={item.path}
                      className={({ isActive }) => `
                        flex items-center gap-3 px-3 py-2.5 rounded text-sm font-bold tracking-wide transition-all duration-150 cursor-pointer
                        ${
                          isActive
                            ? "bg-brand-50 text-brand-700 border-r-4 border-brand-500"
                            : "text-text-secondary hover:bg-slate-50 hover:text-brand-500 font-medium"
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
        {/* ➡️ Original logout function linked here */}
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
