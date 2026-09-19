import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
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

export default function ClassShow({ auth, classItem, students, availableStudents, flash }: ClassShowProps) {
    const t = useTranslation();
    const [selectedStudentForModal, setSelectedStudentForModal] = useState<StudentItem | null>(null);
    const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

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
                                <span className="font-bold text-gray-900 text-base">{students.length}</span>
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
                                {students.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-12 text-gray-400 text-xs">
                                            {t('classes.no_students_enrolled')}
                                        </td>
                                    </tr>
                                ) : (
                                    students.map((student) => (
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
                                                {student.enrollment_status === 'completed' ? (
                                                    <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                                                        <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                        {t('classes.status_passed')} {student.final_grade ? `(${student.final_grade}%)` : ''}
                                                    </span>
                                                ) : (
                                                    <span className="text-stone-500 font-medium text-xs">{t('classes.status_in_progress')}</span>
                                                )}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-3">
                                                    <button
                                                        onClick={() => setSelectedStudentForModal(student)}
                                                        className="text-amber-700 hover:text-amber-900 font-medium underline"
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
                                    Username: {selectedStudentForModal.username}
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

                                    {/* 4 Pipeline Milestones */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
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

                                        <div className={`p-2 rounded border ${lp.exam_completed ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-gray-100 border-gray-200 text-gray-500'}`}>
                                            <div className="font-medium">4. {t('classes.step_exam')}</div>
                                            <div className="text-[10px]">{lp.exam_score ? `${lp.exam_score}%` : t('classes.step_pending')}</div>
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
