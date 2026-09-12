import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';

interface CourseItem {
    id: number;
    title: string;
    slug: string;
    category: 'dhamma' | 'vinaya' | 'abhidhamma' | 'pali' | string;
    target_audience: string;
    description: string;
    lessons_count: number;
    classes_count: number;
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
}

export default function Home({ auth, courses, activeClassesCount, monastery, year }: HomeProps) {
    const categories = [
        { id: 'dhamma', label: '1. Pháp (Dhamma)', desc: 'Pháp học tinh yếu & Kinh tạng Nikaya' },
        { id: 'vinaya', label: '2. Luật (Vinaya)', desc: 'Tỳ Kheo Ni, Sa-di, Tu nữ & Cư sĩ' },
        { id: 'abhidhamma', label: '3. Vi Diệu Pháp (Abhidhamma)', desc: 'Thắng pháp tập yếu luận (Abhidhammattha-sangaha)' },
        { id: 'pali', label: '4. Pali ngữ (Pali Language)', desc: 'Phát âm chuẩn xác, Văn phạm & Phân tích kinh văn' },
    ];

    return (
        <>
            <Head title="Viên Không Ni – Buddhist Courses" />

            <div className="min-h-screen bg-stone-900 text-stone-100 font-sans flex flex-col justify-between selection:bg-amber-500 selection:text-white">
                {/* Header / Navbar */}
                <header className="border-b border-stone-800/80 bg-stone-950/80 backdrop-blur sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center font-serif font-bold text-white shadow-lg shadow-amber-900/40 text-lg">
                                VK
                            </div>
                            <div>
                                <h1 className="font-serif font-bold text-lg text-amber-200 tracking-wide leading-tight">
                                    Viên Không Ni
                                </h1>
                                <p className="text-[11px] text-stone-400 font-medium tracking-wider uppercase">
                                    Buddhist Courses
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-900/30 transition"
                                >
                                    <span>Vào Cổng Học Tập (Dashboard)</span>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </Link>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Link
                                        href={route('login')}
                                        className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-900/40 transition"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                        </svg>
                                        Đăng Nhập Bằng CCCD
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Hero Section */}
                <main className="flex-1">
                    <div className="relative overflow-hidden py-16 sm:py-24 border-b border-stone-800">
                        {/* Ambient golden lotus glow */}
                        <div className="absolute inset-0 -z-10 flex items-center justify-center">
                            <div className="h-[450px] w-[700px] rounded-full bg-amber-600/10 blur-[140px]"></div>
                        </div>

                        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
                                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                                Tu Viện Viên Không Ni &bull; Đề Xuất Nội Dung Khóa Học
                            </div>

                            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-stone-100 max-w-4xl mx-auto leading-tight">
                                Hệ Thống Đào Tạo Phật Học <br />
                                <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent">
                                    Viên Không Ni – Buddhist Courses
                                </span>
                            </h1>

                            <p className="text-sm sm:text-base text-stone-400 max-w-2xl mx-auto leading-relaxed">
                                Nền tảng học tập chuẩn mực dành cho Ni chúng và quý Phật tử tu viện Viên Không Ni. Quy trình học tập nghiêm ngặt 5 bước: Tự đọc tài liệu &rarr; Xem video &rarr; Ôn luyện 10 lần &rarr; Kiểm tra &rarr; Khắc phục triệt để câu sai.
                            </p>

                            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
                                <Link
                                    href={route('login')}
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-amber-600 hover:bg-amber-500 text-white shadow-xl shadow-amber-900/50 transition transform hover:-translate-y-0.5"
                                >
                                    <span>Đăng Nhập Với CCCD & Mật Khẩu</span>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </Link>

                                <a
                                    href="#chuong-trinh"
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition"
                                >
                                    Xem Chương Trình Học
                                </a>
                            </div>

                            {/* Monastery Address Bar */}
                            <div className="mt-8 pt-6 border-t border-stone-800/80 max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-stone-400">
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span>{monastery.address}</span>
                                </div>

                                <a
                                    href={monastery.facebook}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 font-medium"
                                >
                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                    </svg>
                                    Facebook Tu Viện
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* 5-Step Learning Pipeline Explanation */}
                    <div className="py-16 border-b border-stone-800 bg-stone-950/40">
                        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                            <div className="text-center max-w-2xl mx-auto space-y-2">
                                <h2 className="font-serif font-bold text-2xl text-amber-200">
                                    Quy Trình Học Tập 5 Bước Nghiêm Ngặt
                                </h2>
                                <p className="text-xs text-stone-400">
                                    Thiết kế tuần tự: Bắt buộc xong phần tự học mới xem clip, xem xong clip mới được ôn luyện 10 lần, xong ôn luyện mới được kiểm tra, làm lại câu sai mới hoàn tất.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 text-xs">
                                <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 space-y-2">
                                    <span className="text-[10px] font-bold text-amber-500 uppercase">Bước 1</span>
                                    <h3 className="font-semibold text-stone-200 text-sm">Tài Liệu Tự Đọc</h3>
                                    <p className="text-stone-400 text-[11px]">
                                        Tự học tài liệu chuyên khảo. Có nút góp ý ngay dưới mỗi tài liệu để phản ánh khi cần chỉnh sửa.
                                    </p>
                                </div>

                                <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 space-y-2">
                                    <span className="text-[10px] font-bold text-amber-500 uppercase">Bước 2</span>
                                    <h3 className="font-semibold text-stone-200 text-sm">Video Clip Bài Giảng</h3>
                                    <p className="text-stone-400 text-[11px]">
                                        Xem video bài giảng của giáo thọ sư làm rõ nội dung cốt lõi của phần tự học.
                                    </p>
                                </div>

                                <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 space-y-2">
                                    <span className="text-[10px] font-bold text-amber-500 uppercase">Bước 3</span>
                                    <h3 className="font-semibold text-stone-200 text-sm">Ôn Luyện 10 Lần</h3>
                                    <p className="text-stone-400 text-[11px]">
                                        Trắc nghiệm giải thích đáp án ngay sau khi chọn. Bắt buộc thực hiện đủ 10 lần ôn luyện.
                                    </p>
                                </div>

                                <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 space-y-2">
                                    <span className="text-[10px] font-bold text-amber-500 uppercase">Bước 4</span>
                                    <h3 className="font-semibold text-stone-200 text-sm">Bài Kiểm Tra</h3>
                                    <p className="text-stone-400 text-[11px]">
                                        Đề thi tự động xáo câu. Thống kê rõ số câu làm đúng, số câu sai, và số câu cần ôn tập.
                                    </p>
                                </div>

                                <div className="p-5 rounded-2xl bg-stone-900 border border-amber-500/40 space-y-2">
                                    <span className="text-[10px] font-bold text-emerald-400 uppercase">Bước 5</span>
                                    <h3 className="font-semibold text-stone-200 text-sm">Ôn Tập Câu Sai</h3>
                                    <p className="text-stone-400 text-[11px]">
                                        Làm lại các câu sai cho đến khi không còn câu sai mới hoàn tất chương trình môn học.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Planned Curriculum Sections (from PDF Page 1) */}
                    <div id="chuong-trinh" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
                        <div className="text-center max-w-2xl mx-auto space-y-3">
                            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                                Đề Xuất Nội Dung Khóa Học
                            </span>
                            <h2 className="font-serif font-bold text-3xl text-white">
                                Chương Trình Đào Tạo Bốn Phân Môn
                            </h2>
                            <p className="text-xs text-stone-400">
                                Dành cho mỗi học viên (Tỳ Kheo Ni, Sa-di, Tu nữ và Cư sĩ) tại tu viện Viên Không Ni
                            </p>
                        </div>

                        {/* Four Core Categories Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* 1. Dhamma (Pháp) */}
                            <div className="bg-stone-950/60 rounded-3xl border border-stone-800 p-8 space-y-4 hover:border-amber-500/50 transition">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-serif font-bold text-base">
                                        1
                                    </div>
                                    <div>
                                        <h3 className="font-serif font-bold text-xl text-white">1. Pháp (Dhamma)</h3>
                                        <p className="text-xs text-amber-400/80">Pháp học tinh yếu & Kinh tạng Nikaya</p>
                                    </div>
                                </div>
                                <ul className="space-y-2 text-xs text-stone-300 pt-2 border-t border-stone-800">
                                    <li className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                                        <strong>Pháp học tinh yếu:</strong> Bốn Thánh Đế, Bát Thánh Đạo, Thập Nhị Duyên Khởi.
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                                        <strong>Pháp học theo kinh tạng:</strong> Trường Bộ, Trung Bộ, Tương Ưng Bộ, Tăng Chi Bộ.
                                    </li>
                                </ul>
                            </div>

                            {/* 2. Vinaya (Luật) */}
                            <div className="bg-stone-950/60 rounded-3xl border border-stone-800 p-8 space-y-4 hover:border-amber-500/50 transition">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-serif font-bold text-base">
                                        2
                                    </div>
                                    <div>
                                        <h3 className="font-serif font-bold text-xl text-white">2. Luật (Vinaya)</h3>
                                        <p className="text-xs text-amber-400/80">Người xuất gia & Cư sĩ</p>
                                    </div>
                                </div>
                                <ul className="space-y-2 text-xs text-stone-300 pt-2 border-t border-stone-800">
                                    <li className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                                        <strong>Người xuất gia:</strong> Tỳ Kheo Ni (311 giới Patimokkha), Sa-di / Sa-di-ni (10 giới), Tu nữ (Bát quan trai giới & oai nghi).
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                                        <strong>Cư sĩ:</strong> Ngũ giới, Bát quan trai giới ngày Uposatha, Bổn phận gia đình và xã hội.
                                    </li>
                                </ul>
                            </div>

                            {/* 3. Abhidhamma (Vi Diệu Pháp) */}
                            <div className="bg-stone-950/60 rounded-3xl border border-stone-800 p-8 space-y-4 hover:border-amber-500/50 transition">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-serif font-bold text-base">
                                        3
                                    </div>
                                    <div>
                                        <h3 className="font-serif font-bold text-xl text-white">3. Vi Diệu Pháp (Abhidhamma)</h3>
                                        <p className="text-xs text-amber-400/80">Thắng pháp tập yếu luận</p>
                                    </div>
                                </div>
                                <ul className="space-y-2 text-xs text-stone-300 pt-2 border-t border-stone-800">
                                    <li className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                                        <strong>Thắng pháp tập yếu luận (Abhidhammattha-sangaha):</strong> Hệ thống thực tính chân đế: Citta (Tâm), Cetasika (Tâm sở), Rupa (Sắc pháp), Nibbana (Niết-bàn).
                                    </li>
                                </ul>
                            </div>

                            {/* 4. Pali (Pali Language) */}
                            <div className="bg-stone-950/60 rounded-3xl border border-stone-800 p-8 space-y-4 hover:border-amber-500/50 transition">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-serif font-bold text-base">
                                        4
                                    </div>
                                    <div>
                                        <h3 className="font-serif font-bold text-xl text-white">4. Pali Ngữ (Pali)</h3>
                                        <p className="text-xs text-amber-400/80">Ngôn ngữ bảo lưu Tam Tạng Chánh Tạng</p>
                                    </div>
                                </div>
                                <ul className="space-y-2 text-xs text-stone-300 pt-2 border-t border-stone-800">
                                    <li className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                                        <strong>Cách phát âm:</strong> Âm chuẩn Pāḷi, nguyên âm, phụ âm, vần điệu tụng đọc.
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                                        <strong>Văn phạm Pali:</strong> Biến cách danh từ, động từ, tiếp đầu ngữ, luật liên thính (sandhi).
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                                        <strong>Phân tích Pali qua một số bài kinh:</strong> Kinh Điềm Lành, Kinh Châu Báu, Kinh Từ Bi.
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Footer with Monastery Information */}
                <footer className="bg-stone-950 border-t border-stone-800 text-stone-400 py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-serif font-bold">
                                        VK
                                    </div>
                                    <span className="font-serif font-bold text-white text-base">Tu Viện Viên Không Ni</span>
                                </div>
                                <p className="text-xs text-stone-500 leading-relaxed">
                                    Nền tảng đào tạo trực tuyến chính thức phục vụ công tác tu học Phật pháp theo truyền thống Theravada nguyên thủy.
                                </p>
                            </div>

                            <div className="space-y-2 text-xs">
                                <h4 className="font-serif font-bold text-stone-200">Địa Chỉ Tu Viện</h4>
                                <p className="text-stone-400 leading-relaxed">
                                    {monastery.address}
                                </p>
                                <p className="text-stone-500 text-[11px] pt-1">
                                    Mật khẩu truy cập được cấp trực tiếp bởi Người quản lý lớp học.
                                </p>
                            </div>

                            <div className="space-y-3 text-xs">
                                <h4 className="font-serif font-bold text-stone-200">Kết Nối Phật Sự</h4>
                                <a
                                    href={monastery.facebook}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600/20 text-blue-300 border border-blue-500/30 hover:bg-blue-600/30 transition"
                                >
                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                    </svg>
                                    Trang Facebook Tu Viện
                                </a>
                            </div>
                        </div>

                        <div className="border-t border-stone-900 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-stone-500">
                            <p>&copy; {year} Viên Không Ni – Buddhist Courses. All rights reserved.</p>
                            <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                    Hệ thống sẵn sàng
                                </span>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
