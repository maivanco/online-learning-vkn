import { useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useTranslation } from '@/utils/useTranslation';

interface LessonItem {
    id: number;
    course_id: number;
    title: string;
    slug?: string;
    order?: number;
}

interface CourseItem {
    id: number;
    parent_id?: number | null;
    title: string;
    slug: string;
    category?: 'dhamma' | 'vinaya' | 'abhidhamma' | 'pali' | string;
    target_audience?: string;
    description?: string | null;
    user?: {
        id: number;
        name: string;
        username: string;
    } | null;
    lessons_count: number;
    classes_count: number;
    order?: number;
    lessons?: LessonItem[];
    parent?: {
        id: number;
        title: string;
    } | null;
    children?: CourseItem[];
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
    locale?: string;
}

export default function Home({
    auth,
    courses,
    activeClassesCount,
    monastery,
    year,
    hasAdmin = true,
    locale = 'vi',
}: HomeProps) {
    const t = useTranslation();

    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [showQr, setShowQr] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const handleCopy = (text: string, field: string) => {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                setCopiedField(field);
                setTimeout(() => setCopiedField(null), 2000);
            }).catch(() => {
                fallbackCopy(text, field);
            });
        } else {
            fallbackCopy(text, field);
        }
    };

    const fallbackCopy = (text: string, field: string) => {
        try {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopiedField(field);
            setTimeout(() => setCopiedField(null), 2000);
        } catch {
            // fallback ignore
        }
    };

    const switchLocale = (newLocale: string) => {
        router.post(route('locale.update'), { locale: newLocale }, { preserveScroll: true });
    };

    // Filter courses based on selected category & search query
    const filteredCourses = useMemo(() => {
        return (courses || []).filter((course) => {
            const matchesCat =
                selectedCategory === 'all' ||
                (course.category && course.category.toLowerCase() === selectedCategory.toLowerCase());

            const query = searchQuery.trim().toLowerCase();
            const matchesQuery =
                !query ||
                course.title.toLowerCase().includes(query) ||
                (course.description && course.description.toLowerCase().includes(query)) ||
                (course.lessons && course.lessons.some((l) => l.title.toLowerCase().includes(query)));

            return matchesCat && matchesQuery;
        });
    }, [courses, selectedCategory, searchQuery]);

    return (
        <>
            <Head title={t('home.meta_title')} />

            <div className="min-h-screen bg-stone-50 text-stone-800 font-sans flex flex-col justify-between selection:bg-amber-600 selection:text-white">
                {/* Header / Navbar */}
                <header className="border-b border-stone-200/80 bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-xs">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
                        {/* Brand Logo */}
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20 shrink-0">
                                {/* Dhammacakka / Dharma Wheel Symbol */}
                                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                                    <circle cx="12" cy="12" r="9" stroke="currentColor" />
                                    <circle cx="12" cy="12" r="3" fill="currentColor" fillOpacity="0.2" />
                                    <path strokeLinecap="round" d="M12 3v6M12 15v6M3 12h6M15 12h6M5.636 5.636l4.243 4.243M14.121 14.121l4.243 4.243M5.636 18.364l4.243-4.243M14.121 9.879l4.243-4.243" />
                                </svg>
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-serif font-bold text-lg text-stone-900 tracking-tight leading-tight">
                                        {t('home.institute_name')}
                                    </span>
                                    <span className="hidden sm:inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200/60">
                                        {t('home.system_title')}
                                    </span>
                                </div>
                                <p className="text-[11px] text-stone-500 font-medium tracking-wide">
                                    {t('home.system_subtitle')}
                                </p>
                            </div>
                        </div>

                        {/* Desktop Navigation Links */}
                        <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-stone-600">
                            <a href="#pillars" className="hover:text-amber-700 transition">
                                {t('home.nav_pillars')}
                            </a>
                            <a href="#resources" className="hover:text-amber-700 transition">
                                {t('home.nav_resources')}
                            </a>
                            <a href="#study-model" className="hover:text-amber-700 transition">
                                {t('home.nav_study_model')}
                            </a>
                            <a href="#pipeline" className="hover:text-amber-700 transition">
                                {t('home.nav_pipeline')}
                            </a>
                            <a href="#curriculum" className="hover:text-amber-700 transition">
                                {t('home.nav_curriculum')}
                            </a>
                        </nav>

                        {/* Right Actions: Locale Toggle & Auth Buttons */}
                        <div className="flex items-center gap-2.5">
                            {/* Language Switcher Pill */}
                            <div className="flex items-center bg-stone-100 p-0.5 rounded-lg border border-stone-200 text-[11px] font-semibold">
                                <button
                                    type="button"
                                    onClick={() => switchLocale('vi')}
                                    className={`px-2 py-1 rounded-md transition ${
                                        locale === 'vi'
                                            ? 'bg-white text-amber-800 shadow-2xs font-bold'
                                            : 'text-stone-500 hover:text-stone-800'
                                    }`}
                                    title="Tiếng Việt"
                                >
                                    VI
                                </button>
                                <button
                                    type="button"
                                    onClick={() => switchLocale('en')}
                                    className={`px-2 py-1 rounded-md transition ${
                                        locale === 'en'
                                            ? 'bg-white text-amber-800 shadow-2xs font-bold'
                                            : 'text-stone-500 hover:text-stone-800'
                                    }`}
                                    title="English"
                                >
                                    EN
                                </button>
                            </div>

                            {/* Auth Links */}
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-sm shadow-amber-600/20 transition"
                                >
                                    <span>{t('home.nav_dashboard')}</span>
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </Link>
                            ) : (
                                <div className="flex items-center gap-2">
                                    {!hasAdmin ? (
                                        <Link
                                            href={route('setup')}
                                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-700 hover:bg-amber-800 text-white shadow-sm shadow-amber-700/25 transition"
                                        >
                                            {t('home.nav_setup')}
                                        </Link>
                                    ) : (
                                        <>
                                            <Link
                                                href={route('login')}
                                                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-stone-700 hover:text-amber-800 hover:bg-stone-100 transition"
                                            >
                                                {t('home.nav_login')}
                                            </Link>
                                            <Link
                                                href={route('register')}
                                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-sm shadow-amber-600/25 transition"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                                </svg>
                                                <span>{t('home.nav_register')}</span>
                                            </Link>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Mobile Hamburger Toggle */}
                            <button
                                type="button"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="lg:hidden p-2 rounded-xl text-stone-600 hover:bg-stone-100 transition"
                                aria-label="Toggle navigation menu"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {mobileMenuOpen ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                    )}
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Mobile Dropdown Menu */}
                    {mobileMenuOpen && (
                        <div className="lg:hidden border-t border-stone-200 bg-white px-4 py-3 space-y-2 text-xs font-semibold text-stone-700">
                            <a
                                href="#pillars"
                                onClick={() => setMobileMenuOpen(false)}
                                className="block px-3 py-2 rounded-lg hover:bg-stone-100 transition"
                            >
                                {t('home.nav_pillars')}
                            </a>
                            <a
                                href="#resources"
                                onClick={() => setMobileMenuOpen(false)}
                                className="block px-3 py-2 rounded-lg hover:bg-stone-100 transition"
                            >
                                {t('home.nav_resources')}
                            </a>
                            <a
                                href="#study-model"
                                onClick={() => setMobileMenuOpen(false)}
                                className="block px-3 py-2 rounded-lg hover:bg-stone-100 transition"
                            >
                                {t('home.nav_study_model')}
                            </a>
                            <a
                                href="#pipeline"
                                onClick={() => setMobileMenuOpen(false)}
                                className="block px-3 py-2 rounded-lg hover:bg-stone-100 transition"
                            >
                                {t('home.nav_pipeline')}
                            </a>
                            <a
                                href="#curriculum"
                                onClick={() => setMobileMenuOpen(false)}
                                className="block px-3 py-2 rounded-lg hover:bg-stone-100 transition"
                            >
                                {t('home.nav_curriculum')}
                            </a>
                            {!auth.user && hasAdmin && (
                                <Link
                                    href={route('login')}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block px-3 py-2 rounded-lg hover:bg-stone-100 text-amber-700 font-bold"
                                >
                                    {t('home.nav_login')}
                                </Link>
                            )}
                        </div>
                    )}
                </header>

                <main className="flex-1">
                    {/* ========================================================================= */}
                    {/* Hero Section */}
                    {/* ========================================================================= */}
                    <section className="relative overflow-hidden py-16 sm:py-24 border-b border-stone-200 bg-gradient-to-b from-amber-50/60 via-white to-stone-50/40">
                        {/* Background glowing orbs */}
                        <div className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none">
                            <div className="h-[420px] w-[650px] rounded-full bg-gradient-to-tr from-amber-200/50 via-yellow-100/40 to-transparent blur-[120px]"></div>
                        </div>

                        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
                            {/* Mission Badge */}
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-amber-100/80 text-amber-900 border border-amber-300/80 shadow-xs">
                                <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse"></span>
                                {t('home.hero_badge')}
                            </div>

                            {/* Main Headings */}
                            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-stone-900 max-w-4xl mx-auto leading-tight">
                                {t('home.hero_title_1')} <br />
                                <span className="bg-gradient-to-r from-amber-600 via-amber-700 to-yellow-600 bg-clip-text text-transparent">
                                    {t('home.hero_title_2')}
                                </span>
                            </h1>

                            {/* Refined Description Statement */}
                            <p className="text-sm sm:text-base text-stone-600 max-w-3xl mx-auto leading-relaxed">
                                {t('home.hero_desc')}
                            </p>

                            {/* Primary Action Buttons */}
                            <div className="pt-4 flex flex-wrap items-center justify-center gap-3.5">
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
                                ) : !auth.user ? (
                                    <>
                                        <Link
                                            href={route('register')}
                                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-600/25 transition transform hover:-translate-y-0.5"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                            </svg>
                                            <span>{t('home.btn_register')}</span>
                                        </Link>
                                        <Link
                                            href={route('login')}
                                            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold bg-white hover:bg-stone-50 text-stone-700 border border-stone-300 shadow-xs transition hover:-translate-y-0.5"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                            </svg>
                                            <span>{t('home.btn_login')}</span>
                                        </Link>
                                    </>
                                ) : (
                                    <Link
                                        href={route('dashboard')}
                                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-600/25 transition transform hover:-translate-y-0.5"
                                    >
                                        <span>{t('home.nav_dashboard')}</span>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </Link>
                                )}

                                <a
                                    href="#curriculum"
                                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold bg-stone-100 hover:bg-stone-200/80 text-stone-800 border border-stone-200 shadow-xs transition hover:-translate-y-0.5"
                                >
                                    <span>{t('home.btn_view_curriculum')}</span>
                                    <svg className="w-4 h-4 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </a>
                            </div>

                            {/* Stat Counter Strip */}
                            <div className="pt-8 max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div className="p-4 rounded-2xl bg-white/80 border border-stone-200/80 shadow-2xs">
                                    <div className="font-serif font-bold text-lg text-amber-700">{t('home.stat_disciplines_count')}</div>
                                    <div className="text-[11px] text-stone-500 font-medium">{t('home.stat_disciplines_label')}</div>
                                </div>
                                <div className="p-4 rounded-2xl bg-white/80 border border-stone-200/80 shadow-2xs">
                                    <div className="font-serif font-bold text-lg text-stone-900">{t('home.stat_resources_count')}</div>
                                    <div className="text-[11px] text-stone-500 font-medium">{t('home.stat_resources_label')}</div>
                                </div>
                                <div className="p-4 rounded-2xl bg-white/80 border border-stone-200/80 shadow-2xs">
                                    <div className="font-serif font-bold text-lg text-stone-900">{t('home.stat_flexibility_count')}</div>
                                    <div className="text-[11px] text-stone-500 font-medium">{t('home.stat_flexibility_label')}</div>
                                </div>
                                <div className="p-4 rounded-2xl bg-white/80 border border-stone-200/80 shadow-2xs">
                                    <div className="font-serif font-bold text-lg text-emerald-700">{t('home.stat_exams_count')}</div>
                                    <div className="text-[11px] text-stone-500 font-medium">{t('home.stat_exams_label')}</div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ========================================================================= */}
                    {/* Section 1: The Four Academic Pillars (Dhamma, Abhidhamma, Vinaya, Pali) */}
                    {/* ========================================================================= */}
                    <section id="pillars" className="py-20 border-b border-stone-200 bg-white">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
                            <div className="text-center max-w-2xl mx-auto space-y-3">
                                <span className="text-xs font-bold text-amber-700 uppercase tracking-widest">
                                    {t('home.pillars_badge')}
                                </span>
                                <h2 className="font-serif font-bold text-3xl sm:text-4xl text-stone-900 tracking-tight">
                                    {t('home.pillars_title')}
                                </h2>
                                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                                    {t('home.pillars_subtitle')}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {/* Pillar 1: Dhamma */}
                                <div className="rounded-3xl border border-amber-200 bg-gradient-to-b from-amber-50/70 to-white p-6 sm:p-7 space-y-4 hover:shadow-lg hover:border-amber-400 transition flex flex-col justify-between group">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shadow-xs group-hover:scale-105 transition">
                                                <svg className="w-6 h-6 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                </svg>
                                            </div>
                                            <span className="font-mono text-xs font-bold text-amber-700 bg-amber-100/70 px-2.5 py-0.5 rounded-full">
                                                {t('home.pillar_dhamma_pali')}
                                            </span>
                                        </div>
                                        <h3 className="font-serif font-bold text-lg text-stone-900 leading-snug">
                                            {t('home.pillar_dhamma_title')}
                                        </h3>
                                        <p className="text-xs text-stone-600 leading-relaxed">
                                            {t('home.pillar_dhamma_desc')}
                                        </p>
                                    </div>
                                    <div className="pt-4 border-t border-amber-100 text-[11px] text-amber-900 font-medium">
                                        {t('home.pillar_dhamma_highlights')}
                                    </div>
                                </div>

                                {/* Pillar 2: Abhidhamma */}
                                <div className="rounded-3xl border border-indigo-200 bg-gradient-to-b from-indigo-50/50 to-white p-6 sm:p-7 space-y-4 hover:shadow-lg hover:border-indigo-400 transition flex flex-col justify-between group">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center shadow-xs group-hover:scale-105 transition">
                                                <svg className="w-6 h-6 text-indigo-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                                </svg>
                                            </div>
                                            <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-100/70 px-2.5 py-0.5 rounded-full">
                                                {t('home.pillar_abhidhamma_pali')}
                                            </span>
                                        </div>
                                        <h3 className="font-serif font-bold text-lg text-stone-900 leading-snug">
                                            {t('home.pillar_abhidhamma_title')}
                                        </h3>
                                        <p className="text-xs text-stone-600 leading-relaxed">
                                            {t('home.pillar_abhidhamma_desc')}
                                        </p>
                                    </div>
                                    <div className="pt-4 border-t border-indigo-100 text-[11px] text-indigo-900 font-medium">
                                        {t('home.pillar_abhidhamma_highlights')}
                                    </div>
                                </div>

                                {/* Pillar 3: Vinaya */}
                                <div className="rounded-3xl border border-emerald-200 bg-gradient-to-b from-emerald-50/50 to-white p-6 sm:p-7 space-y-4 hover:shadow-lg hover:border-emerald-400 transition flex flex-col justify-between group">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-xs group-hover:scale-105 transition">
                                                <svg className="w-6 h-6 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                </svg>
                                            </div>
                                            <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded-full">
                                                {t('home.pillar_vinaya_pali')}
                                            </span>
                                        </div>
                                        <h3 className="font-serif font-bold text-lg text-stone-900 leading-snug">
                                            {t('home.pillar_vinaya_title')}
                                        </h3>
                                        <p className="text-xs text-stone-600 leading-relaxed">
                                            {t('home.pillar_vinaya_desc')}
                                        </p>
                                    </div>
                                    <div className="pt-4 border-t border-emerald-100 text-[11px] text-emerald-900 font-medium">
                                        {t('home.pillar_vinaya_highlights')}
                                    </div>
                                </div>

                                {/* Pillar 4: Pali */}
                                <div className="rounded-3xl border border-amber-200 bg-gradient-to-b from-amber-50/50 to-white p-6 sm:p-7 space-y-4 hover:shadow-lg hover:border-amber-400 transition flex flex-col justify-between group">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shadow-xs group-hover:scale-105 transition">
                                                <svg className="w-6 h-6 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                                                </svg>
                                            </div>
                                            <span className="font-mono text-xs font-bold text-amber-700 bg-amber-100/70 px-2.5 py-0.5 rounded-full">
                                                {t('home.pillar_pali_pali')}
                                            </span>
                                        </div>
                                        <h3 className="font-serif font-bold text-lg text-stone-900 leading-snug">
                                            {t('home.pillar_pali_title')}
                                        </h3>
                                        <p className="text-xs text-stone-600 leading-relaxed">
                                            {t('home.pillar_pali_desc')}
                                        </p>
                                    </div>
                                    <div className="pt-4 border-t border-amber-100 text-[11px] text-amber-900 font-medium">
                                        {t('home.pillar_pali_highlights')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ========================================================================= */}
                    {/* Section 2: Standardized Learning Resources (By Subject & Class) */}
                    {/* ========================================================================= */}
                    <section id="resources" className="py-20 border-b border-stone-200 bg-stone-50/70">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
                            <div className="text-center max-w-3xl mx-auto space-y-3">
                                <span className="text-xs font-bold text-amber-700 uppercase tracking-widest">
                                    {t('home.resources_badge')}
                                </span>
                                <h2 className="font-serif font-bold text-3xl sm:text-4xl text-stone-900 tracking-tight">
                                    {t('home.resources_title')}
                                </h2>
                                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                                    {t('home.resources_subtitle')}
                                </p>
                            </div>

                            {/* 3 Core Asset Columns */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Resource 1: Study Materials */}
                                <div className="bg-white rounded-3xl border border-stone-200 p-7 space-y-5 shadow-xs hover:shadow-md transition">
                                    <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
                                        <svg className="w-6 h-6 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                    </div>
                                    <div className="space-y-2">
                                        <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wide">
                                            {t('home.resource_materials_badge')}
                                        </span>
                                        <h3 className="font-serif font-bold text-xl text-stone-900 leading-snug">
                                            {t('home.resource_materials_title')}
                                        </h3>
                                        <p className="text-xs text-stone-600 leading-relaxed">
                                            {t('home.resource_materials_desc')}
                                        </p>
                                    </div>
                                    <ul className="space-y-2 pt-3 border-t border-stone-100 text-xs text-stone-700">
                                        <li className="flex items-start gap-2">
                                            <span className="text-emerald-600 font-bold shrink-0">✓</span>
                                            <span>{t('home.resource_materials_point1')}</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-emerald-600 font-bold shrink-0">✓</span>
                                            <span>{t('home.resource_materials_point2')}</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-emerald-600 font-bold shrink-0">✓</span>
                                            <span>{t('home.resource_materials_point3')}</span>
                                        </li>
                                    </ul>
                                </div>

                                {/* Resource 2: Lecture Videos */}
                                <div className="bg-white rounded-3xl border border-stone-200 p-7 space-y-5 shadow-xs hover:shadow-md transition">
                                    <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
                                        <svg className="w-6 h-6 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div className="space-y-2">
                                        <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wide">
                                            {t('home.resource_videos_badge')}
                                        </span>
                                        <h3 className="font-serif font-bold text-xl text-stone-900 leading-snug">
                                            {t('home.resource_videos_title')}
                                        </h3>
                                        <p className="text-xs text-stone-600 leading-relaxed">
                                            {t('home.resource_videos_desc')}
                                        </p>
                                    </div>
                                    <ul className="space-y-2 pt-3 border-t border-stone-100 text-xs text-stone-700">
                                        <li className="flex items-start gap-2">
                                            <span className="text-emerald-600 font-bold shrink-0">✓</span>
                                            <span>{t('home.resource_videos_point1')}</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-emerald-600 font-bold shrink-0">✓</span>
                                            <span>{t('home.resource_videos_point2')}</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-emerald-600 font-bold shrink-0">✓</span>
                                            <span>{t('home.resource_videos_point3')}</span>
                                        </li>
                                    </ul>
                                </div>

                                {/* Resource 3: Multiple-Choice Quizzes */}
                                <div className="bg-white rounded-3xl border border-stone-200 p-7 space-y-5 shadow-xs hover:shadow-md transition">
                                    <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
                                        <svg className="w-6 h-6 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                        </svg>
                                    </div>
                                    <div className="space-y-2">
                                        <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wide">
                                            {t('home.resource_quizzes_badge')}
                                        </span>
                                        <h3 className="font-serif font-bold text-xl text-stone-900 leading-snug">
                                            {t('home.resource_quizzes_title')}
                                        </h3>
                                        <p className="text-xs text-stone-600 leading-relaxed">
                                            {t('home.resource_quizzes_desc')}
                                        </p>
                                    </div>
                                    <ul className="space-y-2 pt-3 border-t border-stone-100 text-xs text-stone-700">
                                        <li className="flex items-start gap-2">
                                            <span className="text-emerald-600 font-bold shrink-0">✓</span>
                                            <span>{t('home.resource_quizzes_point1')}</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-emerald-600 font-bold shrink-0">✓</span>
                                            <span>{t('home.resource_quizzes_point2')}</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-emerald-600 font-bold shrink-0">✓</span>
                                            <span>{t('home.resource_quizzes_point3')}</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ========================================================================= */}
                    {/* Section 3: Study & Exam Model (Convenience vs Fixed Schedule) */}
                    {/* ========================================================================= */}
                    <section id="study-model" className="py-20 border-b border-stone-200 bg-white">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
                            <div className="text-center max-w-3xl mx-auto space-y-3">
                                <span className="text-xs font-bold text-amber-700 uppercase tracking-widest">
                                    {t('home.model_badge')}
                                </span>
                                <h2 className="font-serif font-bold text-3xl sm:text-4xl text-stone-900 tracking-tight">
                                    {t('home.model_title')}
                                </h2>
                                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                                    {t('home.model_subtitle')}
                                </p>
                            </div>

                            {/* Dual Comparison Cards */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                                {/* Card 1: Self-Paced Convenience */}
                                <div className="rounded-3xl border border-stone-200 bg-gradient-to-b from-stone-50 via-white to-white p-7 sm:p-9 space-y-6 shadow-xs flex flex-col justify-between">
                                    <div className="space-y-5">
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200/80">
                                                {t('home.model_selfpaced_tag')}
                                            </span>
                                            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <h3 className="font-serif font-bold text-2xl text-stone-900">
                                                {t('home.model_selfpaced_title')}
                                            </h3>
                                            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                                                {t('home.model_selfpaced_desc')}
                                            </p>
                                        </div>

                                        <div className="space-y-4 pt-2">
                                            <div className="flex items-start gap-3.5">
                                                <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                                                    1
                                                </div>
                                                <div className="space-y-1">
                                                    <h4 className="text-xs font-bold text-stone-900">{t('home.model_selfpaced_item1_title')}</h4>
                                                    <p className="text-xs text-stone-600 leading-relaxed">{t('home.model_selfpaced_item1_desc')}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3.5">
                                                <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                                                    2
                                                </div>
                                                <div className="space-y-1">
                                                    <h4 className="text-xs font-bold text-stone-900">{t('home.model_selfpaced_item2_title')}</h4>
                                                    <p className="text-xs text-stone-600 leading-relaxed">{t('home.model_selfpaced_item2_desc')}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3.5">
                                                <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                                                    3
                                                </div>
                                                <div className="space-y-1">
                                                    <h4 className="text-xs font-bold text-stone-900">{t('home.model_selfpaced_item3_title')}</h4>
                                                    <p className="text-xs text-stone-600 leading-relaxed">{t('home.model_selfpaced_item3_desc')}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {!auth.user && (
                                        <div className="pt-6 border-t border-stone-200">
                                            <Link
                                                href={route('register')}
                                                className="inline-flex items-center justify-center gap-2 w-full px-5 py-2.5 rounded-xl text-xs font-semibold bg-stone-900 hover:bg-stone-800 text-white transition"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                                </svg>
                                                <span>{t('home.btn_register')}</span>
                                            </Link>
                                        </div>
                                    )}
                                </div>

                                {/* Card 2: Fixed Examination Schedule */}
                                <div className="rounded-3xl border border-amber-300 bg-gradient-to-b from-amber-50/70 via-white to-white p-7 sm:p-9 space-y-6 shadow-sm flex flex-col justify-between">
                                    <div className="space-y-5">
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-700 text-white shadow-2xs">
                                                {t('home.model_exam_tag')}
                                            </span>
                                            <div className="w-10 h-10 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <h3 className="font-serif font-bold text-2xl text-stone-900">
                                                {t('home.model_exam_title')}
                                            </h3>
                                            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                                                {t('home.model_exam_desc')}
                                            </p>
                                        </div>

                                        <div className="space-y-4 pt-2">
                                            <div className="flex items-start gap-3.5">
                                                <div className="w-6 h-6 rounded-lg bg-amber-200 text-amber-900 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                                                    1
                                                </div>
                                                <div className="space-y-1">
                                                    <h4 className="text-xs font-bold text-stone-900">{t('home.model_exam_item1_title')}</h4>
                                                    <p className="text-xs text-stone-600 leading-relaxed">{t('home.model_exam_item1_desc')}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3.5">
                                                <div className="w-6 h-6 rounded-lg bg-amber-200 text-amber-900 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                                                    2
                                                </div>
                                                <div className="space-y-1">
                                                    <h4 className="text-xs font-bold text-stone-900">{t('home.model_exam_item2_title')}</h4>
                                                    <p className="text-xs text-stone-600 leading-relaxed">{t('home.model_exam_item2_desc')}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3.5">
                                                <div className="w-6 h-6 rounded-lg bg-amber-200 text-amber-900 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                                                    3
                                                </div>
                                                <div className="space-y-1">
                                                    <h4 className="text-xs font-bold text-stone-900">{t('home.model_exam_item3_title')}</h4>
                                                    <p className="text-xs text-stone-600 leading-relaxed">{t('home.model_exam_item3_desc')}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-amber-200">
                                        <div className="flex items-center gap-2 text-xs font-medium text-amber-900 bg-amber-100/60 p-3 rounded-xl">
                                            <svg className="w-4 h-4 text-amber-700 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span>{t('home.pipeline_subtitle')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ========================================================================= */}
                    {/* Section 4: 5-Step Learning Pipeline */}
                    {/* ========================================================================= */}
                    <section id="pipeline" className="py-20 border-b border-stone-200 bg-stone-50/80">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
                            <div className="text-center max-w-3xl mx-auto space-y-3">
                                <span className="text-xs font-bold text-amber-700 uppercase tracking-widest">
                                    {t('home.pipeline_title')}
                                </span>
                                <h2 className="font-serif font-bold text-3xl sm:text-4xl text-stone-900">
                                    {t('home.pipeline_title')}
                                </h2>
                                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
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

                                <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-300 shadow-xs hover:shadow-md transition space-y-2">
                                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">{t('home.step_5_num')}</span>
                                    <h3 className="font-semibold text-stone-900 text-sm">{t('home.step_5_title')}</h3>
                                    <p className="text-stone-600 text-[11px] leading-relaxed">
                                        {t('home.step_5_desc')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ========================================================================= */}
                    {/* Section 5: Course Catalog & Active Classes */}
                    {/* ========================================================================= */}
                    <section id="curriculum" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
                        <div className="text-center max-w-3xl mx-auto space-y-3">
                            <span className="text-xs font-bold text-amber-700 uppercase tracking-widest">
                                {t('home.curriculum_badge')}
                            </span>
                            <h2 className="font-serif font-bold text-3xl sm:text-4xl text-stone-900">
                                {t('home.curriculum_title')}
                            </h2>
                            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                                {t('home.curriculum_subtitle')}
                            </p>
                        </div>

                        {/* Interactive Filter Pills & Search */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                            {/* Category Filter Tabs */}
                            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white border border-stone-200/90 rounded-2xl shadow-2xs">
                                <button
                                    type="button"
                                    onClick={() => setSelectedCategory('all')}
                                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                                        selectedCategory === 'all'
                                            ? 'bg-amber-600 text-white shadow-xs'
                                            : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                                    }`}
                                >
                                    {t('home.filter_all')}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSelectedCategory('dhamma')}
                                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                                        selectedCategory === 'dhamma'
                                            ? 'bg-amber-600 text-white shadow-xs'
                                            : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                                    }`}
                                >
                                    {t('home.filter_dhamma')}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSelectedCategory('abhidhamma')}
                                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                                        selectedCategory === 'abhidhamma'
                                            ? 'bg-amber-600 text-white shadow-xs'
                                            : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                                    }`}
                                >
                                    {t('home.filter_abhidhamma')}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSelectedCategory('vinaya')}
                                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                                        selectedCategory === 'vinaya'
                                            ? 'bg-amber-600 text-white shadow-xs'
                                            : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                                    }`}
                                >
                                    {t('home.filter_vinaya')}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSelectedCategory('pali')}
                                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                                        selectedCategory === 'pali'
                                            ? 'bg-amber-600 text-white shadow-xs'
                                            : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                                    }`}
                                >
                                    {t('home.filter_pali')}
                                </button>
                            </div>

                            {/* Search Box */}
                            <div className="relative w-full sm:w-64">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search courses..."
                                    className="w-full text-xs rounded-xl border border-stone-200 bg-white py-2 pl-8 pr-3 text-stone-800 placeholder-stone-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-2xs"
                                />
                                <svg
                                    className="w-4 h-4 text-stone-400 absolute left-2.5 top-2.5 pointer-events-none"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>

                        {/* Courses Grid */}
                        {filteredCourses.length === 0 ? (
                            <div className="text-center py-16 px-4 rounded-3xl bg-white border border-stone-200/90 max-w-xl mx-auto space-y-3 shadow-xs">
                                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto shadow-2xs">
                                    <svg className="w-6 h-6 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </div>
                                <p className="text-sm text-stone-600 font-medium">
                                    {t('home.no_courses')}
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                                {filteredCourses.map((course, idx) => {
                                    const hasLessons = course.lessons && course.lessons.length > 0;
                                    const hasChildren = course.children && course.children.length > 0;

                                    return (
                                        <div
                                            key={course.id}
                                            className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 space-y-6 shadow-xs hover:border-amber-500/60 hover:shadow-lg transition duration-200 flex flex-col justify-between"
                                        >
                                            <div className="space-y-5">
                                                {/* Course Header */}
                                                <div className="flex items-start gap-3.5">
                                                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-serif font-bold text-base shadow-xs shrink-0 mt-0.5">
                                                        {idx + 1}
                                                    </div>
                                                    <div className="flex-1 space-y-2">
                                                        <h3 className="font-serif font-bold text-xl text-stone-900 leading-snug">
                                                            {course.title}
                                                        </h3>

                                                        {/* Badges / Meta */}
                                                        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                                                            {course.category && (
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/60 font-medium capitalize">
                                                                    {course.category}
                                                                </span>
                                                            )}
                                                            {course.target_audience && course.target_audience !== 'all' && (
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 font-medium capitalize">
                                                                    {course.target_audience}
                                                                </span>
                                                            )}
                                                            {course.lessons_count > 0 && (
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 font-medium">
                                                                    {course.lessons_count} {course.lessons_count === 1 ? t('home.lesson_unit') : t('home.lessons_count')}
                                                                </span>
                                                            )}
                                                            {course.classes_count > 0 && (
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/60 font-medium">
                                                                    {course.classes_count} {t('home.classes_count')}
                                                                </span>
                                                            )}
                                                            {course.user && (
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 font-medium">
                                                                    <svg className="w-3 h-3 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                                    </svg>
                                                                    <span>{course.user.name}</span>
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Description */}
                                                        {course.description && (
                                                            <div
                                                                className="text-stone-600 text-xs leading-relaxed prose prose-stone prose-xs max-w-none [&>p]:m-0"
                                                                dangerouslySetInnerHTML={{ __html: course.description }}
                                                            />
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Lessons list */}
                                                {hasLessons && (
                                                    <div className="pt-4 border-t border-stone-100 space-y-2.5">
                                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-800">
                                                            <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                            </svg>
                                                            <span>{t('home.lessons_title')} ({course.lessons!.length})</span>
                                                        </div>
                                                        <ul className="space-y-1.5 pl-1">
                                                            {course.lessons!.map((lesson, lIdx) => (
                                                                <li key={lesson.id} className="flex items-start gap-2.5 text-xs text-stone-700">
                                                                    <span className="w-5 h-5 rounded-md bg-amber-50 text-amber-700 text-[10px] font-bold flex items-center justify-center shrink-0 border border-amber-200/60 mt-0.5">
                                                                        {lesson.order ?? lIdx + 1}
                                                                    </span>
                                                                    <span className="leading-snug py-0.5 font-medium">{lesson.title}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}

                                                {/* Sub-courses / Tracks */}
                                                {hasChildren && (
                                                    <div className="pt-4 border-t border-stone-100 space-y-3">
                                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-800">
                                                            <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                            </svg>
                                                            <span>{t('home.sub_courses_title')} ({course.children!.length})</span>
                                                        </div>

                                                        <div className="space-y-3">
                                                            {course.children!.map((child) => {
                                                                const childHasLessons = child.lessons && child.lessons.length > 0;
                                                                return (
                                                                    <div
                                                                        key={child.id}
                                                                        className="bg-stone-50/90 rounded-2xl p-4 border border-stone-200/80 space-y-2.5"
                                                                    >
                                                                        <div className="space-y-1">
                                                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                                                <h4 className="text-xs font-bold text-stone-900 leading-tight">
                                                                                    {child.title}
                                                                                </h4>
                                                                                {(child.lessons_count > 0 || child.classes_count > 0 || child.user) && (
                                                                                    <div className="flex items-center gap-1.5 text-[10px] text-stone-500">
                                                                                        {child.user && (
                                                                                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white border border-stone-200 text-stone-600 font-medium">
                                                                                                <svg className="w-2.5 h-2.5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                                                                </svg>
                                                                                                <span>{child.user.name}</span>
                                                                                            </span>
                                                                                        )}
                                                                                        {child.lessons_count > 0 && (
                                                                                            <span className="px-1.5 py-0.5 rounded bg-white border border-stone-200 text-stone-600 font-medium">
                                                                                                {child.lessons_count} {child.lessons_count === 1 ? t('home.lesson_unit') : t('home.lessons_count')}
                                                                                            </span>
                                                                                        )}
                                                                                        {child.classes_count > 0 && (
                                                                                            <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-medium">
                                                                                                {child.classes_count} {t('home.classes_count')}
                                                                                            </span>
                                                                                        )}
                                                                                    </div>
                                                                                )}
                                                                            </div>

                                                                            {child.description && (
                                                                                <div
                                                                                    className="text-[11px] text-stone-500 prose prose-stone prose-xs max-w-none [&>p]:m-0"
                                                                                    dangerouslySetInnerHTML={{ __html: child.description }}
                                                                                />
                                                                            )}
                                                                        </div>

                                                                        {childHasLessons ? (
                                                                            <div className="pt-2 border-t border-stone-200/60 space-y-1.5">
                                                                                <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">
                                                                                    {t('home.lessons_title')}
                                                                                </span>
                                                                                <ul className="space-y-1 pl-0.5">
                                                                                    {child.lessons!.map((clesson, clIdx) => (
                                                                                        <li key={clesson.id} className="flex items-start gap-2 text-[11px] text-stone-600">
                                                                                            <span className="w-4 h-4 rounded bg-white text-stone-500 text-[9px] font-medium flex items-center justify-center shrink-0 border border-stone-200/80 mt-0.5">
                                                                                                {clesson.order ?? clIdx + 1}
                                                                                            </span>
                                                                                            <span className="leading-snug py-0.5">{clesson.title}</span>
                                                                                        </li>
                                                                                    ))}
                                                                                </ul>
                                                                            </div>
                                                                        ) : (
                                                                            <p className="text-[10px] text-stone-400 italic pt-1">
                                                                                {t('home.no_lessons')}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}

                                                {!hasLessons && !hasChildren && (
                                                    <div className="pt-4 border-t border-stone-100">
                                                        <p className="text-xs text-stone-400 italic">
                                                            {t('home.no_lessons')}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>

                    {/* ========================================================================= */}
                    {/* Section 6: Student Enrollment Call To Action */}
                    {/* ========================================================================= */}
                    <section className="py-20 bg-gradient-to-br from-amber-600 via-amber-700 to-yellow-700 text-white relative overflow-hidden">
                        <div className="absolute inset-0 -z-10 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>

                        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
                            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md text-amber-50 border border-white/25">
                                {t('home.cta_badge')}
                            </span>
                            <h2 className="font-serif font-bold text-3xl sm:text-5xl text-white tracking-tight leading-tight">
                                {t('home.cta_title')}
                            </h2>
                            <p className="text-sm sm:text-base text-amber-100/90 max-w-2xl mx-auto leading-relaxed">
                                {t('home.cta_desc')}
                            </p>

                            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
                                {auth.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl text-sm font-semibold bg-white text-amber-900 shadow-xl hover:bg-stone-100 transition transform hover:-translate-y-0.5"
                                    >
                                        <span>{t('home.nav_dashboard')}</span>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route('register')}
                                            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl text-sm font-semibold bg-white text-amber-900 shadow-xl hover:bg-stone-100 transition transform hover:-translate-y-0.5"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                            </svg>
                                            <span>{t('home.cta_btn_register')}</span>
                                        </Link>
                                        <Link
                                            href={route('login')}
                                            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-semibold bg-amber-800/60 hover:bg-amber-800 text-white border border-white/20 transition transform hover:-translate-y-0.5"
                                        >
                                            <span>{t('home.cta_btn_login')}</span>
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </section>
                </main>

                {/* ========================================================================= */}
                {/* Footer */}
                {/* ========================================================================= */}
                <footer className="bg-stone-100 border-t border-stone-200 text-stone-600 py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
                            {/* Brand & System Overview */}
                            <div className="md:col-span-1 lg:col-span-4 space-y-3">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                                        <svg className="w-4 h-4 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                    </div>
                                    <span className="font-serif font-bold text-stone-900 text-base">{t('home.institute_name')} – {t('home.system_title')}</span>
                                </div>
                                <p className="text-xs text-stone-500 leading-relaxed">
                                    {t('home.footer_desc')}
                                </p>
                                {monastery?.address && (
                                    <p className="text-[11px] text-stone-500">
                                        <strong className="text-stone-700">{t('home.footer_address_title')}:</strong> {monastery.address}
                                    </p>
                                )}
                            </div>

                            {/* Social Connect & Quick Navigation */}
                            <div className="md:col-span-1 lg:col-span-4 space-y-3 text-xs">
                                <h4 className="font-serif font-bold text-sm text-stone-900">{t('home.footer_connect_title')}</h4>
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
                                <div className="pt-2 text-stone-500 text-[11px]">
                                    <p>{t('home.footer_address_note')}</p>
                                </div>
                            </div>

                            {/* Monastery Donation Section */}
                            <div className="md:col-span-1 lg:col-span-4 space-y-2.5 text-xs">
                                <div className="flex items-center justify-between gap-2">
                                    <h4 className="font-serif font-bold text-sm text-stone-900 flex items-center gap-1.5">
                                        <svg className="w-4 h-4 text-amber-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                        <span>{t('home.footer_donation_title')}</span>
                                    </h4>
                                    <button
                                        type="button"
                                        onClick={() => setShowQr(!showQr)}
                                        className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-800 hover:text-amber-900 bg-amber-100/70 hover:bg-amber-100 px-2.5 py-0.5 rounded-lg border border-amber-300/80 transition cursor-pointer shrink-0"
                                    >
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                        </svg>
                                        {showQr ? t('home.footer_hide_qr') : t('home.footer_view_qr')}
                                    </button>
                                </div>
                                <p className="text-[11px] text-stone-500 leading-relaxed">
                                    {t('home.footer_donation_desc')}
                                </p>
                                <div className="bg-white rounded-2xl border border-stone-200/90 p-3.5 space-y-2 shadow-2xs">
                                    {/* Bank */}
                                    <div className="flex items-start justify-between gap-2">
                                        <span className="text-stone-500 text-[11px] shrink-0">{t('home.footer_bank_name')}:</span>
                                        <span className="font-semibold text-stone-800 text-right text-[11px]">{t('home.footer_bank_val')}</span>
                                    </div>

                                    {/* Account Number */}
                                    <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-stone-100">
                                        <span className="text-stone-500 text-[11px] shrink-0">{t('home.footer_account_number')}:</span>
                                        <div className="flex items-center gap-1.5">
                                            <span className="font-mono font-bold text-amber-700 text-xs tracking-wider">0121000887514</span>
                                            <button
                                                type="button"
                                                onClick={() => handleCopy('0121000887514', 'account')}
                                                title={t('home.footer_copy')}
                                                className="p-1 rounded text-stone-400 hover:text-amber-700 hover:bg-amber-50 transition cursor-pointer"
                                            >
                                                {copiedField === 'account' ? (
                                                    <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-0.5">
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        {t('home.footer_copied')}
                                                    </span>
                                                ) : (
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Account Name */}
                                    <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-stone-100">
                                        <span className="text-stone-500 text-[11px] shrink-0">{t('home.footer_account_name')}:</span>
                                        <span className="font-semibold text-stone-800 uppercase text-[11px]">NI VIEN VIEN KHONG</span>
                                    </div>

                                    {/* Transfer Reference */}
                                    <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-stone-100">
                                        <span className="text-stone-500 text-[11px] shrink-0">{t('home.footer_transfer_ref')}:</span>
                                        <div className="flex items-center gap-1.5">
                                            <span className="font-mono font-bold text-stone-800 text-[11px] bg-stone-100 px-1.5 py-0.5 rounded">WEB DONATE</span>
                                            <button
                                                type="button"
                                                onClick={() => handleCopy('WEB DONATE', 'ref')}
                                                title={t('home.footer_copy')}
                                                className="p-1 rounded text-stone-400 hover:text-amber-700 hover:bg-amber-50 transition cursor-pointer"
                                            >
                                                {copiedField === 'ref' ? (
                                                    <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-0.5">
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        {t('home.footer_copied')}
                                                    </span>
                                                ) : (
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Expandable VietQR Code */}
                                    {showQr && (
                                        <div className="pt-2 border-t border-stone-100 flex flex-col items-center text-center space-y-1.5">
                                            <div className="p-2 bg-stone-50 rounded-xl border border-stone-200/90 shadow-2xs max-w-[180px]">
                                                <img
                                                    src="https://img.vietqr.io/image/970436-0121000887514-compact2.png?amount=0&addInfo=WEB%20DONATE&accountName=NI%20VIEN%20VIEN%20KHONG"
                                                    alt="VietQR Vietcombank NI VIEN VIEN KHONG"
                                                    className="w-full h-auto rounded"
                                                    loading="lazy"
                                                />
                                            </div>
                                            <span className="text-[10px] text-stone-400">VietQR • Vietcombank (0121000887514)</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-stone-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-stone-500">
                            <p>&copy; {year} {t('home.institute_name')} – {t('home.system_title')}. All rights reserved.</p>
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
