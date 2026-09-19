import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { PageProps } from '@/types';

interface ClassItem {
    id: number;
    name: string;
    code: string;
    course: {
        id: number;
        title: string;
        category: string;
    };
    duration_months: number;
    start_date: string | null;
    end_date: string | null;
    status: 'active' | 'completed' | 'upcoming';
    is_locked: boolean;
    students_count: number;
    completed_count: number;
    completion_rate: number;
    registered_students: Array<{
        id: number;
        name: string;
        username: string;
        email: string;
        status: string;
    }>;
}

interface Stats {
    total_classes: number;
    active_classes: number;
    completed_classes: number;
    upcoming_classes: number;
    total_students: number;
    pending_feedbacks: number;
    total_questions: number;
}

interface CourseOption {
    id: number;
    title: string;
    category: string;
}

interface DashboardProps extends PageProps {
    classes: ClassItem[];
    stats: Stats;
    courses: CourseOption[];
    currentFilter: string;
}

export default function Dashboard({ auth, classes, stats, courses, currentFilter, flash }: DashboardProps) {
    const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed' | 'upcoming'>('all');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [classToDelete, setClassToDelete] = useState<ClassItem | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        course_id: courses[0]?.id || '',
        name: '',
        code: '',
        duration_months: 3,
        start_date: '',
        end_date: '',
        status: 'active',
        description: '',
    });

    const handleCreateClass = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.classes.store'), {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
            },
        });
    };

    const handleConfirmDeleteClass = () => {
        if (!classToDelete) return;
        setIsDeleting(true);
        router.delete(route('admin.classes.destroy', classToDelete.id), {
            onFinish: () => {
                setIsDeleting(false);
                setClassToDelete(null);
            },
        });
    };

    const filteredClasses = classes.filter((c) => {
        if (activeTab === 'all') return true;
        return c.status === activeTab;
    });

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Class Management</h2>}
        >
            <Head title="Class Management" />

            <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                {/* Flash Messages */}
                {flash?.success && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg text-sm flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            {flash.success}
                        </div>
                    </div>
                )}

                {/* Hero / Overview Banner */}
                <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-2">
                            Buddhist Courses
                        </div>
                        <h1 className="text-2xl font-serif font-bold text-white tracking-wide">
                            Buddhist Courses & Training Progress
                        </h1>
                        <p className="text-xs text-stone-300 mt-1 max-w-xl">
                            Track active courses, student progress metrics, lock/unlock classes after 3-month durations, and manage study materials according to monastic guidelines.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs shadow-lg shadow-amber-900/40 transition"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                            Open New Class (Mở lớp mới)
                        </button>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <p className="text-xs font-medium text-gray-500">Active Classes (Đang học)</p>
                        <p className="text-2xl font-bold text-amber-700 mt-1">{stats.active_classes}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">Underway (3-month cycle)</p>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <p className="text-xs font-medium text-gray-500">Completed (Đã hoàn thành)</p>
                        <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.completed_classes}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">Finished curriculums</p>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <p className="text-xs font-medium text-gray-500">Upcoming (Sắp mở)</p>
                        <p className="text-2xl font-bold text-blue-600 mt-1">{stats.upcoming_classes}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">Enrolling students</p>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <p className="text-xs font-medium text-gray-500">Total Students (Học viên)</p>
                        <p className="text-2xl font-bold text-stone-800 mt-1">{stats.total_students}</p>
                        <p className="text-[11px] text-amber-700 mt-0.5 font-medium">
                            {stats.pending_feedbacks} pending material feedbacks
                        </p>
                    </div>
                </div>

                {/* Tabs & Class Listing */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    {/* Tab Navigation */}
                    <div className="border-b border-gray-200 px-6 pt-4 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex space-x-1 sm:space-x-4">
                            <button
                                onClick={() => setActiveTab('all')}
                                className={`pb-3 text-xs font-semibold border-b-2 transition ${
                                    activeTab === 'all'
                                        ? 'border-amber-600 text-amber-700'
                                        : 'border-transparent text-gray-500 hover:text-gray-800'
                                }`}
                            >
                                All Classes ({classes.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('active')}
                                className={`pb-3 text-xs font-semibold border-b-2 transition ${
                                    activeTab === 'active'
                                        ? 'border-amber-600 text-amber-700'
                                        : 'border-transparent text-gray-500 hover:text-gray-800'
                                }`}
                            >
                                Active Classes (Các lớp đang học) ({stats.active_classes})
                            </button>
                            <button
                                onClick={() => setActiveTab('completed')}
                                className={`pb-3 text-xs font-semibold border-b-2 transition ${
                                    activeTab === 'completed'
                                        ? 'border-amber-600 text-amber-700'
                                        : 'border-transparent text-gray-500 hover:text-gray-800'
                                }`}
                            >
                                Completed Classes (Các lớp đã hoàn thành) ({stats.completed_classes})
                            </button>
                            <button
                                onClick={() => setActiveTab('upcoming')}
                                className={`pb-3 text-xs font-semibold border-b-2 transition ${
                                    activeTab === 'upcoming'
                                        ? 'border-amber-600 text-amber-700'
                                        : 'border-transparent text-gray-500 hover:text-gray-800'
                                }`}
                            >
                                Upcoming Classes (Các lớp sắp mở) ({stats.upcoming_classes})
                            </button>
                        </div>
                    </div>

                    {/* Classes Grid */}
                    <div className="p-6">
                        {filteredClasses.length === 0 ? (
                            <div className="text-center py-12 text-gray-400 text-xs">
                                No classes found in this category.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredClasses.map((cls) => (
                                    <div
                                        key={cls.id}
                                        className={`rounded-xl border transition-all p-5 flex flex-col justify-between ${
                                            cls.is_locked
                                                ? 'bg-stone-50/80 border-stone-300 opacity-90'
                                                : 'bg-white border-gray-200 hover:border-amber-400 hover:shadow-md'
                                        }`}
                                    >
                                        <div>
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-100 text-gray-600 uppercase font-semibold">
                                                    {cls.code}
                                                </span>
                                                <div className="flex items-center gap-1.5">
                                                    {cls.is_locked && (
                                                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700 flex items-center gap-1">
                                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                                            </svg>
                                                            Locked
                                                        </span>
                                                    )}
                                                    <span
                                                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                                                            cls.status === 'active'
                                                                ? 'bg-amber-100 text-amber-800'
                                                                : cls.status === 'completed'
                                                                ? 'bg-emerald-100 text-emerald-800'
                                                                : 'bg-blue-100 text-blue-800'
                                                        }`}
                                                    >
                                                        {cls.status === 'active' ? 'Đang học' : cls.status === 'completed' ? 'Đã hoàn thành' : 'Sắp mở'}
                                                    </span>
                                                </div>
                                            </div>

                                            <h3 className="text-sm font-semibold text-gray-900 leading-snug">
                                                {cls.name}
                                            </h3>
                                            <p className="text-xs text-amber-800/80 font-medium mt-1">
                                                {cls.course.title}
                                            </p>

                                            {/* Duration & Period */}
                                            <div className="mt-3 space-y-1 text-xs text-gray-500">
                                                <div className="flex items-center gap-1.5">
                                                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <span>Duration: {cls.duration_months} Months (Khóa 3 tháng)</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    <span>Period: {cls.start_date || 'TBD'} &rarr; {cls.end_date || 'TBD'}</span>
                                                </div>
                                            </div>

                                            {/* Roster & Progress Stats */}
                                            <div className="mt-4 pt-3 border-t border-gray-100">
                                                <div className="flex justify-between text-xs mb-1.5">
                                                    <span className="text-gray-500 font-medium">Enrolled Students:</span>
                                                    <span className="font-bold text-gray-800">{cls.students_count} học viên</span>
                                                </div>

                                                {cls.status === 'completed' ? (
                                                    <div className="flex justify-between text-xs mb-1">
                                                        <span className="text-emerald-700 font-medium">Graduated/Completed:</span>
                                                        <span className="font-bold text-emerald-700">{cls.completed_count} học viên</span>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <div className="flex justify-between text-[11px] text-gray-500 mb-1">
                                                            <span>Average Completion:</span>
                                                            <span className="font-semibold text-amber-800">{cls.completion_rate}%</span>
                                                        </div>
                                                        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                                            <div
                                                                className="bg-amber-600 h-1.5 rounded-full transition-all"
                                                                style={{ width: `${cls.completion_rate}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                )}

                                                {cls.status === 'upcoming' && (
                                                    <div className="mt-2 text-[11px] text-blue-700 bg-blue-50 p-2 rounded">
                                                        Registered prospective students: {cls.students_count}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions: View Details, Lock/Unlock & Remove */}
                                        <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                                            <Link
                                                href={route('admin.classes.show', cls.id)}
                                                className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-900"
                                            >
                                                <span>View Progress & Roster</span>
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                                </svg>
                                            </Link>

                                            <div className="flex items-center gap-1.5">
                                                <Link
                                                    href={route('admin.classes.toggle-lock', cls.id)}
                                                    method="post"
                                                    as="button"
                                                    className={`text-[11px] font-medium px-2 py-1 rounded transition border ${
                                                        cls.is_locked
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                                                            : 'bg-stone-100 text-stone-700 border-stone-300 hover:bg-stone-200'
                                                    }`}
                                                >
                                                    {cls.is_locked ? 'Unlock' : 'Lock'}
                                                </Link>

                                                <button
                                                    type="button"
                                                    onClick={() => setClassToDelete(cls)}
                                                    className="text-[11px] font-semibold px-2.5 py-1 rounded-lg text-red-700 hover:text-white bg-red-50 hover:bg-red-600 border border-red-200 hover:border-red-600 transition flex items-center gap-1.5 shadow-sm"
                                                    title="Remove Class (Xóa lớp học)"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                    <span>Remove Class (Xóa Lớp)</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Create Class Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between border-b pb-3">
                            <h3 className="font-serif font-bold text-lg text-gray-900">
                                Open New Class (Mở Lớp Học Mới)
                            </h3>
                            <button
                                onClick={() => setIsCreateModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleCreateClass} className="space-y-3.5 text-xs">
                            <div>
                                <label className="block font-medium text-gray-700 mb-1">Subject / Course (Môn học)</label>
                                <select
                                    value={data.course_id}
                                    onChange={(e) => setData('course_id', Number(e.target.value))}
                                    className="w-full rounded-lg border-gray-300 text-xs focus:ring-amber-500 focus:border-amber-500"
                                >
                                    {courses.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            [{c.category.toUpperCase()}] {c.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block font-medium text-gray-700 mb-1">Class Cohort Name (Tên Lớp Học)</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Abhidhammattha-sangaha Cohort 02"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="w-full rounded-lg border-gray-300 text-xs focus:ring-amber-500 focus:border-amber-500"
                                    required
                                />
                                {errors.name && <p className="text-red-500 text-[11px] mt-1">{errors.name}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-medium text-gray-700 mb-1">Class Code (Mã Lớp)</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. VNK-ADH-2602"
                                        value={data.code}
                                        onChange={(e) => setData('code', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 text-xs focus:ring-amber-500 focus:border-amber-500"
                                        required
                                    />
                                    {errors.code && <p className="text-red-500 text-[11px] mt-1">{errors.code}</p>}
                                </div>

                                <div>
                                    <label className="block font-medium text-gray-700 mb-1">Duration (Months - ví dụ 3 tháng)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="24"
                                        value={data.duration_months}
                                        onChange={(e) => setData('duration_months', Number(e.target.value))}
                                        className="w-full rounded-lg border-gray-300 text-xs focus:ring-amber-500 focus:border-amber-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-medium text-gray-700 mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        value={data.start_date}
                                        onChange={(e) => setData('start_date', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 text-xs focus:ring-amber-500 focus:border-amber-500"
                                    />
                                </div>

                                <div>
                                    <label className="block font-medium text-gray-700 mb-1">End Date</label>
                                    <input
                                        type="date"
                                        value={data.end_date}
                                        onChange={(e) => setData('end_date', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 text-xs focus:ring-amber-500 focus:border-amber-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-medium text-gray-700 mb-1">Status (Trạng thái)</label>
                                <select
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                    className="w-full rounded-lg border-gray-300 text-xs focus:ring-amber-500 focus:border-amber-500"
                                >
                                    <option value="active">Active (Đang học)</option>
                                    <option value="upcoming">Upcoming (Sắp mở / Đăng ký)</option>
                                    <option value="completed">Completed (Đã hoàn thành)</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-medium shadow"
                                >
                                    Create Class
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Class Confirmation Modal */}
            {classToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
                        <div className="flex items-center gap-3 text-red-600">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-serif font-bold text-base text-gray-900">
                                    Remove Class (Xóa Lớp Học)
                                </h3>
                                <p className="text-xs text-gray-500">
                                    This action cannot be undone.
                                </p>
                            </div>
                        </div>

                        <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 text-xs text-stone-700 space-y-1">
                            <div>
                                <span className="font-semibold text-stone-900">Class: </span>
                                {classToDelete.name}
                            </div>
                            <div className="text-[11px] text-stone-500 font-mono">
                                Code: {classToDelete.code} &bull; {classToDelete.course.title}
                            </div>
                            <div className="text-[11px] text-red-700 pt-1">
                                Deleting this class will also remove its student enrollments and progress records.
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t">
                            <button
                                type="button"
                                onClick={() => setClassToDelete(null)}
                                disabled={isDeleting}
                                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-xs font-medium hover:bg-gray-50"
                            >
                                Cancel (Hủy)
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmDeleteClass}
                                disabled={isDeleting}
                                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow transition disabled:opacity-50 flex items-center gap-1.5"
                            >
                                {isDeleting ? (
                                    <span>Deleting...</span>
                                ) : (
                                    <>
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        <span>Confirm Delete (Xác Nhận Xóa)</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
