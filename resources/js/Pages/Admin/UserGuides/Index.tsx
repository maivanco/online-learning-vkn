import { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useTranslation } from '@/utils/useTranslation';

interface DocItem {
    slug: string;
    title: string;
}

interface TocItem {
    id: string;
    text: string;
    level: number;
}

interface UserGuidesProps extends PageProps {
    documents: DocItem[];
    activeSlug: string;
    activeTitle: string;
    contentHtml: string;
    toc: TocItem[];
    readingTime: number;
    currentLocale: string;
}

export default function UserGuidesIndex({
    auth,
    documents,
    activeSlug,
    activeTitle,
    contentHtml,
    toc,
    readingTime,
    currentLocale,
}: UserGuidesProps) {
    const t = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');

    // Highlight search matches or filter TOC
    const filteredToc = useMemo(() => {
        if (!searchQuery.trim()) return toc;
        const q = searchQuery.toLowerCase();
        return toc.filter((item) => item.text.toLowerCase().includes(q));
    }, [toc, searchQuery]);

    // Handle switching document
    const handleSelectDoc = (slug: string) => {
        router.get(
            route('admin.user-guides.index'),
            { doc: slug },
            { preserveState: true, preserveScroll: false }
        );
    };

    // Print handler
    const handlePrint = () => {
        window.print();
    };

    // Document icon mapping
    const getDocIcon = (slug: string) => {
        if (slug.includes('overview')) {
            return (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
            );
        }
        if (slug.includes('teacher')) {
            return (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
            );
        }
        if (slug.includes('student')) {
            return (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                </svg>
            );
        }
        if (slug.includes('business') || slug.includes('logic')) {
            return (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
            );
        }
        // FAQ
        return (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        );
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={t('user_guides.meta_title')} />

            <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 border border-stone-800 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-medium">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                                </svg>
                                <span>{t('user_guides.badge')}</span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
                                {t('user_guides.title')}
                            </h1>
                            <p className="text-stone-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
                                {t('user_guides.subtitle')}
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={handlePrint}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium border border-stone-700 shadow-sm transition hover:text-white"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                </svg>
                                <span>{t('user_guides.print')}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Document Selector Dropdown */}
                <div className="lg:hidden bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
                    <label htmlFor="mobile-doc-select" className="block text-xs font-semibold text-stone-700 mb-2">
                        {t('user_guides.select_document')}
                    </label>
                    <select
                        id="mobile-doc-select"
                        value={activeSlug}
                        onChange={(e) => handleSelectDoc(e.target.value)}
                        className="w-full text-xs rounded-lg border-stone-300 focus:border-amber-500 focus:ring-amber-500"
                    >
                        {documents.map((doc) => (
                            <option key={doc.slug} value={doc.slug}>
                                {t(`user_guides.docs.${doc.slug}`) !== `user_guides.docs.${doc.slug}`
                                    ? t(`user_guides.docs.${doc.slug}`)
                                    : doc.title}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Main Content Grid: Left Nav | Center Reading Pane | Right TOC */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left Navigation: Chapter List */}
                    <div className="hidden lg:block lg:col-span-3 sticky top-20 space-y-4">
                        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-4">
                            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-400 px-3 mb-3">
                                {t('user_guides.select_document')}
                            </h2>
                            <nav className="space-y-1">
                                {documents.map((doc) => {
                                    const isActive = doc.slug === activeSlug;
                                    const label =
                                        t(`user_guides.docs.${doc.slug}`) !== `user_guides.docs.${doc.slug}`
                                            ? t(`user_guides.docs.${doc.slug}`)
                                            : doc.title;

                                    return (
                                        <button
                                            key={doc.slug}
                                            type="button"
                                            onClick={() => handleSelectDoc(doc.slug)}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-medium transition-all ${
                                                isActive
                                                    ? 'bg-amber-500/10 text-amber-900 border border-amber-500/30 font-semibold shadow-sm'
                                                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50 border border-transparent'
                                            }`}
                                        >
                                            <span className={isActive ? 'text-amber-600' : 'text-stone-400'}>
                                                {getDocIcon(doc.slug)}
                                            </span>
                                            <span className="truncate">{label}</span>
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>

                        {/* Search Input within Document */}
                        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-4">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder={t('user_guides.search_placeholder')}
                                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border-stone-200 focus:border-amber-500 focus:ring-amber-500 placeholder-stone-400"
                                />
                                <svg
                                    className="w-4 h-4 text-stone-400 absolute left-3 top-2.5 pointer-events-none"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Center Column: Reading Paper Article */}
                    <div className="lg:col-span-6 bg-white rounded-2xl border border-stone-200 shadow-sm p-6 sm:p-10">
                        {/* Reading metadata info */}
                        <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-8 text-xs text-stone-400">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-amber-500" />
                                <span>{activeTitle}</span>
                            </div>
                            <div className="flex items-center gap-1 font-mono">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>
                                    {readingTime} {t('user_guides.reading_time')}
                                </span>
                            </div>
                        </div>

                        {/* Markdown Rendered HTML */}
                        <article
                            className="prose prose-stone max-w-none text-stone-800
                                prose-headings:font-serif prose-headings:text-stone-900 prose-headings:font-bold
                                prose-h1:text-2xl prose-h1:leading-tight prose-h1:mb-6
                                prose-h2:text-xl prose-h2:border-b prose-h2:border-stone-200 prose-h2:pb-2.5 prose-h2:mt-10 prose-h2:text-stone-900
                                prose-h3:text-base prose-h3:font-semibold prose-h3:text-amber-800 prose-h3:mt-6
                                prose-p:leading-relaxed prose-p:text-stone-700 prose-p:text-sm
                                prose-li:text-stone-700 prose-li:text-sm
                                prose-blockquote:border-l-4 prose-blockquote:border-amber-500 prose-blockquote:bg-amber-50/50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-xl prose-blockquote:text-stone-700 prose-blockquote:italic
                                prose-table:border prose-table:border-stone-200 prose-table:rounded-xl prose-table:overflow-hidden prose-table:text-xs
                                prose-th:bg-stone-100 prose-th:p-3 prose-th:text-stone-800 prose-th:font-semibold
                                prose-td:p-3 prose-td:border-t prose-td:border-stone-200
                                prose-code:text-amber-800 prose-code:bg-amber-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs
                                prose-hr:border-stone-200"
                            dangerouslySetInnerHTML={{ __html: contentHtml }}
                        />
                    </div>

                    {/* Right Column: Table of Contents (On this page) */}
                    <div className="hidden lg:block lg:col-span-3 sticky top-20">
                        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-4">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 px-2 mb-3 flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
                                </svg>
                                <span>{t('user_guides.table_of_contents')}</span>
                            </h3>

                            {filteredToc.length > 0 ? (
                                <nav className="space-y-1 text-xs max-h-[70vh] overflow-y-auto pr-1">
                                    {filteredToc.map((item) => (
                                        <a
                                            key={item.id}
                                            href={`#${item.id}`}
                                            className={`block py-1.5 rounded-lg transition-colors ${
                                                item.level === 3 ? 'pl-5 text-stone-500' : 'pl-2 text-stone-700 font-medium'
                                            } hover:text-amber-600 hover:bg-stone-50`}
                                        >
                                            {item.text}
                                        </a>
                                    ))}
                                </nav>
                            ) : (
                                <p className="text-xs text-stone-400 px-2 py-4">
                                    {t('user_guides.no_results')}
                                </p>
                            )}

                            <div className="border-t border-stone-100 pt-3 mt-4 px-2">
                                <a
                                    href="#main-wrapper"
                                    className="inline-flex items-center gap-1 text-[11px] text-amber-600 hover:text-amber-700 font-medium"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                    </svg>
                                    <span>Top of page</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
