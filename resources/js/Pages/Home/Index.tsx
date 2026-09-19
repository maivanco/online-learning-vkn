import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useTranslation } from '@/utils/useTranslation';

interface CourseItem {
    id: number;
    title: string;
    slug: string;
    category: 'dhamma' | 'vinaya' | 'abhidhamma' | 'pali' | string;
    target_audience: string;
    description: string;
    lessons_count: number;
    classes_count: number;
}

interface MonasteryInfo {
    name: string;
    tagline: string;
    address: string;
    facebook: string;
}

interface HomeProps extends PageProps {
    courses: CourseItem[];
    activeClassesCount: number;
    monastery: MonasteryInfo;
    year: string;
    hasAdmin?: boolean;
}

export default function Home({ auth, courses, activeClassesCount, monastery, year, hasAdmin = true }: HomeProps) {
    const t = useTranslation();

    const categories = [
        { id: 'dhamma', label: t('home.dhamma_title'), desc: t('home.dhamma_subtitle') },
        { id: 'vinaya', label: t('home.vinaya_title'), desc: t('home.vinaya_subtitle') },
        { id: 'abhidhamma', label: t('home.abhidhamma_title'), desc: t('home.abhidhamma_subtitle') },
        { id: 'pali', label: t('home.pali_title'), desc: t('home.pali_subtitle') },
    ];

    const cleanedAddress = monastery?.address
        ? monastery.address.replace(/^[^,]+,\s*/, '')
        : '';

    return (
        <>
            <Head title={t('home.meta_title')} />

            <div className="min-h-screen bg-white text-stone-800 font-sans flex flex-col justify-between selection:bg-amber-600 selection:text-white">
                {/* Header / Navbar */}
                <header className="border-b border-stone-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-xs">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="font-serif font-bold text-lg text-stone-900 tracking-tight leading-tight">
                                    {t('home.system_title')}
                                </h1>
                                <p className="text-[11px] text-stone-500 font-medium tracking-wider uppercase">
                                    {t('home.system_subtitle')}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-sm shadow-amber-600/20 transition"
                                >
                                    <span>{t('home.nav_dashboard')}</span>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </Link>
                            ) : (
                                <div className="flex items-center gap-2">
                                    {!hasAdmin ? (
                                        <Link
                                            href={route('setup')}
                                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-amber-700 hover:bg-amber-800 text-white shadow-sm shadow-amber-700/25 transition"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                            </svg>
                                            {t('home.nav_setup')}
                                        </Link>
                                    ) : (
                                        <Link
                                            href={route('login')}
                                            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-sm shadow-amber-600/25 transition"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                            </svg>
                                            {t('home.nav_login')}
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Hero Section */}
                <main className="flex-1">
                    <div className="relative overflow-hidden py-16 sm:py-24 border-b border-stone-200 bg-gradient-to-b from-amber-50/40 via-white to-white">
                        {/* Ambient golden glow */}
                        <div className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none">
                            <div className="h-[450px] w-[700px] rounded-full bg-amber-200/40 blur-[130px]"></div>
                        </div>

                        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-amber-100/70 text-amber-800 border border-amber-200/80 shadow-xs">
                                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                                {t('home.hero_badge')}
                            </div>

                            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-stone-900 max-w-4xl mx-auto leading-tight">
                                {t('home.hero_title_1')} <br />
                                <span className="bg-gradient-to-r from-amber-600 via-amber-700 to-yellow-600 bg-clip-text text-transparent">
                                    {t('home.hero_title_2')}
                                </span>
                            </h1>

                            <p className="text-sm sm:text-base text-stone-600 max-w-2xl mx-auto leading-relaxed">
                                {t('home.hero_desc')}
                            </p>

                            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
                                {!hasAdmin ? (
                                    <Link
                                        href={route('setup')}
                                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-amber-700 hover:bg-amber-800 text-white shadow-lg shadow-amber-700/25 transition transform hover:-translate-y-0.5"
                                    >
                                        <span>{t('home.btn_setup')}</span>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </Link>
                                ) : (
                                    <Link
                                        href={route('login')}
                                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-600/25 transition transform hover:-translate-y-0.5"
                                    >
                                        <span>{t('home.btn_login')}</span>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </Link>
                                )}

                                <a
                                    href="#chuong-trinh"
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-white hover:bg-stone-50 text-stone-700 border border-stone-300 shadow-xs transition hover:-translate-y-0.5"
                                >
                                    {t('home.btn_view_curriculum')}
                                </a>
                            </div>

                            {/* Contact & Facebook Bar */}
                            <div className="mt-8 pt-6 border-t border-stone-200 max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-stone-600">
                                {cleanedAddress && (
                                    <div className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-amber-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span>{cleanedAddress}</span>
                                    </div>
                                )}

                                {monastery?.facebook && (
                                    <a
                                        href={monastery.facebook}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-medium transition"
                                    >
                                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                        </svg>
                                        {t('home.facebook_page')}
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 5-Step Learning Pipeline Explanation */}
                    <div className="py-16 border-b border-stone-200 bg-stone-50/70">
                        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                            <div className="text-center max-w-2xl mx-auto space-y-2">
                                <h2 className="font-serif font-bold text-2xl text-stone-900">
                                    {t('home.pipeline_title')}
                                </h2>
                                <p className="text-xs text-stone-600">
                                    {t('home.pipeline_subtitle')}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 text-xs">
                                <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs hover:shadow-md transition space-y-2">
                                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">{t('home.step_1_num')}</span>
                                    <h3 className="font-semibold text-stone-900 text-sm">{t('home.step_1_title')}</h3>
                                    <p className="text-stone-600 text-[11px] leading-relaxed">
                                        {t('home.step_1_desc')}
                                    </p>
                                </div>

                                <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs hover:shadow-md transition space-y-2">
                                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">{t('home.step_2_num')}</span>
                                    <h3 className="font-semibold text-stone-900 text-sm">{t('home.step_2_title')}</h3>
                                    <p className="text-stone-600 text-[11px] leading-relaxed">
                                        {t('home.step_2_desc')}
                                    </p>
                                </div>

                                <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs hover:shadow-md transition space-y-2">
                                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">{t('home.step_3_num')}</span>
                                    <h3 className="font-semibold text-stone-900 text-sm">{t('home.step_3_title')}</h3>
                                    <p className="text-stone-600 text-[11px] leading-relaxed">
                                        {t('home.step_3_desc')}
                                    </p>
                                </div>

                                <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs hover:shadow-md transition space-y-2">
                                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">{t('home.step_4_num')}</span>
                                    <h3 className="font-semibold text-stone-900 text-sm">{t('home.step_4_title')}</h3>
                                    <p className="text-stone-600 text-[11px] leading-relaxed">
                                        {t('home.step_4_desc')}
                                    </p>
                                </div>

                                <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-300 shadow-xs hover:shadow-md transition space-y-2">
                                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">{t('home.step_5_num')}</span>
                                    <h3 className="font-semibold text-stone-900 text-sm">{t('home.step_5_title')}</h3>
                                    <p className="text-stone-600 text-[11px] leading-relaxed">
                                        {t('home.step_5_desc')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Planned Curriculum Sections */}
                    <div id="chuong-trinh" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
                        <div className="text-center max-w-2xl mx-auto space-y-3">
                            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
                                {t('home.curriculum_badge')}
                            </span>
                            <h2 className="font-serif font-bold text-3xl text-stone-900">
                                {t('home.curriculum_title')}
                            </h2>
                            <p className="text-xs text-stone-600">
                                {t('home.curriculum_subtitle')}
                            </p>
                        </div>

                        {/* Four Core Categories Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* 1. Dhamma (Discourse) */}
                            <div className="bg-white rounded-3xl border border-stone-200 p-8 space-y-4 shadow-xs hover:border-amber-500/60 hover:shadow-lg transition">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-serif font-bold text-base shadow-xs">
                                        {t('home.dhamma_num')}
                                    </div>
                                    <div>
                                        <h3 className="font-serif font-bold text-xl text-stone-900">{t('home.dhamma_title')}</h3>
                                        <p className="text-xs font-medium text-amber-700">{t('home.dhamma_subtitle')}</p>
                                    </div>
                                </div>
                                <ul className="space-y-2.5 text-xs text-stone-600 pt-3 border-t border-stone-100">
                                    <li className="flex items-start gap-2.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></span>
                                        <span><strong className="text-stone-800">{t('home.dhamma_point_1_title')}</strong> {t('home.dhamma_point_1_desc')}</span>
                                    </li>
                                    <li className="flex items-start gap-2.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></span>
                                        <span><strong className="text-stone-800">{t('home.dhamma_point_2_title')}</strong> {t('home.dhamma_point_2_desc')}</span>
                                    </li>
                                </ul>
                            </div>

                            {/* 2. Vinaya (Discipline) */}
                            <div className="bg-white rounded-3xl border border-stone-200 p-8 space-y-4 shadow-xs hover:border-amber-500/60 hover:shadow-lg transition">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-serif font-bold text-base shadow-xs">
                                        {t('home.vinaya_num')}
                                    </div>
                                    <div>
                                        <h3 className="font-serif font-bold text-xl text-stone-900">{t('home.vinaya_title')}</h3>
                                        <p className="text-xs font-medium text-amber-700">{t('home.vinaya_subtitle')}</p>
                                    </div>
                                </div>
                                <ul className="space-y-2.5 text-xs text-stone-600 pt-3 border-t border-stone-100">
                                    <li className="flex items-start gap-2.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></span>
                                        <span><strong className="text-stone-800">{t('home.vinaya_point_1_title')}</strong> {t('home.vinaya_point_1_desc')}</span>
                                    </li>
                                    <li className="flex items-start gap-2.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></span>
                                        <span><strong className="text-stone-800">{t('home.vinaya_point_2_title')}</strong> {t('home.vinaya_point_2_desc')}</span>
                                    </li>
                                </ul>
                            </div>

                            {/* 3. Abhidhamma (Higher Teachings) */}
                            <div className="bg-white rounded-3xl border border-stone-200 p-8 space-y-4 shadow-xs hover:border-amber-500/60 hover:shadow-lg transition">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-serif font-bold text-base shadow-xs">
                                        {t('home.abhidhamma_num')}
                                    </div>
                                    <div>
                                        <h3 className="font-serif font-bold text-xl text-stone-900">{t('home.abhidhamma_title')}</h3>
                                        <p className="text-xs font-medium text-amber-700">{t('home.abhidhamma_subtitle')}</p>
                                    </div>
                                </div>
                                <ul className="space-y-2.5 text-xs text-stone-600 pt-3 border-t border-stone-100">
                                    <li className="flex items-start gap-2.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></span>
                                        <span><strong className="text-stone-800">{t('home.abhidhamma_point_1_title')}</strong> {t('home.abhidhamma_point_1_desc')}</span>
                                    </li>
                                </ul>
                            </div>

                            {/* 4. Pali (Canonical Language) */}
                            <div className="bg-white rounded-3xl border border-stone-200 p-8 space-y-4 shadow-xs hover:border-amber-500/60 hover:shadow-lg transition">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-serif font-bold text-base shadow-xs">
                                        {t('home.pali_num')}
                                    </div>
                                    <div>
                                        <h3 className="font-serif font-bold text-xl text-stone-900">{t('home.pali_title')}</h3>
                                        <p className="text-xs font-medium text-amber-700">{t('home.pali_subtitle')}</p>
                                    </div>
                                </div>
                                <ul className="space-y-2.5 text-xs text-stone-600 pt-3 border-t border-stone-100">
                                    <li className="flex items-start gap-2.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></span>
                                        <span><strong className="text-stone-800">{t('home.pali_point_1_title')}</strong> {t('home.pali_point_1_desc')}</span>
                                    </li>
                                    <li className="flex items-start gap-2.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></span>
                                        <span><strong className="text-stone-800">{t('home.pali_point_2_title')}</strong> {t('home.pali_point_2_desc')}</span>
                                    </li>
                                    <li className="flex items-start gap-2.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></span>
                                        <span><strong className="text-stone-800">{t('home.pali_point_3_title')}</strong> {t('home.pali_point_3_desc')}</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="bg-stone-50 border-t border-stone-200 text-stone-600 py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                                        <svg className="w-4 h-4 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                    </div>
                                    <span className="font-serif font-bold text-stone-900 text-base">{t('home.system_title')}</span>
                                </div>
                                <p className="text-xs text-stone-500 leading-relaxed">
                                    {t('home.footer_desc')}
                                </p>
                            </div>

                            <div className="space-y-2 text-xs">
                                <h4 className="font-serif font-bold text-stone-900">{t('home.footer_address_title')}</h4>
                                {cleanedAddress && (
                                    <p className="text-stone-600 leading-relaxed">
                                        {cleanedAddress}
                                    </p>
                                )}
                                <p className="text-stone-500 text-[11px] pt-1">
                                    {t('home.footer_address_note')}
                                </p>
                            </div>

                            <div className="space-y-3 text-xs">
                                <h4 className="font-serif font-bold text-stone-900">{t('home.footer_connect_title')}</h4>
                                {monastery?.facebook && (
                                    <a
                                        href={monastery.facebook}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition font-medium"
                                    >
                                        <svg className="w-4 h-4 fill-current text-blue-600" viewBox="0 0 24 24">
                                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                        </svg>
                                        {t('home.facebook_page')}
                                    </a>
                                )}
                            </div>
                        </div>

                        <div className="border-t border-stone-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-stone-500">
                            <p>&copy; {year} Buddhist Courses. All rights reserved.</p>
                            <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1.5 text-stone-600">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                    {t('home.footer_system_ready')}
                                </span>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}


