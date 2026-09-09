import React, { useEffect, useState } from 'react';
import * as adminApi from '../../api/admin';
import { UserCheck, Clock, CheckCircle, XCircle, ShieldAlert, Users, UserX, UserPlus, Bell, X, Calendar, AlertTriangle, Pencil, Trash2, XCircle as RejectIcon } from 'lucide-react';
import Loader from '../../components/Loader';
import toast from 'react-hot-toast';

const TAB_STORAGE_KEY = 'admin_approvals_active_tab';

export default function AdminApprovalsPage() {
  const [pendingAccounts, setPendingAccounts] = useState([]);
  const [allAccounts, setAllAccounts] = useState([]);
  const [enrollmentRequests, setEnrollmentRequests] = useState([]);
  const [activeTab, setActiveTab] = useState(() => {
    try {
      const savedTab = localStorage.getItem(TAB_STORAGE_KEY);
      return savedTab || 'accounts';
    } catch (err) {
      return 'accounts';
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [revokeModal, setRevokeModal] = useState({ isOpen: false, enrollment: null, reason: '' });
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRejectAccountModal, setShowRejectAccountModal] = useState(false);
  const [showRejectEnrollmentModal, setShowRejectEnrollmentModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    semester: '',
    uniqueUserId: '',
    accountStatus: 'pending'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Save active tab to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(TAB_STORAGE_KEY, activeTab);
    } catch (err) {
      console.warn('Failed to save active tab to localStorage', err);
    }
  }, [activeTab]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [accRes, allAccRes, enrRes] = await Promise.all([
        adminApi.fetchAccounts('pending'),
        adminApi.fetchAccounts(),
        adminApi.fetchAdminEnrollments(),
      ]);
      setPendingAccounts(accRes.data || []);
      setAllAccounts(allAccRes.data || []);
      setEnrollmentRequests(enrRes.data || []);
    } catch (err) {
      console.error('Failed to load admin approval data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApproveAccount = async (acc) => {
    try {
      await adminApi.updateAccount(acc._id || acc.id, { action: 'approve' });
      toast.success('Account approved successfully');
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to approve account.');
    }
  };

  const openRejectAccountModal = (acc) => {
    setSelectedUser(acc);
    setRejectReason('Registration request rejected by admin stamp.');
    setShowRejectAccountModal(true);
  };

  const handleRejectAccount = async () => {
    if (!selectedUser || !rejectReason.trim()) return;
    setIsSubmitting(true);
    try {
      await adminApi.updateAccount(selectedUser._id || selectedUser.id, { action: 'reject', reason: rejectReason });
      toast.success('Account rejected');
      setShowRejectAccountModal(false);
      setSelectedUser(null);
      setRejectReason('');
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to reject account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      semester: user.semester || '1st Semester',
      uniqueUserId: user.uniqueUserId || '',
      accountStatus: user.accountStatus || 'pending'
    });
    setShowEditModal(true);
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    if (!editForm.name || !editForm.email) return;

    setIsSubmitting(true);
    try {
      await adminApi.updateUserDetails(selectedUser._id || selectedUser.id, {
        name: editForm.name,
        email: editForm.email,
        semester: editForm.semester,
        uniqueUserId: editForm.uniqueUserId,
        accountStatus: editForm.accountStatus
      });

      toast.success('User details updated successfully');
      setShowEditModal(false);
      setSelectedUser(null);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to update user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setIsSubmitting(true);
    try {
      await adminApi.deleteUser(selectedUser._id || selectedUser.id);
      toast.success('User deleted successfully');
      setShowDeleteModal(false);
      setSelectedUser(null);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to delete user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproveEnrollment = async (req) => {
    try {
      await adminApi.updateEnrollment(req._id || req.id, { action: 'approve' });
      toast.success('Enrollment approved');
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to approve enrollment.');
    }
  };

  const openRejectEnrollmentModal = (req) => {
    setSelectedEnrollment(req);
    setRejectReason('Prerequisites or class limits check failed.');
    setShowRejectEnrollmentModal(true);
  };

  const handleRejectEnrollment = async () => {
    if (!selectedEnrollment || !rejectReason.trim()) return;
    setIsSubmitting(true);
    try {
      await adminApi.updateEnrollment(selectedEnrollment._id || selectedEnrollment.id, { action: 'reject', reason: rejectReason });
      toast.success('Enrollment rejected');
      setShowRejectEnrollmentModal(false);
      setSelectedEnrollment(null);
      setRejectReason('');
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to reject enrollment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openRevokeModal = (req) => {
    setRevokeModal({
      isOpen: true,
      enrollment: req,
      reason: 'Revoked by administrative decision.'
    });
  };

  const handleRevokeEnrollment = async () => {
    if (!revokeModal.enrollment) return;

    try {
      await adminApi.updateEnrollment(revokeModal.enrollment._id || revokeModal.enrollment.id, {
        action: 'revoke',
        reason: revokeModal.reason
      });
      setRevokeModal({ isOpen: false, enrollment: null, reason: '' });
      toast.success('Enrollment revoked');
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to revoke enrollment.');
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const pendingEnrollmentRequests = enrollmentRequests.filter(r => r.status === 'pending');
  const activeEnrollments = enrollmentRequests.filter(r => r.status === 'approved');
  const approvedAccounts = allAccounts.filter(acc => acc.accountStatus === 'approved');
  const rejectedAccounts = allAccounts.filter(acc => acc.accountStatus === 'rejected');

  // Show full page loader while loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      {/* Sub-Tab Selector */}
      <div className="flex space-x-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
        <button
          onClick={() => handleTabChange('accounts')}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-all ${activeTab === 'accounts'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-slate-600 hover:text-slate-900'
            }`}
        >
          Pending Accounts ({pendingAccounts.length})
        </button>
        <button
          onClick={() => handleTabChange('users')}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-all ${activeTab === 'users'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-slate-600 hover:text-slate-900'
            }`}
        >
          Total Users ({allAccounts.length})
        </button>
        <button
          onClick={() => handleTabChange('enrollments')}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-all ${activeTab === 'enrollments'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-slate-600 hover:text-slate-900'
            }`}
        >
          Course Access ({activeEnrollments.length})
        </button>
      </div>

      {/* Tab 1: Pending Accounts */}
      {activeTab === 'accounts' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="font-heading text-sm font-bold text-slate-900">Pending Registrations</h3>
              <p className="text-xs text-slate-500">Review student user accounts and approve ledger access</p>
            </div>
            <span className="px-2.5 py-0.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full">
              {pendingAccounts.length} Awaiting
            </span>
          </div>

          {pendingAccounts.length === 0 ? (
            <div className="p-10 text-center text-slate-400 text-xs">
              🎉 All pending account registrations have been approved and processed.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">User ID</th>
                    <th className="p-3.5">Student Name</th>
                    <th className="p-3.5">Semester</th>
                    <th className="p-3.5">Email</th>
                    <th className="p-3.5">Created At</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pendingAccounts.map((acc) => (
                    <tr key={acc._id || acc.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-mono-code text-blue-600 font-bold">{acc.uniqueUserId}</td>
                      <td className="p-3.5 font-semibold text-slate-900">{acc.name}</td>
                      <td className="p-3.5 text-slate-600">{acc.semester || '1st Semester'}</td>
                      <td className="p-3.5 text-slate-500 font-mono-code">{acc.email}</td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-mono-code text-[11px]">
                            {new Date(acc.createdAt || Date.now()).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono-code mt-0.5">
                          {new Date(acc.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        <button
                          onClick={() => handleApproveAccount(acc)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs transition-colors shadow-2xs"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => openRejectAccountModal(acc)}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-xs transition-colors shadow-2xs"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Total Users */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="font-heading text-sm font-bold text-slate-900">All Registered Users</h3>
              <p className="text-xs text-slate-500">Complete list of all user accounts in the system</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full">
                {approvedAccounts.length} Approved
              </span>
              <span className="px-2.5 py-0.5 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-full">
                {rejectedAccounts.length} Rejected
              </span>
            </div>
          </div>

          {allAccounts.length === 0 ? (
            <div className="p-10 text-center text-slate-400 text-xs">
              No registered users found in the system.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">User ID</th>
                    <th className="p-3.5">Student Name</th>
                    <th className="p-3.5">Email</th>
                    <th className="p-3.5">Semester</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-center">Registered Date</th>
                    <th className="p-3.5 text-center">Last Login</th> {/* Add this line */}
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allAccounts.map((acc) => (
                    <tr key={acc._id || acc.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-mono-code text-blue-600 font-bold">{acc.uniqueUserId}</td>
                      <td className="p-3.5 font-semibold text-slate-900">{acc.name}</td>
                      <td className="p-3.5 text-slate-500 font-mono-code">{acc.email}</td>
                      <td className="p-3.5 text-slate-600">{acc.semester || '1st Semester'}</td>
                      <td className="p-3.5">
                        {acc.accountStatus === 'approved' && (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            APPROVED
                          </span>
                        )}
                        {acc.accountStatus === 'pending' && (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                            PENDING
                          </span>
                        )}
                        {acc.accountStatus === 'rejected' && (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-red-50 text-red-700 border border-red-200">
                            REJECTED
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-center font-mono-code text-[11px] text-slate-400">
                        {new Date(acc.createdAt || Date.now()).toLocaleDateString()}
                      </td>
                      {/* Add this td for Last Login */}
                      <td className="p-3.5 text-center">
                        {acc.lastLogin ? (
                          <div>
                            <div className="font-mono-code text-[11px] text-slate-600">
                              {new Date(acc.lastLogin).toLocaleDateString()}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono-code mt-0.5">
                              {new Date(acc.lastLogin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Never logged in</span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(acc)}
                            className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
                            title="Edit User"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(acc)}
                            className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors border border-red-200"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Active Course Enrollments */}
      {activeTab === 'enrollments' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="font-heading text-sm font-bold text-slate-900">Active Course Enrollments</h3>
              <p className="text-xs text-slate-500">Students holding approved access to learning materials</p>
            </div>
            <span className="px-2.5 py-0.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full">
              {activeEnrollments.length} Active
            </span>
          </div>

          {activeEnrollments.length === 0 ? (
            <div className="p-10 text-center text-slate-400 text-xs">
              No active course enrollments found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Student</th>
                    <th className="p-3.5">Course</th>
                    <th className="p-3.5">Created At</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Revocation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeEnrollments.map((req) => (
                    <tr key={req._id || req.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-semibold text-slate-900">
                        {req.userId?.name}<br />
                        {req.userId?.email}
                      </td>
                      <td className="p-3.5 font-bold text-blue-600 font-mono-code">{req.courseId?.courseCode}</td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-mono-code text-[11px]">
                            {new Date(req.createdAt || Date.now()).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono-code mt-0.5">
                          {new Date(req.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full badge-approved-light uppercase">
                          APPROVED
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => openRevokeModal(req)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-red-50 text-red-600 font-semibold rounded-lg text-xs border border-slate-200 hover:border-red-200 transition-colors"
                        >
                          Revoke Access
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Reject Account Modal */}
      {showRejectAccountModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-xl border border-slate-200 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-50 text-red-600 rounded-lg flex items-center justify-center border border-red-200">
                  <RejectIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading text-base font-bold text-slate-900">Reject Account</h3>
                  <p className="text-xs text-slate-500">Provide rejection reason</p>
                </div>
              </div>
              <button
                onClick={() => setShowRejectAccountModal(false)}
                className="w-8 h-8 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5">
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 mb-4">
                <div className="text-xs font-semibold text-slate-900 mb-1">{selectedUser.name}</div>
                <div className="text-[11px] text-slate-500 font-mono-code">{selectedUser.email}</div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Rejection Reason</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2.5 bg-white border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 rounded-lg text-xs text-slate-800 placeholder-slate-400 outline-none transition-all resize-none"
                  placeholder="Enter reason for rejection..."
                />
              </div>

              <div className="flex items-center justify-end space-x-2 mt-4">
                <button
                  onClick={() => setShowRejectAccountModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectAccount}
                  disabled={isSubmitting || !rejectReason.trim()}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-xs transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Rejecting...' : 'Reject Account'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Enrollment Modal */}
      {showRejectEnrollmentModal && selectedEnrollment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-xl border border-slate-200 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-50 text-red-600 rounded-lg flex items-center justify-center border border-red-200">
                  <RejectIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading text-base font-bold text-slate-900">Reject Enrollment</h3>
                  <p className="text-xs text-slate-500">Provide rejection reason</p>
                </div>
              </div>
              <button
                onClick={() => setShowRejectEnrollmentModal(false)}
                className="w-8 h-8 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5">
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 mb-4">
                <div className="text-xs font-semibold text-slate-900 mb-1">{selectedEnrollment.userId?.name}</div>
                <div className="text-[11px] text-slate-500 font-mono-code">
                  Course: <span className="text-blue-600 font-bold">{selectedEnrollment.courseId?.courseCode}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Rejection Reason</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2.5 bg-white border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 rounded-lg text-xs text-slate-800 placeholder-slate-400 outline-none transition-all resize-none"
                  placeholder="Enter reason for rejection..."
                />
              </div>

              <div className="flex items-center justify-end space-x-2 mt-4">
                <button
                  onClick={() => setShowRejectEnrollmentModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectEnrollment}
                  disabled={isSubmitting || !rejectReason.trim()}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-xs transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Rejecting...' : 'Reject Enrollment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal with Status */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-xl border border-slate-200 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center border border-blue-200">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading text-base font-bold text-slate-900">Edit User</h3>
                  <p className="text-xs text-slate-500">Update user information and status</p>
                </div>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="w-8 h-8 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5">
              <form onSubmit={handleEditUser} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">User ID</label>
                  <input
                    type="text"
                    required
                    value={editForm.uniqueUserId}
                    onChange={(e) => setEditForm({ ...editForm, uniqueUserId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg text-xs text-slate-900 font-mono-code"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Student Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Semester</label>
                  <select
                    value={editForm.semester}
                    onChange={(e) => setEditForm({ ...editForm, semester: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg text-xs text-slate-900"
                  >
                    <option value="1st Semester">1st Semester</option>
                    <option value="2nd Semester">2nd Semester</option>
                    <option value="3rd Semester">3rd Semester</option>
                    <option value="4th Semester">4th Semester</option>
                    <option value="5th Semester">5th Semester</option>
                    <option value="6th Semester">6th Semester</option>
                    <option value="7th Semester">7th Semester</option>
                    <option value="8th Semester">8th Semester</option>
                  </select>
                </div>

                {/* Account Status */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Account Status</label>
                  <select
                    value={editForm.accountStatus}
                    onChange={(e) => setEditForm({ ...editForm, accountStatus: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg text-xs text-slate-900"
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Updating...' : 'Update User'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-xl border border-slate-200 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-50 text-red-600 rounded-lg flex items-center justify-center border border-red-200">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading text-base font-bold text-slate-900">Delete User</h3>
                  <p className="text-xs text-slate-500">This action cannot be undone</p>
                </div>
              </div>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="w-8 h-8 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5">
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 mb-4">
                <div className="text-xs font-semibold text-slate-900 mb-1">
                  {selectedUser.name}
                </div>
                <div className="text-[11px] text-slate-500 font-mono-code">
                  Email: <span className="text-blue-600 font-bold">{selectedUser.email}</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 mb-4">
                Are you sure you want to delete this user? All associated enrollments and data will be removed.
              </p>

              <div className="flex items-center justify-end space-x-2">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteUser}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-xs transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Deleting...' : 'Delete User'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button for Pending Access Requests */}
      {pendingEnrollmentRequests.length > 0 && (
        <>
          <button
            onClick={() => setShowPendingModal(true)}
            className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-xl hover:shadow-2xl transition-all flex items-center justify-center z-40"
            title={`${pendingEnrollmentRequests.length} Pending Access Requests`}
          >
            <Bell className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white">
              {pendingEnrollmentRequests.length}
            </span>
          </button>

          {/* Pending Requests Modal */}
          {showPendingModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
              <div className="w-full max-w-3xl bg-white rounded-xl border border-slate-200 shadow-2xl max-h-[80vh] flex flex-col">
                <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <h3 className="font-heading text-base font-bold text-slate-900">Pending Access Requests</h3>
                    <p className="text-xs text-slate-500">Review and process course access requests</p>
                  </div>
                  <button
                    onClick={() => setShowPendingModal(false)}
                    className="w-8 h-8 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  {pendingEnrollmentRequests.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs">
                      No pending course access requests.
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs text-slate-700">
                      <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                        <tr>
                          <th className="p-3">Student Name</th>
                          <th className="p-3">Course Code</th>
                          <th className="p-3">Key</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {pendingEnrollmentRequests.map((req) => (
                          <tr key={req._id || req.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-3 font-semibold text-slate-900">
                              <div>
                                <p>{req.userId?.name}</p>
                                <span className="text-slate-400 font-normal font-mono-code text-[10px]">
                                  {req.userId?.email}
                                </span>
                              </div>
                            </td>
                            <td className="p-3 font-bold text-left text-blue-600 font-mono-code">{req.courseId?.courseCode}</td>
                            <td className="p-3 font-mono-code text-xs text-amber-600 font-bold">{req.uniqueKey}</td>
                            <td className="p-3 text-right space-x-2">
                              <button
                                onClick={() => handleApproveEnrollment(req)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => openRejectEnrollmentModal(req)}
                                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-xs transition-colors"
                              >
                                Reject
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Custom Revoke Modal */}
      {revokeModal.isOpen && revokeModal.enrollment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-xl border border-slate-200 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-50 text-red-600 rounded-lg flex items-center justify-center border border-red-200">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading text-base font-bold text-slate-900">Revoke Access</h3>
                  <p className="text-xs text-slate-500">This action cannot be undone</p>
                </div>
              </div>
              <button
                onClick={() => setRevokeModal({ isOpen: false, enrollment: null, reason: '' })}
                className="w-8 h-8 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-xs font-semibold text-slate-900 mb-1">
                  {revokeModal.enrollment.userId?.name}
                </div>
                <div className="text-[11px] text-slate-500 font-mono-code">
                  Course: <span className="text-blue-600 font-bold">{revokeModal.enrollment.courseId?.courseCode}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Revocation Reason
                </label>
                <textarea
                  value={revokeModal.reason}
                  onChange={(e) => setRevokeModal({ ...revokeModal, reason: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2.5 bg-white border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 rounded-lg text-xs text-slate-800 placeholder-slate-400 outline-none transition-all resize-none"
                  placeholder="Enter reason for revoking access..."
                />
              </div>
            </div>

            <div className="p-5 pt-4 border-t border-slate-100 flex items-center justify-end space-x-2">
              <button
                onClick={() => setRevokeModal({ isOpen: false, enrollment: null, reason: '' })}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRevokeEnrollment}
                disabled={!revokeModal.reason.trim()}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <UserX className="w-3.5 h-3.5" />
                Revoke Access
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}