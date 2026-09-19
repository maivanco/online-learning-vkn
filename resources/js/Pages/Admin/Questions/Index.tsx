import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';

interface QuestionItem {
    id: number;
    course_id: number;
    lesson_id: number | null;
    course_title: string;
    lesson_title: string | null;
    question_text: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    correct_option: 'A' | 'B' | 'C' | 'D';
    explanation: string;
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
}

export default function QuestionBankIndex({ auth, questions, courses, selectedCourseId, flash }: QuestionProps) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedQuestionForEdit, setSelectedQuestionForEdit] = useState<QuestionItem | null>(null);

    const questionForm = useForm({
        course_id: selectedCourseId || courses[0]?.id || '',
        lesson_id: '',
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
            question_text: q.question_text,
            option_a: q.option_a,
            option_b: q.option_b,
            option_c: q.option_c,
            option_d: q.option_d,
            correct_option: q.correct_option,
            explanation: q.explanation,
            type: q.type,
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

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Question Bank (Ngân Hàng Đề Thi & Ôn Luyện)</h2>}
        >
            <Head title="Question Bank - Buddhist Courses" />

            <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                {/* Flash Messages */}
                {flash?.success && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg text-sm flex items-center gap-2 shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        {flash.success}
                    </div>
                )}

                {/* Header Actions */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h3 className="font-serif font-bold text-base text-gray-900">
                            Ngân Hàng Đề Thi Trắc Nghiệm & Đáp Án Giải Thích
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Questions automatically shuffle for exams and 10x practice reviews, with instant grading and explanation.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <select
                            value={selectedCourseId}
                            onChange={(e) => {
                                window.location.href = route('admin.questions.index', { course_id: e.target.value });
                            }}
                            className="rounded-lg border-gray-300 text-xs focus:ring-amber-500 focus:border-amber-500"
                        >
                            {courses.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.title}
                                </option>
                            ))}
                        </select>

                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-medium text-xs shadow transition"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                            Add Question (Thêm Câu Hỏi)
                        </button>
                    </div>
                </div>

                {/* Questions List */}
                <div className="space-y-4">
                    {questions.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-400 text-xs shadow-sm">
                            No questions registered for this course yet.
                        </div>
                    ) : (
                        questions.map((q, idx) => (
                            <div key={q.id} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:border-amber-400 transition space-y-4 text-xs">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded text-[11px]">
                                                Câu {idx + 1}
                                            </span>
                                            {q.lesson_title && (
                                                <span className="text-[11px] text-gray-500">
                                                    &bull; {q.lesson_title}
                                                </span>
                                            )}
                                        </div>
                                        <h4 className="font-semibold text-gray-900 text-sm pt-1">
                                            {q.question_text}
                                        </h4>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => openEdit(q)}
                                            className="text-amber-700 hover:text-amber-900 font-medium"
                                        >
                                            Edit
                                        </button>
                                        <Link
                                            href={route('admin.questions.destroy', q.id)}
                                            method="delete"
                                            as="button"
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            Delete
                                        </Link>
                                    </div>
                                </div>

                                {/* Options A, B, C, D */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
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

                                {/* Explanation */}
                                <div className="bg-amber-50/70 border border-amber-200/80 p-3 rounded-lg text-amber-950">
                                    <span className="font-semibold text-[11px] uppercase tracking-wider text-amber-900 block mb-0.5">
                                        Đáp Án Giải Thích (Explanation):
                                    </span>
                                    {q.explanation}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Create Question Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-xs">
                        <div className="flex items-center justify-between border-b pb-3">
                            <h3 className="font-serif font-bold text-base text-gray-900">
                                Add Multiple Choice Question (Thêm Câu Hỏi Mới)
                            </h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleCreateQuestion} className="space-y-3.5">
                            <div>
                                <label className="block font-medium text-gray-700 mb-1">Associated Lesson (Bài học)</label>
                                <select
                                    value={questionForm.data.lesson_id}
                                    onChange={(e) => questionForm.setData('lesson_id', e.target.value)}
                                    className="w-full rounded-lg border-gray-300 text-xs focus:ring-amber-500 focus:border-amber-500"
                                >
                                    <option value="">-- All / General Course --</option>
                                    {currentCourse?.lessons?.map((l) => (
                                        <option key={l.id} value={l.id}>
                                            {l.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block font-medium text-gray-700 mb-1">Question Text (Nội dung câu hỏi)</label>
                                <textarea
                                    rows={3}
                                    value={questionForm.data.question_text}
                                    onChange={(e) => questionForm.setData('question_text', e.target.value)}
                                    className="w-full rounded-lg border-gray-300 text-xs focus:ring-amber-500 focus:border-amber-500"
                                    placeholder="Enter question text..."
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-medium text-gray-700 mb-1">Option A</label>
                                    <input
                                        type="text"
                                        value={questionForm.data.option_a}
                                        onChange={(e) => questionForm.setData('option_a', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 text-xs"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block font-medium text-gray-700 mb-1">Option B</label>
                                    <input
                                        type="text"
                                        value={questionForm.data.option_b}
                                        onChange={(e) => questionForm.setData('option_b', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 text-xs"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block font-medium text-gray-700 mb-1">Option C</label>
                                    <input
                                        type="text"
                                        value={questionForm.data.option_c}
                                        onChange={(e) => questionForm.setData('option_c', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 text-xs"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block font-medium text-gray-700 mb-1">Option D</label>
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
                                    <label className="block font-medium text-gray-700 mb-1">Correct Answer (Đáp án đúng)</label>
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
                                    <label className="block font-medium text-gray-700 mb-1">Usage Type</label>
                                    <select
                                        value={questionForm.data.type}
                                        onChange={(e) => questionForm.setData('type', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 text-xs"
                                    >
                                        <option value="both">Both (Practice & Exam)</option>
                                        <option value="practice">Practice Only</option>
                                        <option value="exam">Final Exam Only</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block font-medium text-gray-700 mb-1">
                                    Explanation for Answer (Giải thích đáp án sau khi chọn)
                                </label>
                                <textarea
                                    rows={3}
                                    value={questionForm.data.explanation}
                                    onChange={(e) => questionForm.setData('explanation', e.target.value)}
                                    className="w-full rounded-lg border-gray-300 text-xs focus:ring-amber-500 focus:border-amber-500"
                                    placeholder="Explain why this option is correct based on canonical scriptures..."
                                    required
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={questionForm.processing}
                                    className="px-4 py-2 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-medium shadow"
                                >
                                    Save Question
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
                            <h3 className="font-serif font-bold text-base text-gray-900">
                                Edit Question (Chỉnh Sửa Câu Hỏi)
                            </h3>
                            <button onClick={() => setSelectedQuestionForEdit(null)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleUpdateQuestion} className="space-y-3.5">
                            <div>
                                <label className="block font-medium text-gray-700 mb-1">Question Text</label>
                                <textarea
                                    rows={3}
                                    value={editForm.data.question_text}
                                    onChange={(e) => editForm.setData('question_text', e.target.value)}
                                    className="w-full rounded-lg border-gray-300 text-xs focus:ring-amber-500 focus:border-amber-500"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-medium text-gray-700 mb-1">Option A</label>
                                    <input
                                        type="text"
                                        value={editForm.data.option_a}
                                        onChange={(e) => editForm.setData('option_a', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 text-xs"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block font-medium text-gray-700 mb-1">Option B</label>
                                    <input
                                        type="text"
                                        value={editForm.data.option_b}
                                        onChange={(e) => editForm.setData('option_b', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 text-xs"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block font-medium text-gray-700 mb-1">Option C</label>
                                    <input
                                        type="text"
                                        value={editForm.data.option_c}
                                        onChange={(e) => editForm.setData('option_c', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 text-xs"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block font-medium text-gray-700 mb-1">Option D</label>
                                    <input
                                        type="text"
                                        value={editForm.data.option_d}
                                        onChange={(e) => editForm.setData('option_d', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 text-xs"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-medium text-gray-700 mb-1">Correct Answer</label>
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
                                <label className="block font-medium text-gray-700 mb-1">Explanation</label>
                                <textarea
                                    rows={3}
                                    value={editForm.data.explanation}
                                    onChange={(e) => editForm.setData('explanation', e.target.value)}
                                    className="w-full rounded-lg border-gray-300 text-xs focus:ring-amber-500 focus:border-amber-500"
                                    required
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t">
                                <button
                                    type="button"
                                    onClick={() => setSelectedQuestionForEdit(null)}
                                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={editForm.processing}
                                    className="px-4 py-2 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-medium shadow"
                                >
                                    Update Question
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
