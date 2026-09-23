import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useTranslation } from '@/utils/useTranslation';

interface QuestionItem {
    id: number;
    course_id: number;
    lesson_id: number | null;
    question_type: 'quiz' | 'essay';
    course_title: string;
    lesson_title: string | null;
    question_text: string;
    option_a: string | null;
    option_b: string | null;
    option_c: string | null;
    option_d: string | null;
    correct_option: 'A' | 'B' | 'C' | 'D' | null;
    explanation: string | null;
    type: string;
}

interface CourseItem {
    id: number;
    title: string;
    lessons: Array<{
        id: number;
        title: string;
    }>;
}

interface QuestionProps extends PageProps {
    questions: QuestionItem[];
    courses: CourseItem[];
    selectedCourseId: number;
    selectedLessonId: number | null;
    selectedQuestionType: string;
    counts?: {
        all: number;
        quiz: number;
        essay: number;
    };
}

export default function QuestionBankIndex({
    auth,
    questions,
    courses,
    selectedCourseId,
    selectedLessonId,
    selectedQuestionType,
    counts,
    flash,
}: QuestionProps) {
    const t = useTranslation();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedQuestionForEdit, setSelectedQuestionForEdit] = useState<QuestionItem | null>(null);

    const questionForm = useForm({
        course_id: selectedCourseId || courses[0]?.id || '',
        lesson_id: selectedLessonId ? String(selectedLessonId) : '',
        question_type: 'quiz' as 'quiz' | 'essay',
        question_text: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_option: 'A',
        explanation: '',
        type: 'both',
    });

    const editForm = useForm({
        lesson_id: '',
        question_type: 'quiz' as 'quiz' | 'essay',
        question_text: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_option: 'A',
        explanation: '',
        type: 'both',
    });

    const handleCreateQuestion = (e: React.FormEvent) => {
        e.preventDefault();
        questionForm.post(route('admin.questions.store'), {
            onSuccess: () => {
                setIsAddModalOpen(false);
                questionForm.reset();
            },
        });
    };

    const openEdit = (q: QuestionItem) => {
        setSelectedQuestionForEdit(q);
        editForm.setData({
            lesson_id: q.lesson_id ? String(q.lesson_id) : '',
            question_type: q.question_type || 'quiz',
            question_text: q.question_text || '',
            option_a: q.option_a || '',
            option_b: q.option_b || '',
            option_c: q.option_c || '',
            option_d: q.option_d || '',
            correct_option: q.correct_option || 'A',
            explanation: q.explanation || '',
            type: q.type || 'both',
        });
    };

    const handleUpdateQuestion = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedQuestionForEdit) return;
        editForm.put(route('admin.questions.update', selectedQuestionForEdit.id), {
            onSuccess: () => setSelectedQuestionForEdit(null),
        });
    };

    const currentCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];

    const applyFilter = (params: { course_id?: number | string; lesson_id?: number | string; question_type?: string }) => {
        router.get(
            route('admin.questions.index'),
            {
                course_id: params.course_id !== undefined ? params.course_id : selectedCourseId,
                lesson_id: params.lesson_id !== undefined ? params.lesson_id : (selectedLessonId ?? ''),
                question_type: params.question_type !== undefined ? params.question_type : selectedQuestionType,
            },
            { preserveState: true }
        );
    };

    const totalCount = counts?.all ?? questions.length;
    const quizCount = counts?.quiz ?? questions.filter((q) => (q.question_type || 'quiz') === 'quiz').length;
    const essayCount = counts?.essay ?? questions.filter((q) => q.question_type === 'essay').length;

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">{t('questions.header_title')}</h2>}
        >
            <Head title={t('questions.bank_title')} />

            <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                {/* Flash Messages */}
                {flash?.success && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg text-sm flex items-center gap-2 shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        {flash.success}
                    </div>
                )}

                {/* Header Section */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h3 className="font-serif font-bold text-base text-gray-900">
                            {t('questions.section_title')}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                            {t('questions.section_subtitle')}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <select
                            value={selectedCourseId}
                            onChange={(e) => {
                                applyFilter({ course_id: e.target.value, lesson_id: '' });
                            }}
                            className="rounded-lg border-gray-300 text-xs focus:ring-amber-500 focus:border-amber-500 max-w-[200px]"
                        >
                            {courses.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.title}
                                </option>
                            ))}
                        </select>

                        <button
                            onClick={() => {
                                questionForm.setData('course_id', selectedCourseId);
                                questionForm.setData('lesson_id', selectedLessonId ? String(selectedLessonId) : '');
                                setIsAddModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-medium text-xs shadow transition"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                            {t('questions.add_question')}
                        </button>
                    </div>
                </div>

                {/* Filter Bar: Lesson Filter + Question Type Tabs */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    {/* Question Type Filter Tabs */}
                    <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-lg">
                        <button
                            type="button"
                            onClick={() => applyFilter({ question_type: 'all' })}
                            className={`px-3 py-1.5 rounded-md font-medium transition ${
                                selectedQuestionType === 'all'
                                    ? 'bg-white text-stone-900 shadow-sm'
                                    : 'text-stone-600 hover:text-stone-900'
                            }`}
                        >
                            {t('questions.filter_all_types')} ({totalCount})
                        </button>
                        <button
                            type="button"
                            onClick={() => applyFilter({ question_type: 'quiz' })}
                            className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition ${
                                selectedQuestionType === 'quiz'
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-stone-600 hover:text-blue-700'
                            }`}
                        >
                            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                            {t('questions.filter_quiz')} ({quizCount})
                        </button>
                        <button
                            type="button"
                            onClick={() => applyFilter({ question_type: 'essay' })}
                            className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition ${
                                selectedQuestionType === 'essay'
                                    ? 'bg-amber-700 text-white shadow-sm'
                                    : 'text-stone-600 hover:text-amber-800'
                            }`}
                        >
                            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                            {t('questions.filter_essay')} ({essayCount})
                        </button>
                    </div>

                    {/* Lesson Filter Dropdown */}
                    <div className="flex items-center gap-2">
                        <span className="text-gray-500 whitespace-nowrap">{t('questions.associated_lesson')}:</span>
                        <select
                            value={selectedLessonId ?? ''}
                            onChange={(e) => applyFilter({ lesson_id: e.target.value })}
                            className="rounded-lg border-gray-300 text-xs focus:ring-amber-500 focus:border-amber-500 max-w-[220px]"
                        >
                            <option value="">{t('questions.filter_by_lesson')}</option>
                            {currentCourse?.lessons?.map((l) => (
                                <option key={l.id} value={l.id}>
                                    {l.title}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Questions List */}
                <div className="space-y-4">
                    {questions.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-400 text-xs shadow-sm">
                            {t('questions.no_questions')}
                        </div>
                    ) : (
                        questions.map((q, idx) => {
                            const isEssay = q.question_type === 'essay';

                            return (
                                <div
                                    key={q.id}
                                    className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:border-amber-400 transition space-y-4 text-xs"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="space-y-1.5">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded text-[11px]">
                                                    {t('questions.question_prefix')} {idx + 1}
                                                </span>

                                                {isEssay ? (
                                                    <span className="font-semibold text-amber-900 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded text-[11px] flex items-center gap-1">
                                                        <svg className="w-3 h-3 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                        {t('questions.badge_essay')}
                                                    </span>
                                                ) : (
                                                    <span className="font-semibold text-blue-900 bg-blue-100 border border-blue-200 px-2 py-0.5 rounded text-[11px] flex items-center gap-1">
                                                        <svg className="w-3 h-3 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                        </svg>
                                                        {t('questions.badge_quiz')}
                                                    </span>
                                                )}

                                                {q.lesson_title ? (
                                                    <span className="text-[11px] text-gray-600 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded">
                                                        {q.lesson_title}
                                                    </span>
                                                ) : (
                                                    <span className="text-[11px] text-gray-400 italic">
                                                        {t('questions.all_general_course')}
                                                    </span>
                                                )}

                                                <span className="text-[10px] text-stone-500 uppercase tracking-wider bg-stone-100 px-1.5 py-0.5 rounded">
                                                    {q.type === 'both' ? t('questions.both_practice_exam') : q.type === 'practice' ? t('questions.practice_only') : t('questions.exam_only')}
                                                </span>
                                            </div>

                                            <h4 className="font-medium text-gray-900 text-sm pt-1 whitespace-pre-line leading-relaxed">
                                                {q.question_text}
                                            </h4>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            <button
                                                onClick={() => openEdit(q)}
                                                className="text-amber-700 hover:text-amber-900 font-medium px-2 py-1 rounded hover:bg-amber-50 transition"
                                            >
                                                {t('questions.edit')}
                                            </button>
                                            <Link
                                                href={route('admin.questions.destroy', q.id)}
                                                method="delete"
                                                as="button"
                                                className="text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded hover:bg-red-50 transition"
                                            >
                                                {t('questions.delete')}
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Multiple Choice Options */}
                                    {!isEssay && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                                            <div className={`p-2.5 rounded-lg border ${q.correct_option === 'A' ? 'bg-emerald-50 border-emerald-400 font-semibold text-emerald-900' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>
                                                <span className="font-bold mr-1.5">A.</span> {q.option_a}
                                            </div>
                                            <div className={`p-2.5 rounded-lg border ${q.correct_option === 'B' ? 'bg-emerald-50 border-emerald-400 font-semibold text-emerald-900' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>
                                                <span className="font-bold mr-1.5">B.</span> {q.option_b}
                                            </div>
                                            <div className={`p-2.5 rounded-lg border ${q.correct_option === 'C' ? 'bg-emerald-50 border-emerald-400 font-semibold text-emerald-900' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>
                                                <span className="font-bold mr-1.5">C.</span> {q.option_c}
                                            </div>
                                            <div className={`p-2.5 rounded-lg border ${q.correct_option === 'D' ? 'bg-emerald-50 border-emerald-400 font-semibold text-emerald-900' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>
                                                <span className="font-bold mr-1.5">D.</span> {q.option_d}
                                            </div>
                                        </div>
                                    )}

                                    {/* Explanation (for Quiz) OR Suggested Answer / Guide (for Essay) */}
                                    {q.explanation && (
                                        <div className={`p-3.5 rounded-xl border ${isEssay ? 'bg-amber-50/80 border-amber-200 text-amber-950' : 'bg-stone-50 border-stone-200 text-stone-900'}`}>
                                            <span className="font-semibold text-[11px] uppercase tracking-wider text-amber-900 block mb-1 flex items-center gap-1.5">
                                                <svg className="w-3.5 h-3.5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                {isEssay ? t('questions.essay_answer_label') : t('questions.explanation_label')}
                                            </span>
                                            <p className="whitespace-pre-line leading-relaxed text-xs">
                                                {q.explanation}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Create Question Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-xs">
                        <div className="flex items-center justify-between border-b pb-3">
                            <h3 className="font-serif font-bold text-base text-gray-900">
                                {t('questions.add_modal_title')}
                            </h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleCreateQuestion} className="space-y-4">
                            {/* Question Type Radio Selector */}
                            <div>
                                <label className="block font-medium text-gray-700 mb-1.5">{t('questions.question_type_label')}</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => questionForm.setData('question_type', 'quiz')}
                                        className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition ${
                                            questionForm.data.question_type === 'quiz'
                                                ? 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-500/20'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center ${questionForm.data.question_type === 'quiz' ? 'border-blue-600 bg-blue-600' : 'border-gray-400'}`}>
                                            {questionForm.data.question_type === 'quiz' && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                                        </div>
                                        <div>
                                            <span className="font-bold text-gray-900 block text-xs">{t('questions.quiz_type')}</span>
                                            <span className="text-[11px] text-gray-500">4 options (A-D) & instant grading</span>
                                        </div>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => questionForm.setData('question_type', 'essay')}
                                        className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition ${
                                            questionForm.data.question_type === 'essay'
                                                ? 'border-amber-600 bg-amber-50/50 ring-2 ring-amber-600/20'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center ${questionForm.data.question_type === 'essay' ? 'border-amber-700 bg-amber-700' : 'border-gray-400'}`}>
                                            {questionForm.data.question_type === 'essay' && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                                        </div>
                                        <div>
                                            <span className="font-bold text-gray-900 block text-xs">{t('questions.essay_type')}</span>
                                            <span className="text-[11px] text-gray-500">Open-ended answer & reference guide</span>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Associated Lesson */}
                            <div>
                                <label className="block font-medium text-gray-700 mb-1">{t('questions.associated_lesson')}</label>
                                <select
                                    value={questionForm.data.lesson_id}
                                    onChange={(e) => questionForm.setData('lesson_id', e.target.value)}
                                    className="w-full rounded-lg border-gray-300 text-xs focus:ring-amber-500 focus:border-amber-500"
                                >
                                    <option value="">{t('questions.all_general_course')}</option>
                                    {currentCourse?.lessons?.map((l) => (
                                        <option key={l.id} value={l.id}>
                                            {l.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Question Text */}
                            <div>
                                <label className="block font-medium text-gray-700 mb-1">{t('questions.question_text')}</label>
                                <textarea
                                    rows={questionForm.data.question_type === 'essay' ? 4 : 3}
                                    value={questionForm.data.question_text}
                                    onChange={(e) => questionForm.setData('question_text', e.target.value)}
                                    className="w-full rounded-lg border-gray-300 text-xs focus:ring-amber-500 focus:border-amber-500"
                                    placeholder={t('questions.enter_question_placeholder')}
                                    required
                                />
                            </div>

                            {/* Multiple Choice specific fields */}
                            {questionForm.data.question_type === 'quiz' && (
                                <>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block font-medium text-gray-700 mb-1">{t('questions.option_a')}</label>
                                            <input
                                                type="text"
                                                value={questionForm.data.option_a}
                                                onChange={(e) => questionForm.setData('option_a', e.target.value)}
                                                className="w-full rounded-lg border-gray-300 text-xs"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-medium text-gray-700 mb-1">{t('questions.option_b')}</label>
                                            <input
                                                type="text"
                                                value={questionForm.data.option_b}
                                                onChange={(e) => questionForm.setData('option_b', e.target.value)}
                                                className="w-full rounded-lg border-gray-300 text-xs"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-medium text-gray-700 mb-1">{t('questions.option_c')}</label>
                                            <input
                                                type="text"
                                                value={questionForm.data.option_c}
                                                onChange={(e) => questionForm.setData('option_c', e.target.value)}
                                                className="w-full rounded-lg border-gray-300 text-xs"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-medium text-gray-700 mb-1">{t('questions.option_d')}</label>
                                            <input
                                                type="text"
                                                value={questionForm.data.option_d}
                                                onChange={(e) => questionForm.setData('option_d', e.target.value)}
                                                className="w-full rounded-lg border-gray-300 text-xs"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block font-medium text-gray-700 mb-1">{t('questions.correct_answer')}</label>
                                            <select
                                                value={questionForm.data.correct_option}
                                                onChange={(e) => questionForm.setData('correct_option', e.target.value as any)}
                                                className="w-full rounded-lg border-gray-300 text-xs font-bold text-emerald-800"
                                            >
                                                <option value="A">A</option>
                                                <option value="B">B</option>
                                                <option value="C">C</option>
                                                <option value="D">D</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block font-medium text-gray-700 mb-1">{t('questions.usage_type')}</label>
                                            <select
                                                value={questionForm.data.type}
                                                onChange={(e) => questionForm.setData('type', e.target.value)}
                                                className="w-full rounded-lg border-gray-300 text-xs"
                                            >
                                                <option value="both">{t('questions.both_practice_exam')}</option>
                                                <option value="practice">{t('questions.practice_only')}</option>
                                                <option value="exam">{t('questions.exam_only')}</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block font-medium text-gray-700 mb-1">
                                            {t('questions.explanation_field')}
                                        </label>
                                        <textarea
                                            rows={3}
                                            value={questionForm.data.explanation}
                                            onChange={(e) => questionForm.setData('explanation', e.target.value)}
                                            className="w-full rounded-lg border-gray-300 text-xs focus:ring-amber-500 focus:border-amber-500"
                                            placeholder={t('questions.explanation_placeholder')}
                                        />
                                    </div>
                                </>
                            )}

                            {/* Essay specific fields */}
                            {questionForm.data.question_type === 'essay' && (
                                <>
                                    <div>
                                        <label className="block font-medium text-gray-700 mb-1">{t('questions.usage_type')}</label>
                                        <select
                                            value={questionForm.data.type}
                                            onChange={(e) => questionForm.setData('type', e.target.value)}
                                            className="w-full rounded-lg border-gray-300 text-xs"
                                        >
                                            <option value="both">{t('questions.both_practice_exam')}</option>
                                            <option value="practice">{t('questions.practice_only')}</option>
                                            <option value="exam">{t('questions.exam_only')}</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block font-medium text-gray-700 mb-1">
                                            {t('questions.essay_sample_answer')}
                                        </label>
                                        <textarea
                                            rows={4}
                                            value={questionForm.data.explanation}
                                            onChange={(e) => questionForm.setData('explanation', e.target.value)}
                                            className="w-full rounded-lg border-gray-300 text-xs focus:ring-amber-500 focus:border-amber-500"
                                            placeholder={t('questions.essay_sample_placeholder')}
                                        />
                                    </div>
                                </>
                            )}

                            <div className="flex justify-end gap-2 pt-3 border-t">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
                                >
                                    {t('questions.cancel')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={questionForm.processing}
                                    className="px-4 py-2 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-medium shadow"
                                >
                                    {t('questions.save_question')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Question Modal */}
            {selectedQuestionForEdit && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-xs">
                        <div className="flex items-center justify-between border-b pb-3">
                            <div className="flex items-center gap-2">
                                <h3 className="font-serif font-bold text-base text-gray-900">
                                    {t('questions.edit_modal_title')}
                                </h3>
                                <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                                    editForm.data.question_type === 'essay'
                                        ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                        : 'bg-blue-100 text-blue-900 border border-blue-200'
                                }`}>
                                    {editForm.data.question_type === 'essay' ? t('questions.badge_essay') : t('questions.badge_quiz')}
                                </span>
                            </div>
                            <button onClick={() => setSelectedQuestionForEdit(null)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleUpdateQuestion} className="space-y-4">
                            {/* Question Type Switcher */}
                            <div>
                                <label className="block font-medium text-gray-700 mb-1.5">{t('questions.question_type_label')}</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => editForm.setData('question_type', 'quiz')}
                                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition ${
                                            editForm.data.question_type === 'quiz'
                                                ? 'border-blue-500 bg-blue-50/50 font-semibold text-blue-900'
                                                : 'border-gray-200 hover:border-gray-300 text-gray-700'
                                        }`}
                                    >
                                        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${editForm.data.question_type === 'quiz' ? 'border-blue-600 bg-blue-600' : 'border-gray-400'}`}>
                                            {editForm.data.question_type === 'quiz' && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                                        </div>
                                        <span>{t('questions.quiz_type')}</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => editForm.setData('question_type', 'essay')}
                                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition ${
                                            editForm.data.question_type === 'essay'
                                                ? 'border-amber-600 bg-amber-50/50 font-semibold text-amber-900'
                                                : 'border-gray-200 hover:border-gray-300 text-gray-700'
                                        }`}
                                    >
                                        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${editForm.data.question_type === 'essay' ? 'border-amber-700 bg-amber-700' : 'border-gray-400'}`}>
                                            {editForm.data.question_type === 'essay' && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                                        </div>
                                        <span>{t('questions.essay_type')}</span>
                                    </button>
                                </div>
                            </div>

                            {/* Associated Lesson */}
                            <div>
                                <label className="block font-medium text-gray-700 mb-1">{t('questions.associated_lesson')}</label>
                                <select
                                    value={editForm.data.lesson_id}
                                    onChange={(e) => editForm.setData('lesson_id', e.target.value)}
                                    className="w-full rounded-lg border-gray-300 text-xs focus:ring-amber-500 focus:border-amber-500"
                                >
                                    <option value="">{t('questions.all_general_course')}</option>
                                    {currentCourse?.lessons?.map((l) => (
                                        <option key={l.id} value={l.id}>
                                            {l.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Question Text */}
                            <div>
                                <label className="block font-medium text-gray-700 mb-1">{t('questions.question_text')}</label>
                                <textarea
                                    rows={editForm.data.question_type === 'essay' ? 4 : 3}
                                    value={editForm.data.question_text}
                                    onChange={(e) => editForm.setData('question_text', e.target.value)}
                                    className="w-full rounded-lg border-gray-300 text-xs focus:ring-amber-500 focus:border-amber-500"
                                    required
                                />
                            </div>

                            {/* Quiz specific fields */}
                            {editForm.data.question_type === 'quiz' && (
                                <>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block font-medium text-gray-700 mb-1">{t('questions.option_a')}</label>
                                            <input
                                                type="text"
                                                value={editForm.data.option_a}
                                                onChange={(e) => editForm.setData('option_a', e.target.value)}
                                                className="w-full rounded-lg border-gray-300 text-xs"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-medium text-gray-700 mb-1">{t('questions.option_b')}</label>
                                            <input
                                                type="text"
                                                value={editForm.data.option_b}
                                                onChange={(e) => editForm.setData('option_b', e.target.value)}
                                                className="w-full rounded-lg border-gray-300 text-xs"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-medium text-gray-700 mb-1">{t('questions.option_c')}</label>
                                            <input
                                                type="text"
                                                value={editForm.data.option_c}
                                                onChange={(e) => editForm.setData('option_c', e.target.value)}
                                                className="w-full rounded-lg border-gray-300 text-xs"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-medium text-gray-700 mb-1">{t('questions.option_d')}</label>
                                            <input
                                                type="text"
                                                value={editForm.data.option_d}
                                                onChange={(e) => editForm.setData('option_d', e.target.value)}
                                                className="w-full rounded-lg border-gray-300 text-xs"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block font-medium text-gray-700 mb-1">{t('questions.correct_answer')}</label>
                                            <select
                                                value={editForm.data.correct_option}
                                                onChange={(e) => editForm.setData('correct_option', e.target.value as any)}
                                                className="w-full rounded-lg border-gray-300 text-xs font-bold text-emerald-800"
                                            >
                                                <option value="A">A</option>
                                                <option value="B">B</option>
                                                <option value="C">C</option>
                                                <option value="D">D</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block font-medium text-gray-700 mb-1">{t('questions.usage_type')}</label>
                                            <select
                                                value={editForm.data.type}
                                                onChange={(e) => editForm.setData('type', e.target.value)}
                                                className="w-full rounded-lg border-gray-300 text-xs"
                                            >
                                                <option value="both">{t('questions.both_practice_exam')}</option>
                                                <option value="practice">{t('questions.practice_only')}</option>
                                                <option value="exam">{t('questions.exam_only')}</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block font-medium text-gray-700 mb-1">{t('questions.explanation_field')}</label>
                                        <textarea
                                            rows={3}
                                            value={editForm.data.explanation}
                                            onChange={(e) => editForm.setData('explanation', e.target.value)}
                                            className="w-full rounded-lg border-gray-300 text-xs focus:ring-amber-500 focus:border-amber-500"
                                            required
                                        />
                                    </div>
                                </>
                            )}

                            {/* Essay specific fields */}
                            {editForm.data.question_type === 'essay' && (
                                <>
                                    <div>
                                        <label className="block font-medium text-gray-700 mb-1">{t('questions.usage_type')}</label>
                                        <select
                                            value={editForm.data.type}
                                            onChange={(e) => editForm.setData('type', e.target.value)}
                                            className="w-full rounded-lg border-gray-300 text-xs"
                                        >
                                            <option value="both">{t('questions.both_practice_exam')}</option>
                                            <option value="practice">{t('questions.practice_only')}</option>
                                            <option value="exam">{t('questions.exam_only')}</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block font-medium text-gray-700 mb-1">{t('questions.essay_sample_answer')}</label>
                                        <textarea
                                            rows={4}
                                            value={editForm.data.explanation}
                                            onChange={(e) => editForm.setData('explanation', e.target.value)}
                                            className="w-full rounded-lg border-gray-300 text-xs focus:ring-amber-500 focus:border-amber-500"
                                            placeholder={t('questions.essay_sample_placeholder')}
                                        />
                                    </div>
                                </>
                            )}

                            <div className="flex justify-end gap-2 pt-3 border-t">
                                <button
                                    type="button"
                                    onClick={() => setSelectedQuestionForEdit(null)}
                                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
                                >
                                    {t('questions.cancel')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={editForm.processing}
                                    className="px-4 py-2 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-medium shadow"
                                >
                                    {t('questions.update_question')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
