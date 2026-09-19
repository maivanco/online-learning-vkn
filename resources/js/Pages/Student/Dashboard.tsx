import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useTranslation } from '@/utils/useTranslation';

interface LessonProgress {
    id: number;
    title: string;
    order: number;
    reading_completed: boolean;
    video_completed: boolean;
    practice_count: number;
    practice_completed: boolean;
    exam_completed: boolean;
    is_completed: boolean;
}

interface EnrolledClass {
    id: number;
    name: string;
    code: string;
    course_title: string;
    category: string;
    duration_months: number;
    start_date: string | null;
    end_date: string | null;
    status: 'active' | 'completed' | 'upcoming';
    is_locked: boolean;
    enrollment_status: string;
    progress_percentage: number;
    completed_lessons: number;
    total_lessons: number;
    lessons: LessonProgress[];
}

interface UpcomingClass {
    id: number;
    name: string;
    code: string;
    duration_months: number;
    start_date: string | null;
    course: {
        title: string;
        category: string;
    };
}

interface StudentDashboardProps extends PageProps {
    enrolledClasses: EnrolledClass[];
    upcomingClasses: UpcomingClass[];
    user: {
        name: string;
        username: string;
        email: string;
    };
}

export default function StudentDashboard({ auth, enrolledClasses, upcomingClasses, user, flash }: StudentDashboardProps) {
    const t = useTranslation();

    return (
        <div className="min-h-screen bg-stone-100 font-sans text-stone-900">
            <Head title={t('student.meta_title')} />

            {/* Navigation Header */}
            <header className="bg-stone-900 text-stone-100 border-b border-stone-800 sticky top-0 z-40 shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-serif font-bold text-amber-400">
                                VK
                            </div>
                            <span className="font-serif font-bold text-base tracking-wide text-white">
                                {t('student.portal_brand')}
                            </span>
                        </Link>
                        <span className="hidden sm:inline text-xs text-amber-400/90 font-medium pl-2 border-l border-stone-700">
                            {t('student.portal_title')}
                        </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                        <div className="text-right hidden sm:block">
                            <div className="font-semibold text-stone-200">{user.name}</div>
                            <div className="text-[11px] text-amber-400 font-mono">{t('student.username_display', { username: user.username })}</div>
                        </div>

                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="px-3 py-1.5 rounded-lg border border-stone-700 text-stone-300 hover:text-white hover:bg-stone-800 transition"
                        >
                            {t('student.nav_logout')}
                        </Link>
                    </div>
                </div>
            </header>

            <main className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                {/* Flash Messages */}
                {flash?.success && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs flex items-center gap-2 shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        {flash.success}
                    </div>
                )}

                {flash?.error && (
                    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl text-xs flex items-center gap-2 shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                        {flash.error}
                    </div>
                )}

                {/* Welcome Card with Buddhist monastery serenity */}
                <div className="relative overflow-hidden bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
                    <div className="relative z-10 max-w-3xl">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-3">
                            {t('student.welcome_badge', { username: user.username })}
                        </span>
                        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-amber-100 tracking-tight leading-tight">
                            {t('student.learning_path_title')}
                        </h1>
                        <p className="text-xs sm:text-sm text-stone-300 mt-2 leading-relaxed">
                            {t('student.learning_path_desc')}
                        </p>
                    </div>
                </div>

                {/* Enrolled Classes List */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="font-serif font-bold text-lg text-stone-900">
                            {t('student.enrolled_classes_title')}
                        </h2>
                        <span className="text-xs text-stone-500 font-medium">
                            {t('student.enrolled_classes_count', { count: enrolledClasses.length.toString() })}
                        </span>
                    </div>

                    {enrolledClasses.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center text-xs text-stone-500 shadow-sm">
                            {t('student.no_classes_enrolled')}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {enrolledClasses.map((cls) => (
                                <div
                                    key={cls.id}
                                    className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200">
                                                {cls.code}
                                            </span>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                                cls.enrollment_status === 'completed'
                                                    ? 'bg-emerald-100 text-emerald-800'
                                                    : 'bg-amber-100 text-amber-800'
                                            }`}>
                                                {cls.enrollment_status === 'completed' ? t('student.status_graduated') : t('student.status_studying')}
                                            </span>
                                        </div>

                                        <h3 className="font-serif font-bold text-base text-stone-900">
                                            {cls.name}
                                        </h3>
                                        <p className="text-xs text-amber-900/80 font-medium mt-0.5">
                                            {cls.course_title} &bull; <span className="uppercase text-[10px]">{cls.category}</span>
                                        </p>

                                        {/* Progress Bar */}
                                        <div className="mt-4">
                                            <div className="flex justify-between text-xs mb-1.5">
                                                <span className="text-stone-500 font-medium">{t('student.progress_label')}</span>
                                                <span className="font-bold text-amber-800">
                                                    {t('student.progress_summary', {
                                                        percentage: cls.progress_percentage.toString(),
                                                        completed: cls.completed_lessons.toString(),
                                                        total: cls.total_lessons.toString(),
                                                    })}
                                                </span>
                                            </div>
                                            <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden border border-stone-200">
                                                <div
                                                    className="bg-amber-600 h-2 rounded-full transition-all"
                                                    style={{ width: `${cls.progress_percentage}%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        {/* Lessons Checklist */}
                                        <div className="mt-4 pt-3 border-t border-stone-100 space-y-2">
                                            <h4 className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                                                {t('student.units_title')}
                                            </h4>
                                            <div className="space-y-1.5">
                                                {cls.lessons.map((lesson) => (
                                                    <div
                                                        key={lesson.id}
                                                        className="flex items-center justify-between p-2 rounded-lg bg-stone-50 text-xs border border-stone-100"
                                                    >
                                                        <div className="flex items-center gap-2 truncate">
                                                            <span className={`w-2 h-2 rounded-full ${lesson.is_completed ? 'bg-emerald-500' : 'bg-amber-400'}`}></span>
                                                            <span className="font-medium text-stone-800 truncate">{lesson.title}</span>
                                                        </div>

                                                        <div className="flex items-center gap-2 shrink-0 text-[11px]">
                                                            {lesson.is_completed ? (
                                                                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                                                                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                    </svg>
                                                                    {t('student.completed_badge')}
                                                                </span>
                                                            ) : (
                                                                <span className="text-stone-500">
                                                                    {t('student.practice_count_badge', { count: lesson.practice_count.toString() })}
                                                                </span>
                                                            )}

                                                            <Link
                                                                href={route('student.lesson', [cls.id, lesson.id])}
                                                                className="px-2.5 py-1 rounded bg-amber-700 hover:bg-amber-800 text-white font-medium text-[11px] shadow-sm transition"
                                                            >
                                                                {t('student.enter_lesson')}
                                                            </Link>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Class Footer */}
                                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                                        <span>{t('student.course_duration', { months: cls.duration_months.toString() })}</span>
                                        <span>{cls.is_locked ? t('student.class_locked') : t('student.class_open')}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Upcoming Classes Section */}
                {upcomingClasses.length > 0 && (
                    <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4">
                        <div className="border-b border-stone-100 pb-3">
                            <h3 className="font-serif font-bold text-base text-stone-900">
                                {t('student.upcoming_classes_title')}
                            </h3>
                            <p className="text-xs text-stone-500">
                                {t('student.upcoming_classes_desc')}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {upcomingClasses.map((u) => (
                                <div key={u.id} className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-800">
                                            {u.code}
                                        </span>
                                        <span className="text-[10px] text-blue-700 font-semibold">{t('student.course_duration', { months: u.duration_months.toString() })}</span>
                                    </div>
                                    <h4 className="font-semibold text-stone-900">{u.name}</h4>
                                    <p className="text-[11px] text-stone-500">{u.course.title}</p>
                                    <p className="text-[11px] text-amber-800 font-medium pt-1">
                                        {t('student.expected_start', { date: u.start_date || t('student.tba') })}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Monastery Contact Information */}
                <div className="bg-stone-900 text-stone-300 rounded-2xl p-6 shadow text-xs space-y-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h4 className="font-serif font-bold text-sm text-amber-200">
                            {t('student.monastery_title')}
                        </h4>
                        <p className="text-[11px] text-stone-400 mt-0.5">
                            {t('student.monastery_address')}
                        </p>
                    </div>

                    <a
                        href="https://www.facebook.com/share/1DCWqsCZSY/?mibextid=wwXIfr"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow transition self-start sm:self-auto"
                    >
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                        {t('student.monastery_facebook')}
                    </a>
                </div>
            </main>
        </div>
    );
}
