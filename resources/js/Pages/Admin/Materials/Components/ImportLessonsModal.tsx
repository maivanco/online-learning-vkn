import React, { useState, useRef } from 'react';
import { useForm, router } from '@inertiajs/react';
import { useTranslation } from '@/utils/useTranslation';

interface CourseOption {
    id: number;
    title: string;
}

interface ImportLessonsModalProps {
    isOpen: boolean;
    onClose: () => void;
    courses: CourseOption[];
    initialCourseId?: number | null;
}

interface PreviewResponse {
    success: boolean;
    headers: string[];
    preview_rows: Array<Record<string, string | null>>;
    total_rows: number;
    suggested_mappings: Record<string, string>;
    suggested_course_title: string | null;
}

type TargetField =
    | 'ignore'
    | 'title'
    | 'order'
    | 'summary'
    | 'reading_content'
    | 'video_urls'
    | 'document_urls';

export default function ImportLessonsModal({
    isOpen,
    onClose,
    courses,
    initialCourseId,
}: ImportLessonsModalProps) {
    const t = useTranslation();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Step state: 1 = File & Course, 2 = Mapping & Preview
    const [step, setStep] = useState<1 | 2>(1);

    // Step 1 state
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [courseMode, setCourseMode] = useState<'existing' | 'new'>('existing');
    const [selectedCourseId, setSelectedCourseId] = useState<number | string>(
        initialCourseId || (courses.length > 0 ? courses[0].id : '')
    );
    const [newCourseTitle, setNewCourseTitle] = useState('');
    const [newCourseCategory, setNewCourseCategory] = useState('dhamma');
    const [newCourseDescription, setNewCourseDescription] = useState('');

    // Preview / Step 2 state
    const [isLoadingPreview, setIsLoadingPreview] = useState(false);
    const [previewData, setPreviewData] = useState<PreviewResponse | null>(null);
    const [mappings, setMappings] = useState<Record<string, TargetField>>({});
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Form submission
    const { post, processing } = useForm();

    if (!isOpen) return null;

    const resetState = () => {
        setStep(1);
        setSelectedFile(null);
        setPreviewData(null);
        setMappings({});
        setErrorMessage(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleClose = () => {
        resetState();
        onClose();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
            setErrorMessage(null);
        }
    };

    const handleProceedToMapping = async () => {
        if (!selectedFile) {
            setErrorMessage(t('materials.import_file_label') + ' is required.');
            return;
        }

        if (courseMode === 'existing' && !selectedCourseId) {
            setErrorMessage(t('materials.course_selection_required'));
            return;
        }

        if (courseMode === 'new' && !newCourseTitle.trim()) {
            setErrorMessage(t('materials.course_selection_required'));
            return;
        }

        setIsLoadingPreview(true);
        setErrorMessage(null);

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const token = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;
            const res = await fetch(route('admin.materials.import-preview'), {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': token || '',
                },
                body: formData,
            });

            const data = await res.json();
            if (!res.ok || !data.success) {
                setErrorMessage(data.message || 'Failed to analyze spreadsheet.');
                setIsLoadingPreview(false);
                return;
            }

            setPreviewData(data);
            setMappings(data.suggested_mappings || {});

            // If user hasn't typed a new course title yet and spreadsheet suggested one, prefill it
            if (data.suggested_course_title && !newCourseTitle.trim()) {
                setNewCourseTitle(data.suggested_course_title);
            }

            setStep(2);
        } catch (err: any) {
            setErrorMessage(err.message || 'Network error occurred while analyzing the file.');
        } finally {
            setIsLoadingPreview(false);
        }
    };

    const handleMappingChange = (header: string, field: TargetField) => {
        setMappings((prev) => ({
            ...prev,
            [header]: field,
        }));
    };

    const handleSubmitImport = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile) return;

        // Ensure at least one column is mapped to 'title'
        const hasTitle = Object.values(mappings).includes('title');
        if (!hasTitle) {
            setErrorMessage(t('materials.title_mapping_required'));
            return;
        }

        const payload: Record<string, any> = {
            file: selectedFile,
            course_mode: courseMode,
            mappings: mappings,
        };

        if (courseMode === 'existing') {
            payload.course_id = selectedCourseId;
        } else {
            payload.new_course_title = newCourseTitle;
            payload.new_course_category = newCourseCategory;
            payload.new_course_description = newCourseDescription;
        }

        router.post(route('admin.materials.import'), payload, {
            forceFormData: true,
            onSuccess: () => {
                handleClose();
            },
            onError: (errs) => {
                const firstErr = Object.values(errs)[0];
                setErrorMessage(typeof firstErr === 'string' ? firstErr : 'Import failed.');
            },
        });
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-4xl w-full shadow-2xl border border-stone-200 dark:border-stone-800 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                {/* Header */}
                <div className="px-6 py-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50/50 dark:bg-stone-900/50">
                    <div>
                        <h2 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                            <span className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                            </span>
                            {t('materials.modal_import_title')}
                        </h2>
                        <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                            {t('materials.modal_import_subtitle')}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleClose}
                        className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Stepper indicator */}
                <div className="flex border-b border-stone-200 dark:border-stone-800 bg-stone-100/50 dark:bg-stone-950/50 px-6 py-2.5 text-xs font-medium">
                    <span className={`flex items-center gap-1.5 ${step === 1 ? 'text-amber-700 dark:text-amber-400 font-semibold' : 'text-stone-500 dark:text-stone-400'}`}>
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 1 ? 'bg-amber-600 text-white' : 'bg-stone-300 dark:bg-stone-700 text-stone-700 dark:text-stone-300'}`}>1</span>
                        {t('materials.import_step_upload')}
                    </span>
                    <span className="mx-3 text-stone-300 dark:text-stone-700">/</span>
                    <span className={`flex items-center gap-1.5 ${step === 2 ? 'text-amber-700 dark:text-amber-400 font-semibold' : 'text-stone-500 dark:text-stone-400'}`}>
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 2 ? 'bg-amber-600 text-white' : 'bg-stone-300 dark:bg-stone-700 text-stone-700 dark:text-stone-300'}`}>2</span>
                        {t('materials.import_step_mapping')}
                    </span>
                </div>

                {/* Error Banner */}
                {errorMessage && (
                    <div className="mx-6 mt-4 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl text-rose-700 dark:text-rose-300 text-sm flex items-start gap-2.5">
                        <svg className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{errorMessage}</span>
                    </div>
                )}

                {/* Body Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {step === 1 && (
                        <div className="space-y-6">
                            {/* Template Download Callout Banner */}
                            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-start gap-3">
                                    <span className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 flex-shrink-0">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </span>
                                    <div>
                                        <div className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                                            {t('materials.download_template_hint')}
                                        </div>
                                        <div className="text-xs text-amber-700/80 dark:text-amber-400 mt-0.5">
                                            Includes sample sessions, videos, slides, PDFs and an instructions guide tab.
                                        </div>
                                    </div>
                                </div>
                                <a
                                    href={route('admin.materials.template')}
                                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition flex-shrink-0"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    <span>{t('materials.btn_download_template')}</span>
                                </a>
                            </div>

                            {/* File Upload Area */}
                            <div>
                                <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                                    {t('materials.import_file_label')} <span className="text-rose-500">*</span>
                                </label>
                                <div className="border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-amber-500 dark:hover:border-amber-400 rounded-xl p-6 text-center bg-stone-50/50 dark:bg-stone-900/30 transition cursor-pointer"
                                     onClick={() => fileInputRef.current?.click()}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".xlsx,.xls,.csv"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                    <div className="flex flex-col items-center">
                                        <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center mb-2">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        {selectedFile ? (
                                            <div className="text-sm font-medium text-stone-900 dark:text-stone-100">
                                                {selectedFile.name}
                                                <span className="block text-xs text-stone-500 dark:text-stone-400 font-normal mt-0.5">
                                                    {(selectedFile.size / 1024).toFixed(1)} KB — Click to change file
                                                </span>
                                            </div>
                                        ) : (
                                            <>
                                                <p className="text-sm font-medium text-stone-700 dark:text-stone-300">
                                                    Click to select or drag and drop your spreadsheet
                                                </p>
                                                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                                                    {t('materials.import_file_help')}
                                                </p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Target Course Mode */}
                            <div>
                                <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">
                                    {t('materials.target_course_label')} <span className="text-rose-500">*</span>
                                </label>
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    <button
                                        type="button"
                                        onClick={() => setCourseMode('existing')}
                                        className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition ${
                                            courseMode === 'existing'
                                                ? 'border-amber-600 bg-amber-50/60 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 ring-1 ring-amber-600'
                                                : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 text-stone-700 dark:text-stone-300'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="course_mode"
                                            checked={courseMode === 'existing'}
                                            onChange={() => setCourseMode('existing')}
                                            className="mt-0.5 text-amber-600 focus:ring-amber-500"
                                        />
                                        <div>
                                            <div className="font-semibold text-sm">
                                                {t('materials.target_course_existing')}
                                            </div>
                                            <div className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                                                Append or update lessons inside an already established catalog.
                                            </div>
                                        </div>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setCourseMode('new')}
                                        className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition ${
                                            courseMode === 'new'
                                                ? 'border-amber-600 bg-amber-50/60 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 ring-1 ring-amber-600'
                                                : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 text-stone-700 dark:text-stone-300'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="course_mode"
                                            checked={courseMode === 'new'}
                                            onChange={() => setCourseMode('new')}
                                            className="mt-0.5 text-amber-600 focus:ring-amber-500"
                                        />
                                        <div>
                                            <div className="font-semibold text-sm">
                                                {t('materials.target_course_new')}
                                            </div>
                                            <div className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                                                Create a fresh course catalog entry for these imported units.
                                            </div>
                                        </div>
                                    </button>
                                </div>

                                {/* Existing course dropdown */}
                                {courseMode === 'existing' && (
                                    <div className="space-y-1.5">
                                        <select
                                            value={selectedCourseId}
                                            onChange={(e) => setSelectedCourseId(e.target.value)}
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                        >
                                            {courses.map((c) => (
                                                <option key={c.id} value={c.id}>
                                                    {c.title}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {/* New course form inputs */}
                                {courseMode === 'new' && (
                                    <div className="p-4 bg-stone-50 dark:bg-stone-800/40 rounded-xl border border-stone-200 dark:border-stone-800 space-y-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                                                {t('materials.new_course_title_label')} <span className="text-rose-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={newCourseTitle}
                                                onChange={(e) => setNewCourseTitle(e.target.value)}
                                                placeholder="e.g. Vi Diệu Pháp (Abhidhamma)"
                                                className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-sm focus:ring-2 focus:ring-amber-500"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                                                    {t('materials.new_course_category_label')}
                                                </label>
                                                <select
                                                    value={newCourseCategory}
                                                    onChange={(e) => setNewCourseCategory(e.target.value)}
                                                    className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-sm focus:ring-2 focus:ring-amber-500"
                                                >
                                                    <option value="dhamma">Dhamma (Pháp học)</option>
                                                    <option value="abhidhamma">Abhidhamma (Vi Diệu Pháp)</option>
                                                    <option value="vinaya">Vinaya (Luật Tạng)</option>
                                                    <option value="pali">Pali (Ngôn ngữ Pali)</option>
                                                    <option value="general">General (Phật học Thường thức)</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                                                    {t('materials.new_course_description_label')}
                                                </label>
                                                <input
                                                    type="text"
                                                    value={newCourseDescription}
                                                    onChange={(e) => setNewCourseDescription(e.target.value)}
                                                    placeholder="Giảng sư: Ni sư Liễu Pháp..."
                                                    className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-sm focus:ring-2 focus:ring-amber-500"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {step === 2 && previewData && (
                        <div className="space-y-6">
                            {/* Notice regarding multi-column merge */}
                            <div className="p-3 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                                <svg className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{t('materials.merged_document_urls_hint')}</span>
                            </div>

                            {/* Column Mapping Table */}
                            <div className="border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden shadow-sm">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-stone-100 dark:bg-stone-800 text-xs font-semibold text-stone-600 dark:text-stone-300 uppercase">
                                        <tr>
                                            <th className="py-2.5 px-4 w-1/4">
                                                {t('materials.mapping_header_excel')}
                                            </th>
                                            <th className="py-2.5 px-4 w-1/2">
                                                {t('materials.mapping_header_sample')}
                                            </th>
                                            <th className="py-2.5 px-4 w-1/4">
                                                {t('materials.mapping_header_assign')}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
                                        {previewData.headers.map((hName) => {
                                            const sampleVal = previewData.preview_rows[0]?.[hName] || '';
                                            const currentMapping = mappings[hName] || 'ignore';

                                            return (
                                                <tr key={hName} className="hover:bg-stone-50 dark:hover:bg-stone-800/40">
                                                    <td className="py-3 px-4 font-medium text-stone-900 dark:text-stone-100">
                                                        {hName}
                                                    </td>
                                                    <td className="py-3 px-4 text-xs text-stone-500 dark:text-stone-400 font-mono truncate max-w-xs" title={sampleVal}>
                                                        {sampleVal ? (sampleVal.length > 80 ? sampleVal.substring(0, 80) + '...' : sampleVal) : <span className="italic text-stone-400">Empty</span>}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <select
                                                            value={currentMapping}
                                                            onChange={(e) => handleMappingChange(hName, e.target.value as TargetField)}
                                                            className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-medium focus:ring-2 focus:ring-amber-500 ${
                                                                currentMapping === 'title'
                                                                    ? 'border-emerald-500 text-emerald-800 dark:text-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/30'
                                                                    : currentMapping === 'document_urls' || currentMapping === 'video_urls'
                                                                    ? 'border-amber-500 text-amber-800 dark:text-amber-300 bg-amber-50/50 dark:bg-amber-950/30'
                                                                    : currentMapping === 'ignore'
                                                                    ? 'border-stone-300 dark:border-stone-700 text-stone-500 bg-white dark:bg-stone-900'
                                                                    : 'border-blue-500 text-blue-800 dark:text-blue-300 bg-blue-50/50 dark:bg-blue-950/30'
                                                            }`}
                                                        >
                                                            <option value="ignore">{t('materials.field_ignore')}</option>
                                                            <option value="title">{t('materials.field_title')}</option>
                                                            <option value="order">{t('materials.field_order')}</option>
                                                            <option value="document_urls">{t('materials.field_document_urls')}</option>
                                                            <option value="video_urls">{t('materials.field_video_urls')}</option>
                                                            <option value="summary">{t('materials.field_summary')}</option>
                                                            <option value="reading_content">{t('materials.field_reading_content')}</option>
                                                        </select>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Preview first rows */}
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2">
                                    {t('materials.preview_box_title', { count: previewData.total_rows.toString() })}
                                </h4>
                                <div className="border border-stone-200 dark:border-stone-800 rounded-xl p-3 bg-stone-50 dark:bg-stone-950/60 max-h-48 overflow-y-auto space-y-2 text-xs">
                                    {previewData.preview_rows.map((row, idx) => {
                                        // Find title column
                                        const titleCol = Object.keys(mappings).find((k) => mappings[k] === 'title');
                                        const titleVal = titleCol ? (row[titleCol] || '').replace(/[\r\n\t]+/g, ' ').trim() : `Row ${idx + 1}`;

                                        return (
                                            <div key={idx} className="p-2.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center justify-between">
                                                <div className="font-semibold text-stone-800 dark:text-stone-200 truncate pr-3">
                                                    #{idx + 1}: {titleVal}
                                                </div>
                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 font-mono">
                                                    Ready
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Controls */}
                <div className="px-6 py-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50/50 dark:bg-stone-900/50">
                    <button
                        type="button"
                        onClick={step === 2 ? () => setStep(1) : handleClose}
                        className="px-4 py-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 text-sm font-medium transition"
                    >
                        {step === 2 ? t('materials.btn_back_upload') : t('materials.cancel')}
                    </button>

                    <div>
                        {step === 1 ? (
                            <button
                                type="button"
                                disabled={!selectedFile || isLoadingPreview}
                                onClick={handleProceedToMapping}
                                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:bg-amber-300 dark:disabled:bg-stone-800 text-white text-sm font-semibold shadow-sm transition flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                            >
                                {isLoadingPreview && (
                                    <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                                    </svg>
                                )}
                                {isLoadingPreview ? t('materials.uploading_preview') : t('materials.btn_next_mapping')}
                            </button>
                        ) : (
                            <button
                                type="button"
                                disabled={processing}
                                onClick={handleSubmitImport}
                                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 dark:disabled:bg-stone-800 text-white text-sm font-semibold shadow-sm transition flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                            >
                                {processing && (
                                    <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                                    </svg>
                                )}
                                {processing ? t('materials.importing') : t('materials.btn_execute_import')}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
