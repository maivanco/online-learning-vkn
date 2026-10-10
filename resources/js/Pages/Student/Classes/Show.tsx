import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { PageProps, ClassCommentItem } from '@/types';
import { useTranslation } from '@/utils/useTranslation';
import ClassCommentsSection from '@/Components/Comments/ClassCommentsSection';

interface LessonItem {
    id: number;
    title: string;
    order: number;
    reading_completed: boolean;
    video_completed: boolean;
    practice_count: number;
    practice_completed: boolean;
    is_completed: boolean;
}

interface StudentClassItem {
    id: number;
    name: string;
    description: string | null;
    is_locked: boolean;
    course: {
        id: number;
        title: string;
        category: string;
    };
    instructor: {
        id: number;
        name: string;
        username: string;
    } | null;
    is_graduated: boolean;
    final_grade: number | null;
    progress_percentage: number;
    completed_lessons: number;
    total_lessons: number;
    is_all_lessons_completed: boolean;
    exam_attempt: {
        id: number;
        score: number;
        total_questions: number;
        correct_count: number;
        incorrect_count: number;
        is_completed: boolean;
    } | null;
    lessons: LessonItem[];
}

interface StudentClassShowProps extends PageProps {
    classItem: StudentClassItem;
    comments: ClassCommentItem[];
    practiceTarget: number;
}

export default function StudentClassShow({ auth, classItem, comments = [], practiceTarget, flash }: StudentClassShowProps) {
    const t = useTranslation();
    const user = auth.user;

    return (
        <div className="min-h-screen bg-stone-100 font-sans text-stone-900">
            <Head title={`${classItem.name} - ${t('student.portal_brand')}`} />

            {/* Navigation Header */}
            <header className="bg-stone-900 text-stone-100 border-b border-stone-800 sticky top-0 z-40 shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href={route('student.dashboard')} className="flex items-center gap-2 group">
                            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-serif font-bold text-amber-400 group-hover:bg-amber-500/30 transition">
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
                        <Link
                            href={route('student.dashboard')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-700 text-stone-300 hover:text-white hover:bg-stone-800 transition"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            <span>{t('student.back_to_dashboard')}</span>
                        </Link>

                        <div className="text-right hidden sm:block">
                            <div className="font-semibold text-stone-200">{user.name}</div>
                            <div className="text-[11px] text-amber-400 font-mono">
                                {t('student.username_display', { username: user.username || '' })}
                            </div>
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

                {/* Class Overview Hero Banner */}
                <div className="relative overflow-hidden bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
                    <div className="relative z-10 space-y-4 max-w-4xl">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                {classItem.course.category.toUpperCase()}
                            </span>

                            <span className={`text-[11px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider ${
                                classItem.is_graduated
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                    : classItem.is_all_lessons_completed
                                    ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40'
                                    : 'bg-stone-800 text-stone-300 border border-stone-700'
                            }`}>
                                {classItem.is_graduated
                                    ? t('student.status_graduated')
                                    : classItem.is_all_lessons_completed
                                    ? t('student.status_ready_for_exam')
                                    : t('student.status_studying')}
                            </span>

                            {classItem.final_grade !== null && classItem.final_grade !== undefined && (
                                <span className="text-[11px] font-bold px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                    {t('student.final_grade_badge', { score: classItem.final_grade.toString() })}
                                </span>
                            )}
                        </div>

                        <div>
                            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-amber-100 tracking-tight leading-tight">
                                {classItem.name}
                            </h1>
                            <p className="text-stone-300 text-sm mt-1">
                                {classItem.course.title}
                            </p>
                        </div>

                        {classItem.description && (
                            <p className="text-xs text-stone-300/90 leading-relaxed max-w-3xl">
                                {classItem.description}
                            </p>
                        )}

                        <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-stone-300">
                            {classItem.instructor && (
                                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-white/10">
                                    <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <span>{t('student.instructor')}: <strong className="text-white">{classItem.instructor.name}</strong></span>
                                </div>
                            )}

                            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-white/10">
                                <span>📚 {classItem.completed_lessons}/{classItem.total_lessons} {t('classes.lessons_label')}</span>
                            </div>

                            {classItem.is_graduated && (
                                <a
                                    href={route('student.class.certificate', classItem.id)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold text-xs shadow transition"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                    </svg>
                                    {t('student.certificate_btn')}
                                </a>
                            )}
                        </div>

                        {/* Progress Bar */}
                        <div className="pt-2 max-w-xl">
                            <div className="flex justify-between text-xs mb-1.5 text-stone-300">
                                <span>{t('student.progress_label')}</span>
                                <span className="font-bold text-amber-300">
                                    {classItem.progress_percentage}% ({classItem.completed_lessons}/{classItem.total_lessons})
                                </span>
                            </div>
                            <div className="w-full bg-stone-800/80 rounded-full h-2.5 overflow-hidden border border-stone-700/60">
                                <div
                                    className="bg-gradient-to-r from-amber-500 to-amber-600 h-2.5 rounded-full transition-all duration-500"
                                    style={{ width: `${classItem.progress_percentage}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Class Exam Prompt if ready */}
                {classItem.is_all_lessons_completed && !classItem.is_graduated && (
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 p-5 rounded-3xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">📜</span>
                            <div>
                                <h3 className="font-serif font-bold text-stone-900 text-sm sm:text-base">
                                    {t('student.class_exam_title')}
                                </h3>
                                <p className="text-xs text-amber-900 mt-0.5">
                                    {classItem.exam_attempt ? t('student.continue_exam') : t('student.class_exam_desc')}
                                </p>
                            </div>
                        </div>

                        <Link
                            href={route('student.class.exam', classItem.id)}
                            className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-semibold text-xs shadow transition shrink-0 text-center"
                        >
                            {classItem.exam_attempt ? t('student.continue_exam') : t('student.take_exam_now')}
                        </Link>
                    </div>
                )}

                {/* Main Content Layout: Syllabus (left) & Discussions (right) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    {/* Left Column (1 col): Lessons Checklist */}
                    <div className="lg:col-span-1 space-y-4">
                        <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-5 space-y-4">
                            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                                <h3 className="font-serif font-bold text-stone-900 text-sm">
                                    {t('student.class_syllabus')}
                                </h3>
                                <span className="text-xs text-stone-500 font-medium">
                                    {classItem.completed_lessons}/{classItem.total_lessons}
                                </span>
                            </div>

                            <div className="space-y-2">
                                {classItem.lessons.map((lesson) => (
                                    <div
                                        key={lesson.id}
                                        className="p-3 rounded-2xl bg-stone-50 border border-stone-100 hover:border-stone-200 transition space-y-2"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-center gap-2 truncate">
                                                <span className={`w-2 h-2 rounded-full shrink-0 ${
                                                    lesson.is_completed ? 'bg-emerald-500' : 'bg-amber-400'
                                                }`} />
                                                <span className="font-medium text-xs text-stone-800 truncate">
                                                    {lesson.title}
                                                </span>
                                            </div>

                                            {lesson.is_completed && (
                                                <span className="text-emerald-700 font-semibold text-[10px] flex items-center gap-0.5 shrink-0">
                                                    ✓ {t('student.completed_badge')}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between pt-1 text-[11px] text-stone-500">
                                            <span>
                                                {t('student.practice_count_badge', { count: lesson.practice_count.toString() })}
                                            </span>

                                            <Link
                                                href={route('student.lesson', [classItem.id, lesson.id])}
                                                className="px-2.5 py-1 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-medium text-[11px] transition shadow-2xs"
                                            >
                                                {t('student.enter_lesson')}
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column (2 cols): 2-Level Discussion Section */}
                    <div className="lg:col-span-2">
                        <ClassCommentsSection
                            classId={classItem.id}
                            comments={comments}
                            currentUser={user}
                            isLocked={classItem.is_locked}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}
