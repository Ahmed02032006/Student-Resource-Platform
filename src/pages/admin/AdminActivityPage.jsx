import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchActivityLogThunk } from '../../store/activitySlice';
import { Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import Loader from '../../components/Loader';

export default function AdminActivityPage() {
  const dispatch = useDispatch();
  const { logs, isLoading } = useSelector((state) => state.activity);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 8;

  useEffect(() => {
    dispatch(fetchActivityLogThunk({ action: actionFilter !== 'all' ? actionFilter : undefined }));
  }, [dispatch, actionFilter]);

  const filteredLogs = logs.filter((log) => {
    const userName = log.userId?.name || log.userName || 'System';
    const userEmail = log.userId?.email || log.userEmail || '';
    const details = log.metadata?.details || log.details || JSON.stringify(log.metadata || {});

    const matchesSearch =
      userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      details.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  // Reset to first page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, actionFilter]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
  const startIndex = (currentPage - 1) * logsPerPage;
  const endIndex = startIndex + logsPerPage;
  const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleFirstPage = () => {
    setCurrentPage(1);
  };

  const handleLastPage = () => {
    setCurrentPage(totalPages);
  };

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

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) {
          pageNumbers.push(i);
        }
      } else if (currentPage >= totalPages - 2) {
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pageNumbers.push(i);
        }
      }
    }
    
    return pageNumbers;
  };

  // Show full page loader while loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <Loader />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Controls */}
      <div className="px-4 py-3.5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-heading text-sm font-bold text-slate-900">System Activity Audit Log</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time track of user actions, enrollment events, and administrative decisions
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search log records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
            />
          </div>

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-xs rounded-lg text-slate-800 focus:outline-none"
          >
            <option value="all">All Actions</option>
            <option value="login">Login</option>
            <option value="register">Register</option>
            <option value="enrollment_request">Enrollment Request</option>
            <option value="admin_approve">Admin Approve</option>
            <option value="admin_reject">Admin Reject</option>
            <option value="admin_revoke">Admin Revoke</option>
            <option value="resource_view">Resource View</option>
          </select>
        </div>
      </div>

      {/* Log Table */}
      {filteredLogs.length === 0 ? (
        <div className="p-10 text-center text-slate-400 text-xs font-medium">
          No activity records match your current search or filter criteria.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Event Details</th>
                  <th className="p-3 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedLogs.map((log) => {
                  const userName = log.userId?.name || log.userName || 'System';
                  const userEmail = log.userId?.email || log.userEmail || '';
                  const details = log.metadata?.details || log.details || (log.metadata ? JSON.stringify(log.metadata) : 'N/A');

                  return (
                    <tr key={log._id || log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3">
                        <div className="font-semibold text-slate-900">{userName}</div>
                        <div className="text-[11px] text-slate-400 font-mono-code">{userEmail}</div>
                      </td>
                      <td className="p-3.5 font-mono-code">{getActionBadge(log.action)}</td>
                      <td className="p-3.5 text-slate-600">{details}</td>
                      <td className="p-3.5 text-right font-mono-code text-[11px] text-slate-400">
                        {new Date(log.timestamp || log.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="px-3.5 py-2.5 border-t border-slate-100 flex items-center justify-between">
            <div className="text-xs text-slate-500">
              Showing <span className="font-semibold text-slate-700">{startIndex + 1}</span> to{' '}
              <span className="font-semibold text-slate-700">
                {Math.min(endIndex, filteredLogs.length)}
              </span>{' '}
              of <span className="font-semibold text-slate-700">{filteredLogs.length}</span> records
            </div>

            <div className="flex items-center space-x-1">
              {/* First Page Button */}
              <button
                onClick={handleFirstPage}
                disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="First Page"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>

              {/* Previous Page Button */}
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Page Numbers */}
              {getPageNumbers().map((pageNumber) => (
                <button
                  key={pageNumber}
                  onClick={() => handlePageChange(pageNumber)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-colors ${
                    currentPage === pageNumber
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {pageNumber}
                </button>
              ))}

              {/* Next Page Button */}
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Last Page Button */}
              <button
                onClick={handleLastPage}
                disabled={currentPage === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Last Page"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}