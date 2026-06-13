import React, { useState } from "react";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Loader,
  ShoppingBag,
  Mail,
  Store,
} from "lucide-react";
import { useAuth } from "../context/AuthContext"; // Authentication hook

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);

  const { login } = useAuth();

  const [shopName, setShopName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const hasExistingAdmin = localStorage.getItem("registeredUser") !== null;

  const getExistingUsers = () => {
    const billmateUsers = localStorage.getItem("billmate_users");
    const registeredUser = localStorage.getItem("registeredUser");

    if (billmateUsers) {
      return JSON.parse(billmateUsers);
    }

    if (registeredUser) {
      const parsedSingleUser = JSON.parse(registeredUser);
      return [
        {
          username: parsedSingleUser.username || "admin",
          password: parsedSingleUser.password || "admin123",
          role: "Admin",
          createdAt: new Date().toISOString().split("T")[0],
        },
      ];
    }

    return [];
  };

  // Handle both login and sign-up logic in one function
  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    setTimeout(() => {
      const currentUsers = getExistingUsers();
      const inputUser = username.toLowerCase().trim();

      if (isSignUp) {
        if (password !== confirmPassword) {
          setError("Passwords do not match!");
          setIsLoading(false);
          return;
        }
        if (inputUser !== "admin") {
          setError(
            "Please choose 'Admin' as the username for the admin account.",
          );
          setIsLoading(false);
          return;
        }

        const newAdminAccount = {
          username: inputUser,
          password: password,
          role: "Admin",
          shopName: shopName,
          email: email,
          createdAt: new Date().toISOString().split("T")[0],
        };

        const updatedUsers = [
          newAdminAccount,
          ...currentUsers.filter((u) => u.username !== "admin"),
        ];

        localStorage.setItem("billmate_users", JSON.stringify(updatedUsers));
        localStorage.setItem(
          "registeredUser",
          JSON.stringify({ username: inputUser, password, shopName }),
        );
        localStorage.setItem("shopName", shopName);

        setSuccess("Admin account created successfully!! Please login.");
        setIsLoading(false);
        setIsSignUp(false);
        setPassword("");
        setConfirmPassword("");
      } else {
        const matchedUser = currentUsers.find((u) => u.username === inputUser);

        if (matchedUser) {
          if (password === matchedUser.password) {
            login(matchedUser.role, matchedUser.username);
          } else {
            setError("Incorrect password!");
            setIsLoading(false);
          }
        } else if (inputUser === "admin" && password === "admin123") {
          login("Admin", "admin");
        } else if (inputUser === "cashier" && password === "cashier123") {
          login("Cashier", "cashier");
        } else if (inputUser === "cashier1" && password === "cashier123") {
          login("Cashier", "cashier1");
        } else {
          setError("Username not found!");
          setIsLoading(false);
        }
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-pos-bg flex items-center justify-center p-4 selection:bg-brand-primary/30">
      <div className="w-full max-w-md bg-pos-card border border-pos-border/80 rounded-2xl shadow-2xl p-8 space-y-6 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-primary/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-brand-danger/5 rounded-full blur-2xl pointer-events-none"></div>

        {/* Logo & Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-brand-primary/10 text-brand-primary rounded-xl mb-1">
            <ShoppingBag size={28} />
          </div>
          <h1 className="text-2xl font-black text-brand-primary tracking-tight">
            SDL BillMate POS
          </h1>
          <p className="text-xs text-text-secondary">
            {isSignUp
              ? "Create your admin account."
              : "Please login to your account."}
          </p>
        </div>

        {/* Alerts (Error / Success) */}
        {error && (
          <div className="bg-brand-danger/10 border border-brand-danger/20 text-brand-danger text-xs font-semibold p-3 rounded-xl text-center">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold p-3 rounded-xl text-center">
            {success}
          </div>
        )}

        {/* Login/Sign Up Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* SIGN UP FIELDS */}
          {isSignUp && (
            <>
              {/* Store / Shop Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wide">
                  Store / Shop Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Store size={16} />
                  </div>
                  <input
                    type="text"
                    required
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    placeholder="example : SDL Supermarket"
                    className="w-full text-sm bg-pos-bg border border-pos-border rounded-md pl-10 pr-4 py-2.5 text-text-primary placeholder:text-text-muted font-medium focus:outline-none focus:border-brand-primary transition-all"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wide">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full text-sm bg-pos-bg border border-pos-border rounded-md pl-10 pr-4 py-2.5 text-text-primary placeholder:text-text-muted font-medium focus:outline-none focus:border-brand-primary transition-all"
                  />
                </div>
              </div>
            </>
          )}

          {/* Username */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wide">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <User size={16} />
              </div>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full text-sm bg-pos-bg border border-pos-border rounded-md pl-10 pr-4 py-2.5 text-text-primary placeholder:text-text-muted font-medium focus:outline-none focus:border-brand-primary transition-all"
              />
            </div>
          </div>

          {/*  Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wide">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
                <Lock size={16} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full text-sm bg-pos-bg border border-pos-border rounded-md pl-10 pr-4 py-2.5 text-text-primary placeholder:text-text-muted font-medium focus:outline-none focus:border-brand-primary transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/*  Confirm Password */}
          {isSignUp && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wide">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-sm bg-pos-bg border border-pos-border rounded-md pl-10 pr-4 py-2.5 text-text-primary placeholder:text-text-muted font-medium focus:outline-none focus:border-brand-primary transition-all"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 text-sm bg-brand-primary hover:bg-brand-primary/90 disabled:bg-brand-primary text-white py-3 rounded-md transition-all font-bold shadow-lg shadow-emerald-500/10 cursor-pointer disabled:cursor-not-allowed mt-2"
          >
            {isLoading ? (
              <div className="animate-spin flex items-center justify-center">
                <Loader size={18} className="text-white" />
              </div>
            ) : (
              <>
                <ShieldCheck size={18} />

                <span>{isSignUp ? "Sign Up" : "Sign In"}</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center text-sm text-text-secondary pt-2">
          {isSignUp ? (
            <p>
              Already have an account?{" "}
              <button
                onClick={() => {
                  setIsSignUp(false);
                  setError("");
                }}
                className="text-brand-primary font-bold hover:underline ml-1 cursor-pointer"
              >
                Sign In
              </button>
            </p>
          ) : (
            !hasExistingAdmin && (
              <p>
                Don't have an account?{" "}
                <button
                  onClick={() => {
                    setIsSignUp(true);
                    setError("");
                  }}
                  className="text-brand-primary font-bold hover:underline ml-1 cursor-pointer"
                >
                  Sign Up
                </button>
              </p>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
