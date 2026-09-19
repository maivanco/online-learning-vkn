import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { useTranslation } from '@/utils/useTranslation';
import RichTextEditor from '@/Components/RichTextEditor';

export interface ResourceItem {
    title: string;
    url: string;
}

export interface LessonItem {
    id: number;
    course_id: number;
    title: string;
    slug: string;
    order: number;
    summary: string | null;
    reading_content: string | null;
    reading_file_url: string | null;
    document_urls: ResourceItem[];
    video_url: string | null;
    video_urls: ResourceItem[];
    feedbacks_count: number;
    questions_count: number;
    updated_at: string;
}

interface LessonFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    courseId: number | string;
    courseTitle?: string;
    lesson?: LessonItem | null;
    nextOrder?: number;
    onDeleteRequest?: (lesson: LessonItem) => void;
}

export default function LessonFormModal({
    isOpen,
    onClose,
    courseId,
    courseTitle,
    lesson,
    nextOrder = 1,
    onDeleteRequest,
}: LessonFormModalProps) {
    const t = useTranslation();
    const isEdit = Boolean(lesson);

    const form = useForm({
        course_id: courseId,
        title: '',
        summary: '',
        reading_content: '',
        document_urls: [] as ResourceItem[],
        video_urls: [] as ResourceItem[],
        order: nextOrder,
    });

    // Reset/populate form whenever modal opens or active lesson changes
    useEffect(() => {
        if (isOpen) {
            if (lesson) {
                const initialDocs = (lesson.document_urls && lesson.document_urls.length > 0)
                    ? lesson.document_urls
                    : (lesson.reading_file_url ? [{ title: 'Tài liệu / Document', url: lesson.reading_file_url }] : []);

                const initialVideos = (lesson.video_urls && lesson.video_urls.length > 0)
                    ? lesson.video_urls
                    : (lesson.video_url ? [{ title: 'Video bài giảng / Lecture Video', url: lesson.video_url }] : []);

                form.setData({
                    course_id: lesson.course_id,
                    title: lesson.title,
                    summary: lesson.summary || '',
                    reading_content: lesson.reading_content || '',
                    document_urls: initialDocs,
                    video_urls: initialVideos,
                    order: lesson.order,
                });
            } else {
                form.setData({
                    course_id: courseId,
                    title: '',
                    summary: '',
                    reading_content: '',
                    document_urls: [],
                    video_urls: [],
                    order: nextOrder,
                });
            }
            form.clearErrors();
        }
    }, [isOpen, lesson, courseId, nextOrder]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEdit && lesson) {
            form.put(route('admin.materials.update', lesson.id), {
                onSuccess: () => {
                    onClose();
                },
            });
        } else {
            form.post(route('admin.materials.store'), {
                onSuccess: () => {
                    form.reset();
                    onClose();
                },
            });
        }
    };

    // Document URLs item helpers
    const handleAddDocument = () => {
        form.setData('document_urls', [
            ...form.data.document_urls,
            { title: '', url: '' },
        ]);
    };

    const handleUpdateDocument = (index: number, field: keyof ResourceItem, value: string) => {
        const updated = [...form.data.document_urls];
        updated[index] = { ...updated[index], [field]: value };
        form.setData('document_urls', updated);
    };

    const handleRemoveDocument = (index: number) => {
        form.setData(
            'document_urls',
            form.data.document_urls.filter((_, i) => i !== index)
        );
    };

    // Video URLs item helpers
    const handleAddVideo = () => {
        form.setData('video_urls', [
            ...form.data.video_urls,
            { title: '', url: '' },
        ]);
    };

    const handleUpdateVideo = (index: number, field: keyof ResourceItem, value: string) => {
        const updated = [...form.data.video_urls];
        updated[index] = { ...updated[index], [field]: value };
        form.setData('video_urls', updated);
    };

    const handleRemoveVideo = (index: number) => {
        form.setData(
            'video_urls',
            form.data.video_urls.filter((_, i) => i !== index)
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto text-xs">
                {/* Header */}
                <div className="flex items-center justify-between border-b pb-3">
                    <div>
                        <h3 className="font-serif font-bold text-base text-gray-900">
                            {isEdit ? t('materials.modal_edit_lesson_title') : t('materials.modal_create_lesson_title')}
                        </h3>
                        {courseTitle && (
                            <p className="text-[11px] text-amber-800 font-medium mt-0.5">
                                {courseTitle}
                            </p>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-1"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Title & Order */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-2">
                            <label className="block font-medium text-gray-700 mb-1">
                                {t('materials.lesson_title_label')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={form.data.title}
                                onChange={(e) => form.setData('title', e.target.value)}
                                placeholder={t('materials.lesson_title_placeholder')}
                                className="w-full rounded-lg border-gray-300 text-xs focus:ring-amber-500 focus:border-amber-500"
                                required
                            />
                            {form.errors.title && (
                                <p className="text-red-600 text-[11px] mt-1">{form.errors.title}</p>
                            )}
                        </div>
                        <div>
                            <label className="block font-medium text-gray-700 mb-1">
                                {t('materials.order_index_label')}
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={form.data.order}
                                onChange={(e) => form.setData('order', Number(e.target.value))}
                                className="w-full rounded-lg border-gray-300 text-xs focus:ring-amber-500 focus:border-amber-500"
                            />
                            {form.errors.order && (
                                <p className="text-red-600 text-[11px] mt-1">{form.errors.order}</p>
                            )}
                        </div>
                    </div>

                    {/* Summary */}
                    <div>
                        <label className="block font-medium text-gray-700 mb-1">
                            {t('materials.summary_label')}
                        </label>
                        <input
                            type="text"
                            value={form.data.summary}
                            onChange={(e) => form.setData('summary', e.target.value)}
                            placeholder={t('materials.summary_placeholder')}
                            className="w-full rounded-lg border-gray-300 text-xs focus:ring-amber-500 focus:border-amber-500"
                        />
                        {form.errors.summary && (
                            <p className="text-red-600 text-[11px] mt-1">{form.errors.summary}</p>
                        )}
                    </div>

                    {/* Reading Content */}
                    <div>
                        <label className="block font-medium text-gray-700 mb-1">
                            {t('materials.reading_content_label')} <span className="text-red-500">*</span>
                        </label>
                        <RichTextEditor
                            value={form.data.reading_content}
                            onChange={(html) => form.setData('reading_content', html)}
                            placeholder={t('materials.reading_content_placeholder')}
                            minHeight="180px"
                            error={form.errors.reading_content}
                        />
                    </div>

                    {/* Multiple Document URLs */}
                    <div className="bg-stone-50 rounded-xl p-3.5 border border-stone-200 space-y-2.5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 font-semibold text-stone-800">
                                <svg className="w-4 h-4 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span>{t('materials.document_urls_section_title')}</span>
                            </div>
                            <button
                                type="button"
                                onClick={handleAddDocument}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-medium text-[11px] transition"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                </svg>
                                {t('materials.add_document_btn')}
                            </button>
                        </div>

                        {form.data.document_urls.length === 0 ? (
                            <p className="text-[11px] text-gray-400 italic py-1">
                                {t('materials.no_documents_yet')}
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {form.data.document_urls.map((doc, idx) => (
                                    <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-stone-200">
                                        <div className="w-1/3">
                                            <input
                                                type="text"
                                                value={doc.title}
                                                onChange={(e) => handleUpdateDocument(idx, 'title', e.target.value)}
                                                placeholder={t('materials.document_title_placeholder')}
                                                className="w-full rounded-md border-gray-300 text-xs focus:ring-amber-500 focus:border-amber-500"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <input
                                                type="url"
                                                value={doc.url}
                                                onChange={(e) => handleUpdateDocument(idx, 'url', e.target.value)}
                                                placeholder={t('materials.document_url_placeholder')}
                                                className="w-full rounded-md border-gray-300 text-xs font-mono focus:ring-amber-500 focus:border-amber-500"
                                                required
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveDocument(idx)}
                                            className="p-1.5 text-stone-400 hover:text-red-600 rounded-md hover:bg-red-50 transition"
                                            title={t('materials.remove_item')}
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Multiple Video URLs */}
                    <div className="bg-stone-50 rounded-xl p-3.5 border border-stone-200 space-y-2.5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 font-semibold text-stone-800">
                                <svg className="w-4 h-4 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                <span>{t('materials.video_urls_section_title')}</span>
                            </div>
                            <button
                                type="button"
                                onClick={handleAddVideo}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-medium text-[11px] transition"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                </svg>
                                {t('materials.add_video_btn')}
                            </button>
                        </div>

                        {form.data.video_urls.length === 0 ? (
                            <p className="text-[11px] text-gray-400 italic py-1">
                                {t('materials.no_videos_yet')}
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {form.data.video_urls.map((vid, idx) => (
                                    <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-stone-200">
                                        <div className="w-1/3">
                                            <input
                                                type="text"
                                                value={vid.title}
                                                onChange={(e) => handleUpdateVideo(idx, 'title', e.target.value)}
                                                placeholder={t('materials.video_title_placeholder')}
                                                className="w-full rounded-md border-gray-300 text-xs focus:ring-amber-500 focus:border-amber-500"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <input
                                                type="url"
                                                value={vid.url}
                                                onChange={(e) => handleUpdateVideo(idx, 'url', e.target.value)}
                                                placeholder={t('materials.video_url_placeholder')}
                                                className="w-full rounded-md border-gray-300 text-xs font-mono focus:ring-amber-500 focus:border-amber-500"
                                                required
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveVideo(idx)}
                                            className="p-1.5 text-stone-400 hover:text-red-600 rounded-md hover:bg-red-50 transition"
                                            title={t('materials.remove_item')}
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-3 border-t">
                        {isEdit && lesson && onDeleteRequest ? (
                            <button
                                type="button"
                                onClick={() => {
                                    onClose();
                                    onDeleteRequest(lesson);
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 font-medium transition"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                {t('materials.btn_delete_lesson')}
                            </button>
                        ) : (
                            <div></div>
                        )}

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
                            >
                                {t('materials.cancel')}
                            </button>
                            <button
                                type="submit"
                                disabled={form.processing}
                                className="px-4 py-2 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-medium shadow transition disabled:opacity-50"
                            >
                                {form.processing
                                    ? t('materials.saving')
                                    : (isEdit ? t('materials.update_lesson') : t('materials.save_lesson'))}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
