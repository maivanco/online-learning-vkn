import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import axios from 'axios';
import { PageProps } from '@/types';
import { useTranslation } from '@/utils/useTranslation';

interface LessonProgress {
    lesson_id: number;
    title: string;
    reading_completed: boolean;
    video_completed: boolean;
    practice_count: number;
    practice_completed: boolean;
    exam_completed: boolean;
    exam_score: number | null;
    is_completed: boolean;
}

interface ExamAttempt {
    id: number;
    score: number;
    total_questions: number;
    correct_count: number;
    incorrect_count: number;
    is_completed: boolean;
    created_at?: string;
    updated_at?: string;
}

interface StudentItem {
    id: number;
    name: string;
    username: string;
    email: string;
    phone: string | null;
    enrollment_status: string;
    final_grade: number | null;
    completed_at: string | null;
    progress_percentage: number;
    completed_lessons_count: number;
    incomplete_lessons_count: number;
    lessons_progress: LessonProgress[];
    exam_attempt?: ExamAttempt | null;
}

interface ExamQuestionResult {
    id: number;
    lesson_id: number | null;
    lesson_title: string | null;
    question_type: 'quiz' | 'essay';
    question_text: string;
    option_a?: string | null;
    option_b?: string | null;
    option_c?: string | null;
    option_d?: string | null;
    correct_option?: string | null;
    explanation?: string | null;
    is_answered: boolean;
    chosen_option?: string | null;
    essay_answer?: string | null;
    is_correct?: boolean | null;
    score?: number | null;
    teacher_score?: number | null;
    teacher_feedback?: string | null;
    graded_at?: string | null;
    graded_by?: number | null;
    graded_by_name?: string | null;
}

interface ExamResultData {
    student: {
        id: number;
        name: string;
        username: string;
        email: string;
        enrollment_status: string;
        final_grade: number | null;
    };
    exam_attempt: ExamAttempt | null;
    questions: ExamQuestionResult[];
    metrics: {
        total_questions: number;
        answered_count: number;
        quiz_count: number;
        essay_count: number;
        quizzes_correct: number;
        essays_graded: number;
        essays_pending: number;
        is_completed: boolean;
    };
}

interface ClassShowProps extends PageProps {
    classItem: {
        id: number;
        name: string;
        description: string | null;
        is_locked: boolean;
        user?: {
            id: number;
            name: string;
            username: string;
        } | null;
        course: {
            id: number;
            title: string;
            category: string;
        };
        lessons: Array<{
            id: number;
            title: string;
            order: number;
            questions_count: number;
        }>;
    };
    students: StudentItem[];
    availableStudents: Array<{
        id: number;
        name: string;
        username: string;
        email: string;
    }>;
}

export default function ClassShow({ auth, classItem, students: initialStudents, availableStudents, flash }: ClassShowProps) {
    const t = useTranslation();
    const [studentsList, setStudentsList] = useState<StudentItem[]>(initialStudents);
    const [selectedStudentForModal, setSelectedStudentForModal] = useState<StudentItem | null>(null);
    const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Exam Result & Essay Grading States
    const [selectedStudentForExam, setSelectedStudentForExam] = useState<StudentItem | null>(null);
    const [examResultData, setExamResultData] = useState<ExamResultData | null>(null);
    const [isLoadingExamResult, setIsLoadingExamResult] = useState<boolean>(false);
    const [examFilter, setExamFilter] = useState<'all' | 'quiz' | 'essay' | 'incorrect'>('all');
    const [essayGradingInputs, setEssayGradingInputs] = useState<Record<number, { score: string; feedback: string }>>({});
    const [savingEssayId, setSavingEssayId] = useState<number | null>(null);
    const [gradeSuccessMessage, setGradeSuccessMessage] = useState<string | null>(null);
    const [gradeErrorMessage, setGradeErrorMessage] = useState<string | null>(null);

    const addStudentForm = useForm({
        user_id: availableStudents[0]?.id || '',
    });

    const handleAddStudent = (e: React.FormEvent) => {
        e.preventDefault();
        addStudentForm.post(route('admin.classes.add-student', classItem.id), {
            onSuccess: () => setIsAddStudentModalOpen(false),
        });
    };

    const handleDeleteClass = () => {
        setIsDeleting(true);
        router.delete(route('admin.classes.destroy', classItem.id), {
            onFinish: () => {
                setIsDeleting(false);
                setIsDeleteModalOpen(false);
            },
        });
    };

    const openExamModal = async (student: StudentItem) => {
        setSelectedStudentForExam(student);
        setIsLoadingExamResult(true);
        setGradeSuccessMessage(null);
        setGradeErrorMessage(null);
        setExamFilter('all');

        try {
            const res = await axios.get(route('admin.classes.student-exam-result', [classItem.id, student.id]));
            const data: ExamResultData = res.data;
            setExamResultData(data);

            // Initialize grading inputs for essay questions
            const initialInputs: Record<number, { score: string; feedback: string }> = {};
            data.questions.forEach((q) => {
                if (q.question_type === 'essay') {
                    initialInputs[q.id] = {
                        score: q.score !== null && q.score !== undefined ? String(q.score) : '',
                        feedback: q.teacher_feedback || '',
                    };
                }
            });
            setEssayGradingInputs(initialInputs);
        } catch (err: any) {
            console.error('Failed to load exam results:', err);
            setGradeErrorMessage(err.response?.data?.message || 'Could not load exam details. Please try again.');
        } finally {
            setIsLoadingExamResult(false);
        }
    };

    const handleQuickScore = (questionId: number, scoreValue: number) => {
        setEssayGradingInputs((prev) => ({
            ...prev,
            [questionId]: {
                ...prev[questionId],
                score: String(scoreValue),
                feedback: prev[questionId]?.feedback || '',
            },
        }));
    };

    const handleSaveEssayScore = async (questionId: number) => {
        if (!selectedStudentForExam) return;
        const currentInput = essayGradingInputs[questionId];
        const scoreNum = parseFloat(currentInput?.score || '0');

        if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 100) {
            setGradeErrorMessage('Please enter a valid score between 0 and 100.');
            return;
        }

        setSavingEssayId(questionId);
        setGradeSuccessMessage(null);
        setGradeErrorMessage(null);

        try {
            const res = await axios.post(
                route('admin.classes.grade-essay', [classItem.id, selectedStudentForExam.id]),
                {
                    question_id: questionId,
                    score: scoreNum,
                    feedback: currentInput?.feedback || null,
                }
            );

            const data = res.data;

            // Update examResultData state
            setExamResultData((prev) => {
                if (!prev) return null;
                const updatedQuestions = prev.questions.map((q) => {
                    if (q.id === questionId) {
                        return {
                            ...q,
                            score: data.score,
                            teacher_score: data.teacher_score,
                            teacher_feedback: data.teacher_feedback,
                            is_correct: data.is_correct,
                            graded_at: data.graded_at,
                            graded_by_name: data.graded_by_name,
                        };
                    }
                    return q;
                });

                const essaysGraded = updatedQuestions.filter(
                    (q) => q.question_type === 'essay' && q.score !== null && q.score !== undefined
                ).length;

                return {
                    ...prev,
                    exam_attempt: {
                        ...(prev.exam_attempt || {
                            id: data.exam_attempt.id,
                            total_questions: data.exam_attempt.total_questions,
                            is_completed: true,
                        }),
                        score: data.overall_score,
                        correct_count: data.exam_attempt.correct_count,
                        incorrect_count: data.exam_attempt.incorrect_count,
                        total_questions: data.exam_attempt.total_questions,
                    },
                    questions: updatedQuestions,
                    metrics: {
                        ...prev.metrics,
                        essays_graded: essaysGraded,
                        essays_pending: prev.metrics.essay_count - essaysGraded,
                    },
                };
            });

            // Update student list and selected modals state
            setStudentsList((prev) =>
                prev.map((s) => {
                    if (s.id === selectedStudentForExam.id) {
                        return {
                            ...s,
                            final_grade: data.overall_score,
                            exam_attempt: s.exam_attempt
                                ? { ...s.exam_attempt, score: data.overall_score }
                                : {
                                      id: data.exam_attempt.id,
                                      score: data.overall_score,
                                      total_questions: data.exam_attempt.total_questions,
                                      correct_count: data.exam_attempt.correct_count,
                                      incorrect_count: data.exam_attempt.incorrect_count,
                                      is_completed: true,
                                  },
                        };
                    }
                    return s;
                })
            );

            if (selectedStudentForModal && selectedStudentForModal.id === selectedStudentForExam.id) {
                setSelectedStudentForModal((prev) => (prev ? { ...prev, final_grade: data.overall_score } : null));
            }

            setGradeSuccessMessage(t('classes.grade_saved_success'));
        } catch (err: any) {
            console.error('Failed to save essay grade:', err);
            setGradeErrorMessage(err.response?.data?.message || 'Error saving essay grade.');
        } finally {
            setSavingEssayId(null);
        }
    };

    const filteredExamQuestions = (examResultData?.questions || []).filter((q) => {
        if (examFilter === 'quiz') return q.question_type === 'quiz';
        if (examFilter === 'essay') return q.question_type === 'essay';
        if (examFilter === 'incorrect') return q.is_answered && q.is_correct === false;
        return true;
    });

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                            <Link href={route('admin.dashboard')} className="hover:text-amber-700">{t('classes.nav_classes')}</Link>
                            <span>/</span>
                            <span>#{classItem.id}</span>
                        </div>
                        <h2 className="font-serif font-bold text-xl text-gray-900 leading-tight">
                            {classItem.name}
                        </h2>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <Link
                            href={route('admin.classes.toggle-lock', classItem.id)}
                            method="post"
                            as="button"
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition border ${
                                classItem.is_locked
                                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-transparent'
                                    : 'bg-stone-800 hover:bg-stone-900 text-white border-transparent'
                            }`}
                        >
                            {classItem.is_locked ? t('classes.unlock_class') : t('classes.lock_class')}
                        </Link>

                        <button
                            type="button"
                            onClick={() => setIsDeleteModalOpen(true)}
                            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition border bg-red-600 hover:bg-red-700 text-white border-transparent flex items-center gap-1.5"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span>{t('classes.remove_class')}</span>
                        </button>
                    </div>
                </div>
            }
        >
            <Head title={`${classItem.name} - Vien Khong Ni`} />

            <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                {/* Flash Messages */}
                {flash?.success && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg text-sm flex items-center gap-2 shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        {flash.success}
                    </div>
                )}

                {/* Class Meta Card */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div>
                            <span className="text-[11px] font-medium uppercase text-gray-400">{t('classes.subject_curriculum')}</span>
                            <h3 className="font-semibold text-gray-900 text-sm mt-0.5">{classItem.course.title}</h3>
                            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                                    {classItem.course.category}
                                </span>
                                {classItem.user && (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-700 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                                        <svg className="w-3 h-3 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        <span>{classItem.user.name}</span>
                                    </span>
                                )}
                            </div>
                        </div>

                        <div>
                            <span className="text-[11px] font-medium uppercase text-gray-400">Description</span>
                            <p className="text-xs text-gray-700 mt-0.5 line-clamp-2">{classItem.description || '—'}</p>
                            <span className="text-[11px] text-gray-400 mt-1 block">
                                {classItem.lessons.length} lessons
                            </span>
                        </div>

                        <div>
                            <span className="text-[11px] font-medium uppercase text-gray-400">{t('classes.enrollment_status')}</span>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="font-bold text-gray-900 text-base">{studentsList.length}</span>
                                <span className="text-xs text-gray-500">{t('classes.students_count', { count: '' }).trim()}</span>
                            </div>
                            <span className={`inline-block mt-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${
                                classItem.is_locked ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                                {classItem.is_locked ? 'LOCKED' : 'ACTIVE'}
                            </span>
                        </div>

                        <div className="flex flex-col justify-end gap-2">
                            <button
                                onClick={() => setIsAddStudentModalOpen(true)}
                                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-medium text-xs shadow transition"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                </svg>
                                {t('classes.add_student')}
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsDeleteModalOpen(true)}
                                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-600 hover:text-white text-red-700 font-medium text-xs transition"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                {t('classes.remove_class')}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Student Roster & Individual Learning Progress Table */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h3 className="font-serif font-bold text-base text-gray-900">
                                {t('classes.student_progress_title')}
                            </h3>
                            <p className="text-xs text-gray-500 mt-0.5">
                                {t('classes.student_progress_subtitle')}
                            </p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-xs">
                            <thead className="bg-stone-50 text-stone-700 font-semibold uppercase tracking-wider text-[11px]">
                                <tr>
                                    <th className="px-6 py-3.5 text-left">{t('classes.student_header')}</th>
                                    <th className="px-6 py-3.5 text-left">{t('classes.progress_header')}</th>
                                    <th className="px-6 py-3.5 text-center">{t('classes.completed_header')}</th>
                                    <th className="px-6 py-3.5 text-center">{t('classes.incomplete_header')}</th>
                                    <th className="px-6 py-3.5 text-center">{t('classes.result_header')}</th>
                                    <th className="px-6 py-3.5 text-right">{t('classes.actions_header')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {studentsList.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-12 text-gray-400 text-xs">
                                            {t('classes.no_students_enrolled')}
                                        </td>
                                    </tr>
                                ) : (
                                    studentsList.map((student) => (
                                        <tr key={student.id} className="hover:bg-amber-50/30 transition">
                                            {/* Student info */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-semibold text-gray-900 text-sm">{student.name}</div>
                                                <div className="text-[11px] text-gray-500 font-mono flex items-center gap-2 mt-0.5">
                                                    <span>Username: {student.username}</span>
                                                    <span>&bull;</span>
                                                    <span>{student.email}</span>
                                                </div>
                                            </td>

                                            {/* Progress bar */}
                                            <td className="px-6 py-4 whitespace-nowrap min-w-[200px]">
                                                <div className="flex items-center justify-between text-xs mb-1">
                                                    <span className="font-semibold text-stone-700">{student.progress_percentage}%</span>
                                                    <span className="text-[11px] text-gray-400">
                                                        {student.completed_lessons_count} / {classItem.lessons.length} {t('classes.subjects_unit')}
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                                    <div
                                                        className="bg-amber-600 h-2 rounded-full transition-all"
                                                        style={{ width: `${student.progress_percentage}%` }}
                                                    ></div>
                                                </div>
                                            </td>

                                            {/* Completed modules */}
                                            <td className="px-6 py-4 text-center whitespace-nowrap">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                                                    {student.completed_lessons_count} {t('classes.lessons_unit')}
                                                </span>
                                            </td>

                                            {/* Incomplete modules */}
                                            <td className="px-6 py-4 text-center whitespace-nowrap">
                                                {student.incomplete_lessons_count > 0 ? (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                                                        {student.incomplete_lessons_count} {t('classes.incomplete_lessons_unit')}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-gray-400">0</span>
                                                )}
                                            </td>

                                            {/* Final Result / Grade */}
                                            <td className="px-6 py-4 text-center whitespace-nowrap">
                                                <button
                                                    type="button"
                                                    onClick={() => openExamModal(student)}
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition hover:shadow-sm group bg-stone-50 hover:bg-amber-50 border-stone-200"
                                                    title={t('classes.view_exam_results')}
                                                >
                                                    {student.enrollment_status === 'completed' || (student.final_grade !== null && student.final_grade !== undefined) ? (
                                                        <span className="inline-flex items-center gap-1 font-bold text-emerald-700 group-hover:text-emerald-800">
                                                            <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                            </svg>
                                                            <span>{student.final_grade !== null ? `${student.final_grade}%` : t('classes.status_passed')}</span>
                                                        </span>
                                                    ) : student.exam_attempt ? (
                                                        <span className="inline-flex items-center gap-1 font-semibold text-amber-700 group-hover:text-amber-800">
                                                            <svg className="w-3.5 h-3.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            <span>{student.exam_attempt.score}%</span>
                                                        </span>
                                                    ) : (
                                                        <span className="text-stone-500 font-medium text-xs group-hover:text-stone-800">
                                                            {t('classes.status_in_progress')}
                                                        </span>
                                                    )}
                                                    <svg className="w-3 h-3 text-stone-400 group-hover:text-amber-700 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </button>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-2.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => openExamModal(student)}
                                                        className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition shadow-2xs"
                                                    >
                                                        <svg className="w-3.5 h-3.5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                        </svg>
                                                        <span>{t('classes.step_exam')}</span>
                                                    </button>

                                                    <button
                                                        onClick={() => setSelectedStudentForModal(student)}
                                                        className="text-stone-700 hover:text-stone-900 font-medium underline text-xs"
                                                    >
                                                        {t('classes.details_action')}
                                                    </button>

                                                    <Link
                                                        href={route('admin.classes.remove-student', [classItem.id, student.id])}
                                                        method="delete"
                                                        as="button"
                                                        className="text-red-500 hover:text-red-700 text-xs"
                                                    >
                                                        {t('classes.remove_action')}
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Danger Zone: Delete Class */}
                <div className="bg-red-50/60 rounded-2xl border border-red-200 p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h4 className="font-serif font-bold text-sm text-red-900 flex items-center gap-2">
                            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            {t('classes.danger_zone_remove')}
                        </h4>
                        <p className="text-xs text-stone-600 mt-1">
                            {t('classes.danger_zone_desc', { name: classItem.name, code: String(classItem.id) })}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setIsDeleteModalOpen(true)}
                        className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs shadow-sm transition flex items-center gap-2 shrink-0"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span>{t('classes.remove_this_class')}</span>
                    </button>
                </div>
            </div>

            {/* Student Granular Progress Modal */}
            {selectedStudentForModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b pb-3">
                            <div>
                                <h3 className="font-serif font-bold text-base text-gray-900">
                                    {t('classes.student_progress_detail')}: {selectedStudentForModal.name}
                                </h3>
                                <p className="text-xs text-gray-500 font-mono">
                                    Username: {selectedStudentForModal.username} &bull; {selectedStudentForModal.email}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedStudentForModal(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Exam Banner inside Detail Modal */}
                        <div className="bg-gradient-to-r from-amber-50 to-amber-100/40 p-4 rounded-xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                            <div>
                                <div className="font-semibold text-stone-900 text-xs flex items-center gap-2">
                                    <svg className="w-4 h-4 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <span>{t('classes.exam_result_title')}</span>
                                    {selectedStudentForModal.final_grade !== null && selectedStudentForModal.final_grade !== undefined && (
                                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                            {selectedStudentForModal.final_grade}%
                                        </span>
                                    )}
                                </div>
                                <p className="text-[11px] text-stone-600 mt-0.5">
                                    {t('classes.exam_result_subtitle')}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    const st = selectedStudentForModal;
                                    setSelectedStudentForModal(null);
                                    openExamModal(st);
                                }}
                                className="px-3.5 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-semibold text-xs shadow-sm transition flex items-center justify-center gap-1.5 shrink-0"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                <span>{t('classes.view_exam_results')}</span>
                            </button>
                        </div>

                        <div className="space-y-4 text-xs">
                            {selectedStudentForModal.lessons_progress.map((lp, idx) => (
                                <div key={lp.lesson_id} className="p-4 rounded-xl border border-gray-200 bg-stone-50/50 space-y-2.5">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-semibold text-gray-900 text-sm">
                                            {idx + 1}. {lp.title}
                                        </h4>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                            lp.is_completed ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-700'
                                        }`}>
                                            {lp.is_completed ? t('classes.badge_completed') : t('classes.badge_in_progress')}
                                        </span>
                                    </div>

                                    {/* 3 Pipeline Milestones */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] pt-1">
                                        <div className={`p-2 rounded border ${lp.reading_completed ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-gray-100 border-gray-200 text-gray-500'}`}>
                                            <div className="font-medium">1. {t('classes.step_reading')}</div>
                                            <div className="text-[10px]">{lp.reading_completed ? t('classes.step_done') : t('classes.step_pending')}</div>
                                        </div>

                                        <div className={`p-2 rounded border ${lp.video_completed ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-gray-100 border-gray-200 text-gray-500'}`}>
                                            <div className="font-medium">2. {t('classes.step_video')}</div>
                                            <div className="text-[10px]">{lp.video_completed ? t('classes.step_done') : t('classes.step_locked_pending')}</div>
                                        </div>

                                        <div className={`p-2 rounded border ${lp.practice_completed ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
                                            <div className="font-medium">3. {t('classes.step_practice')}</div>
                                            <div className="text-[10px] font-bold">{lp.practice_count} / 10 {t('classes.times_unit')}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end pt-3 border-t">
                            <button
                                onClick={() => setSelectedStudentForModal(null)}
                                className="px-4 py-2 rounded-lg bg-stone-800 text-white font-medium text-xs hover:bg-stone-900"
                            >
                                {t('classes.close')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Exam Results & Essay Grading Modal */}
            {selectedStudentForExam && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-6 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-stone-200">
                        {/* Modal Header */}
                        <div className="p-5 sm:p-6 border-b border-gray-200 bg-stone-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-xl bg-amber-600/30 border border-amber-500/40 flex items-center justify-center text-amber-300 font-serif font-bold text-lg shrink-0">
                                    {selectedStudentForExam.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-serif font-bold text-base text-stone-100">
                                            {selectedStudentForExam.name}
                                        </h3>
                                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-800 text-stone-300 border border-stone-700">
                                            @{selectedStudentForExam.username}
                                        </span>
                                    </div>
                                    <p className="text-xs text-stone-400 mt-0.5 flex items-center gap-1.5">
                                        <span>{classItem.name}</span>
                                        <span>&bull;</span>
                                        <span className="text-amber-400">{classItem.course.title}</span>
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {examResultData && (
                                    <div className="flex items-center gap-2 bg-stone-800 px-3.5 py-1.5 rounded-xl border border-stone-700">
                                        <span className="text-[11px] text-stone-400 uppercase font-medium">{t('classes.exam_score_label')}</span>
                                        <span className="font-bold text-base text-amber-400">
                                            {examResultData.exam_attempt?.score !== undefined ? `${examResultData.exam_attempt.score}%` : '—'}
                                        </span>
                                    </div>
                                )}

                                <button
                                    onClick={() => setSelectedStudentForExam(null)}
                                    className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 bg-stone-50/40">
                            {/* Alert Notifications */}
                            {gradeSuccessMessage && (
                                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between shadow-sm animate-fade-in">
                                    <div className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="font-medium">{gradeSuccessMessage}</span>
                                    </div>
                                    <button onClick={() => setGradeSuccessMessage(null)} className="text-emerald-600 hover:text-emerald-800 text-xs font-bold">✕</button>
                                </div>
                            )}

                            {gradeErrorMessage && (
                                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center justify-between shadow-sm">
                                    <div className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-red-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        <span className="font-medium">{gradeErrorMessage}</span>
                                    </div>
                                    <button onClick={() => setGradeErrorMessage(null)} className="text-red-600 hover:text-red-800 text-xs font-bold">✕</button>
                                </div>
                            )}

                            {isLoadingExamResult ? (
                                <div className="py-16 text-center space-y-3">
                                    <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                                    <p className="text-xs text-stone-500 font-medium">{t('classes.loading_exam_results')}</p>
                                </div>
                            ) : !examResultData ? (
                                <div className="py-16 text-center text-stone-400 text-xs">
                                    {t('classes.no_exam_attempt_yet')}
                                </div>
                            ) : (
                                <>
                                    {/* Metrics summary cards */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-sm">
                                            <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                                                {t('classes.total_questions_label')}
                                            </span>
                                            <div className="text-base font-bold text-stone-900 mt-1">
                                                {examResultData.metrics.answered_count} / {examResultData.metrics.total_questions}
                                            </div>
                                            <span className="text-[10px] text-stone-500">
                                                {examResultData.metrics.is_completed ? t('classes.all_submitted') : t('classes.incomplete_header')}
                                            </span>
                                        </div>

                                        <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-sm">
                                            <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                                                {t('classes.filter_quizzes')}
                                            </span>
                                            <div className="text-base font-bold text-emerald-700 mt-1">
                                                {examResultData.metrics.quizzes_correct} / {examResultData.metrics.quiz_count}
                                            </div>
                                            <span className="text-[10px] text-stone-500">
                                                {examResultData.metrics.quizzes_correct} {t('classes.correct_pct')}
                                            </span>
                                        </div>

                                        <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-sm">
                                            <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                                                {t('classes.filter_essays')}
                                            </span>
                                            <div className="text-base font-bold text-amber-700 mt-1">
                                                {examResultData.metrics.essays_graded} / {examResultData.metrics.essay_count}
                                            </div>
                                            <span className="text-[10px] text-amber-800 font-medium">
                                                {examResultData.metrics.essays_pending > 0
                                                    ? `${examResultData.metrics.essays_pending} ${t('classes.status_pending_grade')}`
                                                    : t('classes.status_graded')}
                                            </span>
                                        </div>

                                        <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-sm">
                                            <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                                                {t('classes.exam_score_label')}
                                            </span>
                                            <div className="text-base font-bold text-amber-900 mt-1">
                                                {examResultData.exam_attempt?.score !== undefined ? `${examResultData.exam_attempt.score}%` : '0%'}
                                            </div>
                                            <span className="text-[10px] text-stone-500">
                                                100%
                                            </span>
                                        </div>
                                    </div>

                                    {/* Question Type Filter Tabs */}
                                    <div className="flex flex-wrap items-center gap-2 border-b border-stone-200 pb-2">
                                        <button
                                            type="button"
                                            onClick={() => setExamFilter('all')}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                                                examFilter === 'all'
                                                    ? 'bg-amber-700 text-white shadow-sm'
                                                    : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                                            }`}
                                        >
                                            {t('classes.filter_all_questions')} ({examResultData.questions.length})
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setExamFilter('quiz')}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                                                examFilter === 'quiz'
                                                    ? 'bg-amber-700 text-white shadow-sm'
                                                    : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                                            }`}
                                        >
                                            {t('classes.filter_quizzes')} ({examResultData.metrics.quiz_count})
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setExamFilter('essay')}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                                                examFilter === 'essay'
                                                    ? 'bg-amber-700 text-white shadow-sm'
                                                    : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                                            }`}
                                        >
                                            <span>{t('classes.filter_essays')} ({examResultData.metrics.essay_count})</span>
                                            {examResultData.metrics.essays_pending > 0 && (
                                                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                                            )}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setExamFilter('incorrect')}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                                                examFilter === 'incorrect'
                                                    ? 'bg-red-700 text-white shadow-sm'
                                                    : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                                            }`}
                                        >
                                            {t('classes.filter_incorrect')} (
                                            {examResultData.questions.filter((q) => q.is_answered && q.is_correct === false).length})
                                        </button>
                                    </div>

                                    {/* Questions Results List */}
                                    <div className="space-y-4">
                                        {filteredExamQuestions.length === 0 ? (
                                            <div className="py-12 text-center text-stone-400 text-xs bg-white rounded-xl border border-stone-200">
                                                {t('classes.no_questions_filter')}
                                            </div>
                                        ) : (
                                            filteredExamQuestions.map((q, qIndex) => {
                                                const isEssay = q.question_type === 'essay';

                                                return (
                                                    <div
                                                        key={q.id}
                                                        className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 space-y-4 transition hover:border-amber-300"
                                                    >
                                                        {/* Question Header */}
                                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <span className="font-bold text-stone-900 text-xs">
                                                                    {t('classes.question_prefix')} #{qIndex + 1}
                                                                </span>
                                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${
                                                                    isEssay
                                                                        ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                                                        : 'bg-blue-100 text-blue-800 border border-blue-200'
                                                                }`}>
                                                                    {isEssay ? t('classes.essay_type_badge') : t('classes.quiz_type_badge')}
                                                                </span>
                                                                {q.lesson_title && (
                                                                    <span className="text-[11px] text-stone-500 font-medium">
                                                                        &bull; {t('classes.lesson_prefix')}: {q.lesson_title}
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {/* Result & Grading Badges */}
                                                            <div>
                                                                {!q.is_answered ? (
                                                                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-100 text-stone-500 border border-stone-200">
                                                                        {t('classes.not_answered_yet')}
                                                                    </span>
                                                                ) : !isEssay ? (
                                                                    q.is_correct ? (
                                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                                            <svg className="w-3.5 h-3.5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                            </svg>
                                                                            <span>{t('classes.correct_pct')}</span>
                                                                        </span>
                                                                    ) : (
                                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-800 border border-red-200">
                                                                            <svg className="w-3.5 h-3.5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                                            </svg>
                                                                            <span>{t('classes.incorrect_pct')}</span>
                                                                        </span>
                                                                    )
                                                                ) : (
                                                                    q.score !== null && q.score !== undefined ? (
                                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                                            <span>{t('classes.status_graded')}: {q.score}/100</span>
                                                                        </span>
                                                                    ) : (
                                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
                                                                            <span>{t('classes.status_pending_grade')}</span>
                                                                        </span>
                                                                    )
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Question Text */}
                                                        <div className="font-medium text-stone-900 text-xs leading-relaxed whitespace-pre-wrap">
                                                            {q.question_text}
                                                        </div>

                                                        {/* Quiz Question: Options Display */}
                                                        {!isEssay ? (
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                                                {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
                                                                    const optField = `option_${optKey.toLowerCase()}` as keyof ExamQuestionResult;
                                                                    const optText = q[optField] as string | undefined;
                                                                    if (!optText) return null;

                                                                    const isChosen = q.chosen_option === optKey;
                                                                    const isCorrectOption = q.correct_option === optKey;

                                                                    let cardStyle = 'bg-stone-50/70 border-stone-200 text-stone-700';
                                                                    let badgeText = null;

                                                                    if (isChosen && isCorrectOption) {
                                                                        cardStyle = 'bg-emerald-50 border-emerald-300 text-emerald-900 ring-1 ring-emerald-400 font-semibold';
                                                                        badgeText = t('classes.student_choice_correct');
                                                                    } else if (isChosen && !isCorrectOption) {
                                                                        cardStyle = 'bg-red-50 border-red-300 text-red-900 ring-1 ring-red-400 font-semibold';
                                                                        badgeText = t('classes.student_choice_incorrect');
                                                                    } else if (isCorrectOption) {
                                                                        cardStyle = 'bg-emerald-50/50 border-emerald-300 text-emerald-800 font-medium';
                                                                        badgeText = `(${t('classes.correct_answer_label')})`;
                                                                    }

                                                                    return (
                                                                        <div
                                                                            key={optKey}
                                                                            className={`p-3 rounded-xl border flex items-start justify-between gap-2 transition ${cardStyle}`}
                                                                        >
                                                                            <div className="flex items-start gap-2">
                                                                                <span className="w-5 h-5 rounded-full bg-stone-200 text-stone-800 text-[11px] font-bold flex items-center justify-center shrink-0">
                                                                                    {optKey}
                                                                                </span>
                                                                                <span className="leading-tight">{optText}</span>
                                                                            </div>
                                                                            {badgeText && (
                                                                                <span className="text-[10px] shrink-0 font-bold px-1.5 py-0.5 rounded bg-white/80">
                                                                                    {badgeText}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        ) : (
                                                            /* Essay Question Display */
                                                            <div className="space-y-4 text-xs">
                                                                {/* Student Submitted Answer Card */}
                                                                <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/90 space-y-2">
                                                                    <div className="flex items-center gap-2 font-semibold text-stone-800 text-xs">
                                                                        <svg className="w-4 h-4 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                                        </svg>
                                                                        <span>{t('classes.submitted_essay_label')}</span>
                                                                    </div>
                                                                    <div className="text-stone-900 bg-white p-3.5 rounded-lg border border-stone-200 leading-relaxed font-serif whitespace-pre-wrap text-sm shadow-inner min-h-[60px]">
                                                                        {q.essay_answer || (
                                                                            <span className="text-stone-400 italic font-sans text-xs">
                                                                                {t('classes.essay_not_submitted')}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {/* Sample Answer / Evaluation Guide */}
                                                                {q.explanation && (
                                                                    <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/60 text-xs space-y-1">
                                                                        <div className="font-semibold text-amber-900 flex items-center gap-1.5">
                                                                            <svg className="w-4 h-4 text-amber-700 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                                            </svg>
                                                                            <span>{t('classes.grading_guide_label')}</span>
                                                                        </div>
                                                                        <div className="text-stone-700 leading-relaxed pl-5 whitespace-pre-wrap">
                                                                            {q.explanation}
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* Teacher Scoring & Feedback Box */}
                                                                <div className="p-4 rounded-xl border border-amber-300/80 bg-gradient-to-r from-amber-50/80 via-white to-amber-50/40 space-y-3 shadow-sm">
                                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/60 pb-2">
                                                                        <h5 className="font-serif font-bold text-stone-900 text-xs flex items-center gap-1.5">
                                                                            <svg className="w-4 h-4 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                                            </svg>
                                                                            <span>{t('classes.grade_essay_title')}</span>
                                                                        </h5>

                                                                        {q.graded_by_name && (
                                                                            <span className="text-[10px] text-stone-500 font-medium">
                                                                                {t('classes.graded_by_label')} <strong className="text-stone-700">{q.graded_by_name}</strong> {q.graded_at ? `(${q.graded_at})` : ''}
                                                                            </span>
                                                                        )}
                                                                    </div>

                                                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
                                                                        {/* Score Input & Quick Buttons */}
                                                                        <div className="md:col-span-4 space-y-2">
                                                                            <label className="block text-[11px] font-semibold text-stone-700">
                                                                                {t('classes.teacher_score_label')}
                                                                            </label>
                                                                            <div className="flex items-center gap-2">
                                                                                <input
                                                                                    type="number"
                                                                                    min="0"
                                                                                    max="100"
                                                                                    step="0.5"
                                                                                    placeholder="0 - 100"
                                                                                    value={essayGradingInputs[q.id]?.score ?? ''}
                                                                                    onChange={(e) =>
                                                                                        setEssayGradingInputs((prev) => ({
                                                                                            ...prev,
                                                                                            [q.id]: {
                                                                                                ...prev[q.id],
                                                                                                score: e.target.value,
                                                                                                feedback: prev[q.id]?.feedback || '',
                                                                                            },
                                                                                        }))
                                                                                    }
                                                                                    className="w-24 rounded-lg border-stone-300 text-xs font-bold text-stone-900 focus:ring-amber-500 focus:border-amber-500"
                                                                                />
                                                                                <span className="font-bold text-stone-600 text-xs">/ 100</span>
                                                                            </div>

                                                                            {/* Quick score chips */}
                                                                            <div className="flex flex-wrap items-center gap-1 pt-1">
                                                                                <span className="text-[10px] text-stone-400 mr-1">{t('classes.quick_score_label')}</span>
                                                                                {[100, 90, 80, 70, 50, 0].map((sc) => (
                                                                                    <button
                                                                                        key={sc}
                                                                                        type="button"
                                                                                        onClick={() => handleQuickScore(q.id, sc)}
                                                                                        className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-white border border-stone-200 hover:bg-amber-100 hover:border-amber-300 text-stone-700 transition"
                                                                                    >
                                                                                        {sc}
                                                                                    </button>
                                                                                ))}
                                                                            </div>
                                                                        </div>

                                                                        {/* Teacher Feedback Text Area */}
                                                                        <div className="md:col-span-8 space-y-2">
                                                                            <label className="block text-[11px] font-semibold text-stone-700">
                                                                                {t('classes.teacher_feedback_label')}
                                                                            </label>
                                                                            <textarea
                                                                                rows={2}
                                                                                placeholder={t('classes.teacher_feedback_placeholder')}
                                                                                value={essayGradingInputs[q.id]?.feedback ?? ''}
                                                                                onChange={(e) =>
                                                                                    setEssayGradingInputs((prev) => ({
                                                                                        ...prev,
                                                                                        [q.id]: {
                                                                                            ...prev[q.id],
                                                                                            feedback: e.target.value,
                                                                                            score: prev[q.id]?.score || '',
                                                                                        },
                                                                                    }))
                                                                                }
                                                                                className="w-full rounded-lg border-stone-300 text-xs text-stone-800 focus:ring-amber-500 focus:border-amber-500 placeholder-stone-400"
                                                                            />

                                                                            <div className="flex justify-end pt-1">
                                                                                <button
                                                                                    type="button"
                                                                                    disabled={savingEssayId === q.id}
                                                                                    onClick={() => handleSaveEssayScore(q.id)}
                                                                                    className="px-4 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 disabled:opacity-50 text-white font-semibold text-xs shadow-sm transition flex items-center gap-1.5"
                                                                                >
                                                                                    {savingEssayId === q.id ? (
                                                                                        <>
                                                                                            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                                                                            <span>{t('classes.saving')}</span>
                                                                                        </>
                                                                                    ) : (
                                                                                        <>
                                                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                                                            </svg>
                                                                                            <span>{t('classes.save_grade_btn')}</span>
                                                                                        </>
                                                                                    )}
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Explanation for Quiz questions */}
                                                        {!isEssay && q.explanation && (
                                                            <div className="p-3 rounded-lg border border-amber-100 bg-amber-50/50 text-[11px] text-stone-700 flex items-start gap-2">
                                                                <svg className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                </svg>
                                                                <div>
                                                                    <strong className="text-amber-900">{t('classes.explanation_label')} </strong>
                                                                    <span>{q.explanation}</span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-gray-200 bg-white flex items-center justify-between shrink-0">
                            <div className="text-xs text-stone-500">
                                {examResultData && (
                                    <span>
                                        {examResultData.metrics.answered_count} / {examResultData.metrics.total_questions} câu hỏi &bull; {t('classes.exam_score_label')} <strong className="text-stone-900">{examResultData.exam_attempt?.score ?? 0}%</strong>
                                    </span>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={() => setSelectedStudentForExam(null)}
                                className="px-5 py-2 rounded-xl bg-stone-800 hover:bg-stone-900 text-white font-medium text-xs transition shadow-sm"
                            >
                                {t('classes.close')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Student to Class Modal */}
            {isAddStudentModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between border-b pb-3">
                            <h3 className="font-serif font-bold text-base text-gray-900">
                                {t('classes.add_student_modal_title', { name: classItem.name })}
                            </h3>
                            <button
                                onClick={() => setIsAddStudentModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {availableStudents.length === 0 ? (
                            <p className="text-xs text-gray-500 py-4 text-center">
                                {t('classes.all_students_enrolled')}
                            </p>
                        ) : (
                            <form onSubmit={handleAddStudent} className="space-y-4 text-xs">
                                <div>
                                    <label className="block font-medium text-gray-700 mb-1">
                                        {t('classes.select_student_label')}
                                    </label>
                                    <select
                                        value={addStudentForm.data.user_id}
                                        onChange={(e) => addStudentForm.setData('user_id', Number(e.target.value))}
                                        className="w-full rounded-lg border-gray-300 text-xs focus:ring-amber-500 focus:border-amber-500"
                                    >
                                        {availableStudents.map((s) => (
                                            <option key={s.id} value={s.id}>
                                                {s.name} &bull; Username: {s.username} ({s.email})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex justify-end gap-2 pt-3 border-t">
                                    <button
                                        type="button"
                                        onClick={() => setIsAddStudentModalOpen(false)}
                                        className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
                                    >
                                        {t('classes.cancel')}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={addStudentForm.processing}
                                        className="px-4 py-2 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-medium shadow"
                                    >
                                        {t('classes.enroll_student')}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* Delete Class Confirmation Modal */}
            {isDeleteModalOpen && (
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
                                    {t('classes.cannot_be_undone')}
                                </p>
                            </div>
                        </div>

                        <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 text-xs text-stone-700 space-y-1">
                            <div>
                                <span className="font-semibold text-stone-900">{t('classes.class_label')} </span>
                                {classItem.name}
                            </div>
                            <div className="text-[11px] text-stone-500 font-mono">
                                #{classItem.id} &bull; {classItem.course.title}
                            </div>
                            <div className="text-[11px] text-red-700 pt-1">
                                {t('classes.delete_consequence')}
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t">
                            <button
                                type="button"
                                onClick={() => setIsDeleteModalOpen(false)}
                                disabled={isDeleting}
                                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-xs font-medium hover:bg-gray-50"
                            >
                                {t('classes.cancel')}
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteClass}
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
