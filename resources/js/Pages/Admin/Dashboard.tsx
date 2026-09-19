import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useTranslation } from '@/utils/useTranslation';

interface ClassItem {
    id: number;
    name: string;
    course: {
        id: number;
        title: string;
        category: string;
    };
    user?: {
        id: number;
        name: string;
        username: string;
    } | null;
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
}

export default function Dashboard({ auth, classes, stats, courses, flash }: DashboardProps) {
    const t = useTranslation();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [classToDelete, setClassToDelete] = useState<ClassItem | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        course_id: courses[0]?.id || '',
        name: '',
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

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">{t('classes.management_title')}</h2>}
        >
            <Head title={t('classes.management_title')} />

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
                            {t('classes.badge_courses')}
                        </div>
                        <h1 className="text-2xl font-serif font-bold text-white tracking-wide">
                            {t('classes.hero_title')}
                        </h1>
                        <p className="text-xs text-stone-300 mt-1 max-w-xl">
                            {t('classes.hero_description')}
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
                            {t('classes.open_new_class')}
                        </button>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <p className="text-xs font-medium text-gray-500">{t('classes.all_classes_tab')}</p>
                        <p className="text-2xl font-bold text-amber-700 mt-1">{stats.total_classes}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">{classes.length} cohorts</p>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <p className="text-xs font-medium text-gray-500">{t('classes.total_students')}</p>
                        <p className="text-2xl font-bold text-stone-800 mt-1">{stats.total_students}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">Registered learners</p>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <p className="text-xs font-medium text-gray-500">Pending Feedback</p>
                        <p className="text-2xl font-bold text-blue-600 mt-1">{stats.pending_feedbacks}</p>
                        <p className="text-[11px] text-amber-700 mt-0.5 font-medium">
                            {t('classes.pending_feedbacks_count', { count: String(stats.pending_feedbacks) })}
                        </p>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <p className="text-xs font-medium text-gray-500">Question Bank</p>
                        <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.total_questions}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">Total practice questions</p>
                    </div>
                </div>

                {/* Class Listing */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-gray-800">
                            {t('classes.all_classes_tab')} ({classes.length})
                        </h2>
                    </div>

                    {/* Classes Grid */}
                    <div className="p-6">
                        {classes.length === 0 ? (
                            <div className="text-center py-12 text-gray-400 text-xs">
                                {t('classes.no_classes_found')}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {classes.map((cls) => (
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
                                                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                                                    {cls.course.category}
                                                </span>
                                                {cls.is_locked && (
                                                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700 flex items-center gap-1">
                                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                                        </svg>
                                                        {t('classes.badge_locked')}
                                                    </span>
                                                )}
                                            </div>

                                            <h3 className="text-base font-serif font-bold text-gray-900 leading-snug">
                                                {cls.name}
                                            </h3>
                                            <p className="text-xs text-amber-800/80 font-medium mt-1">
                                                {cls.course.title}
                                            </p>
                                            {cls.user && (
                                                <div className="flex items-center gap-1.5 text-[11px] text-stone-600 mt-2 font-medium bg-stone-50 px-2 py-1 rounded-md border border-stone-200/60 w-fit">
                                                    <svg className="w-3.5 h-3.5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                    <span>{cls.user.name}</span>
                                                </div>
                                            )}

                                            {/* Roster & Progress Stats */}
                                            <div className="mt-4 pt-3 border-t border-gray-100">
                                                <div className="flex justify-between text-xs mb-1.5">
                                                    <span className="text-gray-500 font-medium">{t('classes.enrolled_students')}</span>
                                                    <span className="font-bold text-gray-800">{t('classes.students_count', { count: String(cls.students_count) })}</span>
                                                </div>

                                                <div>
                                                    <div className="flex justify-between text-[11px] text-gray-500 mb-1">
                                                        <span>{t('classes.average_completion')}</span>
                                                        <span className="font-semibold text-amber-800">{cls.completion_rate}%</span>
                                                    </div>
                                                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                                        <div
                                                            className="bg-amber-600 h-1.5 rounded-full transition-all"
                                                            style={{ width: `${cls.completion_rate}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions: View Details, Lock/Unlock & Remove */}
                                        <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                                            <Link
                                                href={route('admin.classes.show', cls.id)}
                                                className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-900"
                                            >
                                                <span>{t('classes.view_progress_roster')}</span>
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
                                                    {cls.is_locked ? t('classes.action_unlock') : t('classes.action_lock')}
                                                </Link>

                                                <button
                                                    type="button"
                                                    onClick={() => setClassToDelete(cls)}
                                                    className="text-[11px] font-semibold px-2.5 py-1 rounded-lg text-red-700 hover:text-white bg-red-50 hover:bg-red-600 border border-red-200 hover:border-red-600 transition flex items-center gap-1.5 shadow-sm"
                                                    title={t('classes.remove_class')}
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                    <span>{t('classes.remove_class')}</span>
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
                                {t('classes.create_modal_title')}
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
                                <label className="block font-medium text-gray-700 mb-1">{t('classes.subject_course')}</label>
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
                                <label className="block font-medium text-gray-700 mb-1">{t('classes.class_name')}</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Abhidhammattha-sangaha Class"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="w-full rounded-lg border-gray-300 text-xs focus:ring-amber-500 focus:border-amber-500"
                                    required
                                />
                                {errors.name && <p className="text-red-500 text-[11px] mt-1">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="block font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    rows={3}
                                    placeholder="Optional description for this class..."
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    className="w-full rounded-lg border-gray-300 text-xs focus:ring-amber-500 focus:border-amber-500"
                                />
                                {errors.description && <p className="text-red-500 text-[11px] mt-1">{errors.description}</p>}
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
                                >
                                    {t('classes.cancel')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-medium shadow"
                                >
                                    {t('classes.create_button')}
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
                                    {t('classes.delete_modal_title')}
                                </h3>
                                <p className="text-xs text-gray-500">
                                    {t('classes.delete_warning')}
                                </p>
                            </div>
                        </div>

                        <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 text-xs text-stone-700 space-y-1">
                            <div>
                                <span className="font-semibold text-stone-900">{t('classes.class_label')} </span>
                                {classToDelete.name}
                            </div>
                            <div className="text-[11px] text-stone-500">
                                {classToDelete.course.title}
                            </div>
                            <div className="text-[11px] text-red-700 pt-1">
                                {t('classes.delete_impact')}
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t">
                            <button
                                type="button"
                                onClick={() => setClassToDelete(null)}
                                disabled={isDeleting}
                                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-xs font-medium hover:bg-gray-50"
                            >
                                {t('classes.cancel')}
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmDeleteClass}
                                disabled={isDeleting}
                                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow transition disabled:opacity-50 flex items-center gap-1.5"
                            >
                                {isDeleting ? (
                                    <span>{t('classes.deleting')}</span>
                                ) : (
                                    <>
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        <span>{t('classes.confirm_delete')}</span>
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
