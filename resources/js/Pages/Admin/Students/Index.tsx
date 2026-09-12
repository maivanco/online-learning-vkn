import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';

interface Student {
    id: number;
    name: string;
    cccd: string;
    email: string;
    phone: string | null;
    status: string;
    created_at: string;
    classes_count: number;
    classes: Array<{
        id: number;
        name: string;
        status: string;
    }>;
}

interface StudentsProps extends PageProps {
    students: {
        data: Student[];
        current_page: number;
        last_page: number;
        total: number;
    };
    availableClasses: Array<{
        id: number;
        name: string;
        code: string;
    }>;
    search?: string;
}

export default function StudentsIndex({ auth, students, availableClasses, search, flash }: StudentsProps) {
    const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
    const [selectedStudentForPassword, setSelectedStudentForPassword] = useState<Student | null>(null);

    const studentForm = useForm({
        name: '',
        cccd: '',
        email: '',
        phone: '',
        password: '',
        initial_class_id: availableClasses[0]?.id || '',
    });

    const passwordForm = useForm({
        password: '',
    });

    const handleCreateStudent = (e: React.FormEvent) => {
        e.preventDefault();
        studentForm.post(route('admin.students.store'), {
            onSuccess: () => {
                setIsAddStudentOpen(false);
                studentForm.reset();
            },
        });
    };

    const handleUpdatePassword = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStudentForPassword) return;
        passwordForm.put(route('admin.students.password', selectedStudentForPassword.id), {
            onSuccess: () => {
                setSelectedStudentForPassword(null);
                passwordForm.reset();
            },
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Student Roster & CCCD (Quản Lý Học Viên & Cấp Mật Khẩu)</h2>}
        >
            <Head title="Students Management - Viên Không Ni" />

            <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                {/* Flash Messages */}
                {flash?.success && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg text-sm flex items-center gap-2 shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        {flash.success}
                    </div>
                )}

                {/* Header Action Bar */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h3 className="font-serif font-bold text-base text-gray-900">
                            Danh Sách Học Viên Tu Viện Viên Không Ni
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Issue accounts with Citizen ID (CCCD) and initial passwords provided by the monastery manager.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsAddStudentOpen(true)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-medium text-xs shadow transition"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                            Register New Student (Cấp Tài Khoản)
                        </button>
                    </div>
                </div>

                {/* Table of Students */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-xs">
                            <thead className="bg-stone-50 text-stone-700 font-semibold uppercase tracking-wider text-[11px]">
                                <tr>
                                    <th className="px-6 py-3.5 text-left">Học Viên (Name & Email)</th>
                                    <th className="px-6 py-3.5 text-left">Căn Cước Công Dân (CCCD)</th>
                                    <th className="px-6 py-3.5 text-left">Số Điện Thoại</th>
                                    <th className="px-6 py-3.5 text-left">Lớp Tham Gia (Enrolled)</th>
                                    <th className="px-6 py-3.5 text-center">Trạng Thái</th>
                                    <th className="px-6 py-3.5 text-right">Đổi Mật Khẩu (Password)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {students.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-12 text-gray-400 text-xs">
                                            No students found.
                                        </td>
                                    </tr>
                                ) : (
                                    students.data.map((student) => (
                                        <tr key={student.id} className="hover:bg-stone-50/50 transition">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-semibold text-gray-900 text-sm">{student.name}</div>
                                                <div className="text-[11px] text-gray-500">{student.email}</div>
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200">
                                                    {student.cccd || 'N/A'}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                                {student.phone || '—'}
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {student.classes.length > 0 ? (
                                                    <div className="space-y-0.5">
                                                        {student.classes.map((cls) => (
                                                            <div key={cls.id} className="text-[11px] text-gray-700">
                                                                &bull; {cls.name}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-[11px] text-gray-400 italic">None</span>
                                                )}
                                            </td>

                                            <td className="px-6 py-4 text-center whitespace-nowrap">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                                                    {student.status}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 text-right whitespace-nowrap">
                                                <button
                                                    onClick={() => setSelectedStudentForPassword(student)}
                                                    className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-900 border border-amber-300 rounded-lg px-2.5 py-1 bg-amber-50 hover:bg-amber-100 transition"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                                    </svg>
                                                    Cấp/Đổi Mật Khẩu
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Create Student Modal */}
            {isAddStudentOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-xs">
                        <div className="flex items-center justify-between border-b pb-3">
                            <h3 className="font-serif font-bold text-base text-gray-900">
                                Cấp Tài Khoản Học Viên Mới (Issue Student Account)
                            </h3>
                            <button onClick={() => setIsAddStudentOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleCreateStudent} className="space-y-3.5">
                            <div>
                                <label className="block font-medium text-gray-700 mb-1">
                                    Full Name (Họ tên học viên / Pháp danh)
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Bhikkhuni Vien Tue or Nguyen Van A"
                                    value={studentForm.data.name}
                                    onChange={(e) => studentForm.setData('name', e.target.value)}
                                    className="w-full rounded-lg border-gray-300 text-xs focus:ring-amber-500 focus:border-amber-500"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-medium text-gray-700 mb-1">
                                        Citizen ID (CCCD người truy cập)
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="079199000001"
                                        value={studentForm.data.cccd}
                                        onChange={(e) => studentForm.setData('cccd', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 text-xs font-mono focus:ring-amber-500 focus:border-amber-500"
                                        required
                                    />
                                    {studentForm.errors.cccd && <p className="text-red-500 text-[10px] mt-0.5">{studentForm.errors.cccd}</p>}
                                </div>

                                <div>
                                    <label className="block font-medium text-gray-700 mb-1">Phone Number (SĐT)</label>
                                    <input
                                        type="tel"
                                        placeholder="0912345678"
                                        value={studentForm.data.phone}
                                        onChange={(e) => studentForm.setData('phone', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 text-xs focus:ring-amber-500 focus:border-amber-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    placeholder="student@vienkhongni.vn"
                                    value={studentForm.data.email}
                                    onChange={(e) => studentForm.setData('email', e.target.value)}
                                    className="w-full rounded-lg border-gray-300 text-xs focus:ring-amber-500 focus:border-amber-500"
                                    required
                                />
                                {studentForm.errors.email && <p className="text-red-500 text-[10px] mt-0.5">{studentForm.errors.email}</p>}
                            </div>

                            <div>
                                <label className="block font-medium text-gray-700 mb-1">
                                    Initial Password (Mật khẩu được người quản lý cấp)
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. password or custom"
                                    value={studentForm.data.password}
                                    onChange={(e) => studentForm.setData('password', e.target.value)}
                                    className="w-full rounded-lg border-gray-300 text-xs font-mono focus:ring-amber-500 focus:border-amber-500"
                                    required
                                />
                                <p className="text-[11px] text-gray-400 mt-0.5">
                                    This password is handed to the student alongside their Citizen ID (CCCD).
                                </p>
                            </div>

                            <div>
                                <label className="block font-medium text-gray-700 mb-1">
                                    Assign to Class (Ghi danh vào lớp học)
                                </label>
                                <select
                                    value={studentForm.data.initial_class_id}
                                    onChange={(e) => studentForm.setData('initial_class_id', Number(e.target.value))}
                                    className="w-full rounded-lg border-gray-300 text-xs focus:ring-amber-500 focus:border-amber-500"
                                >
                                    <option value="">-- Do not assign immediately --</option>
                                    {availableClasses.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name} ({c.code})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t">
                                <button
                                    type="button"
                                    onClick={() => setIsAddStudentOpen(false)}
                                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={studentForm.processing}
                                    className="px-4 py-2 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-medium shadow"
                                >
                                    Register Account
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Change Password Modal */}
            {selectedStudentForPassword && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-xs">
                        <div className="flex items-center justify-between border-b pb-3">
                            <h3 className="font-serif font-bold text-base text-gray-900">
                                Cấp Lại Mật Khẩu
                            </h3>
                            <button onClick={() => setSelectedStudentForPassword(null)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleUpdatePassword} className="space-y-3.5">
                            <p className="text-gray-600">
                                Set a new password for <span className="font-semibold text-gray-900">{selectedStudentForPassword.name}</span> (CCCD: {selectedStudentForPassword.cccd}).
                            </p>

                            <div>
                                <label className="block font-medium text-gray-700 mb-1">New Password</label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={passwordForm.data.password}
                                    onChange={(e) => passwordForm.setData('password', e.target.value)}
                                    className="w-full rounded-lg border-gray-300 text-xs"
                                    required
                                    minLength={6}
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t">
                                <button
                                    type="button"
                                    onClick={() => setSelectedStudentForPassword(null)}
                                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={passwordForm.processing}
                                    className="px-4 py-2 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-medium shadow"
                                >
                                    Update Password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
