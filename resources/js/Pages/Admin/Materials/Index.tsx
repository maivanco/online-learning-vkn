import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useTranslation } from '@/utils/useTranslation';
import RichTextEditor from '@/Components/RichTextEditor';
import LessonFormModal, { LessonItem } from './Components/LessonFormModal';

interface Course {
    id: number;
    title: string;
    slug: string;
    category: string;
    description: string | null;
    parent_id: number | null;
    parent: {
        id: number;
        title: string;
    } | null;
    user?: {
        id: number;
        name: string;
        username: string;
    } | null;
    lessons_count: number;
    order: number;
}

function slugify(text: string): string {
    return text
        .toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/[\s_]+/g, '-')
        .replace(/-+/g, '-');
}

interface FeedbackItem {
    id: number;
    content: string;
    status: 'pending' | 'reviewed' | 'resolved';
    admin_notes: string | null;
    created_at: string;
    user: {
        id: number;
        name: string;
        username: string;
    };
    lesson: {
        id: number;
        title: string;
        course_title: string;
    };
}

interface MaterialsProps extends PageProps {
    courses: Course[];
    activeCourse: Course | null;
    lessons: LessonItem[];
    feedbacks: FeedbackItem[];
}

export default function MaterialsIndex({ auth, courses, activeCourse, lessons, feedbacks, flash }: MaterialsProps) {
    const t = useTranslation();
    const [selectedLessonForEdit, setSelectedLessonForEdit] = useState<LessonItem | null>(null);
    const [selectedLessonForDelete, setSelectedLessonForDelete] = useState<LessonItem | null>(null);
    const [isCreateLessonModalOpen, setIsCreateLessonModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'materials' | 'feedbacks'>('materials');

    // Courses Catalog State
    const [isCreateCatalogModalOpen, setIsCreateCatalogModalOpen] = useState(false);
    const [selectedCatalogForEdit, setSelectedCatalogForEdit] = useState<Course | null>(null);
    const [selectedCatalogForDelete, setSelectedCatalogForDelete] = useState<Course | null>(null);

    const createCatalogForm = useForm({
        title: '',
        slug: '',
        description: '',
        parent_id: '',
        category: 'general',
    });

    const editCatalogForm = useForm({
        title: '',
        slug: '',
        description: '',
        parent_id: '',
        category: 'general',
    });

    const handleCreateCatalog = (e: React.FormEvent) => {
        e.preventDefault();
        createCatalogForm.post(route('admin.materials.catalogs.store'), {
            onSuccess: () => {
                setIsCreateCatalogModalOpen(false);
                createCatalogForm.reset();
            },
        });
    };

    const openEditCatalogModal = (catalog: Course, e?: React.MouseEvent) => {
        e?.stopPropagation();
        e?.preventDefault();
        setSelectedCatalogForEdit(catalog);
        editCatalogForm.setData({
            title: catalog.title,
            slug: catalog.slug,
            description: catalog.description || '',
            parent_id: catalog.parent_id ? String(catalog.parent_id) : '',
            category: catalog.category || 'general',
        });
    };

    const handleUpdateCatalog = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCatalogForEdit) return;
        editCatalogForm.put(route('admin.materials.catalogs.update', selectedCatalogForEdit.id), {
            onSuccess: () => {
                setSelectedCatalogForEdit(null);
            },
        });
    };

    const handleDeleteCatalog = () => {
        if (!selectedCatalogForDelete) return;
        router.delete(route('admin.materials.catalogs.destroy', selectedCatalogForDelete.id), {
            onSuccess: () => {
                setSelectedCatalogForDelete(null);
            },
        });
    };

    // Calculate descendant IDs to prevent cyclic parent selection in edit modal
    const getDescendantIds = (targetId: number): number[] => {
        const directChildren = courses.filter((c) => c.parent_id === targetId);
        let ids = directChildren.map((c) => c.id);
        for (const child of directChildren) {
            ids = [...ids, ...getDescendantIds(child.id)];
        }
        return ids;
    };

    const handleDeleteLesson = () => {
        if (!selectedLessonForDelete) return;
        router.delete(route('admin.materials.destroy', selectedLessonForDelete.id), {
            onSuccess: () => {
                setSelectedLessonForDelete(null);
                if (selectedLessonForEdit?.id === selectedLessonForDelete.id) {
                    setSelectedLessonForEdit(null);
                }
            },
        });
    };

    const handleUpdateFeedbackStatus = (feedbackId: number, status: string) => {
        router.put(route('admin.feedbacks.update', feedbackId), {
            status,
            admin_notes: 'Reviewed by instructor',
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">{t('materials.header_title')}</h2>}
        >
            <Head title={t('materials.page_title')} />

            <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                {/* Flash Messages */}
                {flash?.success && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg text-sm flex items-center gap-2 shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm flex items-center gap-2 shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                        {flash.error}
                    </div>
                )}

                {/* Subnav / Tabs */}
                <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setActiveTab('materials')}
                            className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
                                activeTab === 'materials'
                                    ? 'bg-amber-700 text-white shadow'
                                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                            }`}
                        >
                            {t('materials.tab_materials', { count: lessons.length.toString() })}
                        </button>
                        <button
                            onClick={() => setActiveTab('feedbacks')}
                            className={`px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                                activeTab === 'feedbacks'
                                    ? 'bg-amber-700 text-white shadow'
                                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                            }`}
                        >
                            <span>{t('materials.tab_feedbacks')}</span>
                            {feedbacks.filter((f) => f.status === 'pending').length > 0 && (
                                <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.2 rounded-full">
                                    {feedbacks.filter((f) => f.status === 'pending').length}
                                </span>
                            )}
                        </button>
                    </div>

                    {activeTab === 'materials' && (
                        <button
                            onClick={() => setIsCreateLessonModalOpen(true)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium shadow"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                            {t('materials.btn_add_new_lesson')}
                        </button>
                    )}
                </div>

                {activeTab === 'materials' ? (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {/* Course Selector Sidebar */}
                        <div className="md:col-span-1 space-y-2">
                            <div className="flex items-center justify-between px-1">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">{t('materials.courses_catalog')}</h3>
                                <button
                                    type="button"
                                    onClick={() => {
                                        createCatalogForm.reset();
                                        setIsCreateCatalogModalOpen(true);
                                    }}
                                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-900 hover:text-amber-950 bg-amber-100 hover:bg-amber-200/90 px-2 py-0.5 rounded-md transition shadow-xs"
                                    title={t('materials.btn_add_catalog')}
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                    </svg>
                                    <span>{t('materials.btn_add_catalog')}</span>
                                </button>
                            </div>

                            <div className="space-y-1.5">
                                {courses.length === 0 ? (
                                    <div className="text-center py-6 text-gray-400 text-xs border border-dashed rounded-xl p-4">
                                        {t('materials.no_catalogs')}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                createCatalogForm.reset();
                                                setIsCreateCatalogModalOpen(true);
                                            }}
                                            className="mt-2 block mx-auto text-amber-800 font-semibold underline"
                                        >
                                            {t('materials.create_first_catalog')}
                                        </button>
                                    </div>
                                ) : (
                                    courses.map((c) => (
                                        <div
                                            key={c.id}
                                            className={`group relative rounded-xl text-xs transition border ${
                                                activeCourse?.id === c.id
                                                    ? 'bg-amber-50 border-amber-300 text-amber-900 font-semibold shadow-sm'
                                                    : 'bg-white border-gray-200 text-gray-700 hover:bg-stone-50'
                                            }`}
                                        >
                                            <Link
                                                href={route('admin.materials.index', { course_id: c.id })}
                                                className="block p-3 pr-16"
                                            >
                                                <div className="font-serif leading-snug">{c.title}</div>
                                                {c.parent && (
                                                    <div className="flex items-center gap-1 text-[10px] text-amber-800 bg-amber-100/70 w-fit px-1.5 py-0.5 rounded mt-1 font-sans">
                                                        <span>↳</span>
                                                        <span className="truncate max-w-[130px]">{c.parent.title}</span>
                                                    </div>
                                                )}
                                                {c.user && (
                                                    <div className="flex items-center gap-1 text-[10px] text-stone-500 mt-1 font-sans">
                                                        <svg className="w-3 h-3 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                        <span className="truncate max-w-[140px]">{c.user.name}</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center justify-between text-[11px] text-gray-500 mt-1.5">
                                                    <span className="capitalize font-sans text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.2 rounded">
                                                        {c.category}
                                                    </span>
                                                    <span className="text-[10px]">{t('materials.topics_count', { count: c.lessons_count.toString() })}</span>
                                                </div>
                                            </Link>

                                            {/* Action buttons (Edit & Delete) */}
                                            <div className="absolute top-2.5 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/95 p-0.5 rounded-md border border-gray-200 shadow-xs">
                                                <button
                                                    type="button"
                                                    onClick={(e) => openEditCatalogModal(c, e)}
                                                    className="p-1 text-gray-500 hover:text-amber-800 hover:bg-amber-50 rounded transition"
                                                    title={t('materials.edit_catalog')}
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        e.preventDefault();
                                                        setSelectedCatalogForDelete(c);
                                                    }}
                                                    className="p-1 text-gray-400 hover:text-red-700 hover:bg-red-50 rounded transition"
                                                    title={t('materials.delete_catalog')}
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Lessons List for Selected Course */}
                        <div className="md:col-span-3 space-y-4">
                            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                                <div className="border-b pb-4 mb-4">
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                        <div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="font-serif font-bold text-base text-gray-900">
                                                    {activeCourse?.title ?? t('materials.no_course_selected')}
                                                </h3>
                                                {activeCourse?.parent && (
                                                    <span className="text-[10px] font-semibold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                                                        {t('materials.parent_label', { title: activeCourse.parent.title })}
                                                    </span>
                                                )}
                                                {activeCourse?.user && (
                                                    <span className="text-[10px] font-semibold bg-stone-100 text-stone-700 px-2 py-0.5 rounded-full flex items-center gap-1 border border-stone-200">
                                                        <svg className="w-3 h-3 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                        <span>{activeCourse.user.name}</span>
                                                    </span>
                                                )}
                                            </div>
                                            {activeCourse && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {t('materials.course_meta', {
                                                        slug: activeCourse.slug,
                                                        category: activeCourse.category.toUpperCase(),
                                                        count: lessons.length.toString(),
                                                    })}
                                                </p>
                                            )}
                                            {activeCourse?.description && (
                                                <div
                                                    className="text-xs text-stone-700 mt-1.5 bg-stone-50/80 p-3 rounded-lg border border-stone-200/80 prose prose-xs max-w-none"
                                                    dangerouslySetInnerHTML={{ __html: activeCourse.description }}
                                                />
                                            )}
                                        </div>

                                        {activeCourse && (
                                            <button
                                                type="button"
                                                onClick={() => openEditCatalogModal(activeCourse)}
                                                className="self-start inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-300 rounded-lg hover:bg-amber-100/80 transition shadow-2xs"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                                {t('materials.edit_catalog')}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {lessons.length === 0 ? (
                                    <div className="text-center py-12 text-gray-400 text-xs">
                                        {t('materials.no_materials_published')}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {lessons.map((lesson) => (
                                            <div key={lesson.id} className="p-4 rounded-xl border border-gray-200 bg-stone-50/40 hover:border-amber-400 transition space-y-3">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900">
                                                                {t('materials.unit_label', { order: lesson.order.toString() })}
                                                            </span>
                                                            <h4 className="font-semibold text-gray-900 text-sm">{lesson.title}</h4>
                                                        </div>
                                                        <p className="text-xs text-gray-600 mt-1">{lesson.summary}</p>
                                                    </div>

                                                    <div className="flex items-center gap-1.5 flex-shrink-0">
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedLessonForEdit(lesson)}
                                                            className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-amber-700 bg-white border border-amber-300 rounded-lg hover:bg-amber-50 transition shadow-2xs"
                                                        >
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                            {t('materials.btn_edit_lesson')}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedLessonForDelete(lesson)}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 hover:text-red-700 transition shadow-2xs"
                                                            title={t('materials.btn_delete_lesson')}
                                                        >
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                            <span>{t('materials.btn_delete_lesson')}</span>
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2 border-t border-gray-200/70">
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <span className="font-medium text-gray-700">{t('materials.reading_document')}</span>
                                                        <span className="text-emerald-700 truncate max-w-[200px]">
                                                            {lesson.document_urls && lesson.document_urls.length > 0
                                                                ? `${lesson.document_urls.length} file(s)`
                                                                : (lesson.reading_file_url ? t('materials.attached_file_url') : t('materials.embedded_text'))}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <span className="font-medium text-gray-700">{t('materials.video_lecture')}</span>
                                                        <span className="text-blue-600 truncate max-w-[200px]">
                                                            {lesson.video_urls && lesson.video_urls.length > 0
                                                                ? `${lesson.video_urls.length} video(s)`
                                                                : (lesson.video_url || t('materials.none'))}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
                                                    <div className="flex items-center gap-3">
                                                        <span>{t('materials.bank_questions_count', { count: lesson.questions_count.toString() })}</span>
                                                        <span>&bull;</span>
                                                        <span className={lesson.feedbacks_count > 0 ? 'text-amber-800 font-semibold' : ''}>
                                                            {t('materials.feedbacks_count', { count: lesson.feedbacks_count.toString() })}
                                                        </span>
                                                    </div>
                                                    <span>{t('materials.updated_at', { date: lesson.updated_at })}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Feedbacks / Corrections Tab */
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
                        <div className="border-b pb-3">
                            <h3 className="font-serif font-bold text-base text-gray-900">
                                {t('materials.feedbacks_heading')}
                            </h3>
                            <p className="text-xs text-gray-500">
                                {t('materials.feedbacks_subheading')}
                            </p>
                        </div>

                        {feedbacks.length === 0 ? (
                            <div className="text-center py-12 text-gray-400 text-xs">
                                {t('materials.no_feedbacks')}
                            </div>
                        ) : (
                            <div className="space-y-3 text-xs">
                                {feedbacks.map((fb) => (
                                    <div
                                        key={fb.id}
                                        className={`p-4 rounded-xl border transition ${
                                            fb.status === 'pending'
                                                ? 'bg-amber-50/50 border-amber-200'
                                                : fb.status === 'resolved'
                                                ? 'bg-emerald-50/30 border-emerald-200'
                                                : 'bg-white border-gray-200'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-4 mb-2">
                                            <div>
                                                <span className="font-semibold text-gray-900 text-sm">
                                                    {fb.user.name} (Username: {fb.user.username})
                                                </span>
                                                <div className="text-[11px] text-amber-800 mt-0.5">
                                                    {t('materials.feedback_material', { title: fb.lesson.title, course: fb.lesson.course_title })}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                                    fb.status === 'pending'
                                                         ? 'bg-amber-100 text-amber-800'
                                                         : fb.status === 'resolved'
                                                         ? 'bg-emerald-100 text-emerald-800'
                                                         : 'bg-blue-100 text-blue-800'
                                                 }`}>
                                                    {fb.status}
                                                </span>
                                                <span className="text-[11px] text-gray-400">{fb.created_at}</span>
                                            </div>
                                        </div>

                                        <div className="bg-white p-3 rounded-lg border border-gray-200 text-gray-800 text-xs italic">
                                            "{fb.content}"
                                        </div>

                                        <div className="mt-3 flex items-center justify-between">
                                            <span className="text-[11px] text-gray-400">
                                                {t('materials.instructor_note', { note: fb.admin_notes || t('materials.none') })}
                                            </span>

                                            <div className="flex items-center gap-2">
                                                {fb.status !== 'resolved' && (
                                                    <button
                                                        onClick={() => handleUpdateFeedbackStatus(fb.id, 'resolved')}
                                                        className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-medium"
                                                    >
                                                        {t('materials.btn_mark_resolved')}
                                                    </button>
                                                )}
                                                {fb.status === 'pending' && (
                                                    <button
                                                        onClick={() => handleUpdateFeedbackStatus(fb.id, 'reviewed')}
                                                        className="px-2.5 py-1 rounded bg-stone-700 hover:bg-stone-800 text-white text-[11px] font-medium"
                                                    >
                                                        {t('materials.btn_mark_reviewed')}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Create Lesson Modal */}
            <LessonFormModal
                isOpen={isCreateLessonModalOpen}
                onClose={() => setIsCreateLessonModalOpen(false)}
                courseId={activeCourse?.id || (courses[0]?.id ?? '')}
                courseTitle={activeCourse?.title}
                nextOrder={lessons.length + 1}
            />

            {/* Edit Lesson Modal */}
            <LessonFormModal
                isOpen={Boolean(selectedLessonForEdit)}
                onClose={() => setSelectedLessonForEdit(null)}
                courseId={selectedLessonForEdit?.course_id || (activeCourse?.id ?? '')}
                courseTitle={activeCourse?.title}
                lesson={selectedLessonForEdit}
                onDeleteRequest={(lessonToDel) => {
                    setSelectedLessonForEdit(null);
                    setSelectedLessonForDelete(lessonToDel);
                }}
            />

            {/* Create Courses Catalog Modal */}
            {isCreateCatalogModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-xs">
                        <div className="flex items-center justify-between border-b pb-3">
                            <div>
                                <h3 className="font-serif font-bold text-base text-gray-900">
                                    {t('materials.modal_create_catalog_title')}
                                </h3>
                                <p className="text-[11px] text-gray-500 mt-0.5">
                                    {t('materials.modal_create_catalog_subtitle')}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsCreateCatalogModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 p-1"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleCreateCatalog} className="space-y-3.5">
                            <div>
                                <label className="block font-medium text-gray-700 mb-1">
                                    {t('materials.catalog_title_label')} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={createCatalogForm.data.title}
                                    onChange={(e) => {
                                        const newTitle = e.target.value;
                                        createCatalogForm.setData((prev) => ({
                                            ...prev,
                                            title: newTitle,
                                            slug: prev.slug === '' || prev.slug === slugify(prev.title) ? slugify(newTitle) : prev.slug,
                                        }));
                                    }}
                                    placeholder={t('materials.catalog_title_placeholder')}
                                    className="w-full rounded-lg border-gray-300 text-xs focus:ring-amber-500 focus:border-amber-500"
                                    required
                                />
                                {createCatalogForm.errors.title && (
                                    <p className="text-red-600 text-[11px] mt-1">{createCatalogForm.errors.title}</p>
                                )}
                            </div>

                            <div>
                                <label className="block font-medium text-gray-700 mb-1">
                                    {t('materials.slug_label')} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={createCatalogForm.data.slug}
                                    onChange={(e) => createCatalogForm.setData('slug', e.target.value)}
                                    placeholder="e.g. sutta-pitaka-dhamma"
                                    className="w-full rounded-lg border-gray-300 text-xs font-mono focus:ring-amber-500 focus:border-amber-500"
                                    required
                                />
                                {createCatalogForm.errors.slug && (
                                    <p className="text-red-600 text-[11px] mt-1">{createCatalogForm.errors.slug}</p>
                                )}
                                <p className="text-gray-400 text-[10px] mt-0.5">{t('materials.slug_help')}</p>
                            </div>

                            <div>
                                <label className="block font-medium text-gray-700 mb-1">
                                    {t('materials.parent_catalog_label')}
                                </label>
                                <select
                                    value={createCatalogForm.data.parent_id}
                                    onChange={(e) => createCatalogForm.setData('parent_id', e.target.value)}
                                    className="w-full rounded-lg border-gray-300 text-xs focus:ring-amber-500 focus:border-amber-500"
                                >
                                    <option value="">{t('materials.parent_catalog_none')}</option>
                                    {courses.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.title} {c.category ? `[${c.category.toUpperCase()}]` : ''}
                                        </option>
                                    ))}
                                </select>
                                {createCatalogForm.errors.parent_id && (
                                    <p className="text-red-600 text-[11px] mt-1">{createCatalogForm.errors.parent_id}</p>
                                )}
                                <p className="text-gray-400 text-[10px] mt-0.5">
                                    {t('materials.parent_catalog_help')}
                                </p>
                            </div>

                            <div>
                                <label className="block font-medium text-gray-700 mb-1">
                                    {t('materials.description_label')}
                                </label>
                                <RichTextEditor
                                    value={createCatalogForm.data.description}
                                    onChange={(html) => createCatalogForm.setData('description', html)}
                                    placeholder={t('materials.description_placeholder')}
                                    minHeight="120px"
                                    error={createCatalogForm.errors.description}
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateCatalogModalOpen(false)}
                                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
                                >
                                    {t('materials.cancel')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={createCatalogForm.processing}
                                    className="px-4 py-2 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-medium shadow"
                                >
                                    {createCatalogForm.processing ? t('materials.creating') : t('materials.create_catalog')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Courses Catalog Modal */}
            {selectedCatalogForEdit && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-xs">
                        <div className="flex items-center justify-between border-b pb-3">
                            <div>
                                <h3 className="font-serif font-bold text-base text-gray-900">
                                    {t('materials.modal_edit_catalog_title')}
                                </h3>
                                <p className="text-[11px] text-gray-500 mt-0.5">
                                    {t('materials.modal_edit_catalog_subtitle')}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedCatalogForEdit(null)}
                                className="text-gray-400 hover:text-gray-600 p-1"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleUpdateCatalog} className="space-y-3.5">
                            <div>
                                <label className="block font-medium text-gray-700 mb-1">
                                    {t('materials.catalog_title_label')} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={editCatalogForm.data.title}
                                    onChange={(e) => editCatalogForm.setData('title', e.target.value)}
                                    className="w-full rounded-lg border-gray-300 text-xs focus:ring-amber-500 focus:border-amber-500"
                                    required
                                />
                                {editCatalogForm.errors.title && (
                                    <p className="text-red-600 text-[11px] mt-1">{editCatalogForm.errors.title}</p>
                                )}
                            </div>

                            <div>
                                <label className="block font-medium text-gray-700 mb-1">
                                    {t('materials.slug_label')} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={editCatalogForm.data.slug}
                                    onChange={(e) => editCatalogForm.setData('slug', e.target.value)}
                                    className="w-full rounded-lg border-gray-300 text-xs font-mono focus:ring-amber-500 focus:border-amber-500"
                                    required
                                />
                                {editCatalogForm.errors.slug && (
                                    <p className="text-red-600 text-[11px] mt-1">{editCatalogForm.errors.slug}</p>
                                )}
                            </div>

                            <div>
                                <label className="block font-medium text-gray-700 mb-1">
                                    {t('materials.parent_catalog_label')}
                                </label>
                                <select
                                    value={editCatalogForm.data.parent_id}
                                    onChange={(e) => editCatalogForm.setData('parent_id', e.target.value)}
                                    className="w-full rounded-lg border-gray-300 text-xs focus:ring-amber-500 focus:border-amber-500"
                                >
                                    <option value="">{t('materials.parent_catalog_none')}</option>
                                    {courses
                                        .filter(
                                            (c) =>
                                                c.id !== selectedCatalogForEdit.id &&
                                                !getDescendantIds(selectedCatalogForEdit.id).includes(c.id)
                                        )
                                        .map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.title} {c.category ? `[${c.category.toUpperCase()}]` : ''}
                                            </option>
                                        ))}
                                </select>
                                {editCatalogForm.errors.parent_id && (
                                    <p className="text-red-600 text-[11px] mt-1">{editCatalogForm.errors.parent_id}</p>
                                )}
                                <p className="text-gray-400 text-[10px] mt-0.5">
                                    {t('materials.parent_catalog_help')}
                                </p>
                            </div>

                            <div>
                                <label className="block font-medium text-gray-700 mb-1">
                                    {t('materials.description_label')}
                                </label>
                                <RichTextEditor
                                    value={editCatalogForm.data.description}
                                    onChange={(html) => editCatalogForm.setData('description', html)}
                                    placeholder={t('materials.description_placeholder')}
                                    minHeight="120px"
                                    error={editCatalogForm.errors.description}
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t">
                                <button
                                    type="button"
                                    onClick={() => setSelectedCatalogForEdit(null)}
                                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
                                >
                                    {t('materials.cancel')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={editCatalogForm.processing}
                                    className="px-4 py-2 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-medium shadow"
                                >
                                    {editCatalogForm.processing ? t('materials.saving') : t('materials.save_changes')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Courses Catalog Confirmation Modal */}
            {selectedCatalogForDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
                        <div className="flex items-center gap-3 border-b pb-3">
                            <div className="p-2 bg-red-100 text-red-700 rounded-full">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-serif font-bold text-base text-gray-900">
                                    {t('materials.modal_delete_catalog_title')}
                                </h3>
                                <p className="text-[11px] text-gray-500">
                                    {t('materials.modal_delete_catalog_subtitle')}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2 text-gray-600">
                            <p>
                                {t('materials.delete_confirm', { title: selectedCatalogForDelete.title })}
                            </p>
                            <p className="text-[11px] text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                                <strong>{t('materials.safety_notice_label')}</strong> {t('materials.safety_notice_text')}
                            </p>
                        </div>

                        <div className="flex justify-end gap-2 pt-3 border-t">
                            <button
                                type="button"
                                onClick={() => setSelectedCatalogForDelete(null)}
                                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
                            >
                                {t('materials.cancel')}
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteCatalog}
                                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium shadow"
                            >
                                {t('materials.delete_catalog_btn')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Lesson Confirmation Modal */}
            {selectedLessonForDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
                        <div className="flex items-center gap-3 border-b pb-3">
                            <div className="p-2 bg-red-100 text-red-700 rounded-full">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-serif font-bold text-base text-gray-900">
                                    {t('materials.modal_delete_lesson_title')}
                                </h3>
                                <p className="text-[11px] text-gray-500">
                                    {t('materials.modal_delete_lesson_subtitle')}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2 text-gray-600">
                            <p>
                                {t('materials.delete_lesson_confirm', { title: selectedLessonForDelete.title })}
                            </p>
                            <p className="text-[11px] text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                                <strong>{t('materials.safety_notice_label')}</strong> {t('materials.delete_lesson_safety_notice')}
                            </p>
                        </div>

                        <div className="flex justify-end gap-2 pt-3 border-t">
                            <button
                                type="button"
                                onClick={() => setSelectedLessonForDelete(null)}
                                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
                            >
                                {t('materials.cancel')}
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteLesson}
                                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium shadow"
                            >
                                {t('materials.delete_lesson_btn')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
