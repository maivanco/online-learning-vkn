import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';

export interface UserItem {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'teacher' | 'student';
    username: string | null;
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

interface UsersProps extends PageProps {
    users: {
        data: UserItem[];
        current_page: number;
        last_page: number;
        total: number;
        prev_page_url: string | null;
        next_page_url: string | null;
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
    };
    availableClasses: Array<{
        id: number;
        name: string;
        code: string;
    }>;
    counts: {
        all: number;
        admin: number;
        teacher: number;
        student: number;
    };
    filters: {
        role: string;
        search?: string;
    };
}

export default function UsersIndex({ auth, users, availableClasses, counts, filters, flash }: UsersProps) {
    const [isAddUserOpen, setIsAddUserOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserItem | null>(null);
    const [selectedUserForPassword, setSelectedUserForPassword] = useState<UserItem | null>(null);
    const [userToDelete, setUserToDelete] = useState<UserItem | null>(null);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    // Form for creating a new user
    const createForm = useForm({
        name: '',
        email: '',
        password: '',
        role: (filters.role !== 'all' && ['admin', 'teacher', 'student'].includes(filters.role) ? filters.role : 'student') as 'admin' | 'teacher' | 'student',
        phone: '',
        username: '',
        status: 'active',
        initial_class_id: availableClasses[0]?.id || '',
    });

    // Form for editing user
    const editForm = useForm({
        name: '',
        email: '',
        role: 'student' as 'admin' | 'teacher' | 'student',
        phone: '',
        username: '',
        status: 'active',
    });

    // Form for changing password
    const passwordForm = useForm({
        password: '',
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('admin.users.index'), {
            role: filters.role || 'all',
            search: searchTerm,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleTabChange = (newRole: string) => {
        router.get(route('admin.users.index'), {
            role: newRole,
            search: searchTerm || undefined,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleCreateUser = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(route('admin.users.store'), {
            onSuccess: () => {
                setIsAddUserOpen(false);
                createForm.reset();
            },
        });
    };

    const openEditModal = (user: UserItem) => {
        setEditingUser(user);
        editForm.setData({
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone || '',
            username: user.username || '',
            status: user.status || 'active',
        });
    };

    const handleUpdateUser = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;
        editForm.put(route('admin.users.update', editingUser.id), {
            onSuccess: () => {
                setEditingUser(null);
                editForm.reset();
            },
        });
    };

    const handleUpdatePassword = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUserForPassword) return;
        passwordForm.put(route('admin.users.password', selectedUserForPassword.id), {
            onSuccess: () => {
                setSelectedUserForPassword(null);
                passwordForm.reset();
            },
        });
    };

    const handleDeleteUser = () => {
        if (!userToDelete) return;
        router.delete(route('admin.users.destroy', userToDelete.id), {
            onSuccess: () => {
                setUserToDelete(null);
            },
        });
    };

    const roleBadges: Record<string, { label: string; badgeClass: string; icon: string }> = {
        admin: {
            label: 'Quản trị viên (Admin)',
            badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
            icon: '🛡️',
        },
        teacher: {
            label: 'Giáo thọ (Teacher)',
            badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
            icon: '🎓',
        },
        student: {
            label: 'Học viên (Student)',
            badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
            icon: '📖',
        },
    };

    const tabs = [
        { key: 'all', label: 'Tất cả người dùng', count: counts.all },
        { key: 'admin', label: 'Quản trị viên', count: counts.admin },
        { key: 'teacher', label: 'Giáo thọ / Giảng viên', count: counts.teacher },
        { key: 'student', label: 'Học viên', count: counts.student },
    ];

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Quản Lý Người Dùng & Phân Quyền (User Management)</h2>}
        >
            <Head title="Quản Lý Người Dùng - Buddhist Courses" />

            <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                {/* Flash Messages */}
                {flash?.success && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-sm flex items-center gap-2 shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        {flash.success}
                    </div>
                )}

                {flash?.error && (
                    <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl text-sm flex items-center gap-2 shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                        {flash.error}
                    </div>
                )}

                {/* Header Action Bar */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h3 className="font-serif font-bold text-lg text-gray-900">
                            Danh Sách Tài Khoản & Vai Trò
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                            Quản lý tài khoản Quản trị viên, Giáo thọ và Học viên trong hệ thống Tu viện.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsAddUserOpen(true)}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-medium text-xs shadow-sm transition"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                            Tạo Tài Khoản Mới
                        </button>
                    </div>
                </div>

                {/* Role Tabs & Search Bar */}
                <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* Filter Tabs */}
                        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-stone-100 rounded-xl">
                            {tabs.map((tab) => {
                                const isActive = filters.role === tab.key || (filters.role === '' && tab.key === 'all');
                                return (
                                    <button
                                        key={tab.key}
                                        onClick={() => handleTabChange(tab.key)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                                            isActive
                                                ? 'bg-white text-gray-900 shadow-sm font-semibold'
                                                : 'text-stone-600 hover:text-gray-900 hover:bg-stone-200/60'
                                        }`}
                                    >
                                        <span>{tab.label}</span>
                                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                                            isActive ? 'bg-amber-100 text-amber-900 font-bold' : 'bg-stone-200 text-stone-600'
                                        }`}>
                                            {tab.count}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Search Input */}
                        <form onSubmit={handleSearch} className="flex items-center gap-2">
                            <div className="relative w-full sm:w-64">
                                <input
                                    type="text"
                                    placeholder="Tìm tên, email, SĐT, Username..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border-gray-300 focus:ring-amber-500 focus:border-amber-500"
                                />
                                <svg className="w-4 h-4 text-gray-400 absolute left-2.5 top-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <button
                                type="submit"
                                className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium transition"
                            >
                                Tìm kiếm
                            </button>
                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchTerm('');
                                        router.get(route('admin.users.index'), { role: filters.role || 'all' });
                                    }}
                                    className="text-xs text-gray-400 hover:text-gray-600"
                                >
                                    Xóa
                                </button>
                            )}
                        </form>
                    </div>
                </div>

                {/* Table of Users */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-xs">
                            <thead className="bg-stone-50 text-stone-700 font-semibold uppercase tracking-wider text-[11px]">
                                <tr>
                                    <th className="px-6 py-3.5 text-left">Người Dùng (Họ tên & Email)</th>
                                    <th className="px-6 py-3.5 text-left">Vai Trò (Role)</th>
                                    <th className="px-6 py-3.5 text-left">Số Điện Thoại / Username</th>
                                    <th className="px-6 py-3.5 text-left">Lớp Học Tham Gia</th>
                                    <th className="px-6 py-3.5 text-center">Trạng Thái</th>
                                    <th className="px-6 py-3.5 text-right">Thao Tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {users.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-12 text-gray-400 text-xs">
                                            Không tìm thấy người dùng nào phù hợp.
                                        </td>
                                    </tr>
                                ) : (
                                    users.data.map((user) => {
                                        const badge = roleBadges[user.role] || roleBadges.student;
                                        const isSelf = auth.user.id === user.id;

                                        return (
                                            <tr key={user.id} className="hover:bg-stone-50/50 transition">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-8 h-8 rounded-full bg-stone-100 text-stone-600 font-bold flex items-center justify-center text-xs">
                                                            {user.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-gray-900 text-sm flex items-center gap-1.5">
                                                                {user.name}
                                                                {isSelf && (
                                                                    <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-normal">
                                                                        Bạn
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="text-[11px] text-gray-500">{user.email}</div>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${badge.badgeClass}`}>
                                                        <span>{badge.icon}</span>
                                                        {badge.label}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-4 whitespace-nowrap text-gray-600 space-y-0.5">
                                                    <div>{user.phone || '—'}</div>
                                                    {user.username && (
                                                        <div className="font-mono text-[10px] text-gray-500">
                                                            Username: {user.username}
                                                        </div>
                                                    )}
                                                </td>

                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {user.classes.length > 0 ? (
                                                        <div className="space-y-0.5">
                                                            {user.classes.map((cls) => (
                                                                <div key={cls.id} className="text-[11px] text-gray-700">
                                                                    &bull; {cls.name}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="text-[11px] text-gray-400 italic">Chưa ghi danh</span>
                                                    )}
                                                </td>

                                                <td className="px-6 py-4 text-center whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                                        user.status === 'active'
                                                            ? 'bg-emerald-100 text-emerald-800'
                                                            : 'bg-rose-100 text-rose-800'
                                                    }`}>
                                                        {user.status === 'active' ? 'Hoạt động' : 'Tạm khóa'}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-4 text-right whitespace-nowrap space-x-1">
                                                    <button
                                                        onClick={() => openEditModal(user)}
                                                        className="inline-flex items-center gap-1 text-xs font-medium text-stone-700 hover:text-stone-900 border border-stone-300 rounded-lg px-2.5 py-1 bg-stone-50 hover:bg-stone-100 transition"
                                                        title="Chỉnh sửa thông tin"
                                                    >
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                        Sửa
                                                    </button>

                                                    <button
                                                        onClick={() => setSelectedUserForPassword(user)}
                                                        className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 hover:text-amber-900 border border-amber-300 rounded-lg px-2.5 py-1 bg-amber-50 hover:bg-amber-100 transition"
                                                        title="Đổi mật khẩu"
                                                    >
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                                        </svg>
                                                        Mật khẩu
                                                    </button>

                                                    {!isSelf && (
                                                        <button
                                                            onClick={() => setUserToDelete(user)}
                                                            className="inline-flex items-center gap-1 text-xs font-medium text-rose-700 hover:text-rose-900 border border-rose-300 rounded-lg px-2 py-1 bg-rose-50 hover:bg-rose-100 transition"
                                                            title="Xóa tài khoản"
                                                        >
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {users.total > users.data.length && (
                        <div className="p-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-600">
                            <div>
                                Hiển thị {users.data.length} trên tổng số {users.total} người dùng
                            </div>
                            <div className="flex items-center gap-1">
                                {users.links.map((link, idx) => (
                                    <Link
                                        key={idx}
                                        href={link.url || '#'}
                                        preserveState
                                        className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                                            link.active
                                                ? 'bg-amber-700 text-white'
                                                : link.url
                                                ? 'text-gray-700 hover:bg-stone-100'
                                                : 'text-gray-300 cursor-not-allowed'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Create User Modal */}
            {isAddUserOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-xs">
                        <div className="flex items-center justify-between border-b pb-3">
                            <h3 className="font-serif font-bold text-base text-gray-900">
                                Tạo Tài Khoản Người Dùng Mới
                            </h3>
                            <button onClick={() => setIsAddUserOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleCreateUser} className="space-y-3.5">
                            <div>
                                <label className="block font-medium text-gray-700 mb-1">
                                    Họ và tên / Pháp danh <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="VD: Sư cô Viên Tuệ hoặc Nguyễn Văn A"
                                    value={createForm.data.name}
                                    onChange={(e) => createForm.setData('name', e.target.value)}
                                    className="w-full rounded-lg border-gray-300 text-xs focus:ring-amber-500 focus:border-amber-500"
                                    required
                                />
                                {createForm.errors.name && <p className="text-red-500 text-[10px] mt-0.5">{createForm.errors.name}</p>}
                            </div>

                            <div>
                                <label className="block font-medium text-gray-700 mb-1">
                                    Vai Trò (Role) <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={createForm.data.role}
                                    onChange={(e) => createForm.setData('role', e.target.value as 'admin' | 'teacher' | 'student')}
                                    className="w-full rounded-lg border-gray-300 text-xs focus:ring-amber-500 focus:border-amber-500 font-medium"
                                    required
                                >
                                    <option value="student">📖 Học viên (Student)</option>
                                    <option value="teacher">🎓 Giáo thọ / Giảng sư (Teacher)</option>
                                    <option value="admin">🛡️ Quản trị viên (Administrator)</option>
                                </select>
                                {createForm.errors.role && <p className="text-red-500 text-[10px] mt-0.5">{createForm.errors.role}</p>}
                            </div>

                            <div>
                                <label className="block font-medium text-gray-700 mb-1">
                                    Địa Chỉ Email <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    placeholder="user@vienkhongni.vn"
                                    value={createForm.data.email}
                                    onChange={(e) => createForm.setData('email', e.target.value)}
                                    className="w-full rounded-lg border-gray-300 text-xs focus:ring-amber-500 focus:border-amber-500"
                                    required
                                />
                                {createForm.errors.email && <p className="text-red-500 text-[10px] mt-0.5">{createForm.errors.email}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-medium text-gray-700 mb-1">
                                        Số Điện Thoại (Tùy chọn)
                                    </label>
                                    <input
                                        type="tel"
                                        placeholder="0912345678"
                                        value={createForm.data.phone}
                                        onChange={(e) => createForm.setData('phone', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 text-xs focus:ring-amber-500 focus:border-amber-500"
                                    />
                                </div>

                                <div>
                                    <label className="block font-medium text-gray-700 mb-1">
                                        Tên Đăng Nhập / Username (Tùy chọn)
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Ví dụ: nguyenvana"
                                        value={createForm.data.username}
                                        onChange={(e) => createForm.setData('username', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 text-xs font-mono focus:ring-amber-500 focus:border-amber-500"
                                    />
                                    {createForm.errors.username && <p className="text-red-500 text-[10px] mt-0.5">{createForm.errors.username}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block font-medium text-gray-700 mb-1">
                                    Mật Khẩu Ban Đầu <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Tối thiểu 6 ký tự"
                                    value={createForm.data.password}
                                    onChange={(e) => createForm.setData('password', e.target.value)}
                                    className="w-full rounded-lg border-gray-300 text-xs font-mono focus:ring-amber-500 focus:border-amber-500"
                                    required
                                    minLength={6}
                                />
                                {createForm.errors.password && <p className="text-red-500 text-[10px] mt-0.5">{createForm.errors.password}</p>}
                            </div>

                            {createForm.data.role === 'student' && (
                                <div>
                                    <label className="block font-medium text-gray-700 mb-1">
                                        Ghi danh vào lớp học (Tùy chọn)
                                    </label>
                                    <select
                                        value={createForm.data.initial_class_id}
                                        onChange={(e) => createForm.setData('initial_class_id', Number(e.target.value))}
                                        className="w-full rounded-lg border-gray-300 text-xs focus:ring-amber-500 focus:border-amber-500"
                                    >
                                        <option value="">-- Chưa ghi danh vào lớp nào --</option>
                                        {availableClasses.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name} ({c.code})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="flex justify-end gap-2 pt-3 border-t">
                                <button
                                    type="button"
                                    onClick={() => setIsAddUserOpen(false)}
                                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    disabled={createForm.processing}
                                    className="px-4 py-2 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-medium shadow"
                                >
                                    {createForm.processing ? 'Đang tạo...' : 'Tạo Tài Khoản'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {editingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-xs">
                        <div className="flex items-center justify-between border-b pb-3">
                            <h3 className="font-serif font-bold text-base text-gray-900">
                                Chỉnh Sửa Thông Tin Người Dùng
                            </h3>
                            <button onClick={() => setEditingUser(null)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleUpdateUser} className="space-y-3.5">
                            <div>
                                <label className="block font-medium text-gray-700 mb-1">Họ và tên</label>
                                <input
                                    type="text"
                                    value={editForm.data.name}
                                    onChange={(e) => editForm.setData('name', e.target.value)}
                                    className="w-full rounded-lg border-gray-300 text-xs"
                                    required
                                />
                                {editForm.errors.name && <p className="text-red-500 text-[10px] mt-0.5">{editForm.errors.name}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-medium text-gray-700 mb-1">Vai Trò (Role)</label>
                                    <select
                                        value={editForm.data.role}
                                        onChange={(e) => editForm.setData('role', e.target.value as 'admin' | 'teacher' | 'student')}
                                        className="w-full rounded-lg border-gray-300 text-xs font-medium"
                                        required
                                    >
                                        <option value="student">📖 Học viên</option>
                                        <option value="teacher">🎓 Giáo thọ</option>
                                        <option value="admin">🛡️ Quản trị viên</option>
                                    </select>
                                    {editForm.errors.role && <p className="text-red-500 text-[10px] mt-0.5">{editForm.errors.role}</p>}
                                </div>

                                <div>
                                    <label className="block font-medium text-gray-700 mb-1">Trạng Thái</label>
                                    <select
                                        value={editForm.data.status}
                                        onChange={(e) => editForm.setData('status', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 text-xs"
                                        required
                                    >
                                        <option value="active">Hoạt động (Active)</option>
                                        <option value="inactive">Tạm khóa (Inactive)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={editForm.data.email}
                                    onChange={(e) => editForm.setData('email', e.target.value)}
                                    className="w-full rounded-lg border-gray-300 text-xs"
                                    required
                                />
                                {editForm.errors.email && <p className="text-red-500 text-[10px] mt-0.5">{editForm.errors.email}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-medium text-gray-700 mb-1">Số Điện Thoại</label>
                                    <input
                                        type="tel"
                                        value={editForm.data.phone}
                                        onChange={(e) => editForm.setData('phone', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 text-xs"
                                    />
                                </div>

                                <div>
                                    <label className="block font-medium text-gray-700 mb-1">Username</label>
                                    <input
                                        type="text"
                                        value={editForm.data.username}
                                        onChange={(e) => editForm.setData('username', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 text-xs font-mono"
                                    />
                                    {editForm.errors.username && <p className="text-red-500 text-[10px] mt-0.5">{editForm.errors.username}</p>}
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t">
                                <button
                                    type="button"
                                    onClick={() => setEditingUser(null)}
                                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    disabled={editForm.processing}
                                    className="px-4 py-2 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-medium shadow"
                                >
                                    {editForm.processing ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Change Password Modal */}
            {selectedUserForPassword && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-xs">
                        <div className="flex items-center justify-between border-b pb-3">
                            <h3 className="font-serif font-bold text-base text-gray-900">
                                Cấp / Đổi Mật Khẩu
                            </h3>
                            <button onClick={() => setSelectedUserForPassword(null)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleUpdatePassword} className="space-y-3.5">
                            <p className="text-gray-600">
                                Đặt mật khẩu mới cho người dùng <span className="font-semibold text-gray-900">{selectedUserForPassword.name}</span> ({selectedUserForPassword.email}).
                            </p>

                            <div>
                                <label className="block font-medium text-gray-700 mb-1">Mật khẩu mới</label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={passwordForm.data.password}
                                    onChange={(e) => passwordForm.setData('password', e.target.value)}
                                    className="w-full rounded-lg border-gray-300 text-xs"
                                    required
                                    minLength={6}
                                />
                                {passwordForm.errors.password && (
                                    <p className="text-red-500 text-[10px] mt-0.5">{passwordForm.errors.password}</p>
                                )}
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t">
                                <button
                                    type="button"
                                    onClick={() => setSelectedUserForPassword(null)}
                                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    disabled={passwordForm.processing}
                                    className="px-4 py-2 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-medium shadow"
                                >
                                    {passwordForm.processing ? 'Đang cập nhật...' : 'Cập Nhật Mật Khẩu'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete User Confirmation Modal */}
            {userToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-xs">
                        <div className="flex items-center gap-3 text-rose-600">
                            <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="font-serif font-bold text-base text-gray-900">
                                Xác Nhận Xóa Tài Khoản
                            </h3>
                        </div>

                        <p className="text-gray-600">
                            Bạn có chắc chắn muốn xóa tài khoản <span className="font-semibold text-gray-900">{userToDelete.name}</span> ({userToDelete.email})? Hành động này không thể hoàn tác.
                        </p>

                        <div className="flex justify-end gap-2 pt-3 border-t">
                            <button
                                type="button"
                                onClick={() => setUserToDelete(null)}
                                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteUser}
                                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-medium shadow"
                            >
                                Xác Nhận Xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
