import { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import { PageProps } from '@/types';
import { useTranslation } from '@/utils/useTranslation';

interface ExamQuestion {
    id: number;
    question_type?: 'quiz' | 'essay';
    question_text: string;
    option_a?: string | null;
    option_b?: string | null;
    option_c?: string | null;
    option_d?: string | null;
    is_answered: boolean;
    chosen_option?: string | null;
    essay_answer?: string | null;
    is_correct?: boolean;
    correct_option?: string;
    explanation?: string;
}

interface ClassExamProps extends PageProps {
    classItem: {
        id: number;
        name: string;
        course: {
            id: number;
            title: string;
            category: string;
            exam_duration_minutes?: number | null;
        };
    };
    questions: ExamQuestion[];
    totalQuestions: number;
    answeredCount: number;
    isCompleted: boolean;
    examDurationMinutes?: number | null;
    remainingSeconds?: number | null;
    isTimeExpired?: boolean;
    examAttempt?: {
        id: number;
        score: number;
        correct_count: number;
        incorrect_count: number;
        total_questions: number;
        created_at?: string;
    } | null;
    finalGrade?: number | null;
}

export default function ClassExam({
    auth,
    classItem,
    questions: initialQuestions,
    totalQuestions,
    answeredCount: initialAnsweredCount,
    isCompleted: initialIsCompleted,
    examDurationMinutes,
    remainingSeconds,
    isTimeExpired: initialIsTimeExpired,
    examAttempt,
    finalGrade,
    flash,
}: ClassExamProps) {
    const t = useTranslation();

    const [questions, setQuestions] = useState<ExamQuestion[]>(initialQuestions);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
    const [essayDrafts, setEssayDrafts] = useState<Record<number, string>>({});
    const [submittingQuestionId, setSubmittingQuestionId] = useState<number | null>(null);
    const [answeredCount, setAnsweredCount] = useState<number>(initialAnsweredCount);
    const [isCompleted, setIsCompleted] = useState<boolean>(initialIsCompleted);
    const [timeLeft, setTimeLeft] = useState<number | null>(remainingSeconds ?? null);
    const [isExpired, setIsExpired] = useState<boolean>(initialIsTimeExpired ?? false);
    const [currentScore, setCurrentScore] = useState<number>(examAttempt?.score ?? finalGrade ?? 0);
    const [correctCount, setCorrectCount] = useState<number>(examAttempt?.correct_count ?? 0);
    const [incorrectCount, setIncorrectCount] = useState<number>(examAttempt?.incorrect_count ?? 0);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Live countdown timer effect
    useEffect(() => {
        if (timeLeft === null || isCompleted || isExpired) return;

        if (timeLeft <= 0) {
            setIsExpired(true);
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev === null || prev <= 1) {
                    clearInterval(timer);
                    setIsExpired(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, isCompleted, isExpired]);

    const formatTime = (seconds: number): string => {
        if (seconds <= 0) return '00:00';
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        if (h > 0) {
            return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const quizQuestions = questions.filter((q) => (q.question_type ?? 'quiz') === 'quiz');
    const essayQuestions = questions.filter((q) => q.question_type === 'essay');

    const handleSelectOption = (questionId: number, option: string) => {
        setSelectedAnswers((prev) => ({
            ...prev,
            [questionId]: option,
        }));
    };

    const handleEssayChange = (questionId: number, text: string) => {
        setEssayDrafts((prev) => ({
            ...prev,
            [questionId]: text,
        }));
    };

    const handleSubmitQuizQuestion = async (questionId: number) => {
        const chosen = selectedAnswers[questionId];
        if (!chosen) return;

        setSubmittingQuestionId(questionId);
        setErrorMessage(null);

        try {
            const res = await axios.post(route('student.class.exam.question-submit', classItem.id), {
                question_id: questionId,
                chosen_option: chosen,
            });

            const data = res.data;

            // Update questions state with locked result
            setQuestions((prev) =>
                prev.map((q) => {
                    if (q.id === questionId) {
                        return {
                            ...q,
                            is_answered: true,
                            chosen_option: data.chosen_option,
                            is_correct: data.is_correct,
                            correct_option: data.correct_option,
                            explanation: data.explanation,
                        };
                    }
                    return q;
                })
            );

            setAnsweredCount(data.answered_count);
            setCorrectCount(data.correct_count);
            setIncorrectCount(data.incorrect_count);
            setCurrentScore(data.score);

            if (data.is_exam_completed) {
                setIsCompleted(true);
            }
        } catch (err: any) {
            console.error(err);
            if (err.response?.data?.error) {
                setErrorMessage(err.response.data.error);
            } else {
                setErrorMessage('An error occurred while submitting your answer. Please try again.');
            }
        } finally {
            setSubmittingQuestionId(null);
        }
    };

    const handleSubmitEssayQuestion = async (questionId: number) => {
        const essayText = essayDrafts[questionId]?.trim();
        if (!essayText) {
            setErrorMessage(t('student.essay_empty_warning'));
            return;
        }

        setSubmittingQuestionId(questionId);
        setErrorMessage(null);

        try {
            const res = await axios.post(route('student.class.exam.question-submit', classItem.id), {
                question_id: questionId,
                essay_answer: essayText,
            });

            const data = res.data;

            // Update questions state with locked result
            setQuestions((prev) =>
                prev.map((q) => {
                    if (q.id === questionId) {
                        return {
                            ...q,
                            is_answered: true,
                            essay_answer: data.essay_answer ?? essayText,
                            is_correct: data.is_correct,
                            explanation: data.explanation,
                        };
                    }
                    return q;
                })
            );

            setAnsweredCount(data.answered_count);
            setCorrectCount(data.correct_count);
            setIncorrectCount(data.incorrect_count);
            setCurrentScore(data.score);

            if (data.is_exam_completed) {
                setIsCompleted(true);
            }
        } catch (err: any) {
            console.error(err);
            if (err.response?.data?.error) {
                setErrorMessage(err.response.data.error);
            } else {
                setErrorMessage('An error occurred while submitting your essay answer. Please try again.');
            }
        } finally {
            setSubmittingQuestionId(null);
        }
    };

    const progressPercentage = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

    return (
        <div className="min-h-screen bg-stone-100 font-sans text-stone-900 flex flex-col">
            <Head title={`${t('student.class_exam_title')} - ${classItem.name}`} />

            {/* Header */}
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
                        {examDurationMinutes ? (
                            !isCompleted && (
                                <div
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-bold border transition shadow-sm ${
                                        isExpired
                                            ? 'bg-red-950/90 text-red-200 border-red-500/70'
                                            : timeLeft !== null && timeLeft < 300
                                            ? 'bg-amber-950/90 text-amber-200 border-amber-500/70 animate-pulse'
                                            : 'bg-stone-800 text-amber-300 border-stone-700'
                                    }`}
                                    title={t('student.exam_time_remaining')}
                                >
                                    <svg className={`w-3.5 h-3.5 ${timeLeft !== null && timeLeft < 300 ? 'text-amber-400' : 'text-amber-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>
                                        {isExpired
                                            ? `00:00 (${t('student.exam_time_expired')})`
                                            : timeLeft !== null
                                            ? formatTime(timeLeft)
                                            : '--:--'}
                                    </span>
                                </div>
                            )
                        ) : (
                            !isCompleted && (
                                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono text-stone-300 bg-stone-800 border border-stone-700">
                                    <svg className="w-3.5 h-3.5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>{t('student.exam_untimed_info')}</span>
                                </div>
                            )
                        )}
                        <span className="font-mono text-stone-300 hidden md:inline">
                            {t('student.student_label', { name: auth.user.name, username: auth.user.username ? `(${auth.user.username})` : '' })}
                        </span>
                        {isCompleted && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                {t('student.status_graduated')}
                            </span>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 py-8 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-6">
                {/* Flash Notice */}
                {flash?.success && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl text-xs flex items-center gap-2 shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        {flash.success}
                    </div>
                )}

                {errorMessage && (
                    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-2xl text-xs flex items-center gap-2 shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                        {errorMessage}
                    </div>
                )}

                {/* Hero Header */}
                <div className="relative overflow-hidden bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
                    <div className="relative z-10 space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                                {t('student.class_exam_badge')}
                            </span>
                            <span className="text-xs text-stone-300 font-medium">
                                {classItem.course.title} &bull; <span className="uppercase">{classItem.course.category}</span>
                                {examDurationMinutes ? (
                                    <> &bull; <span>{t('student.exam_duration_info', { duration: examDurationMinutes.toString() })}</span></>
                                ) : (
                                    <> &bull; <span>{t('student.exam_untimed_info')}</span></>
                                )}
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-amber-100 tracking-tight">
                            {classItem.name} - {t('student.class_exam_title')}
                        </h1>
                        <p className="text-xs sm:text-sm text-stone-300 leading-relaxed max-w-2xl">
                            {t('student.class_exam_desc')}
                        </p>
                    </div>
                </div>

                {/* Time Expired Notice */}
                {isExpired && !isCompleted && (
                    <div className="bg-red-50 border-2 border-red-300 rounded-3xl p-5 sm:p-6 flex items-start gap-4 text-xs text-red-900 shadow-sm">
                        <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="space-y-1">
                            <h4 className="font-bold text-sm text-red-950">{t('student.exam_time_expired')}</h4>
                            <p className="text-xs text-red-800 leading-relaxed">{t('student.exam_time_expired_desc')}</p>
                        </div>
                    </div>
                )}

                {/* Graduation Celebration Banner when Exam is Completed */}
                {isCompleted && (
                    <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-2 border-emerald-400/80 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-sm">
                        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>

                        <div className="max-w-md mx-auto space-y-1">
                            <h3 className="font-serif font-bold text-2xl text-emerald-950">
                                {t('student.class_exam_completed_title')}
                            </h3>
                            <p className="text-xs text-emerald-800">
                                {t('student.class_exam_completed_desc', { course: classItem.course.title })}
                            </p>
                        </div>

                        {/* Result Score Card */}
                        <div className="inline-flex flex-wrap items-center justify-center gap-4 bg-white px-6 py-4 rounded-2xl border border-emerald-200 shadow-sm text-xs">
                            <div className="text-center px-3 border-r border-stone-200">
                                <div className="text-2xl font-serif font-bold text-emerald-800">{currentScore}%</div>
                                <div className="text-[11px] font-medium text-stone-500 uppercase tracking-wider">{t('student.final_grade_badge', { score: '' })}</div>
                            </div>
                            <div className="text-center px-3 border-r border-stone-200">
                                <div className="text-xl font-bold text-emerald-700">{correctCount}</div>
                                <div className="text-[11px] font-medium text-stone-500">{t('student.class_exam_correct_stat', { count: '' })}</div>
                            </div>
                            <div className="text-center px-3 border-r border-stone-200">
                                <div className="text-xl font-bold text-red-600">{incorrectCount}</div>
                                <div className="text-[11px] font-medium text-stone-500">{t('student.class_exam_incorrect_stat', { count: '' })}</div>
                            </div>
                            <div className="text-center px-3">
                                <div className="text-xl font-bold text-stone-800">{totalQuestions}</div>
                                <div className="text-[11px] font-medium text-stone-500">{t('student.class_exam_total_stat', { count: '' })}</div>
                            </div>
                        </div>

                        <div className="pt-2">
                            <Link
                                href={route('student.dashboard')}
                                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs shadow transition"
                            >
                                {t('student.back_to_dashboard')}
                            </Link>
                        </div>
                    </div>
                )}

                {/* Progress & Live Countdown Card */}
                <div className="bg-white rounded-3xl border border-stone-200 p-5 sm:p-6 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
                        {/* Left: Progress Bar */}
                        <div className="space-y-2.5 md:border-r md:border-stone-200 md:pr-6">
                            <div className="flex items-center justify-between text-xs">
                                <span className="font-semibold text-stone-700">
                                    {t('student.class_exam_status_progress', {
                                        answered: answeredCount.toString(),
                                        total: totalQuestions.toString(),
                                    })}
                                </span>
                                <span className="font-bold text-amber-800 text-sm">{progressPercentage}%</span>
                            </div>
                            <div className="w-full bg-stone-100 rounded-full h-3 overflow-hidden border border-stone-200">
                                <div
                                    className="bg-gradient-to-r from-amber-600 to-amber-500 h-3 rounded-full transition-all duration-300"
                                    style={{ width: `${progressPercentage}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Right: Live Countdown Timer */}
                        <div className="flex items-center justify-start md:justify-end">
                            {examDurationMinutes ? (
                                <div className={`flex items-center gap-3.5 px-5 py-3 rounded-2xl border w-full md:w-auto transition ${
                                    isExpired
                                        ? 'bg-red-50 border-red-200 text-red-900'
                                        : timeLeft !== null && timeLeft < 300
                                        ? 'bg-amber-50 border-amber-300 text-amber-900 animate-pulse'
                                        : 'bg-stone-50 border-stone-200 text-stone-800'
                                }`}>
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                        isExpired
                                            ? 'bg-red-100 text-red-600'
                                            : timeLeft !== null && timeLeft < 300
                                            ? 'bg-amber-100 text-amber-600'
                                            : 'bg-amber-100/70 text-amber-800'
                                    }`}>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                                            {t('student.exam_time_remaining')}
                                        </div>
                                        <div className={`text-2xl sm:text-3xl font-mono font-bold tracking-tight ${
                                            isExpired
                                                ? 'text-red-700'
                                                : timeLeft !== null && timeLeft < 300
                                                ? 'text-amber-700'
                                                : 'text-stone-900'
                                        }`}>
                                            {isExpired
                                                ? '00:00'
                                                : timeLeft !== null
                                                ? formatTime(timeLeft)
                                                : '--:--'}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3.5 px-5 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-stone-700 w-full md:w-auto">
                                    <div className="w-10 h-10 rounded-xl bg-stone-200 text-stone-600 flex items-center justify-center shrink-0">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                                            {t('student.exam_time_remaining')}
                                        </div>
                                        <div className="text-sm font-semibold text-stone-800">
                                            {t('student.exam_untimed_info')}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* PART 1: MULTIPLE CHOICE QUIZZES */}
                {quizQuestions.length > 0 && (
                    <div className="space-y-4 pt-2">
                        <div className="flex items-center gap-2 border-b border-stone-200 pb-3">
                            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                                1
                            </div>
                            <div>
                                <h2 className="text-lg font-serif font-bold text-stone-900">
                                    {t('student.exam_part_quiz', { count: quizQuestions.length.toString() })}
                                </h2>
                                <p className="text-xs text-stone-500">
                                    {t('student.exam_part_quiz_desc')}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {quizQuestions.map((q, idx) => {
                                const isAnswered = q.is_answered;
                                const currentChosen = isAnswered ? q.chosen_option : selectedAnswers[q.id];
                                const isSubmitting = submittingQuestionId === q.id;

                                return (
                                    <div
                                        key={q.id}
                                        className={`bg-white rounded-3xl border p-6 sm:p-8 shadow-sm transition space-y-5 ${
                                            isAnswered
                                                ? q.is_correct
                                                    ? 'border-emerald-300 bg-emerald-50/20'
                                                    : 'border-red-300 bg-red-50/20'
                                                : 'border-stone-200'
                                        }`}
                                    >
                                        {/* Question Header */}
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="font-serif font-bold text-stone-900 text-base leading-snug">
                                                <span className="text-amber-800 mr-2">
                                                    {t('student.question_prefix', { number: (idx + 1).toString() })}
                                                </span>
                                                {q.question_text}
                                            </div>

                                            {isAnswered && (
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 uppercase tracking-wide ${
                                                        q.is_correct ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-red-100 text-red-800 border border-red-300'
                                                    }`}
                                                >
                                                    {q.is_correct ? t('student.correct_badge') : t('student.incorrect_badge')}
                                                </span>
                                            )}
                                        </div>

                                        {/* Options */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                            {(['A', 'B', 'C', 'D'] as const).map((opt) => {
                                                const text = opt === 'A' ? q.option_a : opt === 'B' ? q.option_b : opt === 'C' ? q.option_c : q.option_d;
                                                const isSelected = currentChosen === opt;
                                                const isCorrectChoice = isAnswered && q.correct_option === opt;
                                                const isWrongChoice = isAnswered && isSelected && !q.is_correct;

                                                let optionClasses = 'bg-stone-50 border-stone-200 text-stone-700 hover:border-stone-300';
                                                if (isAnswered) {
                                                    if (isCorrectChoice) {
                                                        optionClasses = 'bg-emerald-100 border-emerald-500 font-semibold text-emerald-950';
                                                    } else if (isWrongChoice) {
                                                        optionClasses = 'bg-red-100 border-red-500 font-semibold text-red-950 line-through';
                                                    } else {
                                                        optionClasses = 'bg-stone-50 border-stone-200 text-stone-400 opacity-60';
                                                    }
                                                } else if (isSelected) {
                                                    optionClasses = 'bg-amber-100/80 border-amber-500 font-semibold text-amber-950 shadow-sm ring-1 ring-amber-500';
                                                }

                                                return (
                                                    <label
                                                        key={opt}
                                                        className={`p-3.5 rounded-2xl border flex items-center gap-3 transition ${
                                                            isAnswered ? 'cursor-default' : 'cursor-pointer'
                                                        } ${optionClasses}`}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name={`question-${q.id}`}
                                                            value={opt}
                                                            checked={isSelected}
                                                            disabled={isAnswered}
                                                            onChange={() => handleSelectOption(q.id, opt)}
                                                            className="text-amber-600 focus:ring-amber-500"
                                                        />
                                                        <span className="leading-normal">
                                                            <strong className="mr-1 font-bold">{opt}.</strong> {text}
                                                        </span>
                                                    </label>
                                                );
                                            })}
                                        </div>

                                        {/* Action / Confirmation */}
                                        {!isAnswered ? (
                                            <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                                                <span className="text-[11px] text-stone-500 italic">
                                                    {t('student.class_exam_desc')}
                                                </span>

                                                <button
                                                    type="button"
                                                    disabled={!currentChosen || isSubmitting || isExpired}
                                                    onClick={() => handleSubmitQuizQuestion(q.id)}
                                                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-medium text-xs disabled:opacity-40 transition shadow-sm"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                    </svg>
                                                    <span>
                                                        {isSubmitting ? t('student.checking') : t('student.class_exam_confirm_btn')}
                                                    </span>
                                                </button>
                                            </div>
                                        ) : (
                                            /* Locked Result & Explanation */
                                            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-2 text-xs">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2 font-semibold text-stone-900">
                                                        <span>{t('student.correct_answer_label')}</span>
                                                        <span className="text-emerald-700 font-bold px-2 py-0.5 rounded bg-emerald-100">{q.correct_option}</span>
                                                    </div>
                                                    <span className="text-[11px] font-medium text-stone-500 flex items-center gap-1">
                                                        <svg className="w-3.5 h-3.5 text-stone-400" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                                        </svg>
                                                        {t('student.class_exam_answered_badge')}
                                                    </span>
                                                </div>
                                                {q.explanation && (
                                                    <p className="text-stone-700 italic pt-1 border-t border-stone-200/60 leading-relaxed">
                                                        <span className="font-semibold text-amber-900 not-italic mr-1">{t('student.explanation_label')}</span>
                                                        {q.explanation}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* PART 2: ESSAY QUESTIONS */}
                {essayQuestions.length > 0 && (
                    <div className="space-y-4 pt-6">
                        <div className="flex items-center gap-2 border-b border-stone-200 pb-3">
                            <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">
                                2
                            </div>
                            <div>
                                <h2 className="text-lg font-serif font-bold text-stone-900">
                                    {t('student.exam_part_essay', { count: essayQuestions.length.toString() })}
                                </h2>
                                <p className="text-xs text-stone-500">
                                    {t('student.exam_part_essay_desc')}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {essayQuestions.map((q, idx) => {
                                const isAnswered = q.is_answered;
                                const essayDraft = essayDrafts[q.id] ?? '';
                                const isSubmitting = submittingQuestionId === q.id;

                                return (
                                    <div
                                        key={q.id}
                                        className={`bg-white rounded-3xl border p-6 sm:p-8 shadow-sm transition space-y-5 ${
                                            isAnswered ? 'border-teal-300 bg-teal-50/20' : 'border-stone-200'
                                        }`}
                                    >
                                        {/* Question Header */}
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="font-serif font-bold text-stone-900 text-base leading-snug">
                                                <span className="text-teal-800 mr-2">
                                                    {t('student.question_prefix', { number: (idx + 1).toString() })}
                                                </span>
                                                {q.question_text}
                                            </div>

                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 uppercase tracking-wide ${
                                                    isAnswered ? 'bg-teal-100 text-teal-800 border border-teal-300' : 'bg-stone-100 text-stone-600 border border-stone-300'
                                                }`}
                                            >
                                                {isAnswered ? t('student.essay_submitted_badge') : t('questions.badge_essay')}
                                            </span>
                                        </div>

                                        {/* Essay Input Area / Submitted Answer View */}
                                        {!isAnswered ? (
                                            <div className="space-y-3">
                                                <textarea
                                                    rows={6}
                                                    value={essayDraft}
                                                    onChange={(e) => handleEssayChange(q.id, e.target.value)}
                                                    placeholder={t('student.essay_answer_placeholder')}
                                                    className="w-full rounded-2xl border-stone-300 bg-stone-50/50 p-4 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:border-teal-600 focus:bg-white focus:ring-teal-600 shadow-inner resize-y transition leading-relaxed"
                                                />

                                                <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                                                    <span className="text-[11px] text-stone-400">
                                                        {essayDraft.length > 0 ? `${essayDraft.length} ký tự` : ''}
                                                    </span>

                                                    <button
                                                        type="button"
                                                        disabled={!essayDraft.trim() || isSubmitting || isExpired}
                                                        onClick={() => handleSubmitEssayQuestion(q.id)}
                                                        className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-medium text-xs disabled:opacity-40 transition shadow-sm"
                                                    >
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                        </svg>
                                                        <span>
                                                            {isSubmitting ? t('student.checking') : t('student.essay_submit_btn')}
                                                        </span>
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {/* Student Submitted Answer */}
                                                <div className="bg-stone-50 p-4 sm:p-5 rounded-2xl border border-stone-200 space-y-2 text-xs">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-semibold text-stone-800">
                                                            {t('student.your_essay_answer')}
                                                        </span>
                                                        <span className="text-[11px] font-medium text-stone-500 flex items-center gap-1">
                                                            <svg className="w-3.5 h-3.5 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                                            </svg>
                                                            {t('student.class_exam_answered_badge')}
                                                        </span>
                                                    </div>
                                                    <div className="text-stone-700 whitespace-pre-wrap leading-relaxed pt-1 border-t border-stone-200/60 font-serif text-sm">
                                                        {q.essay_answer}
                                                    </div>
                                                </div>

                                                {/* Sample Guide / Grading Criteria if present */}
                                                {q.explanation && (
                                                    <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 space-y-1.5 text-xs text-amber-950">
                                                        <span className="font-semibold text-amber-900 block">
                                                            {t('student.essay_sample_guide')}
                                                        </span>
                                                        <p className="italic text-stone-700 leading-relaxed">
                                                            {q.explanation}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
