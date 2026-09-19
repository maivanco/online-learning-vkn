import { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import axios from 'axios';
import { PageProps } from '@/types';

interface Question {
    id: number;
    question_text: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
}

interface IncorrectQuestion {
    id: number;
    question_id: number;
    last_chosen_option: string | null;
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
        code: string;
        duration_months: number;
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
        video_url: string | null;
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
        practice_completed: boolean;
        practice_completed_at: string | null;
        exam_completed: boolean;
        exam_completed_at: string | null;
        exam_score: number | null;
        is_completed: boolean;
    };
    questions: Question[];
    unresolvedIncorrect: IncorrectQuestion[];
    latestExamAttempt: any;
    userFeedbacks: any[];
}

export default function LessonPlayer({
    auth,
    classItem,
    lesson,
    allLessons,
    progress,
    questions,
    unresolvedIncorrect: initialUnresolved,
    latestExamAttempt,
    userFeedbacks,
    flash,
}: LessonPlayerProps) {
    // Current active pipeline tab (1 to 5)
    const [activeStep, setActiveStep] = useState<number>(() => {
        if (progress.is_completed) return 5;
        if (progress.exam_completed && initialUnresolved.length > 0) return 5;
        if (progress.exam_completed) return 4;
        if (progress.practice_completed) return 4;
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

    // Step 4: Final Exam state
    const [examSelections, setExamSelections] = useState<Record<number, string>>({});
    const [examResults, setExamResults] = useState<Record<number, { is_correct: boolean; correct_option: string; explanation: string }>>({});
    const [isSubmittingExamQuestion, setIsSubmittingExamQuestion] = useState<number | null>(null);

    const handleConfirmExamQuestion = async (questionId: number) => {
        const chosen = examSelections[questionId];
        if (!chosen) return;

        setIsSubmittingExamQuestion(questionId);
        try {
            const res = await axios.post(route('student.practice.check', [classItem.id, lesson.id]), {
                question_id: questionId,
                chosen_option: chosen,
            });
            setExamResults((prev) => ({
                ...prev,
                [questionId]: res.data,
            }));
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmittingExamQuestion(null);
        }
    };

    const [isSubmittingFullExam, setIsSubmittingFullExam] = useState(false);
    const handleSubmitFullExam = () => {
        setIsSubmittingFullExam(true);
        router.post(route('student.exam.submit', [classItem.id, lesson.id]), {
            answers: examSelections,
        }, {
            onSuccess: () => {
                setActiveStep(5);
            },
            onFinish: () => {
                setIsSubmittingFullExam(false);
            },
        });
    };

    // Step 5: Incorrect questions retry state
    const [unresolvedList, setUnresolvedList] = useState<IncorrectQuestion[]>(initialUnresolved);
    const [retrySelections, setRetrySelections] = useState<Record<number, string>>({});
    const [retryResults, setRetryResults] = useState<Record<number, { is_correct: boolean; explanation: string; message: string }>>({});
    const [isClearedAll, setIsClearedAll] = useState<boolean>(progress.is_completed);

    const handleRetryIncorrectQuestion = async (questionId: number) => {
        const chosen = retrySelections[questionId];
        if (!chosen) return;

        try {
            const res = await axios.post(route('student.incorrect.retry', [classItem.id, lesson.id]), {
                question_id: questionId,
                chosen_option: chosen,
            });

            setRetryResults((prev) => ({
                ...prev,
                [questionId]: res.data,
            }));

            if (res.data.is_correct) {
                // Remove question from unresolved list
                setUnresolvedList((prev) => prev.filter((q) => q.question_id !== questionId));
                if (res.data.all_cleared) {
                    setIsClearedAll(true);
                }
            }
        } catch (err) {
            console.error(err);
        }
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
                            <span className="hidden sm:inline">Quay Lại Bảng Học Tập</span>
                        </Link>
                        <span className="text-stone-600 hidden sm:inline">/</span>
                        <span className="font-serif font-bold text-sm text-amber-200 truncate max-w-[280px] sm:max-w-md">
                            {classItem.name}
                        </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                        <span className="font-mono text-stone-300 hidden md:inline">
                            Học viên: {auth.user.name} {auth.user.username ? `(${auth.user.username})` : ''}
                        </span>
                        {progress.is_completed && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                Đã Hoàn Tất Môn Học
                            </span>
                        )}
                    </div>
                </div>
            </header>

            {/* Stepper Navigation: 5-step strict sequence */}
            <div className="bg-white border-b border-stone-200 shadow-sm sticky top-16 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <div className="grid grid-cols-5 gap-1 sm:gap-3 text-xs">
                        {/* Step 1: Self-Study */}
                        <button
                            onClick={() => setActiveStep(1)}
                            className={`p-2 rounded-xl text-center border transition flex flex-col items-center justify-center ${
                                activeStep === 1
                                    ? 'bg-amber-50 border-amber-500 text-amber-900 font-bold shadow-sm'
                                    : progress.reading_completed
                                    ? 'bg-stone-50 border-emerald-300 text-emerald-800'
                                    : 'bg-stone-50 border-stone-200 text-stone-500'
                            }`}
                        >
                            <span className="text-[10px] uppercase font-semibold">Bước 1</span>
                            <span className="text-[11px] sm:text-xs truncate w-full">Tài Liệu Tự Đọc</span>
                            <span className="text-[10px] mt-0.5">
                                {progress.reading_completed ? '✓ Hoàn thành' : 'Đang đọc'}
                            </span>
                        </button>

                        {/* Step 2: Video Lecture */}
                        <button
                            onClick={() => progress.reading_completed && setActiveStep(2)}
                            disabled={!progress.reading_completed}
                            className={`p-2 rounded-xl text-center border transition flex flex-col items-center justify-center ${
                                activeStep === 2
                                    ? 'bg-amber-50 border-amber-500 text-amber-900 font-bold shadow-sm'
                                    : progress.video_completed
                                    ? 'bg-stone-50 border-emerald-300 text-emerald-800'
                                    : progress.reading_completed
                                    ? 'bg-stone-50 border-amber-300 text-amber-800'
                                    : 'bg-stone-100 border-stone-200 text-stone-400 opacity-60 cursor-not-allowed'
                            }`}
                        >
                            <span className="text-[10px] uppercase font-semibold">Bước 2</span>
                            <span className="text-[11px] sm:text-xs truncate w-full">Video Giảng</span>
                            <span className="text-[10px] mt-0.5">
                                {progress.video_completed ? '✓ Đã xem' : progress.reading_completed ? 'Mở xem' : '🔒 Khóa'}
                            </span>
                        </button>

                        {/* Step 3: Practice (10 repetitions) */}
                        <button
                            onClick={() => progress.video_completed && setActiveStep(3)}
                            disabled={!progress.video_completed}
                            className={`p-2 rounded-xl text-center border transition flex flex-col items-center justify-center ${
                                activeStep === 3
                                    ? 'bg-amber-50 border-amber-500 text-amber-900 font-bold shadow-sm'
                                    : progress.practice_completed
                                    ? 'bg-stone-50 border-emerald-300 text-emerald-800'
                                    : progress.video_completed
                                    ? 'bg-stone-50 border-amber-300 text-amber-800'
                                    : 'bg-stone-100 border-stone-200 text-stone-400 opacity-60 cursor-not-allowed'
                            }`}
                        >
                            <span className="text-[10px] uppercase font-semibold">Bước 3</span>
                            <span className="text-[11px] sm:text-xs truncate w-full">Ôn Luyện 10 Lần</span>
                            <span className="text-[10px] font-bold mt-0.5 text-amber-700">
                                {progress.practice_completed ? '✓ Đủ 10/10' : `${progress.practice_count}/10 Lần`}
                            </span>
                        </button>

                        {/* Step 4: Final Exam */}
                        <button
                            onClick={() => progress.practice_completed && setActiveStep(4)}
                            disabled={!progress.practice_completed}
                            className={`p-2 rounded-xl text-center border transition flex flex-col items-center justify-center ${
                                activeStep === 4
                                    ? 'bg-amber-50 border-amber-500 text-amber-900 font-bold shadow-sm'
                                    : progress.exam_completed
                                    ? 'bg-stone-50 border-emerald-300 text-emerald-800'
                                    : progress.practice_completed
                                    ? 'bg-stone-50 border-amber-300 text-amber-800'
                                    : 'bg-stone-100 border-stone-200 text-stone-400 opacity-60 cursor-not-allowed'
                            }`}
                        >
                            <span className="text-[10px] uppercase font-semibold">Bước 4</span>
                            <span className="text-[11px] sm:text-xs truncate w-full">Bài Kiểm Tra</span>
                            <span className="text-[10px] mt-0.5">
                                {progress.exam_completed ? `✓ ${progress.exam_score}%` : progress.practice_completed ? 'Sẵn sàng' : '🔒 Khóa'}
                            </span>
                        </button>

                        {/* Step 5: Master Incorrect Questions */}
                        <button
                            onClick={() => progress.exam_completed && setActiveStep(5)}
                            disabled={!progress.exam_completed}
                            className={`p-2 rounded-xl text-center border transition flex flex-col items-center justify-center ${
                                activeStep === 5
                                    ? 'bg-amber-50 border-amber-500 text-amber-900 font-bold shadow-sm'
                                    : isClearedAll
                                    ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold'
                                    : progress.exam_completed
                                    ? 'bg-amber-50 border-amber-300 text-amber-800'
                                    : 'bg-stone-100 border-stone-200 text-stone-400 opacity-60 cursor-not-allowed'
                            }`}
                        >
                            <span className="text-[10px] uppercase font-semibold">Bước 5</span>
                            <span className="text-[11px] sm:text-xs truncate w-full">Ôn Tập Câu Sai</span>
                            <span className="text-[10px] font-bold mt-0.5">
                                {isClearedAll ? '✓ Thành tựu' : progress.exam_completed ? `${unresolvedList.length} câu sai` : '🔒 Khóa'}
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
                                Bước 1: Tài Liệu Tự Đọc
                            </span>
                            <h2 className="font-serif font-bold text-2xl text-stone-900 mt-2">
                                {lesson.title}
                            </h2>
                            <p className="text-xs text-stone-500 mt-1">
                                {lesson.summary}
                            </p>
                        </div>

                        {/* Reading Markdown Content */}
                        <div className="prose prose-stone max-w-none text-stone-800 text-sm leading-relaxed whitespace-pre-line font-serif bg-stone-50/60 p-6 rounded-2xl border border-stone-200/80">
                            {lesson.reading_content || 'Nội dung bài học tự đọc đang được cập nhật...'}
                        </div>

                        {/* Optional Attached PDF/Document URL */}
                        {lesson.reading_file_url && (
                            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-amber-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <div>
                                        <div className="font-semibold text-stone-900">Tài Liệu Chuyên Khảo (PDF Đính Kèm)</div>
                                        <div className="text-[11px] text-stone-500">Tải về hoặc xem trực tiếp tài liệu do tu viện cung cấp</div>
                                    </div>
                                </div>
                                <a
                                    href={lesson.reading_file_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-3 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-medium"
                                >
                                    Xem Tài Liệu
                                </a>
                            </div>
                        )}

                        {/* SPECIFICATION REQUIREMENT: Feedback Button Directly Beneath Material */}
                        <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <button
                                type="button"
                                onClick={() => setIsFeedbackModalOpen(true)}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold transition"
                            >
                                <svg className="w-4 h-4 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Góp ý chỉnh sửa tài liệu (Phản ánh sai sót)
                            </button>

                            <button
                                type="button"
                                onClick={handleCompleteReading}
                                disabled={readingForm.processing}
                                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-medium text-xs shadow-md shadow-amber-900/20 transition"
                            >
                                <span>Xác Nhận Đã Tự Đọc Xong</span>
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
                                Bước 2: Xem Video Clip Bài Giảng
                            </span>
                            <h2 className="font-serif font-bold text-2xl text-stone-900 mt-2">
                                Video Giảng Làm Rõ Nội Dung Tự Học
                            </h2>
                            <p className="text-xs text-stone-500 mt-1">
                                {lesson.title}
                            </p>
                        </div>

                        {/* Video Player */}
                        <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-inner flex items-center justify-center">
                            {lesson.video_url ? (
                                <iframe
                                    className="w-full h-full"
                                    src={lesson.video_url.includes('watch?v=') ? lesson.video_url.replace('watch?v=', 'embed/') : lesson.video_url}
                                    title="Bài giảng tu viện Viên Không Ni"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            ) : (
                                <div className="text-center text-stone-400 text-xs p-8">
                                    Video giảng trực tuyến đang được đồng bộ hoá với giáo thọ sư tu viện.
                                </div>
                            )}
                        </div>

                        <div className="pt-4 border-t border-stone-200 flex items-center justify-between">
                            <button
                                onClick={() => setActiveStep(1)}
                                className="text-xs font-medium text-stone-600 hover:text-stone-900"
                            >
                                &larr; Quay lại phần tự đọc
                            </button>

                            <button
                                type="button"
                                onClick={handleCompleteVideo}
                                disabled={videoForm.processing}
                                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-medium text-xs shadow-md transition"
                            >
                                <span>Xác Nhận Đã Xem Xong &rarr; Qua Phần Ôn Luyện (10 Lần)</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 3: PRACTICE QUIZ (Must repeat 10 times) */}
                {activeStep === 3 && (
                    <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-10 shadow-sm space-y-6">
                        <div className="border-b border-stone-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <span className="text-xs font-semibold uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                                    Bước 3: Bài Ôn Luyện Các Nội Dung Chính
                                </span>
                                <h2 className="font-serif font-bold text-2xl text-stone-900 mt-2">
                                    Ôn Luyện Lặp Lại 10 Lần
                                </h2>
                                <p className="text-xs text-stone-500 mt-1">
                                    Yêu cầu quy định: Làm bài ôn luyện 10 lần cho một nội dung học để ghi nhớ thấu đáo pháp học.
                                </p>
                            </div>

                            {/* 10x Repetition Counter Tracker */}
                            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-300 rounded-2xl p-4 text-center sm:min-w-[200px]">
                                <span className="text-[11px] font-semibold text-amber-900 uppercase">
                                    Số lần ôn luyện đã hoàn thành
                                </span>
                                <div className="text-3xl font-serif font-bold text-amber-800 mt-1">
                                    {progress.practice_count} / 10
                                </div>
                                <div className="w-full bg-amber-200 rounded-full h-1.5 mt-2">
                                    <div
                                        className="bg-amber-600 h-1.5 rounded-full transition-all"
                                        style={{ width: `${Math.min(100, (progress.practice_count / 10) * 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>

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
                                                <span className="font-bold text-amber-900 mr-2">Câu {idx + 1}:</span>
                                                {q.question_text}
                                            </div>

                                            {result && (
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold shrink-0 ${
                                                    result.is_correct ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {result.is_correct ? 'ĐÚNG ✓' : 'CHƯA ĐÚNG ✗'}
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
                                                    {isSubmittingPracticeQuestion === q.id ? 'Đang kiểm tra...' : 'Xác Nhận Đáp Án'}
                                                </button>
                                            </div>
                                        )}

                                        {/* SPECIFICATION REQUIREMENT: Display result and explanation after choosing */}
                                        {result && (
                                            <div className="bg-white/80 p-4 rounded-xl border border-stone-200 space-y-1.5 text-xs">
                                                <div className="flex items-center gap-2 font-semibold text-stone-900">
                                                    <span>Đáp án chính xác: <strong className="text-emerald-700 font-bold">{result.correct_option}</strong></span>
                                                </div>
                                                <p className="text-stone-700 text-xs italic">
                                                    <span className="font-semibold text-amber-900 not-italic mr-1">Giải thích:</span>
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
                                Sau mỗi lượt hoàn thành, bấm nút bên dưới để ghi nhận tiến độ ôn luyện.
                            </span>

                            <button
                                type="button"
                                onClick={handleFinishPracticeSession}
                                disabled={practiceAttemptForm.processing}
                                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-medium text-xs shadow-md transition"
                            >
                                <span>Ghi Nhận Lượt Ôn Luyện Thứ {Math.min(10, progress.practice_count + 1)}/10</span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 4: FINAL EXAMINATION */}
                {activeStep === 4 && (
                    <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-10 shadow-sm space-y-6">
                        <div className="border-b border-stone-100 pb-4">
                            <span className="text-xs font-semibold uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                                Bước 4: Bài Kiểm Tra (Trắc Nghiệm Cuối Khóa)
                            </span>
                            <h2 className="font-serif font-bold text-2xl text-stone-900 mt-2">
                                Bài Kiểm Tra Đánh Giá Năng Lực
                            </h2>
                            <p className="text-xs text-stone-500 mt-1">
                                Đề thi tự động xáo câu hỏi. Kết thúc bài thi hiển thị số câu làm đúng, số câu sai, số câu cần ôn tập.
                            </p>
                        </div>

                        {/* Prior attempt results display */}
                        {latestExamAttempt && (
                            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-serif font-bold text-sm text-stone-900">
                                        Kết Quả Lần Thi Gần Nhất
                                    </h4>
                                    <span className="text-base font-bold text-amber-800">
                                        {latestExamAttempt.score}% Điểm
                                    </span>
                                </div>

                                <div className="grid grid-cols-3 gap-3 text-center text-xs">
                                    <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-emerald-900">
                                        <div className="text-xl font-bold">{latestExamAttempt.correct_count}</div>
                                        <div className="text-[11px] font-medium">Số câu đúng</div>
                                    </div>

                                    <div className="bg-red-50 border border-red-200 p-3 rounded-xl text-red-900">
                                        <div className="text-xl font-bold">{latestExamAttempt.incorrect_count}</div>
                                        <div className="text-[11px] font-medium">Số câu sai</div>
                                    </div>

                                    <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-amber-900">
                                        <div className="text-xl font-bold">{latestExamAttempt.review_needed_count}</div>
                                        <div className="text-[11px] font-medium">Số câu cần ôn tập</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Exam Questions */}
                        <div className="space-y-6">
                            {questions.map((q, idx) => {
                                const currentChosen = examSelections[q.id];
                                const result = examResults[q.id];

                                return (
                                    <div
                                        key={q.id}
                                        className="p-6 rounded-2xl border border-stone-200 bg-stone-50/50 space-y-4 text-xs"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="font-semibold text-stone-900 text-sm">
                                                <span className="font-bold text-amber-900 mr-2">Câu {idx + 1}:</span>
                                                {q.question_text}
                                            </div>

                                            {result && (
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                                    result.is_correct ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {result.is_correct ? 'ĐÚNG' : 'SAI'}
                                                </span>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {(['A', 'B', 'C', 'D'] as const).map((opt) => {
                                                const text = opt === 'A' ? q.option_a : opt === 'B' ? q.option_b : opt === 'C' ? q.option_c : q.option_d;
                                                const isSelected = currentChosen === opt;

                                                return (
                                                    <label
                                                        key={opt}
                                                        className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition ${
                                                            isSelected
                                                                ? 'bg-amber-100/70 border-amber-500 font-semibold text-amber-950'
                                                                : 'bg-white border-stone-200 hover:border-stone-300 text-stone-700'
                                                        }`}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name={`exam-${q.id}`}
                                                            value={opt}
                                                            checked={isSelected}
                                                            onChange={() => setExamSelections((prev) => ({ ...prev, [q.id]: opt }))}
                                                            className="text-amber-600 focus:ring-amber-500"
                                                        />
                                                        <span><strong className="mr-1">{opt}.</strong> {text}</span>
                                                    </label>
                                                );
                                            })}
                                        </div>

                                        {!result && currentChosen && (
                                            <div className="flex justify-end">
                                                <button
                                                    type="button"
                                                    disabled={isSubmittingExamQuestion === q.id}
                                                    onClick={() => handleConfirmExamQuestion(q.id)}
                                                    className="px-3 py-1 rounded bg-stone-800 hover:bg-stone-900 text-white text-xs font-medium"
                                                >
                                                    {isSubmittingExamQuestion === q.id ? 'Kiểm tra...' : 'Xác nhận câu này'}
                                                </button>
                                            </div>
                                        )}

                                        {result && (
                                            <div className="bg-white p-3 rounded-xl border border-stone-200 space-y-1">
                                                <div className="font-semibold text-stone-900">
                                                    Đáp án: <span className="text-emerald-700 font-bold">{result.correct_option}</span>
                                                </div>
                                                <p className="text-stone-600 italic">
                                                    {result.explanation}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Submit Full Exam */}
                        <div className="pt-6 border-t border-stone-200 flex justify-end">
                            <button
                                type="button"
                                onClick={handleSubmitFullExam}
                                disabled={isSubmittingFullExam || Object.keys(examSelections).length < questions.length}
                                className="px-6 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-medium text-xs shadow-md transition disabled:opacity-50"
                            >
                                Nộp Bài Kiểm Tra & Xem Tổng Kết
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 5: MASTER INCORRECT QUESTIONS */}
                {activeStep === 5 && (
                    <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-10 shadow-sm space-y-6">
                        <div className="border-b border-stone-100 pb-4">
                            <span className="text-xs font-semibold uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                                Bước 5: Ôn Tập Lại Các Câu Làm Sai
                            </span>
                            <h2 className="font-serif font-bold text-2xl text-stone-900 mt-2">
                                Khắc Phục Câu Sai Cho Đến Khi Thành Thục
                            </h2>
                            <p className="text-xs text-stone-500 mt-1">
                                Các câu làm sai được ghi nhận tại đây. Học viên vào làm lại các câu sai cho đến khi không còn câu sai mới hoàn tất chương trình môn học.
                            </p>
                        </div>

                        {/* Completion Celebration if 0 wrong remaining */}
                        {isClearedAll || unresolvedList.length === 0 ? (
                            <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-2 border-emerald-400/80 rounded-3xl p-8 text-center space-y-4 shadow-sm">
                                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>

                                <div className="max-w-md mx-auto">
                                    <h3 className="font-serif font-bold text-xl text-emerald-950">
                                        Hoàn Tất Chương Trình Môn Học!
                                    </h3>
                                    <p className="text-xs text-emerald-800 mt-1">
                                        Chúc mừng học viên! Bạn không còn câu hỏi làm sai nào. Chương trình học môn <strong className="font-serif">{lesson.title}</strong> đã chính thức được công nhận hoàn tất.
                                    </p>
                                </div>

                                <Link
                                    href={route('student.dashboard')}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs shadow transition"
                                >
                                    Trở Về Bảng Học Tập & Nhận Điểm
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 text-xs text-amber-900 flex items-center justify-between">
                                    <span>
                                        Hiện còn <strong className="text-amber-950 text-sm">{unresolvedList.length}</strong> câu làm sai cần hoàn tất.
                                    </span>
                                </div>

                                {unresolvedList.map((iq, idx) => {
                                    const currentChosen = retrySelections[iq.question_id];
                                    const retryResult = retryResults[iq.question_id];

                                    return (
                                        <div
                                            key={iq.id}
                                            className="p-6 rounded-2xl border border-red-200 bg-red-50/20 space-y-4 text-xs"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="font-semibold text-stone-900 text-sm">
                                                    <span className="font-bold text-red-700 mr-2">Câu sai #{idx + 1}:</span>
                                                    {iq.question_text}
                                                </div>

                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-800 uppercase">
                                                    Cần sửa lại
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                {(['A', 'B', 'C', 'D'] as const).map((opt) => {
                                                    const text = opt === 'A' ? iq.option_a : opt === 'B' ? iq.option_b : opt === 'C' ? iq.option_c : iq.option_d;
                                                    const isSelected = currentChosen === opt;

                                                    return (
                                                        <label
                                                            key={opt}
                                                            className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition ${
                                                                isSelected
                                                                    ? 'bg-amber-100 border-amber-500 font-semibold text-amber-950'
                                                                    : 'bg-white border-stone-200 hover:border-stone-300 text-stone-700'
                                                            }`}
                                                        >
                                                            <input
                                                                type="radio"
                                                                name={`retry-${iq.question_id}`}
                                                                value={opt}
                                                                checked={isSelected}
                                                                onChange={() => setRetrySelections((prev) => ({ ...prev, [iq.question_id]: opt }))}
                                                                className="text-amber-600 focus:ring-amber-500"
                                                            />
                                                            <span><strong className="mr-1">{opt}.</strong> {text}</span>
                                                        </label>
                                                    );
                                                })}
                                            </div>

                                            <div className="flex items-center justify-between pt-1">
                                                <span className="text-[11px] text-stone-500 italic">
                                                    Lần chọn trước: {iq.last_chosen_option || 'N/A'}
                                                </span>

                                                <button
                                                    type="button"
                                                    disabled={!currentChosen}
                                                    onClick={() => handleRetryIncorrectQuestion(iq.question_id)}
                                                    className="px-4 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-medium text-xs disabled:opacity-50"
                                                >
                                                    Kiểm Tra & Khắc Phục
                                                </button>
                                            </div>

                                            {retryResult && (
                                                <div className={`p-3 rounded-xl border ${
                                                    retryResult.is_correct ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-red-50 border-red-300 text-red-900'
                                                }`}>
                                                    <div className="font-semibold">{retryResult.message}</div>
                                                    <p className="mt-1 italic">{retryResult.explanation}</p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Student Feedback Modal (Specification Requirement) */}
            {isFeedbackModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-4 text-xs">
                        <div className="flex items-center justify-between border-b pb-3">
                            <h3 className="font-serif font-bold text-base text-stone-900">
                                Góp Ý & Báo Lỗi Chỉnh Sửa Tài Liệu
                            </h3>
                            <button onClick={() => setIsFeedbackModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmitFeedback} className="space-y-4">
                            <p className="text-stone-600">
                                Nếu phát hiện sai sót về chữ, thuật ngữ Phật học, hoặc video bài giảng cần chỉnh sửa, vui lòng gửi phản hồi trực tiếp đến Giáo viên tu viện:
                            </p>

                            <textarea
                                rows={5}
                                placeholder="Nhập chi tiết nội dung cần chỉnh sửa..."
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
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={feedbackForm.processing}
                                    className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-medium shadow"
                                >
                                    Gửi Góp Ý
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
