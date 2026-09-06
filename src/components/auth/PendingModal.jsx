import React from 'react';
import { Clock } from 'lucide-react';

export default function PendingModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="w-full max-w-md p-6 bg-white border border-slate-200 rounded-2xl shadow-2xl relative overflow-hidden">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-heading text-lg font-bold text-slate-900">Account Pending Approval</h3>
            <span className="text-xs text-amber-600 font-medium">Under Administrative Review</span>
          </div>
        </div>

        <p className="text-slate-600 text-sm mb-4 leading-relaxed">
          Your account registration has been submitted successfully and is currently awaiting review by an institution administrator.
        </p>

        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-slate-700 mb-6 space-y-1">
          <p className="font-semibold text-amber-700">What happens next?</p>
          <p>• Administrators review pending credentials daily.</p>
          <p>• Once approved, you can log in to access course materials.</p>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl transition-colors text-sm"
          >
            Understood, Close
          </button>
        </div>
      </div>
    </div>
  );
}