import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, AlertCircle, Info, Package } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const { login, error, loading } = useAuth();
  
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      // Handled by auth context
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8FAFC] px-4 py-12 sm:px-6 lg:px-8 font-sans">
      
      {/* Centered Authentication Card */}
      <div className="w-full max-w-md bg-[#FFFFFF] rounded-2xl border border-[#E2E8F0] p-8 shadow-sm">
        
        {/* AssetFlow Logo at top */}
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2563EB] text-white">
              <Package className="h-4.5 w-4.5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-[#0F172A]">AssetFlow</span>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold tracking-tight text-[#0F172A] mt-2">
            AssetFlow Login
          </h2>
          
          {/* Circular AF logo icon */}
          <div className="mt-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#2563EB] text-white font-extrabold text-xl shadow-sm border border-blue-500">
              AF
            </div>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
              <span className="font-semibold">{error}</span>
            </div>
          )}

          <div className="space-y-4">
            {/* Email Input */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full rounded-xl border border-[#E2E8F0] bg-white py-2.5 pl-10 pr-4 text-sm text-[#0F172A] placeholder-slate-450 focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB] transition-all shadow-xs"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  className="w-full rounded-xl border border-[#E2E8F0] bg-white py-2.5 pl-10 pr-4 text-sm text-[#0F172A] placeholder-slate-450 focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB] transition-all shadow-xs"
                />
              </div>
              
              {/* Forgot Password Link */}
              <div className="flex justify-end mt-1.5">
                <a 
                  href="#forgot-password" 
                  onClick={(e) => { e.preventDefault(); alert("Password recovery instructions sent if email exists."); }}
                  className="text-xs text-[#2563EB] font-bold hover:underline"
                >
                  Forgot Password?
                </a>
              </div>
            </div>
          </div>

          {/* Primary Sign In Button */}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full justify-center rounded-xl bg-[#2563EB] py-3 px-4 text-sm font-bold text-white shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 transition-all cursor-pointer"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Divider Section */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-[#E2E8F0]" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#FFFFFF] px-3 font-bold text-slate-400">Or</span>
          </div>
        </div>

        {/* New Here? Section */}
        <div className="space-y-4">
          <h3 className="text-center font-bold text-slate-800 text-sm">
            New Here?
          </h3>
          
          {/* Information Card */}
          <div className="flex gap-2.5 rounded-xl bg-blue-50 border border-blue-100 p-3.5 text-xs text-blue-800 leading-relaxed shadow-xs">
            <Info className="h-4.5 w-4.5 shrink-0 text-blue-600 animate-pulse" />
            <span>Creating an account generates an employee account. Administrative roles are assigned by the organization administrator.</span>
          </div>

          {/* Create Account Button */}
          <Link
            to="/register"
            className="block w-full text-center rounded-xl border border-[#E2E8F0] bg-white py-3 px-4 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer shadow-xs"
          >
            Create Account
          </Link>
        </div>

      </div>

      {/* Demo Accounts Helper Card */}
      <div className="mt-6 w-full max-w-md bg-[#FFFFFF] rounded-2xl border border-[#E2E8F0] p-6 shadow-sm font-sans">
        <h4 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 mb-3">
          Demo Accounts
        </h4>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="space-y-1">
            <p className="font-bold text-slate-700">System Administrator</p>
            <p className="text-slate-500 font-mono">admin@assetflow.com</p>
            {showPasswords && <p className="text-[#2563EB] font-bold font-mono">Pass: Admin@123</p>}
          </div>
          <div className="space-y-1">
            <p className="font-bold text-slate-700">Asset Manager</p>
            <p className="text-slate-500 font-mono">manager@assetflow.com</p>
            {showPasswords && <p className="text-[#2563EB] font-bold font-mono">Pass: Manager@123</p>}
          </div>
          <div className="space-y-1">
            <p className="font-bold text-slate-700">Department Head</p>
            <p className="text-slate-500 font-mono">department@assetflow.com</p>
            {showPasswords && <p className="text-[#2563EB] font-bold font-mono">Pass: Department@123</p>}
          </div>
          <div className="space-y-1">
            <p className="font-bold text-slate-700">Employee</p>
            <p className="text-slate-500 font-mono">employee@assetflow.com</p>
            {showPasswords && <p className="text-[#2563EB] font-bold font-mono">Pass: Employee@123</p>}
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-slate-100 flex justify-center">
          <button
            type="button"
            onClick={() => setShowPasswords(!showPasswords)}
            className="text-xs text-[#2563EB] font-bold hover:underline cursor-pointer flex items-center gap-1.5"
          >
            {showPasswords ? "Hide Demo Credentials" : "View Demo Credentials"}
          </button>
        </div>
      </div>

    </div>
  );
};
