import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import user from "../Server/user.js";
import { Eye, EyeOff, User, Mail, Lock, UserPlus } from "lucide-react";

const Register = () => {
  const navigate = useNavigate();
  const Service = new user();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullname: "",
    username: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullname.trim()) {
      newErrors.fullname = "Full name is required";
    }
    
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      const response = await Service.register(formData);
      if (response.data.success) {
        // Store tokens if returned by the API
        if (response.data.accessToken) {
          localStorage.setItem("accessToken", response.accessToken);
        }
        if (response.data.refreshToken) {
          localStorage.setItem("refreshToken", response.refreshToken);
        }
        
        // Navigate to login or directly to chat
      }
      navigate("/login", { state: { message: "Registration successful! Please login." } });
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Registration failed. Please try again.";
      
      if (error.response?.data?.field) {
        // Set specific field error
        setErrors({
          ...errors,
          [error.response.data.field]: errorMessage
        });
      } else {
        // Set general error
        setErrors({
          ...errors,
          general: errorMessage
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-800">Create an Account</h1>
          <p className="mt-2 text-gray-600">Join our chat community</p>
        </div>

        {errors.general && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name Field */}
          <div>
            <label htmlFor="fullname" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <div className="relative mt-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                <User size={18} />
              </span>
              <input
                id="fullname"
                name="fullname"
                type="text"
                value={formData.fullname}
                onChange={handleChange}
                className={`block w-full rounded-md border pl-10 py-2 ${
                  errors.fullname ? "border-red-500" : "border-gray-300"
                } focus:border-blue-500 focus:outline-none focus:ring-blue-500`}
                placeholder="John Doe"
              />
            </div>
            {errors.fullname && <p className="mt-1 text-xs text-red-600">{errors.fullname}</p>}
          </div>

          {/* Username Field */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <div className="relative mt-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                <UserPlus size={18} />
              </span>
              <input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                className={`block w-full rounded-md border pl-10 py-2 ${
                  errors.username ? "border-red-500" : "border-gray-300"
                } focus:border-blue-500 focus:outline-none focus:ring-blue-500`}
                placeholder="johndoe123"
              />
            </div>
            {errors.username && <p className="mt-1 text-xs text-red-600">{errors.username}</p>}
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <div className="relative mt-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                <Mail size={18} />
              </span>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={`block w-full rounded-md border pl-10 py-2 ${
                  errors.email ? "border-red-500" : "border-gray-300"
                } focus:border-blue-500 focus:outline-none focus:ring-blue-500`}
                placeholder="johndoe@example.com"
              />
            </div>
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative mt-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                <Lock size={18} />
              </span>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                className={`block w-full rounded-md border pl-10 pr-10 py-2 ${
                  errors.password ? "border-red-500" : "border-gray-300"
                } focus:border-blue-500 focus:outline-none focus:ring-blue-500`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-blue-600 py-3 text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;