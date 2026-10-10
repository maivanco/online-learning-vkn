# 02. Sổ tay Hướng dẫn Dành cho Giảng viên

Sổ tay này hướng dẫn chi tiết từng thao tác dành cho Quý Thầy, Quý Sư cô và Giảng viên trong việc quản trị lớp học, biên soạn giáo trình, quản lý ngân hàng câu hỏi (kèm tính năng nhập Excel), theo dõi tiến độ, chấm bài thi và quản lý chứng chỉ học viên.

---

## 1. Soạn thảo Khoá học & Bài học

### Bước 1: Mở mục Khoá học & Bài học
- Ở thanh menu bên trái, chọn **"Khoá học & bài học"**.
- Nhấn nút **"Thêm khoá học"** để tạo một khoá học mới:
  - Điền **Tên khoá học** và chọn **Khoá học cha** (nếu là bài học thuộc chuyên đề hoặc phân nhánh).
  - Chọn **Danh mục** (ví dụ: *Tam tạng, Thiền học, Giáo lý căn bản*).
  - Nhập **Mô tả khoá học** bằng trình soạn thảo văn bản phong phú (hỗ trợ in đậm, gạch đầu dòng, tô màu).
  - Tải lên ảnh bìa đại diện của khoá học.
- Nhấn **Lưu khoá học**.

### Bước 2: Thêm các Bài học tuần tự
- Nhấn vào khoá học vừa tạo để vào trang quản lý danh sách bài học.
- Nhấn **"Thêm bài học"**:
  - **Tiêu đề bài học**: Ví dụ: *Bài 1: Ý nghĩa Quy Y Tam Bảo*.
  - **Nội dung bài đọc (Reading Content)**: Sử dụng trình soạn thảo văn bản phong phú (Rich Text Editor - TipTap) để định dạng kinh văn trang nghiêm:
    - Sử dụng định dạng trích dẫn khối (`Blockquote`) cho các câu kinh, bài kệ tụng.
    - Dùng danh sách chấm tròn hoặc đánh số cho các chi phần pháp số.
    - Đặt các tiêu đề phụ (Heading 2, Heading 3) rõ ràng để học viên dễ theo dõi.
  - **Liên kết Video YouTube**: Dán đường link video YouTube bài giảng của bài học đó.
  - **Thứ tự (Order)**: Nhập số thứ tự (1, 2, 3...) để hệ thống hiển thị bài học tuần tự.
- Nhấn **Lưu bài học**.

---

## 2. Quản lý Lớp học, Giới hạn Sĩ số & Ghi danh

### Bước 1: Tạo Lớp học mới
- Chọn **"Lớp học & Tiến độ"** trên thanh menu bên trái.
- Nhấn nút **"Tạo lớp học mới"**:
  - Chọn Khoá học đã tạo trước đó.
  - Đặt **Tên lớp** (ví dụ: *Lớp Phật Pháp Căn Bản - Đợt 1 / 2026*).
  - Chọn **Giảng viên phụ trách**.
  - Nhập **Sĩ số tối đa (`max_students`)**: Giới hạn số lượng học viên được phép tham gia lớp (ví dụ: 50 hoặc 100 học viên) nhằm đảm bảo chất lượng tương tác và chấm bài thi.
- Nhấn **Tạo lớp**.

### Bước 2: Ghi danh & Quản lý Học viên trong Lớp
- Tại danh sách lớp học, nhấn nút **"Quản lý"** ở lớp tương ứng để vào trang chi tiết lớp học.
- **Thêm học viên vào lớp**:
  - Tìm phần **"Thêm học viên vào lớp"**.
  - Chọn tài khoản học viên từ danh sách và nhấn **Thêm**.
  - *Kiểm soát sĩ số*: Nếu lớp học đã đạt đến sĩ số tối đa (`max_students`), hệ thống sẽ hiển thị cảnh báo và ngăn chặn ghi danh vượt mức, bảo đảm đúng kế hoạch đào tạo.
- **Xoá học viên khỏi lớp**: Nếu học viên chuyển lớp hoặc huỷ ghi danh, Giảng viên có thể nhấn nút **"Xoá"** (biểu tượng thùng rác) cạnh tên học viên để loại khỏi danh sách lớp.

### Bước 3: Cơ chế Khoá / Mở Lớp học (`is_locked`)
- Ở góc trên của trang chi tiết lớp học có nút chuyển đổi **"Khoá lớp học" (Lock Class)**.
- **Khi lớp MỞ (`is_locked = false`)**: Học viên tự do đọc bài, xem video, làm bài tập và nộp bài thi kết thúc.
- **Khi lớp KHOÁ (`is_locked = true`)**: Học viên vẫn có thể xem lại toàn bộ bài đọc và video đã học, nhưng **không thể xác nhận hoàn thành bài mới, không thể nộp bài tập và không thể bắt đầu làm bài thi**.
- *Ứng dụng*: Bật tính năng này khi lớp học kết thúc thời gian học quy định hoặc trong giai đoạn Giảng viên đang chấm điểm tổng kết.

---

## 3. Quản lý Ngân hàng Đề thi & Nhập liệu Excel

Hệ thống cung cấp hai phương thức tạo câu hỏi linh hoạt: nhập từng câu thủ công hoặc nhập hàng loạt từ file Excel.

### Cách 1: Tạo Câu hỏi Thủ công
1. Chọn **"Ngân hàng đề thi"** trên thanh menu.
2. Nhấn **"Tạo câu hỏi mới"**:
   - Chọn Khoá học và Bài học liên quan.
   - Chọn loại câu hỏi: **Trắc nghiệm** (Multiple Choice) hoặc **Tự luận** (Essay).
   - Chọn **Mức độ khó**: **Dễ** (Easy), **Trung bình** (Medium), hoặc **Khó** (Hard).
3. **Đối với câu hỏi Trắc nghiệm**:
   - Nhập nội dung câu hỏi (hỗ trợ Rich Text định dạng chữ đậm, nghiêng, trích dẫn).
   - Điền 4 phương án trả lời (A, B, C, D) và đánh dấu chọn đáp án chính xác.
   - Nhập **Lời giải thích chi tiết**: Phần này cực kỳ quan trọng! Lời giải thích sẽ hiển thị ngay khi học viên trả lời sai để củng cố chánh kiến cho học viên.
4. **Đối với câu hỏi Tự luận**:
   - Nhập đề bài yêu cầu học viên suy ngẫm, chia sẻ cảm nhận hoặc viết bài luận giải Phật pháp.

### Cách 2: Nhập Hàng loạt Câu hỏi từ File Excel
Khi cần nhập số lượng lớn câu hỏi (hàng chục đến hàng trăm câu), Giảng viên thực hiện như sau:
1. Tại trang **"Ngân hàng đề thi"**, nhấn nút **"Nhập từ Excel"** (Import Excel).
2. Nhấn nút **"Tải file mẫu Excel"** (Download Template) để lấy file mẫu chuẩn `.xlsx`.
3. Mở file mẫu và điền nội dung câu hỏi theo đúng các cột:
   - `course_code`: Mã khoá học.
   - `lesson_order`: Số thứ tự bài học liên kết (để trống nếu là câu hỏi thi tốt nghiệp chung).
   - `type`: `multiple_choice` (trắc nghiệm) hoặc `essay` (tự luận).
   - `title`: Nội dung câu hỏi.
   - `level`: `easy`, `medium`, hoặc `hard`.
   - `points`: Điểm số của câu hỏi.
   - `option_a`, `option_b`, `option_c`, `option_d`: 4 phương án trả lời.
   - `correct_option`: Đáp án đúng (`A`, `B`, `C` hoặc `D`).
   - `explanation`: Lời giải thích giáo lý chi tiết.
4. Kéo thả file Excel đã điền vào khung tải lên và nhấn **"Kiểm tra & Xem trước"**.
5. Hệ thống sẽ hiển thị bảng xem trước: tách biệt rõ các câu hỏi hợp lệ (sẵn sàng nhập) và các dòng lỗi (ví dụ thiếu đáp án, sai ký tự đáp án đúng) để Giảng viên kiểm tra trước khi bấm **"Xác nhận nhập"**.

---

## 4. Theo dõi Tiến độ & Chấm bài Thi Tốt nghiệp

### Xem Bảng Ma trận Tiến độ Học tập
Trong trang chi tiết lớp học, Giảng viên sẽ thấy bảng theo dõi từng học viên:
- **Họ tên & Pháp danh**: Hiển thị đầy đủ để dễ nhận diện Phật tử.
- **Đọc bài (Reading)**: Hiện dấu tích xanh khi học viên đã bấm xác nhận đọc xong.
- **Xem Video**: Hiện dấu tích xanh khi học viên đã bấm xác nhận xem xong video.
- **Luyện tập (Practice)**: Hiển thị điểm số bài tập trắc nghiệm theo từng bài học.
- **Trạng thái**: Tự động chuyển thành **"Sẵn sàng thi"** khi học viên đã hoàn thành 100% tất cả bài học trong lớp.

### Chấm điểm Bài thi & Nhận xét Tự luận
Khi học viên nộp bài thi kết thúc lớp học:
1. Nhấn nút **"Xem kết quả thi"** tại dòng của học viên đó.
2. Màn hình hiển thị chi tiết bài thi:
   - Các câu **Trắc nghiệm**: Hệ thống tự động chấm điểm theo điểm số cấu hình của từng câu hỏi.
   - Các câu **Tự luận**: Giảng viên đọc bài viết của học viên, nhập điểm số (thang điểm 10) và viết lời nhận xét, sách tấn tu học.
3. Nhấn **"Lưu điểm"**:
   - Hệ thống tự động cộng dồn thành **Điểm tổng kết**.
   - Nếu điểm tổng kết đạt từ 50% trở lên, trạng thái của học viên chuyển thành **"Hoàn thành / Tốt nghiệp"**.

---

## 5. Xem & Xác thực Chứng chỉ Tốt nghiệp của Học viên

- Khi học viên đã hoàn thành khoá học và được công nhận tốt nghiệp, trên bảng danh sách học viên của lớp sẽ xuất hiện nút **"Xem Chứng chỉ"** (View Certificate).
- Giảng viên và Quản trị viên có thể bấm vào để xem trực tiếp Chứng chỉ tốt nghiệp điện tử của học viên:
  - Kiểm tra các thông tin: Họ tên, Pháp danh Phật tử, Khoá học, Ngày cấp, Điểm tổng kết và Xếp loại tốt nghiệp (Xuất sắc, Giỏi, Khá, Đạt).
  - Mã chứng chỉ duy nhất (dạng `VKN-CERT-XXXXXX`).
  - Mã QR xác thực công khai: Quét mã QR bằng điện thoại sẽ mở ngay trang xác thực chính thức trên website của Tu viện Viên Không Ni.

---

## 6. Hồi đáp Thắc mắc & Quản lý Phật tử

- **Trả lời Thắc mắc của Học viên**: Vào **"Khoá học & bài học"** $\rightarrow$ chọn tab **"Phản hồi học viên"**. Giảng viên đọc thắc mắc của học viên gửi từ bài học, soạn thảo câu trả lời giải nghi và nhấn **"Gửi phản hồi"**.
- **Hỗ trợ Tài khoản & Mật khẩu**: Vào mục **"Người dùng & Phân quyền"**, Giảng viên có thể tra cứu học viên theo Tên hoặc Pháp danh, xem thông tin số điện thoại liên lạc, và sử dụng nút **"Đổi mật khẩu"** để hỗ trợ nhanh khi học viên quên mật khẩu đăng nhập.

---

## 7. Thảo luận Lớp học, Hỏi đáp & Điều hành Diễn đàn (Class Discussions & Q&A)

Hệ thống tích hợp diễn đàn thảo luận phân cấp 2 tầng chuyên biệt ngay trong trang chi tiết lớp học (`/admin/classes/{id}`) tại tab **"Thảo luận & Hỏi đáp"**:

### Tham gia Trao đổi & Giải nghi
- Giảng viên và Quản trị viên có thể đăng câu hỏi, chủ đề trao đổi hoặc phản hồi giải nghi cho học viên ở bất kỳ lớp học nào.
- Khung nhập liệu hỗ trợ định dạng cơ bản: in đậm, in nghiêng, gạch chân, gạch ngang, danh sách và trích dẫn kinh văn trang nghiêm.

### Cấu trúc Thảo luận 2 Tầng (2-Level Hierarchy)
- **Tầng 1 (Chủ đề / Câu hỏi gốc)**: Học viên hoặc Giảng viên đặt câu hỏi hoặc mở chủ đề thảo luận.
- **Tầng 2 (Câu trả lời / Hồi đáp)**: Các câu trả lời nằm ngay dưới chủ đề gốc. Khi người dùng trả lời một câu trả lời đã có, hệ thống tự động gắn kèm nhãn `@TênNgườiDùng` và gom gọn dưới chủ đề gốc, tránh việc phân cấp thụt lề vô tận gây rối mắt.

### Quyền Điều hành & Chỉnh sửa
- **Chỉnh sửa**: Tác giả có toàn quyền chỉnh sửa lại nội dung bình luận của mình khi cần bổ sung ý.
- **Xóa & Điều phối**: Giảng viên và Quản trị viên có quyền xóa bất kỳ bình luận hoặc câu trả lời nào không phù hợp để giữ gìn môi trường tu học thanh tịnh. Khi xóa một câu hỏi gốc, toàn bộ câu trả lời con bên dưới cũng sẽ được thu hồi tự động.
- **Bảo mật**: Hệ thống tự động lọc bỏ các mã độc, script hoặc thẻ HTML không an toàn khi lưu trữ.

