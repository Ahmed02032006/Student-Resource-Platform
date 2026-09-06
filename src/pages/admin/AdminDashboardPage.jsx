import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCoursesThunk } from '../../store/coursesSlice';
import { fetchActivityLogThunk } from '../../store/activitySlice';
import * as adminApi from '../../api/admin';
import { 
  Users, 
  UserCheck, 
  BookOpen, 
  ShieldCheck, 
  Clock, 
  Layers,
  ArrowRight,
  TrendingUp,
  Activity,
  AlertCircle,
  CheckCircle2,
  Calendar,
  FileText,
  Video,
  Image as ImageIcon,
  File
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Loader from '../../components/Loader';

export default function AdminDashboardPage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { list: courses, isLoading: isCoursesLoading } = useSelector((state) => state.courses);
  const { logs: activityLogs, isLoading: isActivityLoading } = useSelector((state) => state.activity);

  const [pendingAccountsCount, setPendingAccountsCount] = useState(0);
  const [pendingEnrollmentsCount, setPendingEnrollmentsCount] = useState(0);
  const [approvedEnrollmentsCount, setApprovedEnrollmentsCount] = useState(0);
  const [totalUsersCount, setTotalUsersCount] = useState(0);
  const [recentEnrollments, setRecentEnrollments] = useState([]);
  const [isStatsLoading, setIsStatsLoading] = useState(true);

  useEffect(() => {
    dispatch(fetchCoursesThunk());
    dispatch(fetchActivityLogThunk({ limit: 9 }));
    
    const fetchStats = async () => {
      setIsStatsLoading(true);
      try {
        const [pendingRes, approvedRes, enrollRes] = await Promise.all([
          adminApi.fetchAccounts('pending'),
          adminApi.fetchAccounts('approved'),
          adminApi.fetchAdminEnrollments()
        ]);
        
        setPendingAccountsCount(pendingRes.count || pendingRes.data?.length || 0);
        setTotalUsersCount(approvedRes.count || approvedRes.data?.length || 0);
        
        const data = enrollRes.data || [];
        setPendingEnrollmentsCount(data.filter(r => r.status === 'pending').length);
        setApprovedEnrollmentsCount(data.filter(r => r.status === 'approved').length);
        setRecentEnrollments(data.slice(0, 10));
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setIsStatsLoading(false);
      }
    };

    fetchStats();
  }, [dispatch]);

  const getActionBadge = (action) => {
    switch (action) {
      case 'login':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">LOGIN</span>;
      case 'register':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-50 text-amber-700 border border-amber-200">REGISTER</span>;
      case 'enrollment_request':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-blue-50 text-blue-700 border border-blue-200">ENROLL_REQ</span>;
      case 'admin_approve':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300">APPROVE</span>;
      case 'admin_reject':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-red-100 text-red-800 border border-red-300">REJECT</span>;
      case 'admin_revoke':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-red-50 text-red-700 border border-red-200">REVOKE</span>;
      case 'resource_view':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-purple-50 text-purple-700 border border-purple-200">RESOURCE_VIEW</span>;
      default:
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-100 text-slate-600 border border-slate-200">{(action || 'EVENT').toUpperCase()}</span>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-200">PENDING</span>;
      case 'approved':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">APPROVED</span>;
      case 'rejected':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-red-50 text-red-700 border border-red-200">REJECTED</span>;
      case 'revoked':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 text-slate-600 border border-slate-200">REVOKED</span>;
      default:
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 text-slate-600 border border-slate-200">{status?.toUpperCase()}</span>;
    }
  };

  // Show full page loader while loading
  if (isCoursesLoading || isActivityLoading || isStatsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metric Cards Grid - 5 Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Link to="/admin/approvals" className="p-4 bg-white rounded-xl border border-slate-200 hover:border-amber-300 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-amber-600">{pendingAccountsCount}</span>
          </div>
          <div className="text-xs font-semibold text-slate-900">Pending Users</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Awaiting approval</div>
        </Link>

        <Link to="/admin/approvals" className="p-4 bg-white rounded-xl border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-emerald-600">{totalUsersCount}</span>
          </div>
          <div className="text-xs font-semibold text-slate-900">Total Users</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Registered accounts</div>
        </Link>

        <Link to="/admin/approvals" className="p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-blue-600">{pendingEnrollmentsCount}</span>
          </div>
          <div className="text-xs font-semibold text-slate-900">Pending Access</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Course requests</div>
        </Link>

        <Link to="/admin/courses" className="p-4 bg-white rounded-xl border border-slate-200 hover:border-purple-300 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-purple-600">{courses.length}</span>
          </div>
          <div className="text-xs font-semibold text-slate-900">Total Courses</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Active catalog</div>
        </Link>

        <Link to="/admin/activity" className="p-4 bg-white rounded-xl border border-slate-200 hover:border-red-300 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 border border-red-200 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-red-600">{activityLogs.length}</span>
          </div>
          <div className="text-xs font-semibold text-slate-900">Recent Activity</div>
          <div className="text-[10px] text-slate-500 mt-0.5">System events</div>
        </Link>
      </div>

      {/* Main Content Grid - items-start to prevent stretching */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Recent Activity Logs - Takes 2 columns, shows 10 logs */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-heading text-sm font-bold text-slate-900">Recent Activity Logs</h3>
              <p className="text-xs text-slate-500">Latest system events and user actions</p>
            </div>
            <Link to="/admin/activity" className="text-xs font-semibold text-blue-600 hover:underline">
              View All
            </Link>
          </div>

          {activityLogs.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No recent activity recorded.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">User</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">Details</th>
                    <th className="p-3 text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activityLogs.slice(0, 10).map((log) => {
                    const userName = log.userId?.name || log.userName || 'System';
                    const details = log.metadata?.details || log.details || 'N/A';
                    return (
                      <tr key={log._id || log.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-semibold text-slate-900">{userName}</td>
                        <td className="p-3">{getActionBadge(log.action)}</td>
                        <td className="p-3 text-slate-600 truncate max-w-[200px]">{details}</td>
                        <td className="p-3 text-right font-mono-code text-[11px] text-slate-400">
                          {new Date(log.timestamp || log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Actions and Recent Enrollments - Takes 1 column */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h3 className="font-heading text-sm font-bold text-slate-900">Quick Access</h3>
            </div>
            <div className="p-3 space-y-2">
              <Link to="/admin/approvals" className="flex items-center justify-between p-3 bg-slate-50 hover:bg-blue-50 rounded-lg border border-slate-200 hover:border-blue-200 transition-all group">
                <div className="flex items-center gap-2.5">
                  <UserCheck className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-semibold text-slate-900">Manage Approvals</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </Link>

              <Link to="/admin/courses" className="flex items-center justify-between p-3 bg-slate-50 hover:bg-blue-50 rounded-lg border border-slate-200 hover:border-blue-200 transition-all group">
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-semibold text-slate-900">Manage Courses</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </Link>

              <Link to="/admin/activity" className="flex items-center justify-between p-3 bg-slate-50 hover:bg-blue-50 rounded-lg border border-slate-200 hover:border-blue-200 transition-all group">
                <div className="flex items-center gap-2.5">
                  <Activity className="w-4 h-4 text-purple-600" />
                  <span className="text-xs font-semibold text-slate-900">View Audit Logs</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </Link>
            </div>
          </div>

          {/* Recent Enrollment Requests - scrollable, shows 3 at a time */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h3 className="font-heading text-sm font-bold text-slate-900">Recent Enrollments</h3>
            </div>
            <div 
              className="p-3 space-y-2 overflow-y-auto pr-1.5"
              style={{ maxHeight: '200px' }}
            >
              {recentEnrollments.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs">
                  No enrollment requests yet.
                </div>
              ) : (
                recentEnrollments.map((req) => (
                  <div key={req._id || req.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 bg-blue-50 text-blue-600 rounded-md flex items-center justify-center font-bold text-xs shrink-0">
                        {req.userId?.name?.charAt(0) || 'U'}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-900 truncate">{req.userId?.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{req.courseId?.courseCode}</div>
                      </div>
                    </div>
                    {getStatusBadge(req.status)}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}