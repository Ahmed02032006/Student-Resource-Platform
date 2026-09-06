import React from 'react';
import { Outlet } from 'react-router-dom';
import { BookOpen, GraduationCap, Brain, TrendingUp } from 'lucide-react';

const FEATURES = [
  { icon: BookOpen, title: 'Course Archive', desc: 'All your learning resources in one place' },
  { icon: TrendingUp, title: 'GPA Tracker', desc: 'Monitor your academic performance' },
  { icon: Brain, title: 'AI Assistant', desc: 'Smart study help whenever you need it' },
  { icon: GraduationCap, title: 'Enrollment', desc: 'Simple course access management' },
];

export default function AuthLayout() {
  return (
    <div className="min-h-screen w-full flex bg-[var(--color-canvas)]">
      {/* Left Panel - 65% */}
      <div className="hidden lg:flex lg:w-[65%] relative overflow-hidden bg-slate-900">
        {/* Ruled-paper texture */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 35px, rgba(255,255,255,0.85) 35px, rgba(255,255,255,0.85) 36px)',
          }}
        />
        {/* Left margin rule, like a ruled notebook page */}
        <div className="absolute top-0 bottom-0 left-[88px] w-px bg-blue-500/25" />

        {/* Brand lockup */}
        <div className="absolute top-10 left-16 flex items-center gap-2.5 z-10">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
            <GraduationCap className="w-4 h-4 text-white" strokeWidth={2} />
          </div>
          <span className="text-white text-base font-semibold tracking-tight">ACADEX</span>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center w-full max-w-2xl mx-auto px-16">

          <span className="text-blue-400 text-sm italic mb-5 block">
            A record for every learner
          </span>

          {/* Main Heading */}
          <h1 className="text-white leading-[1.15] mb-6">
            <span className="block text-4xl font-normal">Your complete</span>
            <span className="block text-5xl font-semibold mt-1">academic companion</span>
          </h1>
          <div className="h-px w-16 bg-blue-500 mb-6" />
          <p className="text-slate-400 text-base mb-8 leading-relaxed max-w-md">
            Access course materials, track your GPA, get AI-powered study help, and manage enrollments — all from one unified record.
          </p>

          {/* Feature list — compact two-column, no card chrome */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-6">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/15 flex items-center justify-center shrink-0">
                  <Icon className="w-[18px] h-[18px] text-blue-400" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{title}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - 35% */}
      <div className="flex-1 lg:w-[35%] min-h-screen bg-[var(--color-card)] relative">
        <div
          className="absolute inset-0 opacity-[0.5] pointer-events-none"
          style={{
            backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 39px, rgba(15,23,42,0.035) 39px, rgba(15,23,42,0.035) 40px)',
          }}
        />
        <div className="relative z-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
}