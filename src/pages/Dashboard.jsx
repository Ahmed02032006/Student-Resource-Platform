import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchMyEnrollmentsThunk } from '../store/enrollmentSlice';
import { fetchActivityLogThunk } from '../store/activitySlice';
import { fetchCoursesThunk } from '../store/coursesSlice';
import { fetchAssessmentsThunk } from '../store/assessmentSlice';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  UserCheck,
  Clock,
  Award,
  Calendar as CalendarIcon,
  FileText,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Timer,
  Video,
  Image as ImageIcon,
  File,
  Zap,
  Search
} from 'lucide-react';
import Loader from '../components/Loader';

export default function Dashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { list: courses, isLoading: isCoursesLoading } = useSelector((state) => state.courses);
  const { myEnrollments, isLoading: isEnrollmentsLoading } = useSelector((state) => state.enrollment);
  const { logs: activityLogs, isLoading: isActivityLoading } = useSelector((state) => state.activity);
  const { list: assessments, isLoading: isAssessmentsLoading } = useSelector((state) => state.assessments);

  const [selectedCourseFilter, setSelectedCourseFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric', weekday: 'short' }));

  useEffect(() => {
    dispatch(fetchCoursesThunk());
    dispatch(fetchMyEnrollmentsThunk());
    dispatch(fetchActivityLogThunk({ limit: 20 }));
    dispatch(fetchAssessmentsThunk({ upcoming: true, limit: 5 }));
  }, [dispatch]);

  const getEnrollmentStatus = (courseId) => {
    const req = myEnrollments.find(e => {
      const eCourseId = e.courseId?._id || e.courseId?.id || e.courseId;
      return eCourseId === courseId;
    });
    return req ? req.status : 'not_requested';
  };

  const approvedCourses = courses.filter(c => getEnrollmentStatus(c._id || c.id) === 'approved');
  const pendingRequests = myEnrollments.filter(e => e.status === 'pending');

  // Calculate study progress
  const totalResourcesAccessed = activityLogs.filter(log =>
    log.action === 'resource_view' || log.action === 'resource_download'
  ).length;

  const studyProgress = Math.min(100, Math.round((approvedCourses.length / Math.max(courses.length, 1)) * 100));

  // Filter activity logs to only show resource_view actions
  const resourceActivities = activityLogs.filter(log =>
    log.action === 'resource_view' ||
    log.action === 'resource_download'
  );

  const upcomingAssessments = assessments;

  const getFormatIcon = (format) => {
    switch (format?.toLowerCase()) {
      case 'pdf':
        return FileText;
      case 'video':
        return Video;
      case 'image':
        return ImageIcon;
      case 'note':
        return File;
      default:
        return FileText;
    }
  };

  const getFormatBadge = (format) => {
    const colors = {
      pdf: 'bg-red-50 text-red-700 border-red-200',
      video: 'bg-purple-50 text-purple-700 border-purple-200',
      image: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      note: 'bg-blue-50 text-blue-700 border-blue-200',
    };
    return colors[format?.toLowerCase()] || 'bg-slate-50 text-slate-600 border-slate-200';
  };

  // Show full page loader while loading
  if (isCoursesLoading || isEnrollmentsLoading || isActivityLoading || isAssessmentsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* TOP 3-COLUMN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Quick Stats - Takes Academic Overview's place */}
        <div className="lg:col-span-4 attmark-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-base font-bold text-slate-900">
                Quick Stats
              </h2>
              <Zap className="w-5 h-5 text-amber-600" />
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-semibold text-slate-700">Total Courses</span>
                </div>
                <span className="text-sm font-bold text-slate-900">{courses.length}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-semibold text-slate-700">Enrolled Courses</span>
                </div>
                <span className="text-sm font-bold text-slate-900">{approvedCourses.length}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-semibold text-slate-700">Pending Requests</span>
                </div>
                <span className="text-sm font-bold text-slate-900">{pendingRequests.length}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-red-600" />
                  <span className="text-xs font-semibold text-slate-700">Resources Accessed</span>
                </div>
                <span className="text-sm font-bold text-slate-900">{totalResourcesAccessed}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Assessments */}
        <div className="lg:col-span-4 attmark-card p-6 flex flex-col">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-base font-bold text-slate-900">
                Upcoming Assessments
              </h2>
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>

            {upcomingAssessments.length > 0 ? (
              <div className="space-y-2">
                {upcomingAssessments.map((assessment) => {
                  // Assign color based on type or default
                  const colorMap = {
                    quiz: 'border-blue-200 bg-blue-50',
                    exam: 'border-red-200 bg-red-50',
                    assignment: 'border-amber-200 bg-amber-50',
                    presentation: 'border-purple-200 bg-purple-50',
                    other: 'border-slate-200 bg-slate-50',
                  };
                  const color = colorMap[assessment.type] || colorMap.other;

                  // Format the date
                  const scheduledDate = new Date(assessment.scheduledAt);
                  const formattedDate = scheduledDate.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  });
                  const formattedTime = scheduledDate.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <div key={assessment._id} className={`p-2.5 rounded-lg border ${color} transition-all hover:shadow-sm`}>
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-[11px] font-bold text-slate-900 truncate">
                            {assessment.title}
                          </h3>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <p className="text-[9px] text-slate-600 truncate">
                              {assessment.courseId?.courseName || 'Unknown Course'}
                            </p>
                            <span className="text-[9px] text-slate-400">•</span>
                            <p className="text-[9px] text-slate-500 font-medium">
                              {assessment.courseId?.courseCode || ''}
                            </p>
                          </div>
                          {assessment.description && (
                            <p className="text-[9px] text-slate-500 mt-0.5 line-clamp-1">
                              {assessment.description}
                            </p>
                          )}
                        </div>
                        <span className="shrink-0 ml-2 px-2 py-0.5 text-[9px] font-semibold rounded-full bg-white border border-slate-200 capitalize">
                          {assessment.type}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center gap-1 text-[9px] text-slate-600">
                          <CalendarIcon className="w-3 h-3" />
                          <span>{formattedDate}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[9px] text-slate-600">
                          <Timer className="w-3 h-3" />
                          <span>{formattedTime}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center h-[150px]">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mb-2" />
                <h3 className="text-sm font-semibold text-slate-900 mb-0.5">
                  No Upcoming Assessments
                </h3>
                <p className="text-xs text-slate-500">
                  You're all caught up! No assessments scheduled.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* My Enrolled Courses List - Scrollable */}
        <div className="lg:col-span-4 attmark-card p-6 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-heading text-base font-bold text-slate-900">
              Registered Courses
            </h2>
            <Link to="/courses" className="text-xs font-semibold text-blue-600 hover:underline">
              View All
            </Link>
          </div>

          <div
            className="space-y-2 overflow-y-auto pr-1.5 custom-scrollbar"
            style={{ maxHeight: '210px' }}
          >
            {courses.map((c, i) => {
              const bg = i % 3 === 0 ? 'bg-blue-600' : i % 3 === 1 ? 'bg-emerald-600' : 'bg-purple-600';
              const initial = c.courseName ? c.courseName.charAt(0).toUpperCase() : 'C';
              return (
                <Link
                  key={c._id || c.id || i}
                  to={`/course/${c._id || c.id}`}
                  className="p-2 bg-slate-50 hover:bg-white rounded-lg border border-slate-200 hover:border-blue-300 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <div className={`w-7 h-7 rounded-full ${bg} text-white font-bold text-[10px] flex items-center justify-center shrink-0`}>
                      {initial}
                    </div>
                    <div className="truncate">
                      <div className="font-bold text-[11px] text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                        {c.courseName}
                      </div>
                      <div className="text-[9px] text-slate-400 font-mono-code">
                        {c.courseCode}
                      </div>
                    </div>
                  </div>

                  <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-blue-600 transition-colors shrink-0" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* BOTTOM FULL-WIDTH CARD: Recent Learning Activity Table - Admin Style */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {/* Header with Search and Filter */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-heading text-sm font-bold text-slate-900">
              Recent Resource Activity Records
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Detailed tracking of accessed documents, videos, and study sessions
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
              />
            </div>

            {/* Filter Dropdown */}
            <select
              value={selectedCourseFilter}
              onChange={(e) => setSelectedCourseFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-xs rounded-lg text-slate-800 focus:outline-none"
            >
              <option value="all">All Resources</option>
              <option value="pdf">PDF Documents</option>
              <option value="video">Videos</option>
              <option value="image">Images</option>
              <option value="note">Notes</option>
            </select>

            {/* Date Indicator Pill */}
            <div className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 flex items-center space-x-1.5">
              <CalendarIcon className="w-3.5 h-3.5 text-slate-500" />
              <span>{selectedDate}</span>
            </div>
          </div>
        </div>

        {/* Table */}
        {resourceActivities.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-xs font-medium">
            No resource activity recorded yet. Start exploring your course materials!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Resource / Asset Title</th>
                  <th className="p-3.5">Format</th>
                  <th className="p-3.5">Date & Time</th>
                  <th className="p-3.5 text-right">Access Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {resourceActivities
                  .filter(activity => {
                    const format = activity.metadata?.format || activity.metadata?.type || 'pdf';
                    const resourceTitle = activity.metadata?.resourceTitle || activity.metadata?.details || 'Resource Access';
                    const matchesFilter = selectedCourseFilter === 'all' || format === selectedCourseFilter;
                    const matchesSearch = resourceTitle.toLowerCase().includes(searchTerm.toLowerCase());
                    return matchesFilter && matchesSearch;
                  })
                  .map((activity) => {
                    const resourceTitle = activity.metadata?.resourceTitle || activity.metadata?.details || 'Resource Access';
                    const format = activity.metadata?.format || activity.metadata?.type || 'pdf';
                    const FormatIcon = getFormatIcon(format);
                    const timestamp = activity.timestamp || activity.createdAt;

                    return (
                      <tr key={activity._id || activity.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5 font-bold text-slate-900 flex items-center space-x-2">
                          <FormatIcon className="w-4 h-4 text-blue-600 shrink-0" />
                          <span>{resourceTitle}</span>
                        </td>

                        <td className="p-3.5">
                          <span className={`px-2.5 py-0.5 text-[10px] font-mono-code font-bold rounded-md border ${getFormatBadge(format)}`}>
                            {format.toUpperCase()}
                          </span>
                        </td>

                        <td className="p-3.5 font-mono-code text-slate-500">
                          {new Date(timestamp).toLocaleDateString()} <span className="text-slate-400">({new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})</span>
                        </td>

                        <td className="p-3.5 text-right">
                          <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            ✓ Accessed
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div >
  );
}