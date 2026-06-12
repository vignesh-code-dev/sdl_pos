import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuth } from "./context/AuthContext"; // Authentication hook
import Layout from "./components/Layout"; // லேஅவுட்டை இம்போர்ட் செய்கிறோம்
import Login from "./pages/Login"; // லாகின் பக்கத்தை இம்போர்ட் செய்கிறோம்
import StoreOverview from "./pages/Dashboard/StoreOverview"; // டாஷ்போர்டு ஓவர்வியூ பக்கம்
import Analytics from "./pages/Dashboard/Analytics"; // டாஷ்போர்டு அனலிடிக்ஸ் பக்கம்
import POSBilling from "./pages/Sales/POSBilling"; // POS பில்லிங் பக்கம்
import Products from "./pages/Inventory/Products"; // பொருட்கள் மேலாண்மை பக்கம்
import UserManagement from "./pages/people/UserManagement"; // பயனர் மேலாண்மை பக்கம்
import StockCount from "./pages/Inventory/StockCount";
import StockEntry from "./pages/Inventory/StockEntry";
import StockHistory from "./pages/Inventory/StockHistory";
import StockAlerts from "./pages/Inventory/StockAlerts";

// தற்காலிக பேஜ் காம்போனன்ட்
const PlaceholderPage = ({ title }) => (
  <div className="p-6 text-slate-100">
    <div className="bg-pos-card border border-pos-border rounded-2xl p-8 shadow-xl max-w-2xl">
      <h1 className="text-3xl font-bold text-brand-primary mb-4">{title}</h1>
      <p className="text-slate-400 leading-relaxed">
        உங்களுடைய <strong>"SDL BillMate POS"</strong> டாக்குமெண்ட் படி இந்த
        மாடியூல் வெற்றிகரமாக மேப் செய்யப்பட்டுள்ளது.
      </p>
    </div>
  </div>
);

function App() {
  const { isAuthenticated, userRole, handleLogout } = useAuth();

  // ➡️ பயனர் இன்னும் லாகின் செய்யவில்லை என்றால், லாகின் திரையை மட்டும் காட்டு
  if (!isAuthenticated) {
    return <Login />;
  }

  // ➡️ பயனர் வெற்றிகரமாக லாகின் செய்துவிட்டால், ஆப் ரூட்டிங் மற்றும் லேஅவுட்டைக் காட்டு
  return (
    <Router>
      {/* ➡️ நாவ்பாரில் ரோல் மாற்றும் பட்டனுக்கு பதிலாக இப்போ லாக்அவுட் ஃபங்க்ஷனை பாஸ் செய்கிறோம் */}
      <Layout userRole={userRole} onRoleChange={handleLogout}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Dashboard Group */}
          <Route path="/dashboard" element={<StoreOverview />} />
          <Route path="/analytics" element={<Analytics />} />

          {/* Sales Group */}
          <Route path="/pos" element={<POSBilling />} />
          <Route
            path="/invoices"
            element={<PlaceholderPage title="Invoice Management & Returns" />}
          />
          <Route
            path="/deposits"
            element={<PlaceholderPage title="Customer Deposit Accounts" />}
          />
          <Route
            path="/expenses"
            element={<PlaceholderPage title="Store Expense Tracker" />}
          />
          <Route
            path="/reports"
            element={<PlaceholderPage title="Comprehensive Sales Reports" />}
          />

          {/* Inventory Group */}
          <Route path="/products" element={<Products />} />
          <Route path="/stock-count" element={<StockCount />} />
          <Route path="/stock-entry" element={<StockEntry />} />
          <Route path="/stock-history" element={<StockHistory />} />
          <Route
            path="/stock-alerts"
            element={
              <StockAlerts />
            }
          />

          {/* People Group */}
          <Route
            path="/customers"
            element={<PlaceholderPage title="Customer Database" />}
          />
          <Route
            path="/suppliers"
            element={<PlaceholderPage title="Supplier Directory" />}
          />
          <Route path="/users" element={<UserManagement />} />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
