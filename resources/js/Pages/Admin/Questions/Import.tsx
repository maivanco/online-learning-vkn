import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useTranslation } from '@/utils/useTranslation';

interface CourseItem {
    id: number;
    title: string;
    lessons: Array<{
        id: number;
        title: string;
    }>;
}

type ImportProps = PageProps<{
    courses: CourseItem[];
    selectedCourseId: number;
    selectedLessonId: number | null;
}>;

export default function QuestionsImportPage({
    auth,
    courses,
    selectedCourseId,
    selectedLessonId,
    flash,
}: ImportProps) {
    const t = useTranslation();
    const [isDragging, setIsDragging] = useState(false);

    const [currentCourseId, setCurrentCourseId] = useState<number | string>(
        selectedCourseId || courses[0]?.id || ''
    );
    const [currentLessonId, setCurrentLessonId] = useState<string>(
        selectedLessonId ? String(selectedLessonId) : ''
    );

    const currentCourse = courses.find((c) => String(c.id) === String(currentCourseId)) || courses[0];

    const form = useForm<{
        course_id: number | string;
        lesson_id: string;
        file: File | null;
    }>({
        course_id: currentCourseId,
        lesson_id: currentLessonId,
        file: null,
    });

    const handleCourseChange = (newCourseId: string) => {
        setCurrentCourseId(newCourseId);
        setCurrentLessonId('');
        form.setData({
            ...form.data,
            course_id: newCourseId,
            lesson_id: '',
        });
    };

    const handleLessonChange = (newLessonId: string) => {
        setCurrentLessonId(newLessonId);
        form.setData('lesson_id', newLessonId);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.data.lesson_id || !form.data.file) {
            return;
        }

        form.post(route('admin.questions.import'), {
            forceFormData: true,
            onError: () => {
                // Keep form values intact
            },
        });
    };

    const isLessonSelected = Boolean(form.data.lesson_id);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
                            <Link href={route('admin.questions.index')} className="hover:text-amber-800 transition">
                                {t('nav.question_bank')}
                            </Link>
                            <span>/</span>
                            <span className="text-stone-800 font-medium">{t('nav.questions_import')}</span>
                        </div>
                        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                            {t('questions.import_page_title')}
                        </h2>
                    </div>

                    <Link
                        href={route('admin.questions.index', {
                            course_id: currentCourseId,
                            lesson_id: currentLessonId || undefined,
                        })}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 font-medium text-xs shadow-sm transition"
                    >
                        <svg className="w-4 h-4 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span>{t('questions.back_to_list')}</span>
                    </Link>
                </div>
            }
        >
            <Head title={t('questions.import_page_title')} />

            <div className="py-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
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

                {/* Import Error Report Banner */}
                {flash?.import_errors && flash.import_errors.length > 0 && (
                    <div className="bg-red-50 border border-red-200 text-red-900 p-5 rounded-2xl text-xs shadow-sm space-y-3">
                        <div className="flex items-center gap-2 font-bold text-red-800 text-sm">
                            <svg className="w-5 h-5 text-red-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span>{t('questions.import_errors_title')} ({flash.import_errors.length})</span>
                        </div>
                        <p className="text-red-700">
                            {t('questions.import_failed_msg', { count: String(flash.import_errors.length) })}
                        </p>
                        <div className="bg-white rounded-xl border border-red-200 p-3 max-h-60 overflow-y-auto">
                            <ul className="list-disc list-inside space-y-1.5 text-red-700 text-xs font-mono">
                                {flash.import_errors.map((err, idx) => (
                                    <li key={idx}>{err}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {/* Main Workflow Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Step 1: Select Target Destination */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
                        <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                            <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center">
                                1
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 text-sm">
                                    {t('questions.step_1_title')}
                                </h3>
                                <p className="text-xs text-gray-500">
                                    {t('questions.step_1_desc')}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            {/* Course Dropdown */}
                            <div>
                                <label className="block font-medium text-gray-700 mb-1.5">
                                    {t('questions.select_target_course')} <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={form.data.course_id}
                                    onChange={(e) => handleCourseChange(e.target.value)}
                                    className="w-full rounded-xl border-gray-300 text-xs focus:ring-amber-500 focus:border-amber-500 py-2.5"
                                    required
                                >
                                    {courses.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Lesson Dropdown (Required) */}
                            <div>
                                <label className="block font-medium text-gray-700 mb-1.5">
                                    {t('questions.select_target_lesson')} <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={form.data.lesson_id}
                                    onChange={(e) => handleLessonChange(e.target.value)}
                                    className={`w-full rounded-xl text-xs py-2.5 transition ${
                                        !isLessonSelected
                                            ? 'border-amber-400 bg-amber-50/30 text-amber-900 focus:ring-amber-500 focus:border-amber-500'
                                            : 'border-gray-300 text-gray-900 focus:ring-amber-500 focus:border-amber-500'
                                    }`}
                                    required
                                >
                                    <option value="">{t('questions.select_lesson_placeholder')}</option>
                                    {currentCourse?.lessons?.map((l) => (
                                        <option key={l.id} value={l.id}>
                                            #{l.id} - {l.title}
                                        </option>
                                    ))}
                                </select>
                                {form.errors.lesson_id ? (
                                    <p className="text-red-500 text-[11px] mt-1.5">{form.errors.lesson_id}</p>
                                ) : (
                                    <p className="text-stone-500 text-[11px] mt-1.5">
                                        {t('questions.lesson_selection_help')}
                                    </p>
                                )}
                            </div>
                        </div>

                        {!isLessonSelected && (
                            <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2">
                                <svg className="w-4 h-4 text-amber-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{t('questions.select_lesson_required_warning')}</span>
                            </div>
                        )}
                    </div>

                    {/* Step 2: Download Template */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
                        <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                            <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center">
                                2
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 text-sm">
                                    {t('questions.step_2_title')}
                                </h3>
                                <p className="text-xs text-gray-500">
                                    {t('questions.step_2_desc')}
                                </p>
                            </div>
                        </div>

                        <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="space-y-1">
                                <div className="font-semibold text-stone-900 text-xs flex items-center gap-2">
                                    <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <span>question_import_template.xlsx</span>
                                </div>
                                <p className="text-[11px] text-stone-500">
                                    {t('questions.template_download_hint')}
                                </p>
                            </div>

                            <a
                                href={route('admin.questions.template', {
                                    course_id: currentCourseId,
                                    lesson_id: currentLessonId || undefined,
                                })}
                                download
                                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-medium text-xs shadow-sm transition shrink-0"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                <span>{t('questions.download_sample_excel')}</span>
                            </a>
                        </div>
                    </div>

                    {/* Step 3: File Upload & Action */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
                        <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                            <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                                3
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 text-sm">
                                    {t('questions.step_3_title')}
                                </h3>
                                <p className="text-xs text-gray-500">
                                    {t('questions.step_3_desc')}
                                </p>
                            </div>
                        </div>

                        {/* Drag and Drop Upload Area */}
                        <div>
                            <div
                                onDragOver={(e) => {
                                    if (!isLessonSelected) return;
                                    e.preventDefault();
                                    setIsDragging(true);
                                }}
                                onDragLeave={() => setIsDragging(false)}
                                onDrop={(e) => {
                                    if (!isLessonSelected) return;
                                    e.preventDefault();
                                    setIsDragging(false);
                                    const droppedFile = e.dataTransfer.files?.[0];
                                    if (droppedFile) {
                                        form.setData('file', droppedFile);
                                    }
                                }}
                                className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition ${
                                    !isLessonSelected
                                        ? 'border-gray-200 bg-gray-50/60 opacity-60 cursor-not-allowed'
                                        : isDragging
                                        ? 'border-amber-500 bg-amber-50/50 cursor-pointer'
                                        : form.data.file
                                        ? 'border-emerald-400 bg-emerald-50/30 cursor-pointer'
                                        : 'border-gray-300 hover:border-gray-400 bg-stone-50/40 cursor-pointer'
                                }`}
                            >
                                <input
                                    type="file"
                                    accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
                                    disabled={!isLessonSelected}
                                    onChange={(e) => {
                                        const file = e.target.files?.[0] || null;
                                        form.setData('file', file);
                                    }}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                />

                                {form.data.file ? (
                                    <div className="flex items-center justify-between gap-4 max-w-md mx-auto bg-white p-3.5 rounded-xl border border-emerald-200 shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <div className="text-left">
                                                <p className="font-semibold text-gray-900 text-xs truncate max-w-xs">
                                                    {form.data.file.name}
                                                </p>
                                                <p className="text-[11px] text-gray-500">
                                                    {(form.data.file.size / 1024).toFixed(1)} KB
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                form.setData('file', null);
                                            }}
                                            className="text-stone-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition"
                                            title="Remove file"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-500 flex items-center justify-center mx-auto">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                            </svg>
                                        </div>
                                        <p className="font-semibold text-gray-800 text-xs">
                                            {t('questions.drag_drop_excel')}
                                        </p>
                                        <p className="text-[11px] text-gray-400">
                                            Microsoft Excel (.xlsx, .xls) or CSV (Max 10MB)
                                        </p>
                                    </div>
                                )}
                            </div>

                            {form.errors.file && (
                                <p className="text-red-500 text-[11px] mt-1.5">{form.errors.file}</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <p className="text-xs text-stone-500">
                                {isLessonSelected && form.data.file ? (
                                    <span className="text-emerald-700 font-medium flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                        Ready to import into Lesson #{form.data.lesson_id}
                                    </span>
                                ) : (
                                    <span>Complete steps 1 and 3 to enable import</span>
                                )}
                            </p>

                            <button
                                type="submit"
                                disabled={!isLessonSelected || !form.data.file || form.processing}
                                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                {form.processing && (
                                    <svg className="animate-spin -ml-1 mr-1 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                                    </svg>
                                )}
                                <span>
                                    {form.processing
                                        ? t('questions.importing')
                                        : t('questions.import_submit')}
                                </span>
                            </button>
                        </div>
                    </div>
                </form>

                {/* Quick Reference Rules Cards */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
                    <h4 className="font-semibold text-gray-900 text-xs tracking-wider uppercase">
                        {t('questions.import_guide_title')}
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        {/* Multiple Choice Rules */}
                        <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 space-y-2">
                            <div className="flex items-center gap-2 font-bold text-blue-900">
                                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                                <span>{t('questions.badge_quiz')} (quiz)</span>
                            </div>
                            <ul className="space-y-1.5 text-blue-950 text-[11px] list-disc list-inside">
                                <li>Set <code className="bg-blue-100 px-1 py-0.5 rounded font-mono">question_type</code> to <strong>quiz</strong>.</li>
                                <li>Fill all 4 options: <code className="bg-blue-100 px-1 py-0.5 rounded font-mono">option_a</code> through <code className="bg-blue-100 px-1 py-0.5 rounded font-mono">option_d</code>.</li>
                                <li>Set <code className="bg-blue-100 px-1 py-0.5 rounded font-mono">correct_option</code> to <strong>A</strong>, <strong>B</strong>, <strong>C</strong>, or <strong>D</strong>.</li>
                                <li>Optional <code className="bg-blue-100 px-1 py-0.5 rounded font-mono">explanation</code> explains the answer to students after taking practice or exam.</li>
                            </ul>
                        </div>

                        {/* Essay Rules */}
                        <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 space-y-2">
                            <div className="flex items-center gap-2 font-bold text-amber-900">
                                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                                <span>{t('questions.badge_essay')} (essay)</span>
                            </div>
                            <ul className="space-y-1.5 text-amber-950 text-[11px] list-disc list-inside">
                                <li>Set <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">question_type</code> to <strong>essay</strong>.</li>
                                <li>Leave option columns and <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">correct_option</code> completely blank.</li>
                                <li>Use <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">explanation</code> for sample answers, scripture citations, or grading criteria rubric.</li>
                                <li>Essay questions are automatically routed to the Teacher Grading dashboard upon student completion.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
