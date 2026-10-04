# 01. Tổng quan Hệ thống & Khái niệm Cốt lõi

Chào mừng quý Thầy, quý Sư cô, Giảng viên và Quý Phật tử đến với **Cổng Học Phật Pháp Trực Tuyến - Tu viện Viên Không Ni**.

Tài liệu này được biên soạn với phong cách đơn giản, dễ hiểu nhất dành cho người dùng phổ thông (không chuyên về kỹ thuật), giúp mọi người nắm rõ cách thức hệ thống vận hành và phối hợp nhịp nhàng trong toàn bộ quá trình dạy, học và quản trị.

---

## 1. Mục đích & Ý nghĩa của Nền tảng

Hệ thống được phát triển với tâm nguyện kết nối giáo lý Phật đà truyền thống với phương pháp giáo dục hiện đại:
- **Chuẩn hoá lộ trình tu học**: Học viên tiếp cận bài giảng một cách tuần tự, từ đọc kinh văn, nghe giảng giải cho đến làm bài tập trắc nghiệm củng cố và thi tốt nghiệp.
- **Tiết kiệm thời gian cho Giáo thọ**: Tự động chấm điểm trắc nghiệm, quản lý tiến độ học viên trực quan theo thời gian thực, hỗ trợ nhập đề thi hàng loạt từ Excel.
- **Tạo môi trường học tập trang nghiêm & bền vững**: Phật tử khắp nơi đều có thể tự học, tự ôn luyện mọi lúc, mọi nơi trên máy tính hoặc điện thoại di động; sau khi tốt nghiệp được cấp Chứng chỉ Phật học chính thức có mã định danh và mã QR xác thực công khai.

---

## 2. Triết lý Vận hành: Văn – Tư – Tu

Nền tảng ứng dụng triết lý giáo dục Phật giáo truyền thống (Tam Huệ Học: Văn tuệ – Tư tuệ – Tu tuệ):

1. **Văn tuệ (Học & Nghe)**: 
   - Học viên tự đọc tài liệu kinh điển, giáo trình định dạng chuẩn mực (Tab Bài đọc).
   - Lắng nghe chư Tôn đức giảng giải chi tiết về kinh điển (Tab Video bài giảng).
2. **Tư tuệ (Tư duy & Chiêm nghiệm)**:
   - Làm bài tập trắc nghiệm ngắn sau mỗi bài để kiểm tra mức độ hiểu bài, kèm lời giải thích giáo lý tức thời.
   - Gửi thắc mắc, nghi vấn đến Giáo thọ thông qua khung phản hồi trực tiếp dưới bài học.
3. **Tu tuệ (Thực hành & Khắc sâu)**:
   - Hoàn thành bài thi kết thúc lớp học (kết hợp trắc nghiệm khách quan và tự luận suy nghiệm).
   - Khắc phục câu trả lời sai trong **Sổ tay câu sai cá nhân** cho đến khi thấu suốt chánh kiến.

---

## 3. Ba Nhóm Người Dùng trong Hệ Thống

| Vai trò | Tên gọi | Nhiệm vụ chính |
| :--- | :--- | :--- |
| **Quản trị viên** | Administrator | Quản lý toàn bộ hệ thống, phân quyền tài khoản (Admin, Giảng viên, Học viên), cấu hình website, kho đa phương tiện, bảo trì dữ liệu và giám sát chung. |
| **Giảng viên** | Teacher / Giáo thọ | Quản lý lớp học được phân công, ghi danh học viên theo sĩ số giới hạn, soạn thảo bài học với trình soạn thảo phong phú (Rich Text), xây dựng ngân hàng câu hỏi (nhập tay hoặc file Excel), theo dõi tiến độ và chấm bài thi tự luận. |
| **Học viên** | Student / Phật tử | Đăng ký tài khoản (kèm Pháp danh), tham gia học tuần tự 5 bước: Đọc bài $\rightarrow$ Xem video $\rightarrow$ Làm bài tập $\rightarrow$ Thi kết thúc $\rightarrow$ Ôn tập câu sai, nhận Chứng chỉ tốt nghiệp có mã QR xác thực. |

---

## 4. Các Phân Hệ & Khái niệm Cốt lõi

Hệ thống bao gồm các phân hệ chức năng hoàn chỉnh và liên kết chặt chẽ với nhau:

- **Khoá học (Course) & Cây Danh mục**: Một chủ đề Phật học hoàn chỉnh (ví dụ: *Kinh Trung Bộ*, *Thiền Tứ Niệm Xứ*, *Phật Pháp Căn Bản*). Khoá học hỗ trợ phân cấp cha - con và chứa các bài học tuần tự.
- **Bài học (Lesson) & Trình soạn thảo Rich Text**: Đơn vị bài giảng trong khoá học. Bài học hỗ trợ định dạng kinh văn phong phú (in đậm, in nghiêng, trích dẫn kệ ngôn, danh sách), nhúng video YouTube bài giảng và bộ câu hỏi luyện tập.
- **Lớp học (Class) & Giới hạn Sĩ số**: Lớp mở theo đợt thực tế. Mỗi lớp có Giảng viên phụ trách, giới hạn số lượng học viên tối đa (`max_students`), cơ chế Khoá lớp (`is_locked`) để bảo toàn dữ liệu khi kết thúc khoá.
- **Ngân hàng Đề thi & Nhập liệu Excel**: Kho lưu trữ câu hỏi trắc nghiệm và tự luận phân cấp theo độ khó (Dễ, Trung bình, Khó). Giảng viên có thể nhập hàng trăm câu hỏi nhanh chóng qua file mẫu Excel (.xlsx, .csv).
- **Lộ trình Học 5 Bước (5-Step Pipeline)**: Đảm bảo học viên không nhảy cóc: Hoàn thành Đọc bài $\rightarrow$ Mở khoá Video $\rightarrow$ Mở khoá Luyện tập $\rightarrow$ Đủ 100% mở khoá Bài thi $\rightarrow$ Ôn tập câu sai.
- **Bài thi Kết thúc Lớp & Đồng hồ Đếm ngược**: Bài thi tổng hợp có thời gian làm bài xác định (phút), đếm ngược theo máy chủ và **tự động nộp bài khi hết giờ** để bảo vệ kết quả của học viên.
- **Chứng chỉ Tốt nghiệp & Mã QR Xác thực**: Khi học viên hoàn thành khoá học và đạt điểm tốt nghiệp, hệ thống tự động cấp Chứng chỉ điện tử trang nghiêm, thể hiện Họ tên, Pháp danh, Xếp loại tốt nghiệp (Xuất sắc, Giỏi, Khá, Đạt) cùng mã định danh duy nhất và mã QR xác thực công khai.
- **Hồ sơ Phật tử & Pháp danh (`StudentProfile`)**: Lưu giữ thông tin Pháp danh, năm sinh, giới tính, số điện thoại, địa chỉ phục vụ công tác in ấn chứng chỉ và liên lạc của tu viện.
- **Cài đặt Hệ thống (General Settings)**: Quản lý thông tin tu viện, đường dây nóng hỗ trợ, mạng xã hội, chế độ bảo trì toàn trang.
