import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';
import { ReactNode } from 'react';

interface GuestLayoutProps {
    children: ReactNode;
    maxWidth?: string;
}

export default function Guest({ children, maxWidth = 'sm:max-w-md' }: GuestLayoutProps) {
    return (
        <div className="min-h-screen flex flex-col sm:justify-center items-center py-8 px-4 sm:px-6 lg:px-8 bg-stone-100">
            <div>
                <Link href="/" className="flex items-center hover:opacity-90 transition-opacity">
                    <ApplicationLogo className="h-16 w-auto object-contain drop-shadow-sm" />
                </Link>
            </div>

            <div className={`w-full ${maxWidth} mt-6 px-6 sm:px-8 py-8 bg-white shadow-xl shadow-stone-200/60 border border-stone-200/80 rounded-2xl overflow-hidden transition-all duration-300`}>
                {children}
            </div>
        </div>
    );
}
