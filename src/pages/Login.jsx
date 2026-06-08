import React, { useState } from "react";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  ShoppingBag,
  Mail,
  Store,
} from "lucide-react";
import { useAuth } from "../context/AuthContext"; // Authentication hook

const Login = () => {
  // isSignUp -> true-வாக இருந்தால் Sign Up ஃபார்ம் காட்டும், false-ஆக இருந்தால் Login ஃபார்ம் காட்டும்.
  const [isSignUp, setIsSignUp] = useState(false);

  const { login } = useAuth(); // Authentication context-இல் இருந்து login function-ஐ எடுத்துக்கொள்கிறோம்

  // ஃபார்ம் இன்புட் ஸ்டேட்கள்
  const [shopName, setShopName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI ஸ்டேட்கள்
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // ஏற்கனவே யாராவது சைன்அப் செய்திருக்கிறார்களா என்று பார்க்கிறோம்
  const hasExistingAdmin = localStorage.getItem("registeredUser") !== null;

  // ➡️ லோக்கல் ஸ்டோரேஜில் இருக்கும் பயனர்கள் பட்டியலை பாதுகாப்பாக எடுக்கும் ஃபங்க்ஷன்
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

  // சப்மிட் லாஜிக்
  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    setTimeout(() => {
      const currentUsers = getExistingUsers();
      const inputUser = username.toLowerCase().trim();

      if (isSignUp) {
        // ==========================================
        // SIGN UP LOGIC (புதிய கடை பதிவு)
        // ==========================================
        if (password !== confirmPassword) {
          setError("கடவுச்சொற்கள் இரண்டும் ஒரே மாதிரியாக இல்லை!");
          setIsLoading(false);
          return;
        }
        if (inputUser !== "admin") {
          setError(
            "விதிமுறைப்படி முதன்மை அட்மின் பயனர் பெயர் 'admin' என்று மட்டுமே இருக்க வேண்டும்!",
          );
          setIsLoading(false);
          return;
        }

        const newAdminAccount = {
          username: inputUser,
          password: password, // முதலாளி செட் செய்யும் அட்மின் பாஸ்வேர்ட்
          role: "Admin",
          shopName: shopName,
          email: email,
          createdAt: new Date().toISOString().split("T")[0],
        };

        const updatedUsers = [
          newAdminAccount,
          ...currentUsers.filter((u) => u.username !== "admin"),
        ];

        // இரண்டு கீகளிலும் டேட்டாவை ஒத்திசைக்கிறோம்
        localStorage.setItem("billmate_users", JSON.stringify(updatedUsers));
        localStorage.setItem(
          "registeredUser",
          JSON.stringify({ username: inputUser, password, shopName }),
        );
        localStorage.setItem("shopName", shopName); // கடையின் பெயரை தனியாகவும் சேமிக்கிறோம்

        setSuccess(
          "கணக்கு வெற்றிகரமாக உருவாக்கப்பட்டது! இப்போது லாகின் செய்யவும்.",
        );
        setIsLoading(false);
        setIsSignUp(false);
        setPassword("");
        setConfirmPassword("");
      } else {
        // ==========================================
        // LOGIN LOGIC (DYNAMIC PASSWORD CHECKING)
        // ==========================================
        // லோக்கல் ஸ்டோரேஜில் இந்த பயனர் பெயர் இருக்கிறதா என தேடுகிறது (Admin & Custom Cashiers)
        const matchedUser = currentUsers.find((u) => u.username === inputUser);

        if (matchedUser) {
          // பயனர் மேலாண்மை பக்கத்தில் நீங்கள் கொடுத்த துல்லியமான பாஸ்வேர்ட்டை செக் செய்கிறது
          if (password === matchedUser.password) {
            login(matchedUser.role, matchedUser.username);
          } else {
            setError("தவறான கடவுச்சொல் (Incorrect Password)!");
            setIsLoading(false);
          }
        }
        // ஒருவேளை லோக்கல் ஸ்டோரேஜ் முற்றிலும் காலியாக இருந்தால் Hardcoded Fallback
        else if (inputUser === "admin" && password === "admin123") {
          login("Admin", "admin");
        } else if (inputUser === "cashier" && password === "cashier123") {
          login("Cashier", "cashier");
        } else if (inputUser === "cashier1" && password === "cashier123") {
          login("Cashier", "cashier1");
        } else {
          setError("பயனர் பெயர் கண்டறியப்படவில்லை!");
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

        {/* லோகோ & டைட்டில் */}
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

        {/* அலர்ட்டுகள் (Error / Success) */}
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

        {/* மெயின் ஃபார்ம் */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* SIGN UP-க்கு மட்டும் காட்டும் இன்புட்டுகள் */}
          {isSignUp && (
            <>
              {/* 1. கடையின் பெயர் */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">
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
                    placeholder="உதா: SDL Supermarket"
                    className="w-full text-sm bg-pos-bg border border-pos-border rounded-xl pl-10 pr-4 py-2.5 text-slate-200 placeholder-slate-600 font-medium focus:outline-none focus:border-brand-primary transition-all"
                  />
                </div>
              </div>

              {/* 2. மின்னஞ்சல் */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">
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
                    className="w-full text-sm bg-pos-bg border border-pos-border rounded-xl pl-10 pr-4 py-2.5 text-slate-200 placeholder-slate-600 font-medium focus:outline-none focus:border-brand-primary transition-all"
                  />
                </div>
              </div>
            </>
          )}

          {/* 3. யூசர்நேம் */}
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
                className="w-full text-[1rem] bg-pos-bg border border-pos-border rounded-xl pl-10 pr-4 py-2.5 text-text-primary placeholder:text-text-muted font-medium focus:outline-none focus:border-brand-primary transition-all"
              />
            </div>
          </div>

          {/* 4. கடவுச்சொல் */}
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
                className="w-full text-[1rem] bg-pos-bg border border-pos-border rounded-xl pl-10 pr-4 py-2.5 text-text-primary placeholder:text-text-muted font-medium focus:outline-none focus:border-brand-primary transition-all"
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

          {/* 5. கன்பார்ம் பாஸ்வேர்ட் (SIGN UP-க்கு மட்டும்) */}
          {isSignUp && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">
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
                  className="w-full text-sm bg-pos-bg border border-pos-border rounded-xl pl-10 pr-4 py-2.5 text-slate-200 placeholder-slate-600 font-medium focus:outline-none focus:border-brand-primary transition-all font-mono"
                />
              </div>
            </div>
          )}

          {/* சப்மிட் பட்டன் */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 text-sm bg-brand-primary hover:bg-emerald-500 disabled:bg-emerald-800 text-slate-950 py-3 rounded-xl transition-all font-bold shadow-lg shadow-emerald-500/10 cursor-pointer disabled:cursor-not-allowed mt-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <ShieldCheck size={18} />
                <span>
                  {isSignUp ? "கணக்கை உருவாக்கு (Sign Up)" : "Sign In"}
                </span>
              </>
            )}
          </button>
        </form>

        {/* லாகின் / சைன்அப் மாற்றும் லிங்க் */}
        <div className="text-center text-xs text-slate-400 pt-2">
          {isSignUp ? (
            <p>
              ஏற்கனவே கணக்கு உள்ளதா?{" "}
              <button
                onClick={() => {
                  setIsSignUp(false);
                  setError("");
                }}
                className="text-brand-primary font-bold hover:underline ml-1 cursor-pointer"
              >
                இங்கே உள்நுழையவும்
              </button>
            </p>
          ) : (
            !hasExistingAdmin && (
              <p>
                புதிய கடையா?{" "}
                <button
                  onClick={() => {
                    setIsSignUp(true);
                    setError("");
                  }}
                  className="text-brand-primary font-bold hover:underline ml-1 cursor-pointer"
                >
                  இலவசமாக பதிவு செய்யவும் (Sign Up)
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
