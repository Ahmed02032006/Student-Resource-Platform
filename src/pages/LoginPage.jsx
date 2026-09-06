import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginThunk, clearAuthError } from '../store/authSlice';
import PendingModal from '../components/auth/PendingModal';
import RejectedModal from '../components/auth/RejectedModal';
import toast from 'react-hot-toast';
import { Lock, Mail, ArrowRight, Eye, EyeOff, GraduationCap } from 'lucide-react';

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, rejectionInfo } = useSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isPendingOpen, setIsPendingOpen] = useState(false);
  const [isRejectedOpen, setIsRejectedOpen] = useState(false);
  const [focused, setFocused] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearAuthError());
    const resultAction = await dispatch(loginThunk({ email, password }));

    if (loginThunk.fulfilled.match(resultAction)) {
      const user = resultAction.payload.data;
      toast.success(`Welcome back, ${user?.name || 'User'}!`);

      if (user?.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user?.role === 'cr') {
        navigate('/cr-dashboard');
      } else {
        navigate('/dashboard');
      }
    } else if (loginThunk.rejected.match(resultAction)) {
      const err = resultAction.payload;
      if (err?.code === 'ACCOUNT_PENDING') setIsPendingOpen(true);
      else if (err?.code === 'ACCOUNT_REJECTED') setIsRejectedOpen(true);
      else toast.error(err?.message || 'Authentication failed.');
    }
  };

  return (
    <div className="w-full h-full min-h-screen flex flex-col items-center justify-center px-8 py-10">
      {/* Mobile Wordmark */}
      <div className="lg:hidden flex items-center gap-2 mb-10">
        <div className="w-9 h-9 bg-blue-600 rounded flex items-center justify-center">
          <GraduationCap className="w-4 h-4 text-white" />
        </div>
        <span className="text-slate-900 text-xl font-semibold">
          ACADEX
        </span>
      </div>

      {/* Header */}
      <div className="w-full max-w-sm mb-9">
        <span className="text-blue-600 text-xs tracking-wide">Institutional access</span>
        <h2 className="text-slate-900 text-3xl font-semibold mt-1.5">
          Welcome back
        </h2>
        <p className="text-slate-500 text-sm mt-1.5">Sign in to continue your journey</p>
        <div className="h-px w-full bg-blue-600/10 mt-6" />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">
        <div>
          <label className="block text-sm text-slate-700 mb-2">
            Email address
          </label>
          <div className={`relative border-b transition-colors ${focused === 'email' ? 'border-blue-500' : 'border-slate-300'}`}>
            <Mail className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" strokeWidth={1.5} />
            <input
              type="email"
              required
              placeholder="student@institution.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocused('email')}
              onBlur={() => setFocused('')}
              className="w-full pl-7 pr-2 py-2.5 bg-transparent text-[15px] text-slate-900 placeholder-slate-400 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-slate-700 mb-2">
            Password
          </label>
          <div className={`relative border-b transition-colors ${focused === 'password' ? 'border-blue-500' : 'border-slate-300'}`}>
            <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" strokeWidth={1.5} />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocused('password')}
              onBlur={() => setFocused('')}
              className="w-full pl-7 pr-9 py-2.5 bg-transparent text-[15px] text-slate-900 placeholder-slate-400 outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900"
            >
              {showPassword ? <EyeOff className="w-4 h-4" strokeWidth={1.5} /> : <Eye className="w-4 h-4" strokeWidth={1.5} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 mt-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60 transition-colors"
        >
          {isLoading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Signing in…</span>
            </>
          ) : (
            <>
              <span>Sign in</span>
              <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
            </>
          )}
        </button>
      </form>

      {/* Footer */}
      <p className="text-sm text-slate-500 mt-8">
        New here?{' '}
        <Link to="/register" className="text-blue-600 font-medium hover:underline">
          Create an account
        </Link>
      </p>

      <PendingModal isOpen={isPendingOpen} onClose={() => setIsPendingOpen(false)} />
      <RejectedModal isOpen={isRejectedOpen} onClose={() => setIsRejectedOpen(false)} rejectionInfo={rejectionInfo} />
    </div>
  );
}