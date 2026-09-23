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
    is_completed: boolean;
}

interface EnrolledClass {
    id: number;
    name: string;
    course_title: string;
    category: string;
    instructor?: {
        id?: number;
        name: string;
        username: string;
    } | null;
    is_locked: boolean;
    enrollment_status: string;
    is_graduated: boolean;
    is_all_lessons_completed: boolean;
    progress_percentage: number;
    completed_lessons: number;
    total_lessons: number;
    final_grade?: number | null;
    exam_attempt?: {
        id: number;
        score: number;
        total_questions: number;
        correct_count: number;
        incorrect_count: number;
        is_completed: boolean;
    } | null;
    lessons: LessonProgress[];
}

interface StudentDashboardProps extends PageProps {
    enrolledClasses: EnrolledClass[];
    upcomingClasses?: any[];
    user: {
        name: string;
        username: string;
        email: string;
    };
}

export default function StudentDashboard({ auth, enrolledClasses, user, flash }: StudentDashboardProps) {
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
                                    className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between"
                                >
                                    <div className="space-y-4">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                                                    cls.is_graduated
                                                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                                        : cls.is_all_lessons_completed
                                                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                                        : 'bg-stone-100 text-stone-700'
                                                }`}>
                                                    {cls.is_graduated
                                                        ? t('student.status_graduated')
                                                        : cls.is_all_lessons_completed
                                                        ? t('student.status_ready_for_exam')
                                                        : t('student.status_studying')}
                                                </span>

                                                {cls.final_grade !== null && cls.final_grade !== undefined && (
                                                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
                                                        {t('student.final_grade_badge', { score: cls.final_grade.toString() })}
                                                    </span>
                                                )}
                                            </div>

                                            <span className="text-[11px] text-stone-400">
                                                {cls.is_locked ? t('student.class_locked') : t('student.class_open')}
                                            </span>
                                        </div>

                                        <div>
                                            <h3 className="font-serif font-bold text-lg text-stone-900">
                                                {cls.name}
                                            </h3>
                                            <p className="text-xs text-amber-900/80 font-medium mt-0.5">
                                                {cls.course_title} &bull; <span className="uppercase text-[10px]">{cls.category}</span>
                                            </p>
                                            {cls.instructor && (
                                                <div className="flex items-center gap-1.5 text-[11px] text-stone-600 mt-2 font-medium bg-stone-50 px-2.5 py-1 rounded-lg border border-stone-200/60 w-fit">
                                                    <svg className="w-3.5 h-3.5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                    <span>{cls.instructor.name}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Progress Bar */}
                                        <div>
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

                                        {/* Class Final Exam Callout */}
                                        <div className={`p-4 rounded-2xl border transition text-xs space-y-2.5 ${
                                            cls.is_graduated
                                                ? 'bg-emerald-50/50 border-emerald-200'
                                                : cls.is_all_lessons_completed
                                                ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-300'
                                                : 'bg-stone-50 border-stone-200 opacity-80'
                                        }`}>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-base">📜</span>
                                                    <span className="font-serif font-bold text-stone-900">
                                                        {t('student.class_exam_title')}
                                                    </span>
                                                </div>
                                                {cls.is_graduated ? (
                                                    <span className="text-[11px] font-bold text-emerald-700">
                                                        ✓ {cls.final_grade}%
                                                    </span>
                                                ) : !cls.is_all_lessons_completed ? (
                                                    <span className="text-[10px] text-stone-400 font-medium flex items-center gap-1">
                                                        🔒 {t('student.step_locked')}
                                                    </span>
                                                ) : null}
                                            </div>

                                            {cls.is_all_lessons_completed && !cls.is_graduated ? (
                                                <div className="flex items-center justify-between gap-2 pt-1">
                                                    <span className="text-[11px] text-amber-900 font-medium">
                                                        {cls.exam_attempt ? t('student.continue_exam') : t('student.class_exam_desc')}
                                                    </span>
                                                    <Link
                                                        href={route('student.class.exam', cls.id)}
                                                        className="px-3.5 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-semibold text-xs shadow-sm transition shrink-0"
                                                    >
                                                        {cls.exam_attempt ? t('student.continue_exam') : t('student.take_exam_now')}
                                                    </Link>
                                                </div>
                                            ) : cls.is_graduated ? (
                                                <div className="flex items-center justify-between gap-2 pt-1">
                                                    <span className="text-[11px] text-emerald-800">
                                                        {t('student.class_exam_completed_desc', { course: cls.course_title })}
                                                    </span>
                                                    <Link
                                                        href={route('student.class.exam', cls.id)}
                                                        className="px-3 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-[11px] shadow-sm transition shrink-0"
                                                    >
                                                        {t('student.view_exam_results')}
                                                    </Link>
                                                </div>
                                            ) : (
                                                <p className="text-[11px] text-stone-500">
                                                    {t('student.class_exam_locked_msg', {
                                                        completed: cls.completed_lessons.toString(),
                                                        total: cls.total_lessons.toString(),
                                                    })}
                                                </p>
                                            )}
                                        </div>

                                        {/* Lessons Checklist */}
                                        <div className="pt-2 border-t border-stone-100 space-y-2">
                                            <h4 className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                                                {t('student.units_title')}
                                            </h4>
                                            <div className="space-y-1.5">
                                                {cls.lessons.map((lesson) => (
                                                    <div
                                                        key={lesson.id}
                                                        className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 text-xs border border-stone-100 hover:border-stone-200 transition"
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
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Monastery Contact Information */}
                <div className="bg-stone-900 text-stone-300 rounded-3xl p-6 sm:p-8 shadow text-xs space-y-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h4 className="font-serif font-bold text-base text-amber-200">
                            {t('student.monastery_title')}
                        </h4>
                        <p className="text-xs text-stone-400 mt-1">
                            {t('student.monastery_address')}
                        </p>
                    </div>

                    <a
                        href="https://www.facebook.com/share/1DCWqsCZSY/?mibextid=wwXIfr"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow transition self-start sm:self-auto"
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
