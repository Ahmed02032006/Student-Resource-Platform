import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertOctagon } from 'lucide-react';

export default function RejectedModal({ isOpen, onClose, rejectionInfo }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleReapply = () => {
    onClose();
    navigate('/register');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="w-full max-w-md p-6 bg-white border border-slate-200 rounded-2xl shadow-2xl relative overflow-hidden">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-heading text-lg font-bold text-slate-900">Account Access Blocked</h3>
            <span className="text-xs text-red-600 font-medium">Registration Rejected</span>
          </div>
        </div>

        <p className="text-slate-600 text-sm mb-4 leading-relaxed">
          Your registration request was reviewed and rejected by the administration team.
        </p>

        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-slate-700 mb-6 space-y-1">
          <p className="font-semibold text-red-700">Reason for rejection:</p>
          <p className="italic">
            "{rejectionInfo?.reason || 'Verification of student credentials could not be completed.'}"
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={handleReapply}
            className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors text-sm"
          >
            Re-apply Now
          </button>
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}