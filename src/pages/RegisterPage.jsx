import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerThunk, clearAuthError } from '../store/authSlice';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { User, Mail, Lock, ArrowRight, Eye, EyeOff, Clock, GraduationCap } from 'lucide-react';

const SEMESTERS = [
  '1st Semester', '2nd Semester', '3rd Semester', '4th Semester',
  '5th Semester', '6th Semester', '7th Semester', '8th Semester',
];

export default function RegisterPage() {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({ name: '', email: '', password: '', semester: '1st Semester' });
  const [registeredUser, setRegisteredUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !formData.semester) return;
    dispatch(clearAuthError());
    const resultAction = await dispatch(registerThunk(formData));
    if (registerThunk.fulfilled.match(resultAction)) {
      toast.success('Registration request submitted!');
      setRegisteredUser({ name: formData.name, email: formData.email, semester: formData.semester });
    } else if (registerThunk.rejected.match(resultAction)) {
      toast.error(resultAction.payload?.message || 'Registration failed.');
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

      {registeredUser ? (
        /* Success State — record card */
        <div className="w-full max-w-sm">
          <div className="flex items-start gap-3 mb-6">
            <Clock className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" strokeWidth={1.5} />
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">
                Registration submitted
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                Welcome, <span className="text-blue-600 font-medium">{registeredUser.name}</span>. Your record is under review.
              </p>
            </div>
          </div>

          <div className="border border-slate-200 rounded p-5 text-sm">
            <div className="flex justify-between items-center py-2.5 border-b border-slate-100">
              <span className="text-slate-400">Email</span>
              <span className="text-slate-900 font-medium">{registeredUser.email}</span>
            </div>
            <div className="flex justify-between items-center py-2.5 border-b border-slate-100">
              <span className="text-slate-400">Semester</span>
              <span className="text-slate-900 font-medium">{registeredUser.semester}</span>
            </div>
            <div className="flex justify-between items-center py-2.5">
              <span className="text-slate-400">Status</span>
              <span
                className="px-2 py-0.5 text-[10px] tracking-wide text-amber-700 bg-amber-100 rounded-full"
              >
                PENDING
              </span>
            </div>
          </div>

          <Link
            to="/login"
            className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded flex items-center justify-center transition-colors"
          >
            Go to sign in
          </Link>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="w-full max-w-sm mb-8">
            <span className="text-blue-600 text-xs tracking-wide">Student registration</span>
            <h2 className="text-slate-900 text-3xl font-semibold mt-1.5">
              Create account
            </h2>
            <p className="text-slate-500 text-sm mt-1.5">Join the ACADEX learning platform</p>
            <div className="h-px w-full bg-blue-600/10 mt-6" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">
            <div>
              <label className="block text-sm text-slate-700 mb-2">
                Full name
              </label>
              <div className={`relative border-b transition-colors ${focused === 'name' ? 'border-blue-500' : 'border-slate-300'}`}>
                <User className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" strokeWidth={1.5} />
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Mercer"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  onFocus={() => setFocused('name')}
                  onBlur={() => setFocused('')}
                  className="w-full pl-7 pr-2 py-2.5 bg-transparent text-[15px] text-slate-900 placeholder-slate-400 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-700 mb-2">
                Email address
              </label>
              <div className={`relative border-b transition-colors ${focused === 'email' ? 'border-blue-500' : 'border-slate-300'}`}>
                <Mail className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" strokeWidth={1.5} />
                <input
                  type="email"
                  required
                  placeholder="alex@student.edu"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused('')}
                  className="w-full pl-7 pr-2 py-2.5 bg-transparent text-[15px] text-slate-900 placeholder-slate-400 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-700 mb-2">
                Semester
              </label>
              <select
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                className="w-full border-b border-slate-300 focus:border-blue-500 py-2.5 bg-transparent text-[15px] text-slate-900 outline-none transition-colors"
              >
                {SEMESTERS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
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
                  placeholder="Min. 8 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
                  <span>Creating…</span>
                </>
              ) : (
                <>
                  <span>Create account</span>
                  <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="text-sm text-slate-500 mt-8">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </>
      )}
    </div>
  );
}