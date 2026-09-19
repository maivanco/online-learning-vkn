import { Link, usePage } from "@inertiajs/react";
import { admin_url } from "@/utils/helper";
import { useTranslation } from "@/utils/useTranslation";

export default function Sidebar() {
    const { url } = usePage();
    const t = useTranslation();

    const navLinks = [
        {
            label: t('nav.classes_progress'),
            href: admin_url('dashboard'),
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
            ),
        },
        {
            label: t('nav.courses_lessons'),
            href: admin_url('materials'),
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
            ),
        },
        {
            label: t('nav.question_bank'),
            href: admin_url('questions'),
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
        },
        {
            label: t('nav.users_roles'),
            href: admin_url('users'),
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
        },
        {
            label: t('nav.security_password'),
            href: admin_url('profile/edit'),
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
            ),
        },
    ];

    return (
        <aside id="sidebar-left" className="fixed z-30 top-0 left-0 h-full w-[260px] bg-stone-900 text-stone-200 flex flex-col justify-between border-r border-stone-800 shadow-xl">
            <div>
                {/* Brand Header */}
                <div className="p-5 border-b border-stone-800/80 bg-stone-950/40">
                    <Link href="/" className="flex items-center gap-3">
                        <div>
                            <h1 className="font-serif font-bold text-sm text-white tracking-wide leading-tight">
                                Buddhist Learning
                            </h1>
                            <p className="text-[11px] text-amber-400/90 font-medium">
                                Class Manager Portal
                            </p>
                        </div>
                    </Link>
                </div>

                {/* Navigation Items */}
                <nav className="p-3 space-y-1">
                    {navLinks.map((item) => {
                        const isActive = url === item.href || (item.href !== '/admin/dashboard' && url.startsWith(item.href));
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                                    isActive
                                        ? 'bg-amber-600/20 text-amber-300 border border-amber-500/30 shadow-sm'
                                        : 'text-stone-400 hover:text-stone-100 hover:bg-stone-800/60'
                                }`}
                            >
                                <span className={isActive ? 'text-amber-400' : 'text-stone-400'}>{item.icon}</span>
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Monastery Info Footer */}
            <div className="p-4 border-t border-stone-800/80 bg-stone-950/60 text-[11px] text-stone-400">
                <p className="font-medium text-stone-300">{t('nav.monastery_name')}</p>
                <p className="text-[10px] text-stone-400 mt-0.5 leading-tight">
                    {t('nav.monastery_address')}
                </p>
                <a
                    href="https://www.facebook.com/share/1DCWqsCZSY/?mibextid=wwXIfr"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-[10px] text-amber-400 hover:text-amber-300 mt-2 hover:underline"
                >
                    <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    {t('nav.monastery_facebook')}
                </a>
            </div>
        </aside>
    );
}