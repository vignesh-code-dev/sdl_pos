import React, { useState, useEffect } from "react";
import {
  UserPlus,
  Shield,
  User,
  Trash2,
  Users,
  Search,
  AlertCircle,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const UserManagement = () => {
  const { currentUser } = useAuth() || { currentUser: "admin" };

  const [users, setUsers] = useState(() => {
    const billmateUsers = localStorage.getItem("billmate_users");
    const registeredUser = localStorage.getItem("registeredUser");

    if (billmateUsers) return JSON.parse(billmateUsers);

    if (registeredUser) {
      const parsedSingleUser = JSON.parse(registeredUser);
      return [
        {
          fullName: "System Admin",
          username: parsedSingleUser.username || "admin",
          password: parsedSingleUser.password || "admin123",
          role: "Admin",
          createdAt: new Date().toISOString().split("T")[0],
        },
        {
          fullName: "Cashier One",
          username: "cashier1",
          password: "cashier123",
          role: "Cashier",
          createdAt: "2026-02-20",
        },
      ];
    }

    return [
      {
        fullName: "System Admin",
        username: "admin",
        password: "admin123",
        role: "Admin",
        createdAt: "2026-01-15",
      },
      {
        fullName: "Cashier One",
        username: "cashier1",
        password: "cashier123",
        role: "Cashier",
        createdAt: "2026-02-20",
      },
    ];
  });

  // ஸ்டேட்டுகள்
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showModalPassword, setShowModalPassword] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState({}); // டேபிளில் பாஸ்வேர்டை காட்ட/மறைக்க
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    password: "",
    role: "Cashier",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    localStorage.setItem("billmate_users", JSON.stringify(users));

    const primaryAdmin = users.find((u) => u.role === "Admin");
    if (primaryAdmin) {
      localStorage.setItem(
        "registeredUser",
        JSON.stringify({
          username: primaryAdmin.username,
          password: primaryAdmin.password,
          shopName: localStorage.getItem("shopName") || "My Store",
        }),
      );
    }
  }, [users]);

  const togglePasswordVisibility = (username) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [username]: !prev[username],
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const cleanValue =
      name === "username" ? value.replace(/\s+/g, "").toLowerCase() : value;

    setFormData((prev) => ({ ...prev, [name]: cleanValue }));
    setError("");
  };

  const handleAddUser = (e) => {
    e.preventDefault();
    const { fullName, username, password, role } = formData;

    if (!fullName.trim()) {
      setError("Full Name is required!");
      return;
    }
    if (!username.trim()) {
      setError("Username is required!");
      return;
    }
    if (!password.trim() || password.length < 4) {
      setError("Password must be at least 4 characters long!");
      return;
    }

    if (role === "Admin" && username !== "admin") {
      setError("Admin account's username must be 'admin'!");
      return;
    }

    if (role === "Cashier" && !username.startsWith("cashier")) {
      setError("Cashier account's username must start with 'cashier'!");
      return;
    }

    if (users.some((u) => u.username === username)) {
      setError("Username is already taken!");
      return;
    }

    const newUser = {
      fullName: fullName.trim(),
      username,
      password,
      role,
      createdAt: new Date().toISOString().split("T")[0],
    };

    setUsers((prev) => [newUser, ...prev]);
    setShowModal(false);
    setFormData({ fullName: "", username: "", password: "", role: "Cashier" });
    setShowModalPassword(false);
    setError("");
  };

  const handleDeleteUser = (username) => {
    if (username === currentUser) {
      alert(
        "Security Alert: You cannot delete the currently logged-in account!",
      );
      return;
    }
    if (window.confirm(`Delete '${username}' account from the system?`)) {
      setUsers((prev) => prev.filter((u) => u.username !== username));
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      (u.fullName &&
        u.fullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="p-5 flex flex-col h-[calc(100vh-70px)] bg-pos-bg overflow-hidden text-slate-900">
      {/* Top Title Section */}
      <div className="flex items-center justify-between mb-4 shrink-0 px-1">
        <div className="flex items-center gap-4 ">
          <h1 className="text-xl font-bold tracking-tight text-brand-primary">
            User Management
          </h1>
          <span className="bg-brand-primary text-white font-bold px-2 py-0.5 rounded-full text-xs">
            {users.length} Users
          </span>
        </div>
      </div>

      {/* Search and Add User Bar */}
      <div className="bg-white border border-pos-border rounded p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 shadow-sm mb-4">
        <div className="relative flex-1 max-w-md">
          <Search
            size={16}
            className="absolute left-3.5 top-3.5 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search by name, username or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-sm bg-pos-bg border border-pos-border rounded pl-10 pr-4 py-3 focus:outline-none focus:border-brand-primary font-medium"
          />
        </div>

        <button
          onClick={() => {
            setError("");
            setFormData({
              fullName: "",
              username: "",
              password: "",
              role: "Cashier",
            });
            setShowModal(true);
          }}
          className="p-2.5 bg-brand-primary hover:bg-brand-primary/90 text-white rounded text-sm font-semibold flex items-center gap-1.5 shadow-md cursor-pointer"
        >
          <UserPlus size={16} />
          <span>Add User</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="flex-1 overflow-y-auto">
        {filteredUsers.length === 0 ? (
          <div className="bg-white border border-pos-border rounded p-20 text-center text-slate-400">
            <Users size={40} className="mx-auto mb-2 text-slate-300" />
            <p className="font-semibold text-sm">No users found!</p>
          </div>
        ) : (
          <div className="bg-white border border-pos-border rounded overflow-hidden shadow-sm">
            <table className="w-full border-collapse">
              {/* text-center ஆல் தலைப்புகள் அனைத்தும் மையப்படுத்தப்பட்டுள்ளன */}
              <thead className="bg-slate-50 text-text-primary text-[12px] font-bold uppercase tracking-wider border-b border-pos-border text-center">
                <tr>
                  <th className="py-3 px-4">Full Name</th>
                  <th className="py-3 px-4">Username</th>
                  <th className="py-3 px-4">Password</th>
                  <th className="py-3 px-4">Assigned Role</th>
                  <th className="py-3 px-4">Account Created Date</th>
                  <th className="py-3 px-5 w-24">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-pos-border bg-white text-center">
                {filteredUsers.map((u) => (
                  <tr
                    key={u.username}
                    className="hover:bg-slate-50/80 transition-colors text-text-primary text-[14px]"
                  >
                    {/* Full Name with Role Icon - Centered layout */}
                    <td className="py-3 px-4 font-bold text-brand-primary capitalize">
                      <div className="flex items-center justify-center gap-2">
                        {u.role === "Admin" ? (
                          <div className="w-5 h-5 bg-amber-50 text-amber-600 rounded border border-amber-100 flex items-center justify-center shrink-0">
                            <Shield size={12} />
                          </div>
                        ) : (
                          <div className="w-5 h-5 bg-blue-50 text-blue-600 rounded border border-blue-100 flex items-center justify-center shrink-0">
                            <User size={12} />
                          </div>
                        )}
                        <span>{u.fullName || u.username}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-text-secondary font-mono font-semibold">
                      {u.username}
                    </td>

                    {/* Password with Eye Switch Button - Centered layout */}
                    <td className="py-3 px-4 font-mono">
                      <div className="flex items-center justify-between gap-2 w-32 bg-slate-50 px-2 py-1 rounded border border-slate-100 mx-auto">
                        <span
                          className={
                            visiblePasswords[u.username]
                              ? "text-text-primary font-semibold"
                              : "text-text-muted tracking-widest"
                          }
                        >
                          {visiblePasswords[u.username] ? u.password : "••••••"}
                        </span>
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility(u.username)}
                          className="text-slate-400 hover:text-slate-600 focus:outline-none transition-colors cursor-pointer shrink-0"
                          title={
                            visiblePasswords[u.username]
                              ? "Hide Password"
                              : "Show Password"
                          }
                        >
                          {visiblePasswords[u.username] ? (
                            <EyeOff size={14} />
                          ) : (
                            <Eye size={14} />
                          )}
                        </button>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`font-bold px-2 py-0.5 rounded text-[10px] ${u.role === "Admin" ? "bg-amber-100 text-amber-800 border border-amber-200" : "bg-blue-100 text-blue-800 border border-blue-200"}`}
                      >
                        {u.role}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono text-text-secondary">
                      {u.createdAt}
                    </td>

                    <td className="py-3 px-5">
                      <button
                        onClick={() => handleDeleteUser(u.username)}
                        disabled={u.username === currentUser}
                        className={`p-1.5 rounded transition-colors mx-auto flex items-center justify-center ${u.username === currentUser ? "text-slate-300 cursor-not-allowed bg-slate-50" : "text-text-primary hover:text-brand-danger hover:bg-rose-50 cursor-pointer"}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-pos-border max-w-md w-full p-6 shadow-2xl flex flex-col rounded">
            <h3 className="text-sm font-black uppercase tracking-wider border-b border-pos-border pb-3 text-brand-primary flex items-center justify-center gap-2">
              <UserPlus size={16} className="text-brand-primary" />
              <span>Create New Account</span>
            </h3>

            <form
              onSubmit={handleAddUser}
              className="space-y-4 mt-4 text-sm font-medium text-text-secondary"
            >
              {/* Role Selection */}
              <div className="space-y-1">
                <label className="block font-bold">Select Role</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, role: "Cashier" }))
                    }
                    className={`p-3 border rounded flex flex-col items-center gap-1 font-bold transition-all ${formData.role === "Cashier" ? "border-blue-500 bg-blue-50/50 text-blue-700" : "border-pos-border bg-pos-bg"}`}
                  >
                    <User size={16} />
                    <span>Cashier</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, role: "Admin" }))
                    }
                    className={`p-3 border rounded flex flex-col items-center gap-1 font-bold transition-all ${formData.role === "Admin" ? "border-amber-500 bg-amber-50/50 text-amber-700" : "border-pos-border bg-pos-bg"}`}
                  >
                    <Shield size={16} />
                    <span>Admin</span>
                  </button>
                </div>
              </div>

              {/* Full Name Input */}
              <div className="space-y-1">
                <label className="block font-bold">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter staff full name"
                  className={`w-full border border-pos-border rounded px-3 py-2.5 text-text-primary font-semibold focus:border-brand-primary focus:outline-none transition-colors duration-200 ${
                    formData.fullName
                      ? "bg-brand-primary/10 border-pos-border"
                      : ""
                  }`}
                />
              </div>

              {/* Username Input */}
              <div className="space-y-1">
                <label className="block font-bold">Username</label>
                <input
                  type="text"
                  name="username"
                  required
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder={formData.role === "Admin" ? "Admin" : "Cashier1"}
                  className={`w-full border border-pos-border rounded px-3 py-2.5 text-text-primary font-semibold focus:border-brand-primary focus:outline-none transition-colors duration-200 ${
                    formData.username
                      ? "bg-brand-primary/10 border-pos-border"
                      : ""
                  }`}
                />
              </div>

              {/* Password Input inside Modal */}
              <div className="space-y-1">
                <label className="block font-bold">Set Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock size={14} />
                  </div>
                  <input
                    type={showModalPassword ? "text" : "password"}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter password"
                    className={`w-full border border-pos-border rounded pl-9 pr-10 py-2.5 text-text-primary font-semibold font-mono focus:border-brand-primary focus:outline-none placeholder:text-text-muted ${
                      formData.password ? "bg-brand-primary/10" : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowModalPassword(!showModalPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showModalPassword ? (
                      <EyeOff size={14} />
                    ) : (
                      <Eye size={14} />
                    )}
                  </button>
                </div>
              </div>

              {/* Help Guideline */}
              <div className="bg-slate-50 border border-pos-border rounded p-2.5 text-[12px] text-text-secondary flex items-start gap-1.5">
                <AlertCircle size={12} className="shrink-0 mt-0.5" />
                <div>
                  {formData.role === "Admin" ? (
                    <p>
                      Required: Admin account's username must be{" "}
                      <span className="font-bold font-mono text-brand-warning">
                        'admin'
                      </span>{" "}
                      only.
                    </p>
                  ) : (
                    <p>
                      Required: Cashier account's username must start with{" "}
                      <span className="font-bold font-mono text-brand-warning">
                        'cashier'
                      </span>{" "}
                      followed by a number.
                    </p>
                  )}
                </div>
              </div>

              {error && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 font-semibold flex items-center gap-2 text-[11px]">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2 border-t border-pos-border">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-text-primary font-bold py-2.5 rounded shadow-md cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-brand-primary hover:bg-brand-primary/90 text-white font-bold py-2.5 rounded shadow-md cursor-pointer"
                >
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
