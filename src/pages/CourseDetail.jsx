import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCourseDetailThunk, fetchCourseResourcesThunk, clearCourseResources } from '../store/coursesSlice';
import { fetchMyEnrollmentsThunk, requestEnrollmentThunk } from '../store/enrollmentSlice';
import { fetchResourceAccess } from '../api/resources';
import ResourceViewer from '../components/course/ResourceViewer';
import { 
  ArrowLeft, 
  FileText, 
  Video, 
  Image as ImageIcon, 
  File, 
  Lock, 
  CheckCircle, 
  Clock, 
  AlertOctagon,
  Eye,
  BookOpen,
  Calendar,
  Presentation,
  Loader
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function CourseDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  
  const { 
    selectedCourse: course, 
    resources, 
    isLoading: isCourseLoading,
    isResourcesLoading 
  } = useSelector((state) => state.courses);
  const { myEnrollments } = useSelector((state) => state.enrollment);

  const [activeViewerResource, setActiveViewerResource] = useState(null);
  const [signedUrl, setSignedUrl] = useState(null);
  const [isAccessLoading, setIsAccessLoading] = useState(false);
  const [selectedResourceType, setSelectedResourceType] = useState('all');
  const [isResourceAccessLoading, setIsResourceAccessLoading] = useState(false);

  useEffect(() => {
    if (id) {
      // Clear resources when course changes
      dispatch(clearCourseResources());
      dispatch(fetchCourseDetailThunk(id));
      dispatch(fetchMyEnrollmentsThunk());
    }
    
    // Cleanup function to clear resources when unmounting or changing courses
    return () => {
      dispatch(clearCourseResources());
    };
  }, [id, dispatch]);

  const courseId = course?._id || course?.id;
  
  const enrollmentReq = myEnrollments.find(e => {
    const eCourseId = e.courseId?._id || e.courseId?.id || e.courseId;
    return eCourseId === courseId;
  });

  const enrollmentStatus = enrollmentReq ? enrollmentReq.status : 'not_requested';

  useEffect(() => {
    if (courseId && enrollmentStatus === 'approved') {
      dispatch(fetchCourseResourcesThunk(courseId));
    }
  }, [courseId, enrollmentStatus, dispatch]);

  const handleEnrollRequest = async () => {
    if (!courseId) return;
    try {
      await dispatch(requestEnrollmentThunk(courseId));
      toast.success("Enrollment request submitted");
      dispatch(fetchMyEnrollmentsThunk());
    } catch (err) {
      toast.error(err.message || "Request failed");
    }
  };

  const handleViewResource = async (res) => {
    setIsAccessLoading(true);
    setIsResourceAccessLoading(true);
    try {
      const resId = res._id || res.id;
      const data = await fetchResourceAccess(resId);
      setSignedUrl(data.signedUrl || data.accessUrl || res.fileUrl);
      setActiveViewerResource(res);
    } catch (err) {
      toast.error(err.message || 'Unable to access resource.');
    } finally {
      setIsAccessLoading(false);
      setIsResourceAccessLoading(false);
    }
  };

  const getResourceIcon = (type) => {
    const resourceType = type?.toLowerCase();
    switch (resourceType) {
      case 'pdf':
        return FileText;
      case 'video':
        return Video;
      case 'image':
        return ImageIcon;
      case 'ppt':
      case 'pptx':
      case 'presentation':
        return Presentation;
      default:
        return File;
    }
  };

  const getResourceTypeLabel = (type) => {
    const resourceType = type?.toLowerCase();
    switch (resourceType) {
      case 'pdf':
        return 'PDF';
      case 'video':
        return 'Video';
      case 'image':
        return 'Image';
      case 'ppt':
      case 'pptx':
        return 'Presentation';
      default:
        return type || 'File';
    }
  };

  if (isCourseLoading) {
    return (
      <div className="py-12 text-center">
        <Loader className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
        <p className="text-sm text-slate-500">Loading course details...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="py-12 text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Course Not Found</h2>
        <Link to="/courses" className="text-blue-600 underline text-sm font-medium">
          Return to Course Catalog
        </Link>
      </div>
    );
  }

  const filteredResources = resources.filter(r => {
    if (selectedResourceType === 'all') return true;
    const resourceType = r.type?.toLowerCase();
    
    // Handle PPT and PPTX as the same type
    if (selectedResourceType === 'ppt') {
      return resourceType === 'ppt' || resourceType === 'pptx' || resourceType === 'presentation';
    }
    
    return resourceType === selectedResourceType;
  });

  const initialLetter = course.courseName ? course.courseName.charAt(0).toUpperCase() : 'C';

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      {/* Header Section */}
      <div className="p-3 relative">
        {/* Back Button - Left */}
        <Link 
          to="/courses" 
          className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-blue-50 text-blue-600 rounded-md flex items-center justify-center hover:bg-blue-100 transition-colors border border-blue-100"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>

        {/* Center: Course Name and Semester */}
        <div className="text-center px-12">
          <h1 className="text-sm font-semibold text-slate-900 leading-tight">
            {course.courseName}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {course.semesterId?.name || course.semester || '1st Semester'}
          </p>
        </div>

        {/* Right: Enrollment Status */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {enrollmentStatus === 'not_requested' && (
            <button
              onClick={handleEnrollRequest}
              className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors flex items-center gap-1"
            >
              <BookOpen className="w-3 h-3" />
              Request Access
            </button>
          )}

          {enrollmentStatus === 'pending' && (
            <div className="px-2.5 py-1.5 bg-amber-50 text-amber-700 text-xs font-medium rounded-md border border-amber-200 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Pending
            </div>
          )}

          {enrollmentStatus === 'approved' && (
            <div className="px-2.5 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-md border border-emerald-200 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Enrolled
            </div>
          )}

          {enrollmentStatus === 'rejected' && (
            <div className="px-2.5 py-1.5 bg-red-50 text-red-700 text-xs font-medium rounded-md border border-red-200 flex items-center gap-1">
              <AlertOctagon className="w-3 h-3" />
              Rejected
            </div>
          )}
        </div>
      </div>

      {enrollmentReq && (enrollmentReq.rejectionReason || enrollmentReq.revocationReason) && (
        <div className="mx-3 mb-2 p-2 bg-red-50 rounded-md border border-red-200 text-xs text-red-700">
          <span className="font-semibold">Note: </span>
          {enrollmentReq.rejectionReason || enrollmentReq.revocationReason}
        </div>
      )}

      {/* Light Divider - Slightly Darker */}
      <div className="border-t border-slate-200"></div>

      {/* Course Materials Section */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-slate-900">
            Course Materials
          </h2>

          {/* Resource Filter */}
          {enrollmentStatus === 'approved' && (
            <div className="flex gap-0.5 bg-slate-50 p-0.5 rounded-md border border-slate-200 overflow-x-auto">
              {[
                { value: 'all', label: 'All' },
                { value: 'pdf', label: 'PDFs' },
                { value: 'video', label: 'Videos' },
                { value: 'image', label: 'Images' },
                { value: 'ppt', label: 'Presentations' }
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setSelectedResourceType(filter.value)}
                  className={`px-2 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                    selectedResourceType === filter.value
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Resources Grid */}
        {enrollmentStatus === 'approved' ? (
          isResourcesLoading ? (
            <div className="text-center py-12">
              <Loader className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
              <p className="text-xs text-slate-500">Loading resources...</p>
            </div>
          ) : filteredResources.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-400">
              No resources available for this filter
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {filteredResources.map((res) => {
                const resId = res._id || res.id;
                const Icon = getResourceIcon(res.type);
                const resourceTypeLabel = getResourceTypeLabel(res.type);
                
                return (
                  <div
                    key={resId}
                    className="flex items-center justify-between p-2.5 bg-slate-50 rounded-md border border-slate-200 hover:border-blue-300 hover:bg-white transition-all group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 bg-white text-blue-600 rounded-md flex items-center justify-center border border-slate-200 shrink-0">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-medium text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                          {res.title}
                        </h4>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-[10px] text-slate-500 uppercase font-mono">
                            {resourceTypeLabel}
                          </span>
                          <span className="text-[10px] text-slate-300">•</span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(res.createdAt || Date.now()).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleViewResource(res)}
                      disabled={isAccessLoading}
                      className="ml-2 px-2.5 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors flex items-center gap-0.5 disabled:opacity-50 shrink-0"
                    >
                      {isAccessLoading && activeViewerResource?.id === resId ? (
                        <Loader className="w-3 h-3 animate-spin" />
                      ) : (
                        <Eye className="w-3 h-3" />
                      )}
                      View
                    </button>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          /* Locked Resources */
          <div className="text-center py-6 bg-slate-50 rounded-md border border-slate-200">
            <div className="w-9 h-9 bg-amber-50 text-amber-600 rounded-md flex items-center justify-center mx-auto mb-2 border border-amber-200">
              <Lock className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 mb-1">
              Restricted Access
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-2">
              {enrollmentStatus === 'not_requested'
                ? 'Request access to view course materials and resources.'
                : enrollmentStatus === 'pending'
                ? 'Your access request is pending approval.'
                : 'Access to these materials has been restricted.'}
            </p>
            {enrollmentStatus === 'not_requested' && (
              <button
                onClick={handleEnrollRequest}
                className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors"
              >
                Request Access
              </button>
            )}
          </div>
        )}
      </div>

      {/* Resource Viewer Modal */}
      <ResourceViewer
        isOpen={!!activeViewerResource}
        onClose={() => { 
          setActiveViewerResource(null); 
          setSignedUrl(null);
        }}
        resource={activeViewerResource ? { ...activeViewerResource, url: signedUrl } : null}
      />
    </div>
  );
}