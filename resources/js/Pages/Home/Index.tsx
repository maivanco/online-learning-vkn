import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
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
}

export default function Home({ auth, courses, activeClassesCount, monastery, year, hasAdmin = true }: HomeProps) {
    const t = useTranslation();

    const cleanedAddress = monastery?.address
        ? monastery.address.replace(/^[^,]+,\s*/, '')
        : '';

    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [showQr, setShowQr] = useState(false);

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

                        {/* Courses Grid */}
                        {!courses || courses.length === 0 ? (
                            <div className="text-center py-16 px-4 rounded-3xl bg-stone-50 border border-stone-200/90 max-w-xl mx-auto space-y-3">
                                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto shadow-2xs">
                                    <svg className="w-6 h-6 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </div>
                                <p className="text-sm text-stone-500 font-medium">
                                    {t('home.no_courses')}
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                                {courses.map((course, idx) => {
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
                                                        </div>

                                                        {/* Description if present */}
                                                        {course.description && (
                                                            <div
                                                                className="text-stone-600 text-xs leading-relaxed prose prose-stone prose-xs max-w-none [&>p]:m-0"
                                                                dangerouslySetInnerHTML={{ __html: course.description }}
                                                            />
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Lessons of this Course */}
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
                                                                                {(child.lessons_count > 0 || child.classes_count > 0) && (
                                                                                    <div className="flex items-center gap-1.5 text-[10px] text-stone-500">
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

                                                                        {/* Sub-course Lesson Titles */}
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
                    </div>
                </main>

                {/* Footer */}
                <footer className="bg-stone-50 border-t border-stone-200 text-stone-600 py-12">
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
                                    <span className="font-serif font-bold text-stone-900 text-base">{t('home.system_title')}</span>
                                </div>
                                <p className="text-xs text-stone-500 leading-relaxed">
                                    {t('home.footer_desc')}
                                </p>
                            </div>

                            {/* Social Connect */}
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


