import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import axios from 'axios';
import { PageProps } from '@/types';
import { useTranslation } from '@/utils/useTranslation';

interface Question {
    id: number;
    question_text: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
}

interface LessonPlayerProps extends PageProps {
    classItem: {
        id: number;
        name: string;
        course: {
            id: number;
            title: string;
            category: string;
        };
    };
    lesson: {
        id: number;
        title: string;
        summary: string | null;
        reading_content: string | null;
        reading_file_url: string | null;
        document_urls?: Array<{ title?: string; url: string }>;
        video_url: string | null;
        video_urls?: Array<{ title?: string; url: string }>;
        order: number;
    };
    allLessons: Array<{
        id: number;
        title: string;
        order: number;
    }>;
    progress: {
        reading_completed: boolean;
        reading_completed_at: string | null;
        video_completed: boolean;
        video_completed_at: string | null;
        practice_count: number;
        practice_target?: number;
        practice_completed: boolean;
        practice_completed_at: string | null;
        is_completed: boolean;
    };
    questions: Question[];
    userFeedbacks: any[];
    isAllLessonsCompleted?: boolean;
}

export default function LessonPlayer({
    auth,
    classItem,
    lesson,
    allLessons,
    progress,
    questions,
    userFeedbacks,
    isAllLessonsCompleted,
    flash,
}: LessonPlayerProps) {
    const t = useTranslation();
    const practiceTarget = progress.practice_target || 10;

    // Document and video lists
    const documents = (lesson.document_urls && lesson.document_urls.length > 0)
        ? lesson.document_urls
        : (lesson.reading_file_url ? [{ title: t('student.attached_pdf_title'), url: lesson.reading_file_url }] : []);

    const videos = (lesson.video_urls && lesson.video_urls.length > 0)
        ? lesson.video_urls
        : (lesson.video_url ? [{ title: lesson.title, url: lesson.video_url }] : []);

    const [activeVideoIndex, setActiveVideoIndex] = useState<number>(0);

    // Current active pipeline tab (1 to 3)
    const [activeStep, setActiveStep] = useState<number>(() => {
        if (progress.is_completed || progress.practice_completed) return 3;
        if (progress.video_completed) return 3;
        if (progress.reading_completed) return 2;
        return 1;
    });

    // Feedback modal state
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const feedbackForm = useForm({
        content: '',
    });

    // Step 1: Complete reading
    const readingForm = useForm({});
    const handleCompleteReading = () => {
        readingForm.post(route('student.reading.complete', [classItem.id, lesson.id]), {
            onSuccess: () => setActiveStep(2),
        });
    };

    // Step 2: Complete video
    const videoForm = useForm({});
    const handleCompleteVideo = () => {
        videoForm.post(route('student.video.complete', [classItem.id, lesson.id]), {
            onSuccess: () => setActiveStep(3),
        });
    };

    // Step 3: Interactive Practice Quiz state
    const [practiceSelections, setPracticeSelections] = useState<Record<number, string>>({});
    const [practiceResults, setPracticeResults] = useState<Record<number, { is_correct: boolean; correct_option: string; explanation: string }>>({});
    const [isSubmittingPracticeQuestion, setIsSubmittingPracticeQuestion] = useState<number | null>(null);

    const handleConfirmPracticeAnswer = async (questionId: number) => {
        const chosen = practiceSelections[questionId];
        if (!chosen) return;

        setIsSubmittingPracticeQuestion(questionId);
        try {
            const res = await axios.post(route('student.practice.check', [classItem.id, lesson.id]), {
                question_id: questionId,
                chosen_option: chosen,
            });
            setPracticeResults((prev) => ({
                ...prev,
                [questionId]: res.data,
            }));
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmittingPracticeQuestion(null);
        }
    };

    const practiceAttemptForm = useForm({});
    const handleFinishPracticeSession = () => {
        practiceAttemptForm.post(route('student.practice.record', [classItem.id, lesson.id]), {
            onSuccess: () => {
                setPracticeSelections({});
                setPracticeResults({});
            },
        });
    };

    // Handle feedback submission
    const handleSubmitFeedback = (e: React.FormEvent) => {
        e.preventDefault();
        feedbackForm.post(route('student.feedback.submit', [classItem.id, lesson.id]), {
            onSuccess: () => {
                setIsFeedbackModalOpen(false);
                feedbackForm.reset();
            },
        });
    };

    // Determine next sibling lesson if available
    const currentIndex = allLessons.findIndex((l) => l.id === lesson.id);
    const nextLesson = currentIndex >= 0 && currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

    return (
        <div className="min-h-screen bg-stone-100 font-sans text-stone-900 flex flex-col">
            <Head title={`${lesson.title} - ${classItem.name}`} />

            {/* Top Navigation Bar */}
            <header className="bg-stone-900 text-stone-100 border-b border-stone-800 sticky top-0 z-40 shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link href={route('student.dashboard')} className="text-stone-400 hover:text-white transition flex items-center gap-1.5 text-xs">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            <span className="hidden sm:inline">{t('student.back_to_dashboard')}</span>
                        </Link>
                        <span className="text-stone-600 hidden sm:inline">/</span>
                        <span className="font-serif font-bold text-sm text-amber-200 truncate max-w-[280px] sm:max-w-md">
                            {classItem.name}
                        </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                        <span className="font-mono text-stone-300 hidden md:inline">
                            {t('student.student_label', { name: auth.user.name, username: auth.user.username ? `(${auth.user.username})` : '' })}
                        </span>
                        {progress.is_completed && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                {t('student.lesson_completed')}
                            </span>
                        )}
                    </div>
                </div>
            </header>

            {/* Stepper Navigation: 3-step sequential progression for lesson */}
            <div className="bg-white border-b border-stone-200 shadow-sm sticky top-16 z-30">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <div className="grid grid-cols-3 gap-2 sm:gap-4 text-xs">
                        {/* Step 1: Self-Study */}
                        <button
                            onClick={() => setActiveStep(1)}
                            className={`p-3 rounded-2xl text-center border transition flex flex-col items-center justify-center ${
                                activeStep === 1
                                    ? 'bg-amber-50 border-amber-500 text-amber-900 font-bold shadow-sm'
                                    : progress.reading_completed
                                    ? 'bg-stone-50 border-emerald-300 text-emerald-800'
                                    : 'bg-stone-50 border-stone-200 text-stone-500'
                            }`}
                        >
                            <span className="text-[10px] uppercase font-semibold">{t('student.step_1')}</span>
                            <span className="text-xs sm:text-sm truncate w-full font-serif font-bold">{t('student.step_1_title')}</span>
                            <span className="text-[10px] mt-0.5">
                                {progress.reading_completed ? t('student.step_1_done') : t('student.step_1_reading')}
                            </span>
                        </button>

                        {/* Step 2: Video Lecture */}
                        <button
                            onClick={() => progress.reading_completed && setActiveStep(2)}
                            disabled={!progress.reading_completed}
                            className={`p-3 rounded-2xl text-center border transition flex flex-col items-center justify-center ${
                                activeStep === 2
                                    ? 'bg-amber-50 border-amber-500 text-amber-900 font-bold shadow-sm'
                                    : progress.video_completed
                                    ? 'bg-stone-50 border-emerald-300 text-emerald-800'
                                    : progress.reading_completed
                                    ? 'bg-stone-50 border-amber-300 text-amber-800'
                                    : 'bg-stone-100 border-stone-200 text-stone-400 opacity-60 cursor-not-allowed'
                            }`}
                        >
                            <span className="text-[10px] uppercase font-semibold">{t('student.step_2')}</span>
                            <span className="text-xs sm:text-sm truncate w-full font-serif font-bold">{t('student.step_2_title')}</span>
                            <span className="text-[10px] mt-0.5">
                                {progress.video_completed ? t('student.step_2_watched') : progress.reading_completed ? t('student.step_2_ready') : t('student.step_locked')}
                            </span>
                        </button>

                        {/* Step 3: Practice (10 repetitions) */}
                        <button
                            onClick={() => progress.video_completed && setActiveStep(3)}
                            disabled={!progress.video_completed}
                            className={`p-3 rounded-2xl text-center border transition flex flex-col items-center justify-center ${
                                activeStep === 3
                                    ? 'bg-amber-50 border-amber-500 text-amber-900 font-bold shadow-sm'
                                    : progress.practice_completed
                                    ? 'bg-stone-50 border-emerald-300 text-emerald-800'
                                    : progress.video_completed
                                    ? 'bg-stone-50 border-amber-300 text-amber-800'
                                    : 'bg-stone-100 border-stone-200 text-stone-400 opacity-60 cursor-not-allowed'
                            }`}
                        >
                            <span className="text-[10px] uppercase font-semibold">{t('student.step_3')}</span>
                            <span className="text-xs sm:text-sm truncate w-full font-serif font-bold">{t('student.step_3_title', { target: practiceTarget.toString() })}</span>
                            <span className="text-[10px] font-bold mt-0.5 text-amber-700">
                                {progress.practice_completed ? t('student.step_3_done') : t('student.step_3_count', { count: progress.practice_count.toString(), target: practiceTarget.toString() })}
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <main className="flex-1 py-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-6">
                {/* Flash Notice */}
                {flash?.success && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl text-xs flex items-center gap-2 shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        {flash.success}
                    </div>
                )}

                {/* STEP 1: SELF-STUDY READING MATERIAL */}
                {activeStep === 1 && (
                    <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-10 shadow-sm space-y-6">
                        <div className="border-b border-stone-100 pb-4">
                            <span className="text-xs font-semibold uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                                {t('student.step_1_header')}
                            </span>
                            <h2 className="font-serif font-bold text-2xl text-stone-900 mt-2">
                                {lesson.title}
                            </h2>
                            <p className="text-xs text-stone-500 mt-1">
                                {lesson.summary}
                            </p>
                        </div>

                        {/* Reading Markdown / Rich Text Content */}
                        <div
                            className="prose prose-stone max-w-none text-stone-800 text-sm leading-relaxed font-serif bg-stone-50/60 p-6 rounded-2xl border border-stone-200/80"
                            dangerouslySetInnerHTML={{ __html: lesson.reading_content || t('student.reading_updating') }}
                        />

                        {/* Optional Attached PDF/Document URLs */}
                        {documents.length > 0 && (
                            <div className="space-y-2.5">
                                <h4 className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                                    <svg className="w-4 h-4 text-amber-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <span>{t('student.attached_documents_title', { count: documents.length.toString() })}</span>
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    {documents.map((doc, idx) => (
                                        <div key={idx} className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 flex items-center justify-between text-xs gap-3">
                                            <div className="min-w-0">
                                                <div className="font-semibold text-stone-900 truncate">
                                                    {doc.title || `Tài liệu / Document #${idx + 1}`}
                                                </div>
                                                <div className="text-[11px] text-stone-500 truncate">
                                                    {doc.url}
                                                </div>
                                            </div>
                                            <a
                                                href={doc.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="px-3 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-medium shrink-0 transition shadow-2xs"
                                            >
                                                {t('student.view_material')}
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Feedback Button & Confirm Reading Completed */}
                        <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <button
                                type="button"
                                onClick={() => setIsFeedbackModalOpen(true)}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold transition"
                            >
                                <svg className="w-4 h-4 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                {t('student.feedback_button')}
                            </button>

                            <button
                                type="button"
                                onClick={handleCompleteReading}
                                disabled={readingForm.processing}
                                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-medium text-xs shadow-md shadow-amber-900/20 transition"
                            >
                                <span>{t('student.confirm_reading_done')}</span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 2: VIDEO LECTURE CLIP */}
                {activeStep === 2 && (
                    <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-10 shadow-sm space-y-6">
                        <div className="border-b border-stone-100 pb-4">
                            <span className="text-xs font-semibold uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                                {t('student.step_2_header')}
                            </span>
                            <h2 className="font-serif font-bold text-2xl text-stone-900 mt-2">
                                {t('student.step_2_subtitle')}
                            </h2>
                            <p className="text-xs text-stone-500 mt-1">
                                {lesson.title}
                            </p>
                        </div>

                        {/* Video Part Switcher */}
                        {videos.length > 1 && (
                            <div className="space-y-1.5">
                                <label className="block text-[11px] font-semibold text-stone-700">
                                    {t('student.select_video_part')}
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {videos.map((vid, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => setActiveVideoIndex(idx)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                                                activeVideoIndex === idx
                                                    ? 'bg-amber-700 text-white border-amber-800 shadow-sm'
                                                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                                            }`}
                                        >
                                            {t('student.video_part_label', {
                                                number: (idx + 1).toString(),
                                                title: vid.title || `Part ${idx + 1}`,
                                            })}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Video Player */}
                        <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-inner flex items-center justify-center">
                            {videos[activeVideoIndex]?.url ? (
                                <iframe
                                    className="w-full h-full"
                                    src={
                                        videos[activeVideoIndex].url.includes('watch?v=')
                                            ? videos[activeVideoIndex].url.replace('watch?v=', 'embed/')
                                            : videos[activeVideoIndex].url
                                    }
                                    title={videos[activeVideoIndex].title || "Buddhist Courses Lecture"}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            ) : (
                                <div className="text-center text-stone-400 text-xs p-8">
                                    {t('student.video_syncing')}
                                </div>
                            )}
                        </div>

                        <div className="pt-4 border-t border-stone-200 flex items-center justify-between">
                            <button
                                onClick={() => setActiveStep(1)}
                                className="text-xs font-medium text-stone-600 hover:text-stone-900"
                            >
                                {t('student.back_to_reading')}
                            </button>

                            <button
                                type="button"
                                onClick={handleCompleteVideo}
                                disabled={videoForm.processing}
                                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-medium text-xs shadow-md transition"
                            >
                                <span>{t('student.confirm_video_done', { target: practiceTarget.toString() })}</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 3: PRACTICE QUIZ (10 repetitions) */}
                {activeStep === 3 && (
                    <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-10 shadow-sm space-y-6">
                        <div className="border-b border-stone-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <span className="text-xs font-semibold uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                                    {t('student.step_3_header')}
                                </span>
                                <h2 className="font-serif font-bold text-2xl text-stone-900 mt-2">
                                    {t('student.step_3_heading', { target: practiceTarget.toString() })}
                                </h2>
                                <p className="text-xs text-stone-500 mt-1">
                                    {t('student.step_3_desc', { target: practiceTarget.toString() })}
                                </p>
                            </div>

                            {/* Practice Repetition Counter Tracker */}
                            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-300 rounded-2xl p-4 text-center sm:min-w-[200px]">
                                <span className="text-[11px] font-semibold text-amber-900 uppercase">
                                    {t('student.completed_practice_sessions')}
                                </span>
                                <div className="text-3xl font-serif font-bold text-amber-800 mt-1">
                                    {progress.practice_count} / {practiceTarget}
                                </div>
                                <div className="w-full bg-amber-200 rounded-full h-1.5 mt-2">
                                    <div
                                        className="bg-amber-600 h-1.5 rounded-full transition-all"
                                        style={{ width: `${Math.min(100, (progress.practice_count / practiceTarget) * 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        {/* Lesson Completion Card if 10 repetitions completed */}
                        {progress.is_completed && (
                            <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-300 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                                <div className="flex items-center gap-3 text-xs">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="font-serif font-bold text-sm text-emerald-950">
                                            {t('student.lesson_celebration_title')}
                                        </h4>
                                        <p className="text-emerald-800 text-[11px] mt-0.5">
                                            {t('student.lesson_celebration_desc', { title: lesson.title, target: practiceTarget.toString() })}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    {isAllLessonsCompleted ? (
                                        <Link
                                            href={route('student.class.exam', classItem.id)}
                                            className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-semibold text-xs shadow transition flex items-center gap-1.5"
                                        >
                                            <span>{t('student.take_class_exam_button')}</span>
                                        </Link>
                                    ) : nextLesson ? (
                                        <Link
                                            href={route('student.lesson', [classItem.id, nextLesson.id])}
                                            className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow transition flex items-center gap-1.5"
                                        >
                                            <span>{t('student.next_lesson_button')}</span>
                                        </Link>
                                    ) : (
                                        <Link
                                            href={route('student.dashboard')}
                                            className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow transition"
                                        >
                                            {t('student.back_to_dashboard')}
                                        </Link>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Questions List */}
                        <div className="space-y-6">
                            {questions.map((q, idx) => {
                                const result = practiceResults[q.id];
                                const currentChosen = practiceSelections[q.id];

                                return (
                                    <div
                                        key={q.id}
                                        className={`p-6 rounded-2xl border transition space-y-4 ${
                                            result
                                                ? result.is_correct
                                                    ? 'bg-emerald-50/40 border-emerald-300'
                                                    : 'bg-red-50/40 border-red-300'
                                                : 'bg-stone-50/60 border-stone-200'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="font-medium text-stone-900 text-sm">
                                                <span className="font-bold text-amber-900 mr-2">{t('student.question_prefix', { number: (idx + 1).toString() })}</span>
                                                {q.question_text}
                                            </div>

                                            {result && (
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold shrink-0 ${
                                                    result.is_correct ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {result.is_correct ? t('student.correct_badge') : t('student.incorrect_badge')}
                                                </span>
                                            )}
                                        </div>

                                        {/* Options */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                            {(['A', 'B', 'C', 'D'] as const).map((opt) => {
                                                const text = opt === 'A' ? q.option_a : opt === 'B' ? q.option_b : opt === 'C' ? q.option_c : q.option_d;
                                                const isSelected = currentChosen === opt;

                                                return (
                                                    <label
                                                        key={opt}
                                                        className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition ${
                                                            isSelected
                                                                ? 'bg-amber-100/70 border-amber-500 font-semibold text-amber-950 shadow-sm'
                                                                : 'bg-white border-stone-200 hover:border-stone-300 text-stone-700'
                                                        }`}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name={`practice-${q.id}`}
                                                            value={opt}
                                                            checked={isSelected}
                                                            onChange={() => setPracticeSelections((prev) => ({ ...prev, [q.id]: opt }))}
                                                            className="text-amber-600 focus:ring-amber-500"
                                                        />
                                                        <span><strong className="mr-1">{opt}.</strong> {text}</span>
                                                    </label>
                                                );
                                            })}
                                        </div>

                                        {/* Action: Confirm Answer */}
                                        {!result && (
                                            <div className="flex justify-end pt-1">
                                                <button
                                                    type="button"
                                                    disabled={!currentChosen || isSubmittingPracticeQuestion === q.id}
                                                    onClick={() => handleConfirmPracticeAnswer(q.id)}
                                                    className="px-4 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-medium text-xs disabled:opacity-50 transition"
                                                >
                                                    {isSubmittingPracticeQuestion === q.id ? t('student.checking') : t('student.confirm_answer')}
                                                </button>
                                            </div>
                                        )}

                                        {/* Display result and explanation after choosing */}
                                        {result && (
                                            <div className="bg-white/80 p-4 rounded-xl border border-stone-200 space-y-1.5 text-xs">
                                                <div className="flex items-center gap-2 font-semibold text-stone-900">
                                                    <span>{t('student.correct_answer_label')} <strong className="text-emerald-700 font-bold">{result.correct_option}</strong></span>
                                                </div>
                                                <p className="text-stone-700 text-xs italic">
                                                    <span className="font-semibold text-amber-900 not-italic mr-1">{t('student.explanation_label')}</span>
                                                    {result.explanation}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Complete Round Action */}
                        <div className="pt-6 border-t border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <span className="text-xs text-stone-500">
                                {t('student.round_note')}
                            </span>

                            <button
                                type="button"
                                onClick={handleFinishPracticeSession}
                                disabled={practiceAttemptForm.processing}
                                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-medium text-xs shadow-md transition"
                            >
                                <span>{t('student.record_round', { current: Math.min(practiceTarget, progress.practice_count + 1).toString(), target: practiceTarget.toString() })}</span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}
            </main>

            {/* Student Feedback Modal */}
            {isFeedbackModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-4 text-xs">
                        <div className="flex items-center justify-between border-b pb-3">
                            <h3 className="font-serif font-bold text-base text-stone-900">
                                {t('student.feedback_modal_title')}
                            </h3>
                            <button onClick={() => setIsFeedbackModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmitFeedback} className="space-y-4">
                            <p className="text-stone-600">
                                {t('student.feedback_modal_desc')}
                            </p>

                            <textarea
                                rows={5}
                                placeholder={t('student.feedback_placeholder')}
                                value={feedbackForm.data.content}
                                onChange={(e) => feedbackForm.setData('content', e.target.value)}
                                className="w-full rounded-xl border-stone-300 text-xs focus:ring-amber-500 focus:border-amber-500"
                                required
                            />

                            <div className="flex justify-end gap-2 pt-2 border-t">
                                <button
                                    type="button"
                                    onClick={() => setIsFeedbackModalOpen(false)}
                                    className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 font-medium hover:bg-stone-50"
                                >
                                    {t('student.cancel')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={feedbackForm.processing}
                                    className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-medium shadow"
                                >
                                    {t('student.send_feedback')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
