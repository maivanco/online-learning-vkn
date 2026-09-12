import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { PageProps } from '@/types';

interface Course {
    id: number;
    title: string;
    category: string;
    lessons_count: number;
}

interface LessonItem {
    id: number;
    course_id: number;
    title: string;
    slug: string;
    order: number;
    summary: string | null;
    reading_content: string | null;
    reading_file_url: string | null;
    video_url: string | null;
    feedbacks_count: number;
    questions_count: number;
    updated_at: string;
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
        cccd: string;
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
    const [selectedLessonForEdit, setSelectedLessonForEdit] = useState<LessonItem | null>(null);
    const [isCreateLessonModalOpen, setIsCreateLessonModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'materials' | 'feedbacks'>('materials');

    const lessonForm = useForm({
        course_id: activeCourse?.id || '',
        title: '',
        summary: '',
        reading_content: '',
        reading_file_url: '',
        video_url: '',
        order: lessons.length + 1,
    });

    const editLessonForm = useForm({
        title: '',
        summary: '',
        reading_content: '',
        reading_file_url: '',
        video_url: '',
        order: 1,
    });

    const handleCreateLesson = (e: React.FormEvent) => {
        e.preventDefault();
        lessonForm.post(route('admin.materials.store'), {
            onSuccess: () => {
                setIsCreateLessonModalOpen(false);
                lessonForm.reset();
            },
        });
    };

    const openEditModal = (lesson: LessonItem) => {
        setSelectedLessonForEdit(lesson);
        editLessonForm.setData({
            title: lesson.title,
            summary: lesson.summary || '',
            reading_content: lesson.reading_content || '',
            reading_file_url: lesson.reading_file_url || '',
            video_url: lesson.video_url || '',
            order: lesson.order,
        });
    };

    const handleUpdateLesson = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedLessonForEdit) return;
        editLessonForm.put(route('admin.materials.update', selectedLessonForEdit.id), {
            onSuccess: () => setSelectedLessonForEdit(null),
        });
    };

    const feedbackStatusForm = useForm({
        status: 'reviewed',
        admin_notes: '',
    });

    const handleUpdateFeedbackStatus = (feedbackId: number, status: string) => {
        router.put(route('admin.feedbacks.update', feedbackId), {
            status,
            admin_notes: 'Reviewed by instructor',
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Materials & Lecture Videos (Tài liệu & Video)</h2>}
        >
            <Head title="Materials Management - Viên Không Ni" />

            <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                {/* Flash Messages */}
                {flash?.success && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg text-sm flex items-center gap-2 shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        {flash.success}
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
                            Study Materials & Video Lectures ({lessons.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('feedbacks')}
                            className={`px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                                activeTab === 'feedbacks'
                                    ? 'bg-amber-700 text-white shadow'
                                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                            }`}
                        >
                            <span>Student Feedbacks / Error Reports</span>
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
                            Add New Study Material (Thêm Tài Liệu)
                        </button>
                    )}
                </div>

                {activeTab === 'materials' ? (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {/* Course Selector Sidebar */}
                        <div className="md:col-span-1 space-y-2">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 px-1">Courses Catalog</h3>
                            <div className="space-y-1">
                                {courses.map((c) => (
                                    <Link
                                        key={c.id}
                                        href={route('admin.materials.index', { course_id: c.id })}
                                        className={`block p-3 rounded-xl text-xs transition border ${
                                            activeCourse?.id === c.id
                                                ? 'bg-amber-50 border-amber-300 text-amber-900 font-semibold shadow-sm'
                                                : 'bg-white border-gray-200 text-gray-700 hover:bg-stone-50'
                                        }`}
                                    >
                                        <div className="font-serif">{c.title}</div>
                                        <div className="flex items-center justify-between text-[11px] text-gray-500 mt-1">
                                            <span className="capitalize">{c.category}</span>
                                            <span>{c.lessons_count} topics</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Lessons List for Selected Course */}
                        <div className="md:col-span-3 space-y-4">
                            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                                <div className="border-b pb-4 mb-4">
                                    <h3 className="font-serif font-bold text-base text-gray-900">
                                        {activeCourse?.title}
                                    </h3>
                                    <p className="text-xs text-gray-500">
                                        Category: <span className="font-semibold uppercase text-amber-800">{activeCourse?.category}</span> &bull; {lessons.length} study units
                                    </p>
                                </div>

                                {lessons.length === 0 ? (
                                    <div className="text-center py-12 text-gray-400 text-xs">
                                        No materials or lessons published for this course yet.
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {lessons.map((lesson) => (
                                            <div key={lesson.id} className="p-4 rounded-xl border border-gray-200 bg-stone-50/40 hover:border-amber-400 transition space-y-3">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900">
                                                                Unit {lesson.order}
                                                            </span>
                                                            <h4 className="font-semibold text-gray-900 text-sm">{lesson.title}</h4>
                                                        </div>
                                                        <p className="text-xs text-gray-600 mt-1">{lesson.summary}</p>
                                                    </div>

                                                    <button
                                                        onClick={() => openEditModal(lesson)}
                                                        className="px-3 py-1 text-xs font-semibold text-amber-700 bg-white border border-amber-300 rounded-lg hover:bg-amber-50"
                                                    >
                                                        Edit Material
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2 border-t border-gray-200/70">
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <span className="font-medium text-gray-700">Reading Document:</span>
                                                        <span className="text-emerald-700 truncate max-w-[200px]">
                                                            {lesson.reading_file_url ? 'Attached File / URL' : 'Embedded Text'}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <span className="font-medium text-gray-700">Lecture Video Clip:</span>
                                                        <span className="text-blue-600 truncate max-w-[200px]">
                                                            {lesson.video_url || 'None'}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
                                                    <div className="flex items-center gap-3">
                                                        <span>{lesson.questions_count} bank questions</span>
                                                        <span>&bull;</span>
                                                        <span className={lesson.feedbacks_count > 0 ? 'text-amber-800 font-semibold' : ''}>
                                                            {lesson.feedbacks_count} student feedbacks
                                                        </span>
                                                    </div>
                                                    <span>Updated: {lesson.updated_at}</span>
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
                                Ý Kiến Đóng Góp & Báo Lỗi Tài Liệu Từ Học Viên
                            </h3>
                            <p className="text-xs text-gray-500">
                                Feedbacks submitted by students using the feedback button located beneath each reading document.
                            </p>
                        </div>

                        {feedbacks.length === 0 ? (
                            <div className="text-center py-12 text-gray-400 text-xs">
                                No material feedback reports submitted yet.
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
                                                    {fb.user.name} (CCCD: {fb.user.cccd})
                                                </span>
                                                <div className="text-[11px] text-amber-800 mt-0.5">
                                                    Material: <span className="font-semibold">{fb.lesson.title}</span> &bull; {fb.lesson.course_title}
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
                                                Instructor note: {fb.admin_notes || 'None'}
                                            </span>

                                            <div className="flex items-center gap-2">
                                                {fb.status !== 'resolved' && (
                                                    <button
                                                        onClick={() => handleUpdateFeedbackStatus(fb.id, 'resolved')}
                                                        className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-medium"
                                                    >
                                                        Mark Resolved (Đã sửa)
                                                    </button>
                                                )}
                                                {fb.status === 'pending' && (
                                                    <button
                                                        onClick={() => handleUpdateFeedbackStatus(fb.id, 'reviewed')}
                                                        className="px-2.5 py-1 rounded bg-stone-700 hover:bg-stone-800 text-white text-[11px] font-medium"
                                                    >
                                                        Mark Reviewed
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
            {isCreateLessonModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-xs">
                        <div className="flex items-center justify-between border-b pb-3">
                            <h3 className="font-serif font-bold text-base text-gray-900">
                                Post New Study Material & Video (Đăng Tài Liệu Mới)
                            </h3>
                            <button
                                onClick={() => setIsCreateLessonModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleCreateLesson} className="space-y-3.5">
                            <div>
                                <label className="block font-medium text-gray-700 mb-1">Course (Môn học)</label>
                                <select
                                    value={lessonForm.data.course_id}
                                    onChange={(e) => lessonForm.setData('course_id', Number(e.target.value))}
                                    className="w-full rounded-lg border-gray-300 text-xs focus:ring-amber-500 focus:border-amber-500"
                                >
                                    {courses.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div className="col-span-2">
                                    <label className="block font-medium text-gray-700 mb-1">Lesson / Topic Title</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Lesson 3: The 52 Cetasikas"
                                        value={lessonForm.data.title}
                                        onChange={(e) => lessonForm.setData('title', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 text-xs focus:ring-amber-500 focus:border-amber-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block font-medium text-gray-700 mb-1">Order Index</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={lessonForm.data.order}
                                        onChange={(e) => lessonForm.setData('order', Number(e.target.value))}
                                        className="w-full rounded-lg border-gray-300 text-xs focus:ring-amber-500 focus:border-amber-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-medium text-gray-700 mb-1">Summary / Objective</label>
                                <input
                                    type="text"
                                    placeholder="Short description of this lesson unit"
                                    value={lessonForm.data.summary}
                                    onChange={(e) => lessonForm.setData('summary', e.target.value)}
                                    className="w-full rounded-lg border-gray-300 text-xs focus:ring-amber-500 focus:border-amber-500"
                                />
                            </div>

                            <div>
                                <label className="block font-medium text-gray-700 mb-1">
                                    Self-Study Reading Content (Nội dung tài liệu tự đọc - Markdown supported)
                                </label>
                                <textarea
                                    rows={6}
                                    placeholder="Enter reading content or markdown notes for students..."
                                    value={lessonForm.data.reading_content}
                                    onChange={(e) => lessonForm.setData('reading_content', e.target.value)}
                                    className="w-full rounded-lg border-gray-300 text-xs focus:ring-amber-500 focus:border-amber-500 font-mono"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-medium text-gray-700 mb-1">
                                        Reading Document File / PDF Link (Tài liệu đính kèm)
                                    </label>
                                    <input
                                        type="url"
                                        placeholder="https://.../document.pdf"
                                        value={lessonForm.data.reading_file_url}
                                        onChange={(e) => lessonForm.setData('reading_file_url', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 text-xs focus:ring-amber-500 focus:border-amber-500"
                                    />
                                </div>

                                <div>
                                    <label className="block font-medium text-gray-700 mb-1">
                                        Lecture Video Clip URL (Video bài giảng)
                                    </label>
                                    <input
                                        type="url"
                                        placeholder="https://www.youtube.com/watch?v=..."
                                        value={lessonForm.data.video_url}
                                        onChange={(e) => lessonForm.setData('video_url', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 text-xs focus:ring-amber-500 focus:border-amber-500"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateLessonModalOpen(false)}
                                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={lessonForm.processing}
                                    className="px-4 py-2 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-medium shadow"
                                >
                                    Save Material
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Lesson Modal */}
            {selectedLessonForEdit && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-xs">
                        <div className="flex items-center justify-between border-b pb-3">
                            <h3 className="font-serif font-bold text-base text-gray-900">
                                Edit Study Material (Chỉnh Sửa Tài Liệu)
                            </h3>
                            <button
                                onClick={() => setSelectedLessonForEdit(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleUpdateLesson} className="space-y-3.5">
                            <div className="grid grid-cols-3 gap-3">
                                <div className="col-span-2">
                                    <label className="block font-medium text-gray-700 mb-1">Title</label>
                                    <input
                                        type="text"
                                        value={editLessonForm.data.title}
                                        onChange={(e) => editLessonForm.setData('title', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 text-xs focus:ring-amber-500 focus:border-amber-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block font-medium text-gray-700 mb-1">Order</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={editLessonForm.data.order}
                                        onChange={(e) => editLessonForm.setData('order', Number(e.target.value))}
                                        className="w-full rounded-lg border-gray-300 text-xs focus:ring-amber-500 focus:border-amber-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-medium text-gray-700 mb-1">Summary</label>
                                <input
                                    type="text"
                                    value={editLessonForm.data.summary}
                                    onChange={(e) => editLessonForm.setData('summary', e.target.value)}
                                    className="w-full rounded-lg border-gray-300 text-xs focus:ring-amber-500 focus:border-amber-500"
                                />
                            </div>

                            <div>
                                <label className="block font-medium text-gray-700 mb-1">Reading Content (Nội dung tự đọc)</label>
                                <textarea
                                    rows={7}
                                    value={editLessonForm.data.reading_content}
                                    onChange={(e) => editLessonForm.setData('reading_content', e.target.value)}
                                    className="w-full rounded-lg border-gray-300 text-xs focus:ring-amber-500 focus:border-amber-500 font-mono"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-medium text-gray-700 mb-1">Reading File URL</label>
                                    <input
                                        type="url"
                                        value={editLessonForm.data.reading_file_url}
                                        onChange={(e) => editLessonForm.setData('reading_file_url', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 text-xs focus:ring-amber-500 focus:border-amber-500"
                                    />
                                </div>

                                <div>
                                    <label className="block font-medium text-gray-700 mb-1">Video Clip URL</label>
                                    <input
                                        type="url"
                                        value={editLessonForm.data.video_url}
                                        onChange={(e) => editLessonForm.setData('video_url', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 text-xs focus:ring-amber-500 focus:border-amber-500"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t">
                                <button
                                    type="button"
                                    onClick={() => setSelectedLessonForEdit(null)}
                                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={editLessonForm.processing}
                                    className="px-4 py-2 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-medium shadow"
                                >
                                    Update Material
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
