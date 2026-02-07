import React, { useState } from "react";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  UserPlus,
  User,
  Hash,
  Home,
  DoorOpen,
  ChevronDown,
} from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");

  // Registration form fields
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    rollNo: "",
    hostelNo: "",
    roomNo: "",
  });

  const API_URL = "http://localhost:5000/api";

  // Hostel options
  const hostelOptions = [
    { value: "", label: "Select Hostel", disabled: true },
    { value: "MBH-A", label: "MBH-A - Main Boys Hostel" },
    { value: "MBH-B", label: "MBH-B - Main Boys Hostel" },
    { value: "MBH-F", label: "MBH-F - Main Boys Hostel" },
    { value: "BH-1", label: "BH-1 - Boys Hostel 1" },
    { value: "BH-2", label: "BH-2 - Boys Hostel 2" },
    { value: "BH-3", label: "BH-3 - Boys Hostel 3" },
    { value: "BH-4", label: "BH-4 - Boys Hostel 4" },
    { value: "BH-5", label: "BH-5 - Boys Hostel 5" },
    { value: "BH-6", label: "BH-6 - Boys Hostel 6" },
    { value: "BH-7", label: "BH-7 - Boys Hostel 7" },
    { value: "GH-1", label: "GH-1 - Girls Hostel 1" },
    { value: "GH-2", label: "GH-2 - Girls Hostel 2" },
    { value: "MGH-1", label: "MGH-1 - Main Girls Hostel 1" },
    { value: "MGH-2", label: "MGH-2 - Main Girls Hostel 2" },
  ];

  const validateEmail = (email) => {
    // Check if email ends with @nitj.ac.in
    const collegeDomain = "@nitj.ac.in";
    if (!email.endsWith(collegeDomain)) {
      return `Email must be a college email ending with ${collegeDomain}`;
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }

    return null;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Invalid email or password");
        setLoading(false);
        return;
      }

      // Store authentication data
      const authData = {
        isAuthenticated: true,
        token: data.token,
        student: data.student,
        loginTime: new Date().toISOString(),
      };

      localStorage.setItem("authToken", data.token);
      localStorage.setItem("authUser", JSON.stringify(authData));
      sessionStorage.setItem("authUser", JSON.stringify(authData));
      window.currentUser = authData;

      setLoading(false);

      alert(
        `Login successful! Welcome ${data.student.name}\n\nRedirecting to dashboard...`,
      );
      window.location.href = "/student/dashboard";
    } catch (error) {
      console.error("Login error:", error);
      setError("Server error. Please try again later.");
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation
    if (
      !registerData.name ||
      !registerData.email ||
      !registerData.password ||
      !registerData.rollNo ||
      !registerData.hostelNo ||
      !registerData.roomNo
    ) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    // Email validation
    const emailError = validateEmail(registerData.email);
    if (emailError) {
      setError(emailError);
      setLoading(false);
      return;
    }

    if (registerData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: registerData.name,
          email: registerData.email,
          password: registerData.password,
          rollNo: registerData.rollNo,
          hostelNo: registerData.hostelNo,
          roomNo: registerData.roomNo,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Registration failed");
        setLoading(false);
        return;
      }

      setLoading(false);
      alert(
        `Registration successful! Welcome ${data.student.name}\n\nYou can now login with your credentials.`,
      );

      // Switch to login view and pre-fill email
      setShowRegister(false);
      setEmail(registerData.email);
      setRegisterData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        rollNo: "",
        hostelNo: "",
        roomNo: "",
      });
    } catch (error) {
      console.error("Registration error:", error);
      setError("Server error. Please try again later.");
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setResetMessage("");

    await new Promise((resolve) => setTimeout(resolve, 1000));
    setResetMessage("Password reset functionality will be implemented soon!");

    setTimeout(() => {
      setShowForgotPassword(false);
      setResetEmail("");
      setResetMessage("");
    }, 2000);
  };

  // Forgot Password View
  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 px-4">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

        <div className="bg-white shadow-2xl rounded-3xl w-full max-w-md p-8 relative z-10 border border-gray-100">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Lock className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Reset Password
            </h2>
            <p className="text-gray-500">
              Enter your email to receive reset link
            </p>
          </div>

          <div>
            <div className="mb-6">
              <label className="block mb-2 text-sm font-semibold text-gray-700">
                College Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleForgotPassword(e)
                  }
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="you@nitj.ac.in"
                />
              </div>
            </div>

            {resetMessage && (
              <div className="mb-4 p-3 rounded-lg text-sm bg-blue-50 text-blue-700 border border-blue-200">
                {resetMessage}
              </div>
            )}

            <button
              onClick={handleForgotPassword}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
            >
              Send Reset Link
            </button>

            <button
              onClick={() => setShowForgotPassword(false)}
              className="w-full mt-3 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Register View
  if (showRegister) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 px-4 py-8">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

        <div className="absolute top-20 left-10 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

        <div className="bg-white shadow-2xl rounded-3xl w-full max-w-2xl p-8 relative z-10 border border-gray-100">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-2xl mb-4 shadow-lg">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Create Account
            </h2>
            <p className="text-gray-500">Register as a new student at NITJ</p>
          </div>

          <form onSubmit={handleRegister}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="md:col-span-2">
                <label className="block mb-2 text-sm font-semibold text-gray-700">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={registerData.name}
                    onChange={(e) =>
                      setRegisterData({ ...registerData, name: e.target.value })
                    }
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Your Name"
                    required
                  />
                </div>
              </div>

              {/* College Email */}
              <div className="md:col-span-2">
                <label className="block mb-2 text-sm font-semibold text-gray-700">
                  College Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={registerData.email}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        email: e.target.value,
                      })
                    }
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="yourname@nitj.ac.in"
                    required
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Use your official NITJ email address
                </p>
              </div>

              {/* Roll Number */}
              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700">
                  Roll Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={registerData.rollNo}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        rollNo: e.target.value,
                      })
                    }
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Your roll number"
                    required
                  />
                </div>
              </div>

              {/* Hostel Dropdown */}
              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700">
                  Hostel <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                  <select
                    value={registerData.hostelNo}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        hostelNo: e.target.value,
                      })
                    }
                    className="w-full pl-12 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white cursor-pointer"
                    required
                  >
                    {hostelOptions.map((option) => (
                      <option
                        key={option.value}
                        value={option.value}
                        disabled={option.disabled}
                        className="py-2"
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Room Number */}
              <div className="md:col-span-2">
                <label className="block mb-2 text-sm font-semibold text-gray-700">
                  Room Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <DoorOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={registerData.roomNo}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        roomNo: e.target.value,
                      })
                    }
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="428"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={registerData.password}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        password: e.target.value,
                      })
                    }
                    className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="••••••••"
                    minLength="6"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Minimum 6 characters
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={registerData.confirmPassword}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-700 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-xl font-semibold transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating Account...
                </span>
              ) : (
                "Create Account"
              )}
            </button>

            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => {
                  setShowRegister(false);
                  setError("");
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
              >
                Already have an account? Sign In
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Login View
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 px-4">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

      <div className="bg-white shadow-2xl rounded-3xl w-full max-w-md p-8 relative z-10 border border-gray-100">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl mb-4 shadow-lg">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome Back
          </h2>
          <p className="text-gray-500">Sign in to access your dashboard</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="mb-5">
            <label className="block mb-2 text-sm font-semibold text-gray-700">
              College Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="you@nitj.ac.in"
                required
              />
            </div>
          </div>

          <div className="mb-2">
            <label className="block mb-2 text-sm font-semibold text-gray-700">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div className="flex justify-end mb-6">
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
            >
              Forgot Password?
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white rounded-xl font-semibold transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Signing In...
              </span>
            ) : (
              "Sign In"
            )}
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">
                New to NITJ Mess?
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setShowRegister(true);
              setError("");
            }}
            className="w-full py-3 bg-white border-2 border-green-600 text-green-600 hover:bg-green-50 rounded-xl font-semibold transition-all transform hover:scale-[1.02] shadow-md hover:shadow-lg"
          >
            Create New Account
          </button>
        </form>
      </div>

      <style>{`
        .bg-grid-pattern {
          background-image: 
            linear-gradient(to right, #e5e7eb 1px, transparent 1px),
            linear-gradient(to bottom, #e5e7eb 1px, transparent 1px);
          background-size: 20px 20px;
        }
        
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }

        select option {
          padding: 12px;
        }

        select:focus option:checked {
          background: linear-gradient(to right, #3b82f6, #10b981);
          color: white;
        }
      `}</style>
    </div>
  );
}
