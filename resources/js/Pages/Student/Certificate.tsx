import React, { useRef } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useTranslation } from '@/utils/useTranslation';

interface CertificateProps extends PageProps {
    classItem: {
        id: number;
        name: string;
        course: {
            id: number;
            title: string;
            category: string;
            duration_months: number;
            total_lessons: number;
        };
        instructor?: {
            id: number;
            name: string;
        } | null;
    };
    student: {
        id: number;
        name: string;
        username: string;
        student_code: string;
    };
    certificate: {
        certificate_code: string;
        final_grade: number;
        classification: 'distinction' | 'merit' | 'credit' | 'pass' | 'completed';
        completed_at_iso: string;
        completed_at_formatted: string;
        completed_at_en: string;
        completed_at_vi: string;
    };
}

export default function Certificate({ classItem, student, certificate }: CertificateProps) {
    const t = useTranslation();
    const { locale } = usePage<PageProps & { locale: string }>().props;
    const isVi = locale === 'vi';
    const certificateRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        window.print();
    };

    // Formatted date based on locale
    const formattedDate = isVi ? certificate.completed_at_vi : certificate.completed_at_en;

    // Classification label
    const classificationLabel = t(`certificate.${certificate.classification}`);

    return (
        <div className="min-h-screen bg-stone-900 text-stone-100 flex flex-col font-sans selection:bg-amber-500 selection:text-white">
            <Head>
                <title>{t('certificate.meta_title', { course: classItem.course.title })}</title>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700;800;900&family=Playfair+Display:ital,wght@0,500;0,600;0,700;0,800;1,400;1,600&display=swap"
                    rel="stylesheet"
                />
            </Head>

            {/* Print Styles */}
            <style>{`
                @media print {
                    @page {
                        size: landscape A4;
                        margin: 0;
                    }
                    html, body {
                        background: #ffffff !important;
                        color: #000000 !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                    .certificate-outer-wrapper {
                        padding: 0 !important;
                        background: transparent !important;
                        min-height: 0 !important;
                        display: block !important;
                    }
                    .certificate-container {
                        width: 100vw !important;
                        height: 100vh !important;
                        max-width: none !important;
                        max-height: none !important;
                        box-shadow: none !important;
                        border-radius: 0 !important;
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                        margin: 0 !important;
                    }
                }
            `}</style>

            {/* Floating Top Control Bar (Hidden when printing) */}
            <div className="no-print sticky top-0 z-50 bg-stone-950/90 backdrop-blur border-b border-stone-800 shadow-xl px-4 py-3 sm:px-6">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('student.dashboard')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white text-xs font-medium transition"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            {t('certificate.back_dashboard')}
                        </Link>

                        <div className="hidden md:flex items-center gap-2 text-xs text-stone-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            <span className="font-mono text-stone-300 font-semibold">{certificate.certificate_code}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden lg:flex items-center gap-2 text-[11px] text-amber-300/80 bg-amber-950/40 border border-amber-800/40 px-3 py-1.5 rounded-lg max-w-md">
                            <span className="text-amber-400">💡</span>
                            <span>{t('certificate.print_tip_desc')}</span>
                        </div>

                        <button
                            type="button"
                            onClick={handlePrint}
                            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-stone-950 font-bold text-xs shadow-lg shadow-amber-900/30 transition transform hover:-translate-y-0.5 active:translate-y-0"
                        >
                            <svg className="w-4 h-4 text-stone-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            {t('certificate.print_download')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Certificate Display Canvas */}
            <div className="certificate-outer-wrapper flex-1 flex items-center justify-center p-3 sm:p-6 lg:p-8 overflow-x-auto">
                <div
                    ref={certificateRef}
                    className="certificate-container relative bg-[#fdfbf7] text-stone-900 w-[1120px] aspect-[1.414/1] shadow-2xl rounded-2xl border-8 border-stone-200/80 p-8 sm:p-10 flex flex-col justify-between overflow-hidden select-none shrink-0"
                    style={{
                        backgroundImage: `radial-gradient(circle at 50% 50%, rgba(254, 243, 199, 0.35) 0%, rgba(253, 251, 247, 1) 75%)`,
                    }}
                >
                    {/* Intricate Classical Border Frame */}
                    <div className="absolute inset-3 border-2 border-amber-800/40 rounded-xl pointer-events-none"></div>
                    <div className="absolute inset-4 border border-amber-600/30 rounded-lg pointer-events-none"></div>

                    {/* Ornate Corner Elements */}
                    <div className="absolute top-5 left-5 w-12 h-12 text-amber-700/60 pointer-events-none">
                        <svg viewBox="0 0 100 100" fill="currentColor">
                            <path d="M0,0 L40,0 C20,10 10,20 0,40 Z M10,10 L30,10 C20,15 15,20 10,30 Z" />
                            <circle cx="20" cy="20" r="4" />
                        </svg>
                    </div>
                    <div className="absolute top-5 right-5 w-12 h-12 text-amber-700/60 pointer-events-none rotate-90">
                        <svg viewBox="0 0 100 100" fill="currentColor">
                            <path d="M0,0 L40,0 C20,10 10,20 0,40 Z M10,10 L30,10 C20,15 15,20 10,30 Z" />
                            <circle cx="20" cy="20" r="4" />
                        </svg>
                    </div>
                    <div className="absolute bottom-5 left-5 w-12 h-12 text-amber-700/60 pointer-events-none -rotate-90">
                        <svg viewBox="0 0 100 100" fill="currentColor">
                            <path d="M0,0 L40,0 C20,10 10,20 0,40 Z M10,10 L30,10 C20,15 15,20 10,30 Z" />
                            <circle cx="20" cy="20" r="4" />
                        </svg>
                    </div>
                    <div className="absolute bottom-5 right-5 w-12 h-12 text-amber-700/60 pointer-events-none rotate-180">
                        <svg viewBox="0 0 100 100" fill="currentColor">
                            <path d="M0,0 L40,0 C20,10 10,20 0,40 Z M10,10 L30,10 C20,15 15,20 10,30 Z" />
                            <circle cx="20" cy="20" r="4" />
                        </svg>
                    </div>

                    {/* Subtle Background Watermark: Dharmachakra / Lotus */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.035] pointer-events-none">
                        <svg className="w-[500px] h-[500px] text-amber-900 fill-current" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none" />
                            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
                            <path d="M12 2v7M12 15v7M2 12h7M15 12h7M4.93 4.93l4.95 4.95M14.12 14.12l4.95 4.95M4.93 19.07l4.95-4.95M14.12 9.88l4.95-4.95" stroke="currentColor" strokeWidth="1.5" />
                        </svg>
                    </div>

                    {/* ==================================================== */}
                    {/* 1. Header Section: Monastery & Dharmachakra Emblem  */}
                    {/* ==================================================== */}
                    <div className="relative z-10 text-center space-y-1 pt-2">
                        {/* Golden Monastic Dharmachakra Emblem */}
                        <div className="flex items-center justify-center gap-3">
                            <div className="h-[1px] w-20 bg-gradient-to-r from-transparent to-amber-700/60"></div>
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-600 p-[2px] shadow-md flex items-center justify-center">
                                <div className="w-full h-full rounded-full bg-stone-900 flex items-center justify-center text-amber-400">
                                    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <circle cx="12" cy="12" r="9" strokeWidth="1.5" />
                                        <circle cx="12" cy="12" r="3" strokeWidth="1.5" />
                                        <path d="M12 3v6M12 15v6M3 12h6M15 12h6M5.64 5.64l4.24 4.24M14.12 14.12l4.24 4.24M5.64 18.36l4.24-4.24M14.12 9.88l4.24-4.24" strokeWidth="1.5" strokeLinecap="round" />
                                    </svg>
                                </div>
                            </div>
                            <div className="h-[1px] w-20 bg-gradient-to-l from-transparent to-amber-700/60"></div>
                        </div>

                        {/* Monastery Name */}
                        <div className="pt-1">
                            <h2
                                className="text-xl sm:text-2xl font-black uppercase tracking-[0.25em] text-stone-900"
                                style={{ fontFamily: "'Cinzel', serif" }}
                            >
                                {t('certificate.institution_name')}
                            </h2>
                            <p className="text-[11px] font-serif text-amber-900/80 uppercase tracking-widest font-semibold mt-0.5">
                                {t('certificate.institution_sub')}
                            </p>
                        </div>

                        {/* Certificate Main Title */}
                        <div className="pt-2">
                            <div className="inline-block relative">
                                <h1
                                    className="text-2xl sm:text-3xl font-extrabold tracking-[0.18em] uppercase text-amber-950 px-6"
                                    style={{ fontFamily: "'Cinzel', serif" }}
                                >
                                    {t('certificate.title')}
                                </h1>
                                <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-amber-700 to-transparent mt-1"></div>
                            </div>
                            <p className="text-xs italic font-serif text-stone-600 mt-1">
                                {t('certificate.subtitle')}
                            </p>
                        </div>
                    </div>

                    {/* ==================================================== */}
                    {/* 2. Recipient Section: Student Details & Course       */}
                    {/* ==================================================== */}
                    <div className="relative z-10 text-center space-y-3 py-2 max-w-3xl mx-auto">
                        <p className="text-xs uppercase tracking-widest text-stone-500 font-serif">
                            {t('certificate.certifies_that')}
                        </p>

                        {/* Student Name */}
                        <div>
                            <div
                                className="text-3xl sm:text-4xl font-bold text-stone-950 tracking-wide font-serif py-1"
                                style={{ fontFamily: "'Playfair Display', serif" }}
                            >
                                {student.name}
                            </div>
                            <div className="inline-flex items-center gap-2 text-[11px] text-amber-900/80 font-mono font-medium px-3 py-0.5 rounded-full bg-amber-100/60 border border-amber-200">
                                <span>{t('certificate.student_id_label', { id: student.student_code })}</span>
                                <span>&bull;</span>
                                <span>@{student.username}</span>
                            </div>
                        </div>

                        <p className="text-xs text-stone-600 font-serif max-w-2xl mx-auto leading-relaxed">
                            {t('certificate.has_completed')}
                        </p>

                        {/* Course Title Badge */}
                        <div className="py-1">
                            <h3
                                className="text-xl sm:text-2xl font-bold text-amber-900 font-serif tracking-tight"
                                style={{ fontFamily: "'Playfair Display', serif" }}
                            >
                                {classItem.course.title}
                            </h3>
                            <div className="flex items-center justify-center gap-3 text-xs text-stone-600 mt-1.5 flex-wrap">
                                <span className="font-semibold text-stone-800">
                                    {t('certificate.in_class')} <span className="text-amber-900">{classItem.name}</span>
                                </span>
                                <span>&bull;</span>
                                <span className="uppercase text-[11px] tracking-wider font-medium text-stone-700 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                                    {classItem.course.category}
                                </span>
                            </div>
                        </div>

                        {/* Meta Assessment Row */}
                        <div className="flex items-center justify-center gap-6 pt-1 text-xs">
                            <div className="flex items-center gap-1.5 text-stone-700">
                                <span className="text-stone-400 font-serif">{t('certificate.issued_date')}</span>
                                <span className="font-bold text-stone-900">{formattedDate}</span>
                            </div>
                            <span>&bull;</span>
                            <div className="flex items-center gap-1.5">
                                <span className="text-stone-400 font-serif">{t('certificate.final_grade')}</span>
                                <span className="font-bold text-amber-900 bg-amber-100/70 border border-amber-300 px-2.5 py-0.5 rounded-full text-xs">
                                    {certificate.final_grade}% &bull; {classificationLabel}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* ==================================================== */}
                    {/* 3. Footer Section: Signatures, Seal & Serial Number  */}
                    {/* ==================================================== */}
                    <div className="relative z-10 pt-4 pb-2">
                        <div className="grid grid-cols-3 items-end gap-4 text-center">
                            {/* Left Signature: Academic Administration */}
                            <div className="flex flex-col items-center">
                                <div className="h-12 flex items-end justify-center">
                                    {/* Stylized Monastic Calligraphic Script */}
                                    <span
                                        className="font-serif italic text-2xl text-stone-800 tracking-wider opacity-85 select-none"
                                        style={{ fontFamily: "'Playfair Display', cursive" }}
                                    >
                                        Thích Nữ Như Viên
                                    </span>
                                </div>
                                <div className="w-44 border-b border-stone-400/80 my-1"></div>
                                <div className="font-serif font-bold text-xs text-stone-900 uppercase tracking-wider">
                                    {t('certificate.director_signature')}
                                </div>
                                <div className="text-[10px] text-stone-500 font-serif">
                                    {t('certificate.default_director')}
                                </div>
                            </div>

                            {/* Center: Monastic Red Seal & Serial Badge */}
                            <div className="flex flex-col items-center justify-center -space-y-1">
                                {/* Red Monastic Seal (Circular Rosette) */}
                                <div className="w-20 h-20 rounded-full border-2 border-dashed border-red-700 p-1 flex items-center justify-center shadow-inner bg-red-50/50">
                                    <div className="w-full h-full rounded-full border-2 border-red-800 bg-gradient-to-tr from-red-800 via-red-700 to-red-600 text-amber-200 flex flex-col items-center justify-center shadow text-center p-1">
                                        <svg className="w-6 h-6 text-amber-300" viewBox="0 0 24 24" fill="currentColor">
                                            <circle cx="12" cy="12" r="3" />
                                            <path d="M12 2a10 10 0 1010 10A10 10 0 0012 2zm0 18a8 8 0 118-8 8 8 0 01-8 8z" />
                                        </svg>
                                        <span className="text-[7px] font-black uppercase tracking-tighter text-amber-100 font-serif leading-none mt-0.5">
                                            {t('certificate.official_seal')}
                                        </span>
                                    </div>
                                </div>

                                <div className="pt-2 text-center">
                                    <div className="text-[9px] font-mono font-bold tracking-widest text-stone-600 uppercase">
                                        {t('certificate.certificate_no')}
                                    </div>
                                    <div className="text-[11px] font-mono font-bold text-stone-900 tracking-wider">
                                        {certificate.certificate_code}
                                    </div>
                                </div>
                            </div>

                            {/* Right Signature: Instructor */}
                            <div className="flex flex-col items-center">
                                <div className="h-12 flex items-end justify-center">
                                    {/* Stylized Monastic Calligraphic Script */}
                                    <span
                                        className="font-serif italic text-2xl text-stone-800 tracking-wider opacity-85 select-none"
                                        style={{ fontFamily: "'Playfair Display', cursive" }}
                                    >
                                        {classItem.instructor?.name || t('certificate.default_instructor')}
                                    </span>
                                </div>
                                <div className="w-44 border-b border-stone-400/80 my-1"></div>
                                <div className="font-serif font-bold text-xs text-stone-900 uppercase tracking-wider">
                                    {t('certificate.instructor_signature')}
                                </div>
                                <div className="text-[10px] text-stone-500 font-serif">
                                    {classItem.instructor?.name || t('certificate.default_instructor')}
                                </div>
                            </div>
                        </div>

                        {/* Bottom Security / Credential Verification Strip */}
                        <div className="mt-4 pt-2 border-t border-stone-200/80 flex items-center justify-between text-[10px] text-stone-400 font-mono">
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                <span>{t('certificate.verified_credential')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span>{t('certificate.qr_scan_verify')}</span>
                                <span>&bull;</span>
                                <span className="text-stone-500">{window.location.host}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
