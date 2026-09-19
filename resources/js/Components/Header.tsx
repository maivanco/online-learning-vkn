import { User } from '@/types';
import Dropdown from '@/Components/Dropdown';
import { usePage } from '@inertiajs/react';
import { useTranslation } from '@/utils/useTranslation';

export default function Header({ user }: { user: User }) {
    const t = useTranslation();
    const { url } = usePage();

    const isHomeActive = url === '/';

    return (
        <header id="site-header" className="bg-slate-900 border-b border-slate-800 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-8">
                        <a className="flex items-center gap-2 text-xl font-bold tracking-tight text-white hover:text-indigo-400 transition" href="/">
                            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white shadow">
                                <i className="fas fa-graduation-cap text-lg"></i>
                            </span>
                            <span>{t('nav.buddhist_courses')}</span>
                        </a>

                        <nav id="main-nav" className="hidden md:flex items-center space-x-6">
                            <a
                                href="/"
                                className={`text-sm font-medium transition ${isHomeActive ? 'text-indigo-400' : 'text-slate-300 hover:text-white'}`}
                            >
                                {t('nav.home')}
                            </a>
                        </nav>
                    </div>
                    <aside className="side-right">
                        {user ? (
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <span className="inline-flex rounded-md">
                                        <button
                                            type="button"
                                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 bg-white hover:text-gray-700 focus:outline-none transition ease-in-out duration-150"
                                        >
                                            {user.name}

                                            <svg
                                                className="ml-2 -mr-0.5 h-4 w-4"
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </button>
                                    </span>
                                </Dropdown.Trigger>

                                <Dropdown.Content>
                                    <Dropdown.Link href={route('dashboard')}>
                                        <i className="fas fa-home"></i> {t('nav.dashboard')}
                                    </Dropdown.Link>
                                    <Dropdown.Link href={route('admin/profile.edit')}>
                                        <i className="fas fa-user"></i> {t('nav.profile')}
                                    </Dropdown.Link>
                                    <Dropdown.Link href={route('logout')} method="post" as="button">
                                        <i className="fas fa-sign-out-alt"></i> {t('nav.log_out')}
                                    </Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                        ) : (
                            <a href="/login" className="ml-2">
                                <i className="fas fa-user"></i> {t('nav.login_register')}
                            </a>
                        )}
                    </aside>
                </div>
            </div>
        </header>
    );
}