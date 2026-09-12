import { useEffect, FormEventHandler } from 'react';
import Checkbox from '@/Components/Checkbox';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }: { status?: string; canResetPassword: boolean }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        login: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    const fillCredentials = (loginVal: string, passVal: string) => {
        setData((prev) => ({
            ...prev,
            login: loginVal,
            password: passVal,
        }));
    };

    return (
        <GuestLayout>
            <Head title="Sign In - Viên Không Ni Buddhist Courses" />

            <div className="mb-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 text-amber-800 mb-3 shadow-inner">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                </div>
                <h2 className="text-xl font-serif font-bold text-gray-900 tracking-tight">Viên Không Ni – Buddhist Courses</h2>
                <p className="text-xs text-amber-800/80 font-medium mt-1">
                    Sign in with Citizen ID (CCCD) and password provided by administrator
                </p>
            </div>

            {status && <div className="mb-4 font-medium text-sm text-emerald-600 bg-emerald-50 p-2.5 rounded border border-emerald-200">{status}</div>}

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <InputLabel htmlFor="login" value="Citizen ID (CCCD) or Email" />

                    <TextInput
                        id="login"
                        type="text"
                        name="login"
                        value={data.login}
                        placeholder="e.g. 079199000001 or admin@vienkhongni.vn"
                        className="mt-1 block w-full text-sm"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('login', e.target.value)}
                    />

                    <InputError message={errors.login} className="mt-1.5" />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="Password (Mật khẩu được cấp)" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        placeholder="••••••••"
                        className="mt-1 block w-full text-sm"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />

                    <InputError message={errors.password} className="mt-1.5" />
                </div>

                <div className="flex items-center justify-between">
                    <label className="flex items-center cursor-pointer">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                        />
                        <span className="ml-2 text-xs text-gray-600">Remember me</span>
                    </label>

                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-xs text-amber-700 hover:text-amber-900 underline"
                        >
                            Forgot password?
                        </Link>
                    )}
                </div>

                <PrimaryButton className="w-full justify-center py-2.5 bg-amber-700 hover:bg-amber-800 text-white shadow" disabled={processing}>
                    Sign In to Portal
                </PrimaryButton>
            </form>

            {/* Demo Quick Accounts */}
            <div className="mt-6 border-t border-gray-200 pt-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 text-center mb-2.5">
                    Quick Demo Credentials
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                        type="button"
                        onClick={() => fillCredentials('001099000001', 'password')}
                        className="p-2 rounded border border-amber-200 bg-amber-50/50 hover:bg-amber-100/70 text-left transition"
                    >
                        <div className="font-semibold text-amber-950">Administrator / Manager</div>
                        <div className="text-[11px] text-gray-500 font-mono">CCCD: 001099000001</div>
                    </button>

                    <button
                        type="button"
                        onClick={() => fillCredentials('079199000001', 'password')}
                        className="p-2 rounded border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100/70 text-left transition"
                    >
                        <div className="font-semibold text-indigo-950">Student (Vien Tue)</div>
                        <div className="text-[11px] text-gray-500 font-mono">CCCD: 079199000001</div>
                    </button>
                </div>
            </div>

            {/* Monastery Info Footer */}
            <div className="mt-6 text-center text-xs text-gray-500 border-t border-gray-100 pt-3">
                <p className="font-medium text-gray-700">Tu viện Viên Không Ni</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Ấp 4, xã Châu Pha, Tp. Hồ Chí Minh</p>
                <a
                    href="https://www.facebook.com/share/1DCWqsCZSY/?mibextid=wwXIfr"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:underline mt-1"
                >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Official Facebook Page
                </a>
            </div>
        </GuestLayout>
    );
}
