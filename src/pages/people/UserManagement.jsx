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

  // LocalStorage-ல் இருந்து பயனர்களை எடுக்கிறோம்
  const [users, setUsers] = useState(() => {
    const billmateUsers = localStorage.getItem("billmate_users");
    const registeredUser = localStorage.getItem("registeredUser");

    if (billmateUsers) return JSON.parse(billmateUsers);

    if (registeredUser) {
      const parsedSingleUser = JSON.parse(registeredUser);
      return [
        {
          username: parsedSingleUser.username || "admin",
          password: parsedSingleUser.password || "admin123", // பாஸ்வேர்ட் சேர்க்கப்பட்டுள்ளது
          role: "Admin",
          createdAt: new Date().toISOString().split("T")[0],
        },
        {
          username: "cashier1",
          password: "cashier123",
          role: "Cashier",
          createdAt: "2026-02-20",
        },
      ];
    }

    return [
      {
        username: "admin",
        password: "admin123",
        role: "Admin",
        createdAt: "2026-01-15",
      },
      {
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
  const [showPassword, setShowPassword] = useState(false); // பாஸ்வேர்ட் காட்ட/மறைக்க
  const [formData, setFormData] = useState({
    username: "",
    password: "", // புதிய பாஸ்வேர்ட் ஸ்டேட்
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const cleanValue =
      name === "username" ? value.replace(/\s+/g, "").toLowerCase() : value;
    setFormData((prev) => ({ ...prev, [name]: cleanValue }));
    setError("");
  };

  const handleAddUser = (e) => {
    e.preventDefault();
    const { username, password, role } = formData;

    if (!username.trim()) {
      setError("பயனர் பெயரை உள்ளிடவும்!");
      return;
    }
    if (!password.trim() || password.length < 4) {
      setError("கடவுச்சொல் குறைந்தபட்சம் 4 எழுத்துக்கள் இருக்க வேண்டும்!");
      return;
    }

    if (role === "Admin" && username !== "admin") {
      setError("Admin கணக்கின் பெயர் 'admin' என்று மட்டுமே இருக்க வேண்டும்!");
      return;
    }

    if (role === "Cashier" && !username.startsWith("cashier")) {
      setError(
        "கேஷியர் கணக்கின் பெயர் 'cashier' என்ற அமைப்பில் தொடங்க வேண்டும்!",
      );
      return;
    }

    if (users.some((u) => u.username === username)) {
      setError("இந்த பயனர் பெயர் ஏற்கனவே பயன்படுத்தப்பட்டுள்ளது!");
      return;
    }

    const newUser = {
      username,
      password, // புதிய கேஷியரின் பாஸ்வேர்ட் சேமிக்கப்படுகிறது
      role,
      createdAt: new Date().toISOString().split("T")[0],
    };

    setUsers((prev) => [newUser, ...prev]);
    setShowModal(false);
    setFormData({ username: "", password: "", role: "Cashier" });
    setShowPassword(false);
    setError("");
  };

  const handleDeleteUser = (username) => {
    if (username === currentUser) {
      alert(
        "பாதுகாப்பு எச்சரிக்கை: நீங்கள் தற்போது லாகின் செய்துள்ள கணக்கை நீக்க முடியாது!",
      );
      return;
    }
    if (window.confirm(`'${username}' கணக்கை கணினியிலிருந்து நீக்கலாமா?`)) {
      setUsers((prev) => prev.filter((u) => u.username !== username));
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="p-5 flex flex-col h-[calc(100vh-70px)] bg-pos-bg overflow-hidden text-slate-900">
      {/* Search and Add User Bar */}
      <div className="bg-white border border-pos-border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 shadow-sm mb-4">
        <div className="relative flex-1 max-w-md">
          <Search
            size={16}
            className="absolute left-3.5 top-3.5 text-slate-400"
          />
          <input
            type="text"
            placeholder="பயனர் பெயர் அல்லது ரோல் மூலம் தேடுக..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs bg-pos-bg border border-pos-border rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-brand-primary font-medium"
          />
        </div>

        <button
          onClick={() => {
            setError("");
            setFormData({ username: "", password: "", role: "Cashier" });
            setShowModal(true);
          }}
          className="p-2.5 bg-brand-primary hover:bg-brand-primary-hover text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/10 cursor-pointer"
        >
          <UserPlus size={16} />
          <span>Add User</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="flex-1 overflow-y-auto">
        {filteredUsers.length === 0 ? (
          <div className="bg-white border border-pos-border rounded-2xl p-20 text-center text-slate-400">
            <Users size={40} className="mx-auto mb-2 text-slate-300" />
            <p className="font-bold text-sm">
              எந்தப் பயனர்களும் கண்டறியப்படவில்லை!
            </p>
          </div>
        ) : (
          <div className="bg-white border border-pos-border rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-slate-600 text-[11px] font-bold uppercase tracking-wider border-b border-pos-border">
                <tr>
                  <th className="py-3 px-5 w-12">Type</th>
                  <th className="py-3 px-4">Username</th>
                  <th className="py-3 px-4">Password (Hidden)</th>
                  <th className="py-3 px-4">Assigned Role</th>
                  <th className="py-3 px-4">Account Created Date</th>
                  <th className="py-3 px-5 text-center w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pos-border text-xs">
                {filteredUsers.map((u) => (
                  <tr
                    key={u.username}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3 px-5">
                      {u.role === "Admin" ? (
                        <div className="w-8 h-8 bg-amber-50 text-amber-600 rounded-lg border border-amber-100 flex items-center justify-center">
                          <Shield size={14} />
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg border border-blue-100 flex items-center justify-center">
                          <User size={14} />
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800 font-mono">
                      {u.username}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">
                      ••••••••
                    </td>{" "}
                    {/* பாதுகாப்பிற்கு பாஸ்வேர்ட் மறைக்கப்பட்டுள்ளது */}
                    <td className="py-3 px-4">
                      <span
                        className={`font-bold px-2 py-0.5 rounded-md text-[10px] ${u.role === "Admin" ? "bg-amber-100 text-amber-800 border border-amber-200" : "bg-blue-100 text-blue-800 border border-blue-200"}`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">
                      {u.createdAt}
                    </td>
                    <td className="py-3 px-5 text-center">
                      <button
                        onClick={() => handleDeleteUser(u.username)}
                        disabled={u.username === currentUser}
                        className={`p-1.5 rounded transition-colors ${u.username === currentUser ? "text-slate-300 cursor-not-allowed bg-slate-50" : "text-slate-400 hover:text-brand-danger hover:bg-rose-50 cursor-pointer"}`}
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
          <div className="bg-white border border-pos-border rounded-2xl max-w-md w-full p-6 shadow-2xl flex flex-col">
            <h3 className="text-sm font-black uppercase tracking-wider border-b border-pos-border pb-3 text-slate-700 flex items-center gap-2">
              <UserPlus size={16} className="text-brand-primary" />
              <span>Create New Account</span>
            </h3>

            <form
              onSubmit={handleAddUser}
              className="space-y-4 mt-4 text-xs font-medium text-slate-600"
            >
              {/* Role Selection */}
              <div className="space-y-1">
                <label className="block font-bold">Select Role *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, role: "Cashier" }))
                    }
                    className={`p-3 border rounded-xl flex flex-col items-center gap-1 font-bold transition-all ${formData.role === "Cashier" ? "border-blue-500 bg-blue-50/50 text-blue-700" : "border-pos-border bg-pos-bg"}`}
                  >
                    <User size={16} />
                    <span>Cashier</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, role: "Admin" }))
                    }
                    className={`p-3 border rounded-xl flex flex-col items-center gap-1 font-bold transition-all ${formData.role === "Admin" ? "border-amber-500 bg-amber-50/50 text-amber-700" : "border-pos-border bg-pos-bg"}`}
                  >
                    <Shield size={16} />
                    <span>Admin</span>
                  </button>
                </div>
              </div>

              {/* Username Input */}
              <div className="space-y-1">
                <label className="block font-bold">Username *</label>
                <input
                  type="text"
                  name="username"
                  required
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder={formData.role === "Admin" ? "admin" : "cashier1"}
                  className="w-full bg-pos-bg border border-pos-border rounded-xl px-3 py-2.5 text-slate-900 font-mono font-bold focus:border-brand-primary focus:outline-none"
                />
              </div>

              {/* ➡️ புதிய பாஸ்வேர்ட் இன்புட் ஃபீல்டு */}
              <div className="space-y-1">
                <label className="block font-bold">Set Password *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock size={14} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter password"
                    className="w-full bg-pos-bg border border-pos-border rounded-xl pl-9 pr-10 py-2.5 text-slate-900 font-bold focus:border-brand-primary focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* Help Guideline */}
              <div className="bg-slate-50 border border-pos-border rounded-lg p-2.5 text-[10px] text-slate-500 flex items-start gap-1.5">
                <AlertCircle size={12} className="shrink-0 mt-0.5" />
                <div>
                  {formData.role === "Admin" ? (
                    <p>
                      விதிமுறை: Admin கணக்கிற்கு பயனர் பெயர்{" "}
                      <span className="font-bold font-mono">'admin'</span>{" "}
                      மட்டுமே இருக்க வேண்டும்.
                    </p>
                  ) : (
                    <p>
                      விதிமுறை: கேஷியர் பெயர்கள்{" "}
                      <span className="font-bold font-mono">
                        'cashier1', 'cashier2'
                      </span>{" "}
                      போன்ற அமைப்பில் தொடங்க வேண்டும்.
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
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2.5 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-brand-primary hover:bg-brand-primary-hover text-white font-bold py-2.5 rounded-xl shadow-md"
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
