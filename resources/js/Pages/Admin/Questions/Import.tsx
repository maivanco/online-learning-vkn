import { useState, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
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

type TargetQuestionField =
    | 'ignore'
    | 'question_text'
    | 'question_type'
    | 'option_a'
    | 'option_b'
    | 'option_c'
    | 'option_d'
    | 'correct_option'
    | 'explanation'
    | 'type';

interface PreviewResponse {
    success: boolean;
    headers: string[];
    preview_rows: Array<Record<string, string | null>>;
    total_rows: number;
    suggested_mappings: Record<string, string>;
}

export default function QuestionsImportPage({
    auth,
    courses,
    selectedCourseId,
    selectedLessonId,
    flash,
}: ImportProps) {
    const t = useTranslation();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Stepper: 1 = File & Destination, 2 = Mapping & Preview
    const [step, setStep] = useState<1 | 2>(1);
    const [isDragging, setIsDragging] = useState(false);

    const [currentCourseId, setCurrentCourseId] = useState<number | string>(
        selectedCourseId || courses[0]?.id || ''
    );
    const [currentLessonId, setCurrentLessonId] = useState<string>(
        selectedLessonId ? String(selectedLessonId) : ''
    );

    const currentCourse = courses.find((c) => String(c.id) === String(currentCourseId)) || courses[0];
    const currentLesson = currentCourse?.lessons?.find((l) => String(l.id) === String(currentLessonId));

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isLoadingPreview, setIsLoadingPreview] = useState(false);
    const [previewData, setPreviewData] = useState<PreviewResponse | null>(null);
    const [mappings, setMappings] = useState<Record<string, TargetQuestionField>>({});
    const [stepError, setStepError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<{
        course_id: number | string;
        lesson_id: string;
    }>({
        course_id: currentCourseId,
        lesson_id: currentLessonId,
    });

    const handleCourseChange = (newCourseId: string) => {
        setCurrentCourseId(newCourseId);
        setCurrentLessonId('');
        form.setData({
            course_id: newCourseId,
            lesson_id: '',
        });
        setStepError(null);
    };

    const handleLessonChange = (newLessonId: string) => {
        setCurrentLessonId(newLessonId);
        form.setData('lesson_id', newLessonId);
        setStepError(null);
    };

    const handleFileSelect = (file: File | null) => {
        setSelectedFile(file);
        setStepError(null);
    };

    const handleProceedToMapping = async () => {
        if (!currentLessonId) {
            setStepError(t('questions.error_lesson_required'));
            return;
        }

        if (!selectedFile) {
            setStepError(t('questions.error_file_required'));
            return;
        }

        setIsLoadingPreview(true);
        setStepError(null);

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const token = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;
            const res = await fetch(route('admin.questions.import-preview'), {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': token || '',
                },
                body: formData,
            });

            const data = await res.json();
            if (!res.ok || !data.success) {
                setStepError(data.message || 'Failed to analyze spreadsheet.');
                setIsLoadingPreview(false);
                return;
            }

            setPreviewData(data);
            setMappings(data.suggested_mappings || {});
            setStep(2);
        } catch (err: any) {
            setStepError(err.message || 'Network error occurred while analyzing the file.');
        } finally {
            setIsLoadingPreview(false);
        }
    };

    const handleMappingChange = (header: string, field: TargetQuestionField) => {
        setMappings((prev) => ({
            ...prev,
            [header]: field,
        }));
    };

    const handleSubmitImport = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile || !currentLessonId) return;

        // Ensure at least one column is mapped to question_text
        const hasQuestionText = Object.values(mappings).includes('question_text');
        if (!hasQuestionText) {
            setStepError(t('questions.error_question_text_mapping_required'));
            return;
        }

        setIsSubmitting(true);
        setStepError(null);

        const payload: Record<string, any> = {
            course_id: currentCourseId,
            lesson_id: currentLessonId,
            file: selectedFile,
            mappings: mappings,
        };

        router.post(route('admin.questions.import'), payload, {
            forceFormData: true,
            onFinish: () => {
                setIsSubmitting(false);
            },
            onError: (errs) => {
                const firstErr = Object.values(errs)[0];
                setStepError(typeof firstErr === 'string' ? firstErr : 'Import failed.');
            },
        });
    };

    const isLessonSelected = Boolean(currentLessonId);

    const getFieldColorClass = (field: TargetQuestionField) => {
        switch (field) {
            case 'question_text':
                return 'border-emerald-500 text-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/30';
            case 'question_type':
            case 'type':
                return 'border-indigo-500 text-indigo-800 bg-indigo-50/60 dark:bg-indigo-950/30';
            case 'option_a':
            case 'option_b':
            case 'option_c':
            case 'option_d':
                return 'border-blue-500 text-blue-800 bg-blue-50/60 dark:bg-blue-950/30';
            case 'correct_option':
                return 'border-violet-500 text-violet-800 bg-violet-50/60 dark:bg-violet-950/30';
            case 'explanation':
                return 'border-amber-500 text-amber-800 bg-amber-50/60 dark:bg-amber-950/30';
            case 'ignore':
            default:
                return 'border-stone-300 text-stone-500 bg-white dark:bg-stone-900';
        }
    };

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
                {/* Stepper Progress Bar */}
                <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex items-center justify-between text-xs font-medium">
                    <div className="flex items-center gap-3">
                        <span
                            className={`flex items-center gap-2 ${step === 1
                                    ? 'text-amber-800 font-semibold'
                                    : 'text-stone-500'
                                }`}
                        >
                            <span
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === 1
                                        ? 'bg-amber-600 text-white'
                                        : 'bg-emerald-600 text-white'
                                    }`}
                            >
                                {step > 1 ? '✓' : '1'}
                            </span>
                            <span>{t('questions.import_step_upload')}</span>
                        </span>

                        <span className="text-stone-300">/</span>

                        <span
                            className={`flex items-center gap-2 ${step === 2
                                    ? 'text-amber-800 font-semibold'
                                    : 'text-stone-400'
                                }`}
                        >
                            <span
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === 2
                                        ? 'bg-amber-600 text-white'
                                        : 'bg-stone-200 text-stone-600'
                                    }`}
                            >
                                2
                            </span>
                            <span>{t('questions.import_step_mapping')}</span>
                        </span>
                    </div>

                    {step === 2 && (
                        <button
                            type="button"
                            onClick={() => {
                                setStep(1);
                                setStepError(null);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 hover:bg-stone-50 text-stone-600 text-xs transition"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                            </svg>
                            <span>{t('questions.btn_back_upload')}</span>
                        </button>
                    )}
                </div>

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

                {/* Step / Runtime Error Banner */}
                {stepError && (
                    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl text-xs flex items-center gap-2 shadow-sm">
                        <svg className="w-4 h-4 text-red-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{stepError}</span>
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

                {/* STEP 1: Destination Selection & File Upload */}
                {step === 1 && (
                    <div className="space-y-6">
                        {/* Target Destination Card */}
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
                                <div>
                                    <label className="block font-medium text-gray-700 mb-1.5">
                                        {t('questions.select_target_course')} <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={currentCourseId}
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

                                <div>
                                    <label className="block font-medium text-gray-700 mb-1.5">
                                        {t('questions.select_target_lesson')} <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={currentLessonId}
                                        onChange={(e) => handleLessonChange(e.target.value)}
                                        className={`w-full rounded-xl text-xs py-2.5 transition ${!isLessonSelected
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
                                    <p className="text-stone-500 text-[11px] mt-1.5">
                                        {t('questions.lesson_selection_help')}
                                    </p>
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

                        {/* Download Template Banner */}
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

                        {/* File Upload Area */}
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
                                            handleFileSelect(droppedFile);
                                        }
                                    }}
                                    className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition ${!isLessonSelected
                                            ? 'border-gray-200 bg-gray-50/60 opacity-60 cursor-not-allowed'
                                            : isDragging
                                                ? 'border-amber-500 bg-amber-50/50 cursor-pointer'
                                                : selectedFile
                                                    ? 'border-emerald-400 bg-emerald-50/30 cursor-pointer'
                                                    : 'border-gray-300 hover:border-gray-400 bg-stone-50/40 cursor-pointer'
                                        }`}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
                                        disabled={!isLessonSelected}
                                        onChange={(e) => {
                                            const file = e.target.files?.[0] || null;
                                            handleFileSelect(file);
                                        }}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                    />

                                    {selectedFile ? (
                                        <div className="flex items-center justify-between gap-4 max-w-md mx-auto bg-white p-3.5 rounded-xl border border-emerald-200 shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                                <div className="text-left">
                                                    <p className="font-semibold text-gray-900 text-xs truncate max-w-xs">
                                                        {selectedFile.name}
                                                    </p>
                                                    <p className="text-[11px] text-gray-500">
                                                        {(selectedFile.size / 1024).toFixed(1)} KB
                                                    </p>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleFileSelect(null);
                                                    if (fileInputRef.current) {
                                                        fileInputRef.current.value = '';
                                                    }
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
                            </div>

                            {/* Proceed to Mapping Button */}
                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                <p className="text-xs text-stone-500">
                                    {isLessonSelected && selectedFile ? (
                                        <span className="text-emerald-700 font-medium flex items-center gap-1.5">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                            Ready to map columns and preview
                                        </span>
                                    ) : (
                                        <span>Select lesson and file to proceed</span>
                                    )}
                                </p>

                                <button
                                    type="button"
                                    onClick={handleProceedToMapping}
                                    disabled={!isLessonSelected || !selectedFile || isLoadingPreview}
                                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-medium text-xs shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                    {isLoadingPreview && (
                                        <svg className="animate-spin -ml-1 mr-1 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                                        </svg>
                                    )}
                                    <span>
                                        {isLoadingPreview
                                            ? t('questions.analyzing_file')
                                            : t('questions.btn_proceed_mapping')}
                                    </span>
                                    {!isLoadingPreview && (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Quick Reference Rules Cards */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
                            <h4 className="font-semibold text-gray-900 text-xs tracking-wider uppercase">
                                {t('questions.import_guide_title')}
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 space-y-2">
                                    <div className="flex items-center gap-2 font-bold text-blue-900">
                                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                                        <span>{t('questions.badge_quiz')} (quiz)</span>
                                    </div>
                                    <ul className="space-y-1.5 text-blue-950 text-[11px] list-disc list-inside">
                                        <li>Map <code className="bg-blue-100 px-1 py-0.5 rounded font-mono">question_type</code> or leave empty to default to <strong>quiz</strong>.</li>
                                        <li>Map 4 answer options: <code className="bg-blue-100 px-1 py-0.5 rounded font-mono">option_a</code> through <code className="bg-blue-100 px-1 py-0.5 rounded font-mono">option_d</code>.</li>
                                        <li>Map <code className="bg-blue-100 px-1 py-0.5 rounded font-mono">correct_option</code> containing <strong>A</strong>, <strong>B</strong>, <strong>C</strong>, or <strong>D</strong>.</li>
                                        <li>Optional <code className="bg-blue-100 px-1 py-0.5 rounded font-mono">explanation</code> explains the answer to students.</li>
                                    </ul>
                                </div>

                                <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 space-y-2">
                                    <div className="flex items-center gap-2 font-bold text-amber-900">
                                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                                        <span>{t('questions.badge_essay')} (essay)</span>
                                    </div>
                                    <ul className="space-y-1.5 text-amber-950 text-[11px] list-disc list-inside">
                                        <li>Set or map <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">question_type</code> to <strong>essay</strong>.</li>
                                        <li>Multiple choice options and correct option can be left unmapped or blank.</li>
                                        <li>Use <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">explanation</code> for sample answers, scripture citations, or grading rubric.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 2: Field Mapping & Preview */}
                {step === 2 && previewData && (
                    <form onSubmit={handleSubmitImport} className="space-y-6">
                        {/* Target & File Summary Bar */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                                <div>
                                    <span className="text-gray-400 block text-[11px] uppercase tracking-wider">
                                        {t('questions.target_summary_course')}
                                    </span>
                                    <span className="font-semibold text-gray-800 truncate block mt-0.5" title={currentCourse?.title}>
                                        {currentCourse?.title}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-400 block text-[11px] uppercase tracking-wider">
                                        {t('questions.target_summary_lesson')}
                                    </span>
                                    <span className="font-semibold text-gray-800 truncate block mt-0.5" title={currentLesson?.title}>
                                        #{currentLesson?.id} - {currentLesson?.title}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-400 block text-[11px] uppercase tracking-wider">
                                        {t('questions.target_summary_file')}
                                    </span>
                                    <span className="font-semibold text-gray-800 truncate block mt-0.5" title={selectedFile?.name}>
                                        {selectedFile?.name} ({((selectedFile?.size || 0) / 1024).toFixed(1)} KB)
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-400 block text-[11px] uppercase tracking-wider">
                                        {t('questions.target_summary_rows')}
                                    </span>
                                    <span className="font-bold text-emerald-700 block mt-0.5">
                                        {previewData.total_rows} questions
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Mapping Configuration Card */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
                            <div className="border-b border-gray-100 pb-3">
                                <h3 className="font-semibold text-gray-900 text-sm">
                                    {t('questions.mapping_title')}
                                </h3>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {t('questions.mapping_desc')}
                                </p>
                            </div>

                            {/* Mapping Table */}
                            <div className="border border-stone-200 rounded-xl overflow-hidden shadow-sm">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-stone-100 text-stone-600 uppercase font-semibold text-[11px]">
                                        <tr>
                                            <th className="py-3 px-4 w-1/4">
                                                {t('questions.mapping_header_excel')}
                                            </th>
                                            <th className="py-3 px-4 w-1/2">
                                                {t('questions.mapping_header_sample')}
                                            </th>
                                            <th className="py-3 px-4 w-1/4">
                                                {t('questions.mapping_header_assign')}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-stone-200">
                                        {previewData.headers.map((hName) => {
                                            const sampleVal = previewData.preview_rows[0]?.[hName] || '';
                                            const currentField = mappings[hName] || 'ignore';

                                            return (
                                                <tr key={hName} className="hover:bg-stone-50 transition">
                                                    <td className="py-3 px-4 font-semibold text-stone-900">
                                                        {hName}
                                                    </td>
                                                    <td
                                                        className="py-3 px-4 text-stone-500 font-mono text-[11px] truncate max-w-xs"
                                                        title={sampleVal}
                                                    >
                                                        {sampleVal ? (
                                                            sampleVal.length > 70
                                                                ? sampleVal.substring(0, 70) + '...'
                                                                : sampleVal
                                                        ) : (
                                                            <span className="italic text-stone-400">Empty</span>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <select
                                                            value={currentField}
                                                            onChange={(e) =>
                                                                handleMappingChange(
                                                                    hName,
                                                                    e.target.value as TargetQuestionField
                                                                )
                                                            }
                                                            className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-medium focus:ring-2 focus:ring-amber-500 ${getFieldColorClass(
                                                                currentField
                                                            )}`}
                                                        >
                                                            <option value="ignore">
                                                                {t('questions.field_ignore')}
                                                            </option>
                                                            <option value="question_text">
                                                                {t('questions.field_question_text')}
                                                            </option>
                                                            <option value="question_type">
                                                                {t('questions.field_question_type')}
                                                            </option>
                                                            <option value="option_a">
                                                                {t('questions.field_option_a')}
                                                            </option>
                                                            <option value="option_b">
                                                                {t('questions.field_option_b')}
                                                            </option>
                                                            <option value="option_c">
                                                                {t('questions.field_option_c')}
                                                            </option>
                                                            <option value="option_d">
                                                                {t('questions.field_option_d')}
                                                            </option>
                                                            <option value="correct_option">
                                                                {t('questions.field_correct_option')}
                                                            </option>
                                                            <option value="explanation">
                                                                {t('questions.field_explanation')}
                                                            </option>
                                                            <option value="type">
                                                                {t('questions.field_type')}
                                                            </option>
                                                        </select>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Data Preview Card */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
                            <h4 className="font-semibold text-gray-900 text-xs tracking-wider uppercase">
                                {t('questions.preview_rows_title', {
                                    count: String(previewData.total_rows),
                                })}
                            </h4>

                            <div className="border border-stone-200 rounded-xl p-3 bg-stone-50 max-h-64 overflow-y-auto space-y-2.5 text-xs">
                                {previewData.preview_rows.map((row, idx) => {
                                    const textCol = Object.keys(mappings).find((k) => mappings[k] === 'question_text');
                                    const typeCol = Object.keys(mappings).find((k) => mappings[k] === 'question_type');
                                    const optACol = Object.keys(mappings).find((k) => mappings[k] === 'option_a');
                                    const optBCol = Object.keys(mappings).find((k) => mappings[k] === 'option_b');
                                    const optCCol = Object.keys(mappings).find((k) => mappings[k] === 'option_c');
                                    const optDCol = Object.keys(mappings).find((k) => mappings[k] === 'option_d');
                                    const correctCol = Object.keys(mappings).find((k) => mappings[k] === 'correct_option');

                                    const qText = textCol ? row[textCol] || `Row ${idx + 1}` : `Row ${idx + 1}`;
                                    const rawType = (typeCol ? row[typeCol] || 'quiz' : 'quiz').toLowerCase();
                                    const isEssay = rawType.includes('essay') || rawType.includes('luan');
                                    const correct = correctCol ? row[correctCol] : '';

                                    return (
                                        <div
                                            key={idx}
                                            className="p-3 rounded-xl bg-white border border-stone-200 space-y-1.5 shadow-xs"
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="font-semibold text-stone-900 flex-1">
                                                    <span className="text-stone-400 mr-1.5">#{idx + 1}</span>
                                                    {qText}
                                                </div>
                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    <span
                                                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${isEssay
                                                                ? 'bg-amber-100 text-amber-800'
                                                                : 'bg-blue-100 text-blue-800'
                                                            }`}
                                                    >
                                                        {isEssay ? 'essay' : 'quiz'}
                                                    </span>
                                                    {correct && (
                                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                                            Ans: {correct}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {!isEssay && (
                                                <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-600 pl-4 border-l-2 border-stone-200">
                                                    <div>A: {optACol ? row[optACol] || '—' : '—'}</div>
                                                    <div>B: {optBCol ? row[optBCol] || '—' : '—'}</div>
                                                    <div>C: {optCCol ? row[optCCol] || '—' : '—'}</div>
                                                    <div>D: {optDCol ? row[optDCol] || '—' : '—'}</div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Submit & Back Controls */}
                        <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                            <button
                                type="button"
                                onClick={() => {
                                    setStep(1);
                                    setStepError(null);
                                }}
                                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 font-medium text-xs transition"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                </svg>
                                <span>{t('questions.btn_back_upload')}</span>
                            </button>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                {isSubmitting && (
                                    <svg className="animate-spin -ml-1 mr-1 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                                    </svg>
                                )}
                                <span>
                                    {isSubmitting
                                        ? t('questions.importing')
                                        : t('questions.import_submit')}
                                </span>
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
