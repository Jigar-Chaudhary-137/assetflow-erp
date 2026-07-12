import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { employeeService } from '../services/employeeService';
import { Package, User, Mail, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';

export const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required';
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email Address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    try {
      // Persist user in the mock database
      await employeeService.create({
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: 'Employee', // default role
        department: 'Operations', // default dept
        designation: formData.username
      });
      
      // Navigate to login with success state message
      navigate('/login', { 
        state: { 
          message: 'Account created successfully. Please wait for administrator approval.' 
        } 
      });
    } catch (err) {
      setErrors({ submit: err.message || 'Registration failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear validation error when editing field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8FAFC] px-4 py-12 sm:px-6 lg:px-8 font-sans">
      
      {/* Brand logo header */}
      <div className="w-full max-w-md text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-[#2563EB] text-white shadow-md">
          <Package className="h-5 w-5" />
        </div>
        <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-[#0F172A]">
          Create Employee Account
        </h2>
        <p className="mt-1 text-sm text-slate-500 font-medium">
          AssetFlow Enterprise Portal Registration
        </p>
      </div>

      <div className="mt-6 w-full max-w-md">
        <div className="rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] p-8 shadow-sm">
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.submit && (
              <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
                <span className="font-semibold">{errors.submit}</span>
              </div>
            )}

            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className={`w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm text-[#0F172A] placeholder-slate-400 focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB] transition-all shadow-xs ${
                    errors.fullName ? 'border-rose-350 focus:ring-rose-500' : 'border-[#E2E8F0]'
                  }`}
                />
              </div>
              {errors.fullName && <p className="text-xs text-rose-600 mt-1 font-semibold">{errors.fullName}</p>}
            </div>

            {/* Username */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="johndoe"
                  className={`w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm text-[#0F172A] placeholder-slate-400 focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB] transition-all shadow-xs ${
                    errors.username ? 'border-rose-350 focus:ring-rose-500' : 'border-[#E2E8F0]'
                  }`}
                />
              </div>
              {errors.username && <p className="text-xs text-rose-600 mt-1 font-semibold">{errors.username}</p>}
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@company.com"
                  className={`w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm text-[#0F172A] placeholder-slate-400 focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB] transition-all shadow-xs ${
                    errors.email ? 'border-rose-350 focus:ring-rose-500' : 'border-[#E2E8F0]'
                  }`}
                />
              </div>
              {errors.email && <p className="text-xs text-rose-600 mt-1 font-semibold">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••"
                  className={`w-full rounded-xl border py-2.5 pl-10 pr-10 text-sm text-[#0F172A] placeholder-slate-400 focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB] transition-all shadow-xs ${
                    errors.password ? 'border-rose-350 focus:ring-rose-500' : 'border-[#E2E8F0]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-rose-600 mt-1 font-semibold">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••"
                  className={`w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm text-[#0F172A] placeholder-slate-400 focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB] transition-all shadow-xs ${
                    errors.confirmPassword ? 'border-rose-350 focus:ring-rose-500' : 'border-[#E2E8F0]'
                  }`}
                />
              </div>
              {errors.confirmPassword && <p className="text-xs text-rose-600 mt-1 font-semibold">{errors.confirmPassword}</p>}
            </div>

            {/* Register Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded-xl bg-[#2563EB] py-3 px-4 text-sm font-bold text-white shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 transition-all cursor-pointer mt-6"
            >
              {loading ? 'Creating Account...' : 'Create Employee Account'}
            </button>
          </form>

          {/* Back to Login Button */}
          <div className="mt-4 text-center">
            <Link
              to="/login"
              className="inline-block w-full rounded-xl border border-[#E2E8F0] bg-white py-3 px-4 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer shadow-xs text-center"
            >
              Back to Login
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
};
