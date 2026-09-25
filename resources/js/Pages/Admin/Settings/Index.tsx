import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useTranslation } from '@/utils/useTranslation';

interface SettingsData {
    practice_repetition_target: number;
    max_classes_per_student: number;
}

interface SettingsPageProps extends PageProps {
    settings: SettingsData;
}

export default function SettingsIndex({ auth, settings }: SettingsPageProps) {
    const t = useTranslation();
    const { flash } = usePage<PageProps>().props;

    const form = useForm({
        practice_repetition_target: settings.practice_repetition_target ?? 10,
        max_classes_per_student: settings.max_classes_per_student ?? 5,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(route('admin.settings.update'), {
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={t('settings.page_title')} />

            <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="border-b border-stone-200 pb-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shadow-sm">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">
                                {t('settings.page_title')}
                            </h1>
                            <p className="text-xs text-stone-500 mt-1">
                                {t('settings.page_subtitle')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Success Flash Banner */}
                {flash?.success && (
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2 shadow-sm">
                        <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{flash.success}</span>
                    </div>
                )}

                {/* Settings Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Setting 1: Practice Repetition Target */}
                    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
                        <div className="p-6 sm:p-7 space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-800 flex items-center justify-center shrink-0 mt-0.5">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-base font-semibold text-stone-900 font-serif">
                                        {t('settings.card_practice_title')}
                                    </h2>
                                    <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                                        {t('settings.card_practice_desc')}
                                    </p>
                                </div>
                            </div>

                            <div className="pt-3 border-t border-stone-100 grid sm:grid-cols-2 gap-6 items-center">
                                <div>
                                    <label htmlFor="practice_repetition_target" className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
                                        {t('settings.practice_repetition_target_label')}
                                    </label>
                                    <div className="relative rounded-xl shadow-sm max-w-xs">
                                        <input
                                            id="practice_repetition_target"
                                            type="number"
                                            min={1}
                                            max={100}
                                            value={form.data.practice_repetition_target}
                                            onChange={(e) => form.setData('practice_repetition_target', parseInt(e.target.value, 10) || 1)}
                                            className="w-full rounded-xl border-stone-300 pr-16 text-sm font-semibold text-stone-800 focus:border-amber-600 focus:ring-amber-600"
                                            required
                                        />
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none text-xs text-stone-400 font-medium">
                                            {t('settings.practice_target_unit')}
                                        </div>
                                    </div>
                                    {form.errors.practice_repetition_target && (
                                        <p className="mt-2 text-xs text-red-600 font-medium">
                                            {form.errors.practice_repetition_target}
                                        </p>
                                    )}
                                    <p className="mt-2 text-[11px] text-stone-500 leading-normal">
                                        {t('settings.practice_repetition_target_help')}
                                    </p>
                                </div>

                                {/* Preview Card */}
                                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/80 rounded-xl p-4 text-xs space-y-2">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                                        {t('classes.step_practice')}
                                    </span>
                                    <div className="flex items-center justify-between text-xs font-medium text-stone-700">
                                        <span>{t('student.completed_practice_sessions')}</span>
                                        <span className="font-bold text-amber-800 font-mono text-sm">
                                            {Math.min(form.data.practice_repetition_target, Math.round(form.data.practice_repetition_target * 0.4))} / {form.data.practice_repetition_target} {t('settings.practice_target_unit')}
                                        </span>
                                    </div>
                                    <div className="w-full bg-amber-200 rounded-full h-2 overflow-hidden">
                                        <div className="bg-amber-600 h-2 rounded-full w-[40%] transition-all"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Setting 2: Student Max Classes Limit */}
                    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
                        <div className="p-6 sm:p-7 space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0 mt-0.5">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M12 14l9-5-9-5-9 5 9 5z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-base font-semibold text-stone-900 font-serif">
                                        {t('settings.card_enrollment_title')}
                                    </h2>
                                    <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                                        {t('settings.card_enrollment_desc')}
                                    </p>
                                </div>
                            </div>

                            <div className="pt-3 border-t border-stone-100 grid sm:grid-cols-2 gap-6 items-center">
                                <div>
                                    <label htmlFor="max_classes_per_student" className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
                                        {t('settings.max_classes_per_student_label')}
                                    </label>
                                    <div className="relative rounded-xl shadow-sm max-w-xs">
                                        <input
                                            id="max_classes_per_student"
                                            type="number"
                                            min={0}
                                            max={100}
                                            value={form.data.max_classes_per_student}
                                            onChange={(e) => form.setData('max_classes_per_student', parseInt(e.target.value, 10) || 0)}
                                            className="w-full rounded-xl border-stone-300 pr-16 text-sm font-semibold text-stone-800 focus:border-amber-600 focus:ring-amber-600"
                                            required
                                        />
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none text-xs text-stone-400 font-medium">
                                            {t('settings.classes_unit')}
                                        </div>
                                    </div>
                                    {form.errors.max_classes_per_student && (
                                        <p className="mt-2 text-xs text-red-600 font-medium">
                                            {form.errors.max_classes_per_student}
                                        </p>
                                    )}
                                    <p className="mt-2 text-[11px] text-stone-500 leading-normal">
                                        {t('settings.max_classes_per_student_help')}
                                    </p>
                                </div>

                                {/* Preview Card */}
                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/80 rounded-xl p-4 text-xs space-y-2">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800">
                                        {t('classes.enrollment_status')}
                                    </span>
                                    <div className="text-xs text-stone-700 flex items-center justify-between">
                                        <span>{t('settings.max_classes_per_student_label')}:</span>
                                        <span className="font-bold text-blue-900 font-mono text-sm">
                                            {form.data.max_classes_per_student === 0
                                                ? t('settings.unlimited_hint')
                                                : `${form.data.max_classes_per_student} ${t('settings.classes_unit')}`}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-stone-500">
                                        {form.data.max_classes_per_student === 0
                                            ? t('settings.unlimited_hint')
                                            : t('settings.error_max_classes_reached', { name: 'Student', max: form.data.max_classes_per_student.toString() })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Information Box */}
                    <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 text-xs text-stone-600 space-y-2">
                        <div className="font-bold text-stone-800 flex items-center gap-2">
                            <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{t('settings.info_box_title')}</span>
                        </div>
                        <ul className="list-disc list-inside space-y-1 pl-1 text-[11px] text-stone-500">
                            <li>{t('settings.info_box_practice')}</li>
                            <li>{t('settings.info_box_enrollment')}</li>
                        </ul>
                    </div>

                    {/* Submit Bar */}
                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={form.processing}
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 active:bg-amber-900 text-white font-medium text-xs shadow-md transition disabled:opacity-50"
                        >
                            {form.processing ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>{t('settings.saving')}</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>{t('settings.save_button')}</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
