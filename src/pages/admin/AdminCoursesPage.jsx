import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCoursesThunk } from '../../store/coursesSlice';
import * as adminApi from '../../api/admin';
import {
  BookOpen,
  Upload,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Plus,
  UploadCloud,
  X,
  Calendar,
  Layers,
  Eye,
  Pencil,
  Trash2
} from 'lucide-react';
import Loader from '../../components/Loader';
import toast from 'react-hot-toast';

export default function AdminCoursesPage() {
  const dispatch = useDispatch();
  const { list: courses, isLoading } = useSelector((state) => state.courses);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    dispatch(fetchCoursesThunk());
  }, [dispatch]);

  const [courseForm, setCourseForm] = useState({
    courseId: '',
    courseCode: '',
    courseName: '',
    semester: '3rd Semester',
    description: ''
  });

  const [resourceForm, setResourceForm] = useState({
    courseId: '',
    title: '',
    type: 'pdf',
    cloudinaryPublicId: '',
    cloudinaryUrl: ''
  });

  const [selectedFile, setSelectedFile] = useState(null);

  const [courseSuccessMsg, setCourseSuccessMsg] = useState('');
  const [courseErrMsg, setCourseErrMsg] = useState('');
  const [resourceSuccessMsg, setResourceSuccessMsg] = useState('');
  const [resourceErrMsg, setResourceErrMsg] = useState('');
  const [isSubmittingCourse, setIsSubmittingCourse] = useState(false);
  const [isSubmittingResource, setIsSubmittingResource] = useState(false);
  const [isDeletingCourse, setIsDeletingCourse] = useState(false);

  useEffect(() => {
    if (courses.length > 0 && !resourceForm.courseId) {
      setResourceForm(prev => ({ ...prev, courseId: courses[0]._id || courses[0].id }));
    }
  }, [courses, resourceForm.courseId]);

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setCourseSuccessMsg('');
    setCourseErrMsg('');
    if (!courseForm.courseId || !courseForm.courseCode || !courseForm.courseName) return;

    setIsSubmittingCourse(true);
    try {
      await adminApi.createCourse(courseForm);
      dispatch(fetchCoursesThunk());
      setCourseSuccessMsg(`Course "${courseForm.courseCode}" successfully created!`);
      setCourseForm({
        courseId: '',
        courseCode: '',
        courseName: '',
        semester: '3rd Semester',
        description: ''
      });
      setTimeout(() => {
        setShowCreateModal(false);
        setCourseSuccessMsg('');
      }, 1500);
    } catch (err) {
      setCourseErrMsg(err.message || 'Failed to create course.');
    } finally {
      setIsSubmittingCourse(false);
    }
  };

  const handleEditCourse = async (e) => {
    e.preventDefault();
    setCourseSuccessMsg('');
    setCourseErrMsg('');
    if (!courseForm.courseId || !courseForm.courseCode || !courseForm.courseName) return;

    setIsSubmittingCourse(true);
    try {
      // Assuming there's an update API - if not, you'll need to add it
      await adminApi.updateCourse(selectedCourse._id || selectedCourse.id, courseForm);
      dispatch(fetchCoursesThunk());
      setCourseSuccessMsg(`Course "${courseForm.courseCode}" successfully updated!`);
      setTimeout(() => {
        setShowEditModal(false);
        setCourseSuccessMsg('');
      }, 1500);
    } catch (err) {
      setCourseErrMsg(err.message || 'Failed to update course.');
    } finally {
      setIsSubmittingCourse(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!selectedCourse) return;
    setIsDeletingCourse(true);
    try {
      // Assuming there's a delete API - if not, you'll need to add it
      await adminApi.deleteCourse(selectedCourse._id || selectedCourse.id);
      dispatch(fetchCoursesThunk());
      toast.success('Course deleted successfully');
      setShowDeleteModal(false);
      setSelectedCourse(null);
    } catch (err) {
      toast.error(err.message || 'Failed to delete course');
    } finally {
      setIsDeletingCourse(false);
    }
  };

  const openEditModal = (course) => {
    setSelectedCourse(course);
    setCourseForm({
      courseId: course.courseId || '',
      courseCode: course.courseCode || '',
      courseName: course.courseName || '',
      semester: course.semesterId?.name || course.semester || '1st Semester',
      description: course.description || ''
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (course) => {
    setSelectedCourse(course);
    setShowDeleteModal(true);
  };

  const handleUploadResource = async (e) => {
    e.preventDefault();
    setResourceSuccessMsg('');
    setResourceErrMsg('');

    if (!resourceForm.courseId || !resourceForm.title) return;

    setIsSubmittingResource(true);
    try {
      let publicId = resourceForm.cloudinaryPublicId || `res-${Date.now()}`;
      let url = resourceForm.cloudinaryUrl || `https://res.cloudinary.com/demo/image/upload/sample.jpg`;

      if (selectedFile) {
        try {
          const sigRes = await adminApi.getUploadSignature(resourceForm.courseId);
          const { signature, timestamp, folder, cloudName, apiKey } = sigRes.data;

          const formData = new FormData();
          formData.append('file', selectedFile);
          formData.append('api_key', apiKey);
          formData.append('timestamp', timestamp);
          formData.append('signature', signature);
          formData.append('folder', folder);
          formData.append('type', 'authenticated');

          const cRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
            method: 'POST',
            body: formData,
          });
          const cData = await cRes.json();
          if (cData.public_id && cData.secure_url) {
            publicId = cData.public_id;
            url = cData.secure_url;
          }
        } catch (uploadErr) {
          console.warn('Cloudinary upload warning:', uploadErr);
        }
      }

      await adminApi.addResource(resourceForm.courseId, {
        title: resourceForm.title,
        type: resourceForm.type,
        cloudinaryPublicId: publicId,
        cloudinaryUrl: url,
      });

      setResourceSuccessMsg(`Resource "${resourceForm.title}" published!`);
      setResourceForm({
        courseId: courses[0]?._id || courses[0]?.id || '',
        title: '',
        type: 'pdf',
        cloudinaryPublicId: '',
        cloudinaryUrl: ''
      });
      setSelectedFile(null);
      setTimeout(() => {
        setShowUploadModal(false);
        setResourceSuccessMsg('');
      }, 1500);
    } catch (err) {
      setResourceErrMsg(err.message || 'Failed to publish resource.');
    } finally {
      setIsSubmittingResource(false);
    }
  };

  // Show loader while fetching courses
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      {/* Courses Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-300 flex items-center justify-between">
          <div>
            <h3 className="font-heading text-sm font-bold text-slate-900">All Courses</h3>
            <p className="text-xs text-slate-500">Complete list of courses in the system</p>
          </div>
          <span className="px-2.5 py-0.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-full">
            {courses.length} Courses
          </span>
        </div>

        {courses.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-xs">
            No courses found. Click the + button to create a course.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Course ID</th>
                  <th className="p-3.5">Course Code</th>
                  <th className="p-3.5">Course Name</th>
                  <th className="p-3.5">Semester</th>
                  <th className="p-3.5 text-right">Created At</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {courses.map((course) => {
                  const initial = course.courseName ? course.courseName.charAt(0).toUpperCase() : 'C';
                  return (
                    <tr key={course._id || course.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-mono-code text-blue-600 font-bold">{course.courseId}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-mono-code">
                          {course.courseCode}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-2.5">
                          <span className="font-semibold text-slate-900">{course.courseName}</span>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <span>{course.semesterId?.name || course.semester || '1st Semester'}</span>
                        </div>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5 text-slate-600">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-mono-code text-[11px]">
                            {new Date(course.createdAt || Date.now()).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(course)}
                            className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
                            title="Edit Course"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(course)}
                            className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors border border-red-200"
                            title="Delete Course"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Floating Buttons */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-3 z-40">
        <button
          onClick={() => setShowUploadModal(true)}
          className="w-14 h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-xl hover:shadow-2xl transition-all flex items-center justify-center"
          title="Upload Course Asset"
        >
          <UploadCloud className="w-6 h-6" />
        </button>
        <button
          onClick={() => setShowCreateModal(true)}
          className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-xl hover:shadow-2xl transition-all flex items-center justify-center"
          title="Create Course"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Create Course Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-xl border border-slate-200 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center border border-blue-200">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading text-base font-bold text-slate-900">Create Course Entry</h3>
                  <p className="text-xs text-slate-500">Register a new academic course</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5">
              {courseSuccessMsg && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700 font-semibold flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{courseSuccessMsg}</span>
                </div>
              )}

              {courseErrMsg && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-semibold flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{courseErrMsg}</span>
                </div>
              )}

              <form onSubmit={handleCreateCourse} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Course ID</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. CS101"
                      value={courseForm.courseId}
                      onChange={(e) => setCourseForm({ ...courseForm, courseId: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg text-xs text-slate-900 font-mono-code"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Course Code</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. CS-101"
                      value={courseForm.courseCode}
                      onChange={(e) => setCourseForm({ ...courseForm, courseCode: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg text-xs text-slate-900 font-mono-code"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Course Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Introduction to Computer Science"
                    value={courseForm.courseName}
                    onChange={(e) => setCourseForm({ ...courseForm, courseName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Semester</label>
                  <select
                    value={courseForm.semester}
                    onChange={(e) => setCourseForm({ ...courseForm, semester: e.target.value })}
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

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Overview Description</label>
                  <textarea
                    rows="3"
                    placeholder="Provide course summary..."
                    value={courseForm.description}
                    onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg text-xs text-slate-900"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingCourse}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
                >
                  {isSubmittingCourse ? 'Creating Entry...' : 'Create Course Entry'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Course Modal */}
      {showEditModal && selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-xl border border-slate-200 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center border border-blue-200">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading text-base font-bold text-slate-900">Edit Course</h3>
                  <p className="text-xs text-slate-500">Update course information</p>
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
              {courseSuccessMsg && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700 font-semibold flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{courseSuccessMsg}</span>
                </div>
              )}

              {courseErrMsg && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-semibold flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{courseErrMsg}</span>
                </div>
              )}

              <form onSubmit={handleEditCourse} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Course ID</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. CS101"
                      value={courseForm.courseId}
                      onChange={(e) => setCourseForm({ ...courseForm, courseId: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg text-xs text-slate-900 font-mono-code"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Course Code</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. CS-101"
                      value={courseForm.courseCode}
                      onChange={(e) => setCourseForm({ ...courseForm, courseCode: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg text-xs text-slate-900 font-mono-code"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Course Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Introduction to Computer Science"
                    value={courseForm.courseName}
                    onChange={(e) => setCourseForm({ ...courseForm, courseName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Semester</label>
                  <select
                    value={courseForm.semester}
                    onChange={(e) => setCourseForm({ ...courseForm, semester: e.target.value })}
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

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Overview Description</label>
                  <textarea
                    rows="3"
                    placeholder="Provide course summary..."
                    value={courseForm.description}
                    onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg text-xs text-slate-900"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingCourse}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
                >
                  {isSubmittingCourse ? 'Updating...' : 'Update Course'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Course Modal */}
      {showDeleteModal && selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-xl border border-slate-200 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-50 text-red-600 rounded-lg flex items-center justify-center border border-red-200">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading text-base font-bold text-slate-900">Delete Course</h3>
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
                  {selectedCourse.courseName}
                </div>
                <div className="text-[11px] text-slate-500 font-mono-code">
                  Course Code: <span className="text-blue-600 font-bold">{selectedCourse.courseCode}</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 mb-4">
                Are you sure you want to delete this course? All associated resources and enrollments will be affected.
              </p>

              <div className="flex items-center justify-end space-x-2">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteCourse}
                  disabled={isDeletingCourse}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-xs transition-colors disabled:opacity-50"
                >
                  {isDeletingCourse ? 'Deleting...' : 'Delete Course'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Resource Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-xl border border-slate-200 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center border border-emerald-200">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading text-base font-bold text-slate-900">Upload Course Asset</h3>
                  <p className="text-xs text-slate-500">Publish documents or media</p>
                </div>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="w-8 h-8 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5">
              {resourceSuccessMsg && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700 font-semibold flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{resourceSuccessMsg}</span>
                </div>
              )}

              {resourceErrMsg && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-semibold flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{resourceErrMsg}</span>
                </div>
              )}

              <form onSubmit={handleUploadResource} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Course</label>
                  <select
                    value={resourceForm.courseId}
                    onChange={(e) => setResourceForm({ ...resourceForm, courseId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg text-xs text-slate-900"
                  >
                    {courses.map(c => (
                      <option key={c._id || c.id} value={c._id || c.id}>
                        {c.courseCode} - {c.courseName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Resource Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lecture 01 - Foundations PDF"
                    value={resourceForm.title}
                    onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg text-xs text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Format Type</label>
                    <select
                      value={resourceForm.type}
                      onChange={(e) => setResourceForm({ ...resourceForm, type: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg text-xs text-slate-900 font-mono-code uppercase"
                    >
                      <option value="pdf">PDF Document</option>
                      <option value="video">Video Stream</option>
                      <option value="image">Image / Diagram</option>
                      <option value="note">Markdown Note</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">File Upload</label>
                    <input
                      type="file"
                      onChange={(e) => setSelectedFile(e.target.files[0] || null)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingResource}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
                >
                  {isSubmittingResource ? 'Publishing Asset...' : 'Publish Asset to Course'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}