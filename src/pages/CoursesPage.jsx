import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchCoursesThunk } from '../store/coursesSlice';
import { fetchMyEnrollmentsThunk, requestEnrollmentThunk } from '../store/enrollmentSlice';
import { 
  BookOpen, 
  Search, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  Filter,
  ChevronDown,
  Users,
  Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';
import Loader from '../components/Loader';

export default function CoursesPage() {
  const dispatch = useDispatch();
  const { list: courses, isLoading: isCoursesLoading } = useSelector((state) => state.courses);
  const { myEnrollments, isLoading: isEnrollmentsLoading } = useSelector((state) => state.enrollment);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    dispatch(fetchCoursesThunk());
    dispatch(fetchMyEnrollmentsThunk());
  }, [dispatch]);

  const getEnrollmentStatus = (courseObj) => {
    const courseId = courseObj._id || courseObj.id;
    const req = myEnrollments.find(e => {
      const eCourseId = e.courseId?._id || e.courseId?.id || e.courseId;
      return eCourseId === courseId;
    });
    return req ? req.status : 'not_requested';
  };

  const handleQuickRequest = async (e, course) => {
    e.preventDefault();
    e.stopPropagation();
    const courseId = course._id || course.id;
    try {
      await dispatch(requestEnrollmentThunk(courseId));
      toast.success("Enrollment request submitted!");
      dispatch(fetchMyEnrollmentsThunk());
    } catch (err) {
      toast.error(err.message || "Failed to request enrollment");
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch =
      course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.courseCode.toLowerCase().includes(searchTerm.toLowerCase());
    
    const status = getEnrollmentStatus(course);
    const matchesStatus = statusFilter === 'all' || status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const isLoading = isCoursesLoading || isEnrollmentsLoading;

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
      {/* Header with Search and Filter */}
      <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-heading text-sm font-bold text-slate-900">Course Catalog</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Browse available courses and manage your enrollments
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
            />
          </div>

          {/* Filter Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-xs rounded-lg text-slate-800 focus:outline-none"
          >
            <option value="all">All Courses</option>
            <option value="approved">Enrolled</option>
            <option value="pending">Pending</option>
            <option value="not_requested">Available</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {filteredCourses.length === 0 ? (
        <div className="p-10 text-center text-slate-400 text-xs font-medium">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800 mb-1">No Courses Found</h3>
          <p className="text-sm text-slate-500 mb-4">Try adjusting your search or filter</p>
          <button
            onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3.5">Course</th>
                <th className="p-3.5">Course Code</th>
                <th className="p-3.5">Semester</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCourses.map((course) => {
                const courseId = course._id || course.id;
                const status = getEnrollmentStatus(course);
                const initial = course.courseName ? course.courseName.charAt(0).toUpperCase() : 'C';

                return (
                  <tr key={courseId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5">
                      <Link
                        to={`/course/${courseId}`}
                        className="flex items-center gap-2.5 group"
                      >
                        <div className="w-7 h-7 bg-blue-50 text-blue-600 rounded-md flex items-center justify-center font-bold text-xs border border-blue-100 shrink-0">
                          {initial}
                        </div>
                        <span className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {course.courseName}
                        </span>
                      </Link>
                    </td>

                    <td className="p-3.5">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-mono-code">
                        {course.courseCode}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{course.semesterId?.name || course.semester || '1st Semester'}</span>
                      </div>
                    </td>

                    <td className="p-3.5">
                      {status === 'approved' && (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" />
                          ENROLLED
                        </span>
                      )}
                      {status === 'pending' && (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1 w-fit">
                          <Clock className="w-3 h-3" />
                          PENDING
                        </span>
                      )}
                      {status === 'not_requested' && (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                          AVAILABLE
                        </span>
                      )}
                    </td>

                    <td className="p-3.5 text-right">
                      {status === 'not_requested' && (
                        <button
                          onClick={(e) => handleQuickRequest(e, course)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs transition-colors"
                        >
                          Request Access
                        </button>
                      )}
                      {status === 'approved' && (
                        <Link
                          to={`/course/${courseId}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
                        >
                          Open Course <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      )}
                      {status === 'pending' && (
                        <span className="text-xs font-medium text-amber-600">
                          Under Review
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}