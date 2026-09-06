import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCoursesThunk } from '../../store/coursesSlice';
import {
    fetchAssessmentsThunk,
    createAssessmentThunk,
    deleteAssessmentThunk,
    updateAssessmentThunk,
} from '../../store/assessmentSlice';
import toast from 'react-hot-toast';
import Loader from '../../components/Loader';
import {
    Calendar,
    Plus,
    Trash2,
    BookOpen,
    Clock,
    Award,
    Bell,
    X,
    Calendar as CalendarIcon,
    FileText,
    GraduationCap,
    TrendingUp,
    Search,
    CheckCircle2,
    Users,
    Edit,
} from 'lucide-react';

export default function CRDashboard() {
    const dispatch = useDispatch();
    const { list: assessments, isLoading: isAssessmentsLoading } = useSelector((state) => state.assessments);
    const { list: courses, isLoading: isCoursesLoading } = useSelector((state) => state.courses);
    const { user } = useSelector((state) => state.auth);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        courseId: '',
        scheduledAt: '',
        type: 'other',
    });

    useEffect(() => {
        dispatch(fetchCoursesThunk());
        dispatch(fetchAssessmentsThunk({ upcoming: false }));
    }, [dispatch]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            courseId: '',
            scheduledAt: '',
            type: 'other',
        });
        setIsEditMode(false);
        setEditingId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditMode && editingId) {
                await dispatch(updateAssessmentThunk({ id: editingId, data: formData })).unwrap();
                toast.success('Assessment updated successfully!');
            } else {
                await dispatch(createAssessmentThunk(formData)).unwrap();
                toast.success('Assessment posted successfully!');
            }
            resetForm();
            setIsModalOpen(false);
        } catch (err) {
            toast.error(err?.message || 'Failed to save assessment');
        }
    };

    const handleEdit = (assessment) => {
        setIsEditMode(true);
        setEditingId(assessment._id);
        setFormData({
            title: assessment.title,
            description: assessment.description || '',
            courseId: assessment.courseId?._id || assessment.courseId || '',
            scheduledAt: assessment.scheduledAt ? new Date(assessment.scheduledAt).toISOString().slice(0, 16) : '',
            type: assessment.type || 'other',
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this assessment?')) {
            try {
                await dispatch(deleteAssessmentThunk(id)).unwrap();
                toast.success('Assessment deleted successfully!');
            } catch (err) {
                toast.error(err?.message || 'Failed to delete assessment');
            }
        }
    };

    const getTypeColor = (type) => {
        const colors = {
            quiz: 'bg-purple-50 text-purple-700 border-purple-200',
            exam: 'bg-red-50 text-red-700 border-red-200',
            assignment: 'bg-amber-50 text-amber-700 border-amber-200',
            presentation: 'bg-blue-50 text-blue-700 border-blue-200',
            other: 'bg-slate-50 text-slate-700 border-slate-200',
        };
        return colors[type] || colors.other;
    };

    const getTypeIcon = (type) => {
        const icons = {
            quiz: <Award className="w-3.5 h-3.5" />,
            exam: <FileText className="w-3.5 h-3.5" />,
            assignment: <BookOpen className="w-3.5 h-3.5" />,
            presentation: <Users className="w-3.5 h-3.5" />,
            other: <Bell className="w-3.5 h-3.5" />,
        };
        return icons[type] || icons.other;
    };

    const isUpcoming = (date) => new Date(date) >= new Date();

    // Filter assessments
    const filteredAssessments = assessments.filter(assessment => {
        const matchesSearch =
            assessment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            assessment.courseId?.courseCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            assessment.courseId?.courseName?.toLowerCase().includes(searchTerm.toLowerCase());

        const status = isUpcoming(assessment.scheduledAt) ? 'upcoming' : 'past';
        const matchesStatus = statusFilter === 'all' || status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    if (isAssessmentsLoading || isCoursesLoading) {
        return (
            <div className="flex items-center justify-center min-h-[600px]">
                <Loader />
            </div>
        );
    }

    const totalAssessments = assessments.length;
    const upcomingCount = assessments.filter(a => isUpcoming(a.scheduledAt)).length;
    const pastCount = totalAssessments - upcomingCount;

    return (
        <div className="space-y-6 relative">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg border border-slate-200 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-slate-500">Total Assessments</p>
                            <p className="text-2xl font-bold text-slate-900">{totalAssessments}</p>
                        </div>
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                            <CalendarIcon className="w-5 h-5 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-slate-200 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-slate-500">Upcoming</p>
                            <p className="text-2xl font-bold text-emerald-600">{upcomingCount}</p>
                        </div>
                        <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-emerald-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-slate-200 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-slate-500">Past</p>
                            <p className="text-2xl font-bold text-slate-500">{pastCount}</p>
                        </div>
                        <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center">
                            <Clock className="w-5 h-5 text-slate-500" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-slate-200 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-slate-500">Your Courses</p>
                            <p className="text-2xl font-bold text-slate-900">{courses.length}</p>
                        </div>
                        <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-purple-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Assessments Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                {/* Header with Search and Filter */}
                <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h3 className="font-heading text-sm font-bold text-slate-900">Assessments</h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Manage all course assessments and announcements
                        </p>
                    </div>

                    <div className="flex items-center space-x-3">
                        {/* Search Input */}
                        <div className="relative">
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                            <input
                                type="text"
                                placeholder="Search assessments..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        {/* Filter Dropdown */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-xs rounded-lg text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        >
                            <option value="all">All Assessments</option>
                            <option value="upcoming">Upcoming</option>
                            <option value="past">Past</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                {filteredAssessments.length === 0 ? (
                    <div className="p-10 text-center text-slate-400 text-xs font-medium">
                        <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <h3 className="text-base font-semibold text-slate-800 mb-1">No Assessments Found</h3>
                        <p className="text-sm text-slate-500 mb-4">
                            {searchTerm || statusFilter !== 'all'
                                ? 'Try adjusting your search or filter'
                                : 'Click the + button to post your first one.'}
                        </p>
                        {(searchTerm || statusFilter !== 'all') && (
                            <button
                                onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
                                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg font-medium hover:bg-blue-700 transition-colors"
                            >
                                Reset Filters
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-700">
                            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                                <tr>
                                    <th className="p-3.5">Title</th>
                                    <th className="p-3.5 text-center">Type</th>
                                    <th className="p-3.5 text-center">Course</th>
                                    <th className="p-3.5 text-center">Scheduled</th>
                                    <th className="p-3.5 text-center">Status</th>
                                    <th className="p-3.5 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredAssessments.map((assessment) => {
                                    const upcoming = isUpcoming(assessment.scheduledAt);
                                    const courseCode = assessment.courseId?.courseCode || 'N/A';
                                    const courseName = assessment.courseId?.courseName || '';

                                    return (
                                        <tr key={assessment._id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="p-3.5">
                                                <div>
                                                    <span className="font-semibold text-slate-900">
                                                        {assessment.title}
                                                    </span>
                                                    {assessment.description && (
                                                        <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                                                            {assessment.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="p-3.5 text-center">
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border flex items-center gap-1 justify-center mx-auto w-fit ${getTypeColor(assessment.type)}`}>
                                                    {getTypeIcon(assessment.type)}
                                                    {assessment.type.charAt(0).toUpperCase() + assessment.type.slice(1)}
                                                </span>
                                            </td>

                                            <td className="p-3.5 text-center">
                                                <div className="flex flex-col items-center">
                                                    <span className="font-medium">{courseCode}</span>
                                                    {courseName && (
                                                        <span className="text-[10px] text-slate-500">{courseName}</span>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="p-3.5 text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                                                    <span>
                                                        {new Date(assessment.scheduledAt).toLocaleString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="p-3.5 text-center">
                                                {upcoming ? (
                                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium flex items-center gap-1 justify-center mx-auto w-fit">
                                                        <CheckCircle2 className="w-3 h-3" />
                                                        Upcoming
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-medium flex items-center gap-1 justify-center mx-auto w-fit">
                                                        <Clock className="w-3 h-3" />
                                                        Past
                                                    </span>
                                                )}
                                            </td>

                                            <td className="p-3.5 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button
                                                        onClick={() => handleEdit(assessment)}
                                                        className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Edit assessment"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(assessment._id)}
                                                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete assessment"
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

            {/* Floating Action Button */}
            <button
                onClick={() => {
                    resetForm();
                    setIsModalOpen(true);
                }}
                className="fixed bottom-8 right-8 z-40 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center group"
            >
                <Plus className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </button>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-slate-900">
                                    {isEditMode ? 'Edit Assessment' : 'New Assessment'}
                                </h2>
                                <button
                                    onClick={() => {
                                        resetForm();
                                        setIsModalOpen(false);
                                    }}
                                    className="p-1.5 hover:bg-slate-100 rounded-lg transition"
                                >
                                    <X className="w-5 h-5 text-slate-500" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                        Title <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        placeholder="e.g., Mid-Term Exam"
                                        value={formData.title}
                                        onChange={handleChange}
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                        Description <span className="text-slate-400 text-xs">(optional)</span>
                                    </label>
                                    <textarea
                                        name="description"
                                        placeholder="Additional details"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows="2"
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                        Course <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="courseId"
                                        value={formData.courseId}
                                        onChange={handleChange}
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        required
                                    >
                                        <option value="">Select a course</option>
                                        {courses.map((c) => (
                                            <option key={c._id} value={c._id}>
                                                {c.courseCode} – {c.courseName}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                        Type <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleChange}
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >
                                        <option value="quiz">Quiz</option>
                                        <option value="exam">Exam</option>
                                        <option value="assignment">Assignment</option>
                                        <option value="presentation">Presentation</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                        Date & Time <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="datetime-local"
                                        name="scheduledAt"
                                        value={formData.scheduledAt}
                                        onChange={handleChange}
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        required
                                    />
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            resetForm();
                                            setIsModalOpen(false);
                                        }}
                                        className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition"
                                    >
                                        {isEditMode ? 'Update Assessment' : 'Post Assessment'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}