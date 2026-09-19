import { useEffect, FormEventHandler } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, useForm } from '@inertiajs/react';
import { useTranslation } from '@/utils/useTranslation';

export default function SetupAdmin() {
    const t = useTranslation();
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        username: '',
        phone: '',
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        return () => {
            reset('password', 'password_confirmation');
        };
    }, []);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('setup.store'));
    };

    return (
        <GuestLayout>
            <Head title={t('setup.meta_title')} />

            <div className="mb-6 text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-white mb-3 shadow-lg shadow-amber-600/20">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase bg-amber-100/80 text-amber-900 border border-amber-200 mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
                    {t('setup.badge_init')}
                </div>
                <h2 className="text-xl font-serif font-bold text-gray-900 tracking-tight">
                    {t('setup.heading')}
                </h2>
                <p className="text-xs text-stone-600 max-w-sm mx-auto mt-1 leading-relaxed">
                    {t('setup.subheading')}
                </p>
            </div>

            <form onSubmit={submit} className="space-y-4">
                {/* Name */}
                <div>
                    <InputLabel htmlFor="name" value={t('setup.name_label')} />
                    <TextInput
                        id="name"
                        type="text"
                        name="name"
                        value={data.name}
                        placeholder={t('setup.name_placeholder')}
                        className="mt-1 block w-full text-sm"
                        autoComplete="name"
                        isFocused={true}
                        required
                        onChange={(e) => setData('name', e.target.value)}
                    />
                    <InputError message={errors.name} className="mt-1.5" />
                </div>

                {/* Email */}
                <div>
                    <InputLabel htmlFor="email" value={t('setup.email_label')} />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        placeholder="admin@vienkhongni.vn"
                        className="mt-1 block w-full text-sm"
                        autoComplete="username"
                        required
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    <InputError message={errors.email} className="mt-1.5" />
                </div>

                {/* Username & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <InputLabel htmlFor="username" value={t('setup.username_label')} />
                        <TextInput
                            id="username"
                            type="text"
                            name="username"
                            value={data.username}
                            placeholder="admin"
                            className="mt-1 block w-full text-sm"
                            onChange={(e) => setData('username', e.target.value)}
                        />
                        <InputError message={errors.username} className="mt-1.5" />
                    </div>

                    <div>
                        <InputLabel htmlFor="phone" value={t('setup.phone_label')} />
                        <TextInput
                            id="phone"
                            type="tel"
                            name="phone"
                            value={data.phone}
                            placeholder="0901234567"
                            className="mt-1 block w-full text-sm"
                            onChange={(e) => setData('phone', e.target.value)}
                        />
                        <InputError message={errors.phone} className="mt-1.5" />
                    </div>
                </div>

                {/* Password */}
                <div>
                    <InputLabel htmlFor="password" value={t('setup.password_label')} />
                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        placeholder="••••••••"
                        className="mt-1 block w-full text-sm"
                        autoComplete="new-password"
                        required
                        onChange={(e) => setData('password', e.target.value)}
                    />
                    <InputError message={errors.password} className="mt-1.5" />
                </div>

                {/* Password Confirmation */}
                <div>
                    <InputLabel htmlFor="password_confirmation" value={t('setup.password_confirmation_label')} />
                    <TextInput
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        placeholder="••••••••"
                        className="mt-1 block w-full text-sm"
                        autoComplete="new-password"
                        required
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                    />
                    <InputError message={errors.password_confirmation} className="mt-1.5" />
                </div>

                <div className="pt-2">
                    <PrimaryButton
                        className="w-full justify-center py-2.5 bg-amber-700 hover:bg-amber-800 text-white shadow-md shadow-amber-700/20 font-medium"
                        disabled={processing}
                    >
                        {processing ? t('setup.submitting') : t('setup.submit_button')}
                    </PrimaryButton>
                </div>
            </form>

        </GuestLayout>
    );
}
