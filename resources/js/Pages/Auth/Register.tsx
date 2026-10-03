import { useState, FormEventHandler, useMemo } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';
import { useTranslation } from '@/utils/useTranslation';
import {
    UserIcon,
    AcademicCapIcon,
    ShieldCheckIcon,
    ArrowRightIcon,
    ArrowLeftIcon,
    CheckIcon,
    BuildingLibraryIcon,
} from '@heroicons/react/24/outline';

const STUDY_PURPOSE_KEYS = [
    'basic_buddhist_studies',
    'pali_canon_studies',
    'advanced_buddhist_studies',
    'supplement_buddhist_knowledge',
    'support_practice_and_dharma_propagation',
    'other',
] as const;

const STUDY_LEVEL_KEYS = [
    'none',
    'beginner',
    'intermediate',
    'advanced',
    'previously_studied',
] as const;

const ORDINATION_STATUS_KEYS = [
    'female_novice',
    'male_novice',
    'sikkhamana',
    'bhikkhu',
    'bhikkhuni',
] as const;

export default function Register() {
    const t = useTranslation();
    const [currentStep, setCurrentStep] = useState<number>(1);
    const [clientErrors, setClientErrors] = useState<Record<string, string>>({});

    const { data, setData, post, processing, errors, clearErrors } = useForm({
        // Step 1: Personal Information
        full_name: '',
        date_of_birth: '',
        gender: 'male',
        phone: '',
        email: '',
        refuge_in_triple_gem: false,
        dharma_name: '',

        // Step 2: Buddhist Studies & Academic Information
        student_type: 'layperson', // 'layperson' | 'monastic'
        ordination_status: '',
        ordination_date: '',
        ordination_place: '',
        preceptor_teacher: '',
        current_residence: '',

        study_purposes: [] as string[],
        other_study_purpose: '',
        buddhist_study_level: 'none',
        previous_buddhist_programs: '',

        // Step 3: Account Credentials & Terms
        username: '',
        password: '',
        password_confirmation: '',
        confirm_information: false,
        agree_to_rules: false,
    });

    const maxPastDate = useMemo(() => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    }, []);

    // Toggle study purposes
    const toggleStudyPurpose = (purposeKey: string) => {
        const current = data.study_purposes;
        let updated: string[];
        if (current.includes(purposeKey)) {
            updated = current.filter((item) => item !== purposeKey);
            if (purposeKey === 'other') {
                setData((prev) => ({ ...prev, study_purposes: updated, other_study_purpose: '' }));
                return;
            }
        } else {
            updated = [...current, purposeKey];
        }
        setData('study_purposes', updated);
    };

    // Handle student type switch and clear monastic fields if layperson
    const handleStudentTypeChange = (type: 'layperson' | 'monastic') => {
        if (type === 'layperson') {
            setData((prev) => ({
                ...prev,
                student_type: 'layperson',
                ordination_status: '',
                ordination_date: '',
                ordination_place: '',
                preceptor_teacher: '',
                current_residence: '',
            }));
        } else {
            setData('student_type', 'monastic');
        }
    };

    // Client-side validation for Step 1
    const validateStep1 = (): boolean => {
        const errs: Record<string, string> = {};
        if (!data.full_name || data.full_name.trim().length < 2) {
            errs.full_name = t('validation.required', { attribute: t('auth.full_name') });
        }
        if (!data.date_of_birth) {
            errs.date_of_birth = t('validation.required', { attribute: t('auth.date_of_birth') });
        } else if (data.date_of_birth >= maxPastDate) {
            errs.date_of_birth = t('validation.before', { attribute: t('auth.date_of_birth'), date: t('home.today') || 'today' });
        }
        if (!data.gender) {
            errs.gender = t('validation.required', { attribute: t('auth.gender') });
        }
        if (!data.phone || data.phone.trim().length < 7) {
            errs.phone = t('validation.required', { attribute: t('auth.phone') });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!data.email || !emailRegex.test(data.email)) {
            errs.email = t('validation.email', { attribute: t('auth.email') });
        }

        setClientErrors(errs);
        return Object.keys(errs).length === 0;
    };

    // Client-side validation for Step 2
    const validateStep2 = (): boolean => {
        const errs: Record<string, string> = {};

        if (data.student_type === 'monastic') {
            if (!data.ordination_status) {
                errs.ordination_status = t('validation.required', { attribute: t('auth.ordination_status') });
            }
            if (!data.ordination_date) {
                errs.ordination_date = t('validation.required', { attribute: t('auth.ordination_date') });
            } else if (data.ordination_date >= maxPastDate) {
                errs.ordination_date = t('validation.before', { attribute: t('auth.ordination_date'), date: t('home.today') || 'today' });
            }
            if (!data.ordination_place || data.ordination_place.trim() === '') {
                errs.ordination_place = t('validation.required', { attribute: t('auth.ordination_place') });
            }
            if (!data.preceptor_teacher || data.preceptor_teacher.trim() === '') {
                errs.preceptor_teacher = t('validation.required', { attribute: t('auth.preceptor_teacher') });
            }
            if (!data.current_residence || data.current_residence.trim() === '') {
                errs.current_residence = t('validation.required', { attribute: t('auth.current_residence') });
            }
        }

        if (!data.study_purposes || data.study_purposes.length === 0) {
            errs.study_purposes = t('auth.study_purposes_hint');
        } else if (data.study_purposes.includes('other') && (!data.other_study_purpose || data.other_study_purpose.trim() === '')) {
            errs.other_study_purpose = t('validation.required', { attribute: t('auth.other_study_purpose') });
        }

        if (!data.buddhist_study_level) {
            errs.buddhist_study_level = t('validation.required', { attribute: t('auth.buddhist_study_level') });
        }

        setClientErrors(errs);
        return Object.keys(errs).length === 0;
    };

    // Client-side validation for Step 3
    const validateStep3 = (): boolean => {
        const errs: Record<string, string> = {};
        const usernameRegex = /^[a-zA-Z0-9_\-]+$/;
        if (!data.username || data.username.length < 3 || data.username.length > 50 || !usernameRegex.test(data.username)) {
            errs.username = t('auth.username_hint');
        }
        if (!data.password || data.password.length < 8) {
            errs.password = t('auth.password_hint');
        }
        if (data.password !== data.password_confirmation) {
            errs.password_confirmation = t('validation.confirmed', { attribute: t('auth.password') });
        }
        if (!data.confirm_information) {
            errs.confirm_information = t('validation.accepted', { attribute: t('auth.confirm_information') });
        }
        if (!data.agree_to_rules) {
            errs.agree_to_rules = t('validation.accepted', { attribute: t('auth.agree_to_rules') });
        }

        setClientErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleNext = () => {
        if (currentStep === 1) {
            if (validateStep1()) {
                setClientErrors({});
                clearErrors();
                setCurrentStep(2);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } else if (currentStep === 2) {
            if (validateStep2()) {
                setClientErrors({});
                clearErrors();
                setCurrentStep(3);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
    };

    const handlePrev = () => {
        if (currentStep > 1) {
            setClientErrors({});
            setCurrentStep((prev) => prev - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        // Validate final step
        if (!validateStep3()) {
            return;
        }

        post(route('register'), {
            onError: (serverErrors) => {
                // If there are errors in earlier steps, navigate the user back to fix them
                const step1Fields = ['full_name', 'date_of_birth', 'gender', 'phone', 'email', 'refuge_in_triple_gem', 'dharma_name'];
                const step2Fields = [
                    'student_type',
                    'ordination_status',
                    'ordination_date',
                    'ordination_place',
                    'preceptor_teacher',
                    'current_residence',
                    'study_purposes',
                    'other_study_purpose',
                    'buddhist_study_level',
                    'previous_buddhist_programs',
                ];

                const hasStep1Error = Object.keys(serverErrors).some((k) => step1Fields.includes(k));
                const hasStep2Error = Object.keys(serverErrors).some((k) => step2Fields.includes(k));

                if (hasStep1Error) {
                    setCurrentStep(1);
                } else if (hasStep2Error) {
                    setCurrentStep(2);
                }
                window.scrollTo({ top: 0, behavior: 'smooth' });
            },
        });
    };

    const steps = [
        { id: 1, name: t('auth.step_1_title'), icon: UserIcon },
        { id: 2, name: t('auth.step_2_title'), icon: AcademicCapIcon },
        { id: 3, name: t('auth.step_3_title'), icon: ShieldCheckIcon },
    ];

    return (
        <GuestLayout maxWidth="sm:max-w-3xl">
            <Head title={t('auth.register_title')} />

            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 font-serif">
                    {t('auth.register_title')}
                </h1>
                <p className="mt-2 text-sm text-stone-600 max-w-lg mx-auto">
                    {t('auth.register_subtitle')}
                </p>
            </div>

            {/* Stepper Progress Bar */}
            <div className="mb-8">
                <div className="flex items-center justify-between relative">
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-stone-200 -translate-y-1/2 -z-0" />
                    <div
                        className="absolute top-1/2 left-0 h-0.5 bg-amber-600 -translate-y-1/2 -z-0 transition-all duration-500 ease-out"
                        style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                    />

                    {steps.map((step) => {
                        const Icon = step.icon;
                        const isCompleted = currentStep > step.id;
                        const isCurrent = currentStep === step.id;

                        return (
                            <button
                                key={step.id}
                                type="button"
                                onClick={() => {
                                    if (step.id < currentStep) {
                                        setCurrentStep(step.id);
                                    }
                                }}
                                disabled={step.id > currentStep}
                                className={`relative z-10 flex flex-col items-center group focus:outline-none transition-colors ${
                                    step.id > currentStep ? 'cursor-not-allowed' : 'cursor-pointer'
                                }`}
                            >
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm transition-all duration-300 shadow-sm ${
                                        isCompleted
                                            ? 'bg-amber-600 text-white'
                                            : isCurrent
                                            ? 'bg-stone-900 text-amber-400 ring-4 ring-amber-100'
                                            : 'bg-white border-2 border-stone-300 text-stone-400'
                                    }`}
                                >
                                    {isCompleted ? <CheckIcon className="w-5 h-5 stroke-[2.5]" /> : <Icon className="w-5 h-5" />}
                                </div>
                                <span
                                    className={`mt-2 text-xs font-medium transition-colors hidden sm:block ${
                                        isCurrent ? 'text-amber-800 font-semibold' : isCompleted ? 'text-stone-700' : 'text-stone-400'
                                    }`}
                                >
                                    {step.name}
                                </span>
                            </button>
                        );
                    })}
                </div>
                <div className="sm:hidden text-center mt-3 text-xs font-medium text-amber-800">
                    {steps[currentStep - 1].name} ({currentStep}/{steps.length})
                </div>
            </div>

            {/* Error Notification Banner if any client error */}
            {Object.keys(clientErrors).length > 0 && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start space-x-3 animate-shake">
                    <span className="font-semibold text-red-800">●</span>
                    <p>{t('auth.validation_error_alert')}</p>
                </div>
            )}

            <form onSubmit={submit}>
                {/* ================= STEP 1: PERSONAL INFORMATION ================= */}
                {currentStep === 1 && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="border-b border-stone-200 pb-3">
                            <h2 className="text-lg font-semibold text-stone-900 flex items-center gap-2">
                                <UserIcon className="w-5 h-5 text-amber-700" />
                                {t('auth.step_1_title')}
                            </h2>
                            <p className="text-xs text-stone-500 mt-0.5">{t('auth.step_1_subtitle')}</p>
                        </div>

                        {/* Full Name & Date of Birth */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="full_name" value={t('auth.full_name')} required />
                                <TextInput
                                    id="full_name"
                                    name="full_name"
                                    value={data.full_name}
                                    className="mt-1 block w-full text-sm"
                                    autoComplete="name"
                                    placeholder={t('auth.name')}
                                    isFocused={true}
                                    onChange={(e) => setData('full_name', e.target.value)}
                                    required
                                />
                                <InputError message={clientErrors.full_name || errors.full_name} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel htmlFor="date_of_birth" value={t('auth.date_of_birth')} required />
                                <TextInput
                                    id="date_of_birth"
                                    type="date"
                                    name="date_of_birth"
                                    max={maxPastDate}
                                    value={data.date_of_birth}
                                    className="mt-1 block w-full text-sm"
                                    onChange={(e) => setData('date_of_birth', e.target.value)}
                                    required
                                />
                                <InputError message={clientErrors.date_of_birth || errors.date_of_birth} className="mt-1" />
                            </div>
                        </div>

                        {/* Gender & Phone */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="gender" value={t('auth.gender')} required />
                                <div className="mt-1 grid grid-cols-3 gap-2">
                                    {(['male', 'female', 'other'] as const).map((g) => (
                                        <button
                                            key={g}
                                            type="button"
                                            onClick={() => setData('gender', g)}
                                            className={`py-2 px-3 text-xs sm:text-sm font-medium rounded-lg border text-center transition-all ${
                                                data.gender === g
                                                    ? 'bg-amber-50 border-amber-600 text-amber-900 font-semibold ring-1 ring-amber-600'
                                                    : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                                            }`}
                                        >
                                            {t(`auth.gender_${g}`)}
                                        </button>
                                    ))}
                                </div>
                                <InputError message={clientErrors.gender || errors.gender} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel htmlFor="phone" value={t('auth.phone')} required />
                                <TextInput
                                    id="phone"
                                    type="tel"
                                    name="phone"
                                    value={data.phone}
                                    className="mt-1 block w-full text-sm"
                                    autoComplete="tel"
                                    placeholder="0912 345 678"
                                    onChange={(e) => setData('phone', e.target.value)}
                                    required
                                />
                                <InputError message={clientErrors.phone || errors.phone} className="mt-1" />
                            </div>
                        </div>

                        {/* Email Address */}
                        <div>
                            <InputLabel htmlFor="email" value={t('auth.email')} required />
                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="mt-1 block w-full text-sm"
                                autoComplete="email"
                                placeholder="example@email.com"
                                onChange={(e) => setData('email', e.target.value)}
                                required
                            />
                            <InputError message={clientErrors.email || errors.email} className="mt-1" />
                        </div>

                        {/* Refuge in Triple Gem (Radio) */}
                        <div className="p-4 rounded-xl bg-stone-50/80 border border-stone-200 space-y-3">
                            <InputLabel value={t('auth.refuge_in_triple_gem')} required />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <label
                                    className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                                        data.refuge_in_triple_gem
                                            ? 'bg-amber-50/80 border-amber-600 text-amber-950 font-medium ring-1 ring-amber-600'
                                            : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-100/60'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="refuge_in_triple_gem"
                                        checked={data.refuge_in_triple_gem === true}
                                        onChange={() => setData('refuge_in_triple_gem', true)}
                                        className="text-amber-600 focus:ring-amber-500 h-4 w-4"
                                    />
                                    <span className="ml-3 text-sm">{t('auth.refuge_yes')}</span>
                                </label>

                                <label
                                    className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                                        !data.refuge_in_triple_gem
                                            ? 'bg-stone-100 border-stone-400 text-stone-900 font-medium ring-1 ring-stone-400'
                                            : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-100/60'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="refuge_in_triple_gem"
                                        checked={data.refuge_in_triple_gem === false}
                                        onChange={() => setData('refuge_in_triple_gem', false)}
                                        className="text-amber-600 focus:ring-amber-500 h-4 w-4"
                                    />
                                    <span className="ml-3 text-sm">{t('auth.refuge_no')}</span>
                                </label>
                            </div>
                        </div>

                        {/* Dharma Name (Optional) */}
                        <div>
                            <div className="flex justify-between items-center">
                                <InputLabel htmlFor="dharma_name" value={t('auth.dharma_name')} />
                                <span className="text-xs text-stone-400">({t('materials.optional') || 'Optional'})</span>
                            </div>
                            <TextInput
                                id="dharma_name"
                                name="dharma_name"
                                value={data.dharma_name}
                                className="mt-1 block w-full text-sm"
                                placeholder={t('auth.dharma_name_placeholder')}
                                onChange={(e) => setData('dharma_name', e.target.value)}
                            />
                            <InputError message={errors.dharma_name} className="mt-1" />
                        </div>
                    </div>
                )}

                {/* ================= STEP 2: BUDDHIST STUDIES INFORMATION ================= */}
                {currentStep === 2 && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="border-b border-stone-200 pb-3">
                            <h2 className="text-lg font-semibold text-stone-900 flex items-center gap-2">
                                <AcademicCapIcon className="w-5 h-5 text-amber-700" />
                                {t('auth.step_2_title')}
                            </h2>
                            <p className="text-xs text-stone-500 mt-0.5">{t('auth.step_2_subtitle')}</p>
                        </div>

                        {/* Student Type Selection */}
                        <div>
                            <InputLabel value={t('auth.student_type')} required />
                            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => handleStudentTypeChange('layperson')}
                                    className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${
                                        data.student_type === 'layperson'
                                            ? 'bg-amber-50/70 border-amber-600 ring-2 ring-amber-600/30'
                                            : 'bg-white border-stone-200 hover:bg-stone-50'
                                    }`}
                                >
                                    <div
                                        className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                            data.student_type === 'layperson' ? 'border-amber-600 bg-amber-600' : 'border-stone-400'
                                        }`}
                                    >
                                        {data.student_type === 'layperson' && <div className="w-2 h-2 rounded-full bg-white" />}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-sm text-stone-900">{t('auth.student_type_layperson')}</div>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleStudentTypeChange('monastic')}
                                    className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${
                                        data.student_type === 'monastic'
                                            ? 'bg-amber-50/70 border-amber-600 ring-2 ring-amber-600/30'
                                            : 'bg-white border-stone-200 hover:bg-stone-50'
                                    }`}
                                >
                                    <div
                                        className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                            data.student_type === 'monastic' ? 'border-amber-600 bg-amber-600' : 'border-stone-400'
                                        }`}
                                    >
                                        {data.student_type === 'monastic' && <div className="w-2 h-2 rounded-full bg-white" />}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-sm text-stone-900">{t('auth.student_type_monastic')}</div>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Monastic Details (Conditional if monastic) */}
                        {data.student_type === 'monastic' && (
                            <div className="p-5 rounded-2xl bg-amber-50/40 border border-amber-300/80 space-y-4 shadow-sm">
                                <div className="flex items-center gap-2 border-b border-amber-200/60 pb-2">
                                    <BuildingLibraryIcon className="w-5 h-5 text-amber-700" />
                                    <div>
                                        <h3 className="font-semibold text-stone-900 text-sm">{t('auth.monastic_section_title')}</h3>
                                        <p className="text-xs text-stone-600">{t('auth.monastic_section_desc')}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <InputLabel htmlFor="ordination_status" value={t('auth.ordination_status')} required />
                                        <select
                                            id="ordination_status"
                                            name="ordination_status"
                                            value={data.ordination_status}
                                            onChange={(e) => setData('ordination_status', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 text-sm"
                                            required
                                        >
                                            <option value="">-- {t('auth.ordination_status')} --</option>
                                            {ORDINATION_STATUS_KEYS.map((k) => (
                                                <option key={k} value={k}>
                                                    {t(`auth.${k}`)}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError message={clientErrors.ordination_status || errors.ordination_status} className="mt-1" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="ordination_date" value={t('auth.ordination_date')} required />
                                        <TextInput
                                            id="ordination_date"
                                            type="date"
                                            name="ordination_date"
                                            max={maxPastDate}
                                            value={data.ordination_date}
                                            className="mt-1 block w-full text-sm"
                                            onChange={(e) => setData('ordination_date', e.target.value)}
                                            required
                                        />
                                        <InputError message={clientErrors.ordination_date || errors.ordination_date} className="mt-1" />
                                    </div>
                                </div>

                                <div>
                                    <InputLabel htmlFor="ordination_place" value={t('auth.ordination_place')} required />
                                    <TextInput
                                        id="ordination_place"
                                        name="ordination_place"
                                        value={data.ordination_place}
                                        className="mt-1 block w-full text-sm"
                                        placeholder={t('auth.ordination_place_placeholder')}
                                        onChange={(e) => setData('ordination_place', e.target.value)}
                                        required
                                    />
                                    <InputError message={clientErrors.ordination_place || errors.ordination_place} className="mt-1" />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <InputLabel htmlFor="preceptor_teacher" value={t('auth.preceptor_teacher')} required />
                                        <TextInput
                                            id="preceptor_teacher"
                                            name="preceptor_teacher"
                                            value={data.preceptor_teacher}
                                            className="mt-1 block w-full text-sm"
                                            placeholder={t('auth.preceptor_teacher_placeholder')}
                                            onChange={(e) => setData('preceptor_teacher', e.target.value)}
                                            required
                                        />
                                        <InputError message={clientErrors.preceptor_teacher || errors.preceptor_teacher} className="mt-1" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="current_residence" value={t('auth.current_residence')} required />
                                        <TextInput
                                            id="current_residence"
                                            name="current_residence"
                                            value={data.current_residence}
                                            className="mt-1 block w-full text-sm"
                                            placeholder={t('auth.current_residence_placeholder')}
                                            onChange={(e) => setData('current_residence', e.target.value)}
                                            required
                                        />
                                        <InputError message={clientErrors.current_residence || errors.current_residence} className="mt-1" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Study Purpose (Multi-select / Checkbox) */}
                        <div className="space-y-3">
                            <div>
                                <InputLabel value={t('auth.study_purposes')} required />
                                <p className="text-xs text-stone-500">{t('auth.study_purposes_hint')}</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {STUDY_PURPOSE_KEYS.map((key) => {
                                    const checked = data.study_purposes.includes(key);
                                    return (
                                        <label
                                            key={key}
                                            className={`flex items-start p-3 rounded-xl border cursor-pointer transition-all ${
                                                checked
                                                    ? 'bg-amber-50/70 border-amber-600 ring-1 ring-amber-600/40 text-stone-900'
                                                    : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                                            }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={() => toggleStudyPurpose(key)}
                                                className="mt-0.5 rounded text-amber-600 focus:ring-amber-500 h-4 w-4 border-stone-300"
                                            />
                                            <span className="ml-3 text-xs sm:text-sm font-medium leading-snug">
                                                {t(`auth.purpose_${key}`)}
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                            <InputError message={clientErrors.study_purposes || errors.study_purposes} className="mt-1" />

                            {/* Conditional Other Study Purpose */}
                            {data.study_purposes.includes('other') && (
                                <div className="mt-3 p-3 bg-stone-50 rounded-xl border border-stone-200 animate-fade-in">
                                    <InputLabel htmlFor="other_study_purpose" value={t('auth.other_study_purpose')} required />
                                    <textarea
                                        id="other_study_purpose"
                                        name="other_study_purpose"
                                        rows={3}
                                        value={data.other_study_purpose}
                                        maxLength={500}
                                        placeholder={t('auth.other_study_purpose_placeholder')}
                                        onChange={(e) => setData('other_study_purpose', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 text-sm"
                                        required
                                    />
                                    <InputError message={clientErrors.other_study_purpose || errors.other_study_purpose} className="mt-1" />
                                </div>
                            )}
                        </div>

                        {/* Current Level of Buddhist Studies (Radio/Select) */}
                        <div className="space-y-3">
                            <InputLabel value={t('auth.buddhist_study_level')} required />
                            <div className="space-y-2">
                                {STUDY_LEVEL_KEYS.map((lvl) => {
                                    const selected = data.buddhist_study_level === lvl;
                                    return (
                                        <label
                                            key={lvl}
                                            className={`flex items-center p-3 rounded-xl border cursor-pointer transition-all ${
                                                selected
                                                    ? 'bg-amber-50/80 border-amber-600 text-stone-900 ring-1 ring-amber-600/40 font-medium'
                                                    : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="buddhist_study_level"
                                                checked={selected}
                                                onChange={() => setData('buddhist_study_level', lvl)}
                                                className="text-amber-600 focus:ring-amber-500 h-4 w-4"
                                            />
                                            <span className="ml-3 text-xs sm:text-sm">{t(`auth.level_${lvl}`)}</span>
                                        </label>
                                    );
                                })}
                            </div>
                            <InputError message={clientErrors.buddhist_study_level || errors.buddhist_study_level} className="mt-1" />
                        </div>

                        {/* Previous Buddhist Studies Programs (Optional Textarea) */}
                        <div>
                            <div className="flex justify-between items-center">
                                <InputLabel htmlFor="previous_buddhist_programs" value={t('auth.previous_buddhist_programs_question')} />
                                <span className="text-xs text-stone-400">({t('materials.optional') || 'Optional'})</span>
                            </div>
                            <textarea
                                id="previous_buddhist_programs"
                                name="previous_buddhist_programs"
                                rows={2}
                                value={data.previous_buddhist_programs}
                                maxLength={1000}
                                placeholder={t('auth.previous_buddhist_programs_placeholder')}
                                onChange={(e) => setData('previous_buddhist_programs', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 text-sm"
                            />
                            <InputError message={errors.previous_buddhist_programs} className="mt-1" />
                        </div>
                    </div>
                )}

                {/* ================= STEP 3: ACCOUNT & CONFIRMATION ================= */}
                {currentStep === 3 && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="border-b border-stone-200 pb-3">
                            <h2 className="text-lg font-semibold text-stone-900 flex items-center gap-2">
                                <ShieldCheckIcon className="w-5 h-5 text-amber-700" />
                                {t('auth.step_3_title')}
                            </h2>
                            <p className="text-xs text-stone-500 mt-0.5">{t('auth.step_3_subtitle')}</p>
                        </div>

                        {/* Account Credentials Card */}
                        <div className="p-5 rounded-2xl bg-stone-50/80 border border-stone-200 space-y-4">
                            <h3 className="font-semibold text-sm text-stone-900">{t('auth.account_section_title')}</h3>

                            <div>
                                <InputLabel htmlFor="username" value={t('auth.username')} required />
                                <TextInput
                                    id="username"
                                    name="username"
                                    value={data.username}
                                    className="mt-1 block w-full text-sm"
                                    autoComplete="username"
                                    placeholder="phattu123"
                                    onChange={(e) => setData('username', e.target.value.toLowerCase().trim())}
                                    required
                                />
                                <p className="mt-1 text-xs text-stone-500">{t('auth.username_hint')}</p>
                                <InputError message={clientErrors.username || errors.username} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel htmlFor="account_email" value={t('auth.email')} />
                                <TextInput
                                    id="account_email"
                                    type="email"
                                    value={data.email}
                                    readOnly
                                    className="mt-1 block w-full text-sm bg-stone-100 text-stone-600 cursor-not-allowed border-stone-200"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <InputLabel htmlFor="password" value={t('auth.password')} required />
                                    <TextInput
                                        id="password"
                                        type="password"
                                        name="password"
                                        value={data.password}
                                        className="mt-1 block w-full text-sm"
                                        autoComplete="new-password"
                                        onChange={(e) => setData('password', e.target.value)}
                                        required
                                    />
                                    <p className="mt-1 text-xs text-stone-500">{t('auth.password_hint')}</p>
                                    <InputError message={clientErrors.password || errors.password} className="mt-1" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="password_confirmation" value={t('auth.confirm_password')} required />
                                    <TextInput
                                        id="password_confirmation"
                                        type="password"
                                        name="password_confirmation"
                                        value={data.password_confirmation}
                                        className="mt-1 block w-full text-sm"
                                        autoComplete="new-password"
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        required
                                    />
                                    <InputError message={clientErrors.password_confirmation || errors.password_confirmation} className="mt-1" />
                                </div>
                            </div>
                        </div>

                        {/* Confirmation & Agreements */}
                        <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-4">
                            <h3 className="font-semibold text-sm text-stone-900">{t('auth.confirmation_section_title')}</h3>

                            <label className="flex items-start cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={data.confirm_information}
                                    onChange={(e) => setData('confirm_information', e.target.checked)}
                                    className="mt-0.5 rounded text-amber-600 focus:ring-amber-500 h-4 w-4 border-stone-300"
                                    required
                                />
                                <span className="ml-3 text-xs sm:text-sm text-stone-700 leading-snug">
                                    {t('auth.confirm_information')} <span className="text-red-500">*</span>
                                </span>
                            </label>
                            <InputError message={clientErrors.confirm_information || errors.confirm_information} className="mt-1" />

                            <label className="flex items-start cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={data.agree_to_rules}
                                    onChange={(e) => setData('agree_to_rules', e.target.checked)}
                                    className="mt-0.5 rounded text-amber-600 focus:ring-amber-500 h-4 w-4 border-stone-300"
                                    required
                                />
                                <span className="ml-3 text-xs sm:text-sm text-stone-700 leading-snug">
                                    {t('auth.agree_to_rules')} <span className="text-red-500">*</span>
                                </span>
                            </label>
                            <InputError message={clientErrors.agree_to_rules || errors.agree_to_rules} className="mt-1" />
                        </div>
                    </div>
                )}

                {/* ================= STEPPER ACTIONS ================= */}
                <div className="mt-8 pt-5 border-t border-stone-200 flex items-center justify-between gap-4">
                    {currentStep > 1 ? (
                        <button
                            type="button"
                            onClick={handlePrev}
                            className="inline-flex items-center px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-700 text-sm font-medium hover:bg-stone-50 transition shadow-sm"
                        >
                            <ArrowLeftIcon className="w-4 h-4 mr-1.5" />
                            {t('auth.prev_step')}
                        </button>
                    ) : (
                        <Link
                            href={route('login')}
                            className="text-xs sm:text-sm text-stone-600 hover:text-stone-900 underline font-medium"
                        >
                            {t('auth.already_registered')}
                        </Link>
                    )}

                    <div className="flex items-center gap-3">
                        {currentStep < 3 ? (
                            <button
                                type="button"
                                onClick={handleNext}
                                className="inline-flex items-center px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold transition shadow-md shadow-amber-600/20"
                            >
                                {t('auth.next_step')}
                                <ArrowRightIcon className="w-4 h-4 ml-1.5" />
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center px-6 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 disabled:opacity-50 text-white text-sm font-semibold transition shadow-md shadow-amber-700/25"
                            >
                                {processing ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                        </svg>
                                        {t('auth.submitting')}
                                    </>
                                ) : (
                                    <>
                                        <CheckIcon className="w-4 h-4 mr-1.5 stroke-[2.5]" />
                                        {t('auth.submit_registration')}
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </form>
        </GuestLayout>
    );
}
