import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuth } from "./context/AuthContext"; // Authentication hook
import Layout from "./components/layout/Layout";
import Login from "./pages/Login";
import StoreOverview from "./pages/Dashboard/StoreOverview";
import Analytics from "./pages/Dashboard/Analytics";
import POSBilling from "./pages/Sales/POSBilling";
import Invoices from "./pages/Sales/Invoices";
import Products from "./pages/Inventory/Products";
import StockCount from "./pages/Inventory/StockCount";
import StockEntry from "./pages/Inventory/StockEntry";
import StockHistory from "./pages/Inventory/StockHistory";
import StockAlerts from "./pages/Inventory/StockAlerts";
import UserManagement from "./pages/people/UserManagement";
import CustomerManagement from "./pages/people/CustomerManagement";
import SupplierManagement from "./pages/people/SupplierManagement";
import DepositAccounts from "./pages/Sales/DepositAccounts";
import Expenses from "./pages/Sales/Expenses";
import Reports from "./pages/Sales/Reports";

const PlaceholderPage = ({ title }) => (
  <div className="p-6 text-slate-100">
    <div className="bg-pos-card border border-pos-border rounded-2xl p-8 shadow-xl max-w-2xl">
      <h1 className="text-3xl font-bold text-brand-primary mb-4">{title}</h1>
      <p className="text-slate-400 leading-relaxed">
        According to your <strong>"SDL BillMate POS"</strong> requirements, this
        module has been successfully mapped.
      </p>
    </div>
  </div>
);

function App() {
  const { isAuthenticated, userRole, handleLogout } = useAuth();

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Router>
      <Layout userRole={userRole} onRoleChange={handleLogout}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Dashboard Group */}
          <Route path="/dashboard" element={<StoreOverview />} />
          <Route path="/analytics" element={<Analytics />} />

          {/* Sales Group */}
          <Route path="/pos" element={<POSBilling />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/deposits" element={<DepositAccounts />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/reports" element={<Reports />} />

          {/* Inventory Group */}
          <Route path="/products" element={<Products />} />
          <Route path="/stock-count" element={<StockCount />} />
          <Route path="/stock-entry" element={<StockEntry />} />
          <Route path="/stock-history" element={<StockHistory />} />
          <Route path="/stock-alerts" element={<StockAlerts />} />

          {/* People Group */}
          <Route path="/customers" element={<CustomerManagement />} />
          <Route path="/suppliers" element={<SupplierManagement />} />
          <Route path="/users" element={<UserManagement />} />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
