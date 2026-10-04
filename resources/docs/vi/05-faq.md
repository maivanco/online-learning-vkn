# 05. Các Câu hỏi Thường gặp & Hướng dẫn Xử lý Vấn đề

Tài liệu tổng hợp các thắc mắc thực tế thường gặp nhất từ phía Giảng viên và Học viên cùng hướng dẫn chi tiết, giúp quá trình tu học và quản lý luôn suôn sẻ.

---

### Câu hỏi 1: Tôi là học viên, tại sao tôi không thể bấm nút "Làm bài thi kết thúc"?

**Trả lời**:
Nút làm bài thi chỉ mở khoá khi bạn đã hoàn thành **100% tất cả các bài học** trong lớp đó:
1. Hãy kiểm tra lại từng bài học trong danh mục xem có bài nào chưa bấm **"Hoàn thành bài đọc"**, chưa bấm **"Hoàn thành video"** hoặc chưa làm bài tập luyện tập trắc nghiệm không.
2. Khi mọi bài học đều đạt dấu tích xanh hoàn thành, nút thi sẽ sáng màu vàng để bạn nhấn vào.
3. Ngoài ra, hãy liên hệ với Giảng viên để chắc chắn rằng lớp học không bị bật chế độ "Khoá lớp" (`is_locked`).

---

### Câu hỏi 2: Thời gian thi có đồng hồ đếm ngược không, và chuyện gì xảy ra nếu hết giờ mà chưa bấm nộp bài?

**Trả lời**:
- **Có**. Mỗi bài thi đều có thời gian quy định (ví dụ 45 phút). Khi bắt đầu thi, đồng hồ đếm ngược sẽ hiển thị rõ ràng trên màn hình và chạy chuẩn xác theo máy chủ.
- **Cơ chế bảo vệ học viên**: Nếu đồng hồ đếm ngược về `00:00:00` mà bạn chưa kịp nhấn nút nộp bài, hệ thống sẽ **tự động nộp toàn bộ các phương án trắc nghiệm và câu trả lời tự luận bạn đã chọn lên máy chủ**. Bạn hoàn toàn yên tâm không bị mất điểm hay phải làm lại từ đầu.

---

### Câu hỏi 3: Học viên xem, in và tải Chứng chỉ tốt nghiệp Phật học ở đâu?

**Trả lời**:
- Khi Giảng viên hoàn tất chấm điểm và điểm tổng kết của bạn đạt từ 50% trở lên ($\ge 5.0$), lớp học sẽ chuyển sang trạng thái "Hoàn thành / Tốt nghiệp".
- Bạn có thể nhấn nút **"Xem Chứng chỉ"** xuất hiện ngay tại:
  1. Thẻ lớp học trên **Bảng điều khiển Học viên** (Dashboard).
  2. Màn hình thông báo kết quả thi sau khi được chấm điểm.
- Trên trang chứng chỉ, nhấn nút **"In / Lưu PDF"** ở góc trên để in ra giấy A4 nằm ngang hoặc lưu thành file PDF sắc nét.

---

### Câu hỏi 4: Mã QR và mã định danh trên Chứng chỉ dùng để làm gì?

**Trả lời**:
- Mỗi Chứng chỉ được cấp kèm một **Mã chứng chỉ độc nhất** (dạng `VKN-CERT-XXXXXX`) và một **Mã QR xác thực công khai**.
- Bất kỳ ai (gia đình, bạn đồng tu, ban điều hành đạo tràng) dùng camera điện thoại quét mã QR đều sẽ được chuyển thẳng tới trang xác thực chính thức trên website của Tu viện Viên Không Ni. Trang này sẽ công khai: Họ tên, Pháp danh, Khoá học, Ngày cấp, Điểm số và Xếp loại tốt nghiệp nhằm bảo đảm tính minh bạch và chống giả mạo.

---

### Câu hỏi 5: Giảng viên nhập hàng loạt câu hỏi từ file Excel như thế nào và nếu file bị lỗi thì sửa ra sao?

**Trả lời**:
1. Vào menu **"Ngân hàng đề thi"** $\rightarrow$ chọn **"Nhập từ Excel"**.
2. Nhấn nút **"Tải file mẫu Excel"** để nhận đúng cấu trúc cột chuẩn (`course_code`, `lesson_order`, `type`, `title`, `level`, `points`, `option_a`, `option_b`, `option_c`, `option_d`, `correct_option`, `explanation`).
3. Điền câu hỏi vào file và tải lên hệ thống.
4. Màn hình **Kiểm tra & Xem trước (Preview)** sẽ phân tách riêng các dòng hợp lệ và các dòng lỗi (ví dụ: dòng thiếu đáp án đúng, sai ký tự A/B/C/D). Bạn có thể kiểm tra dòng bị lỗi, chỉnh sửa lại file Excel rồi tải lên lại trước khi bấm "Xác nhận nhập".

---

### Câu hỏi 6: Giới hạn sĩ số lớp học (`max_students`) là gì và khi lớp đầy thì xử lý ra sao?

**Trả lời**:
- Nhằm đảm bảo tương tác sư phạm và Giảng viên có đủ thời gian chấm bài tự luận thấu đáo, mỗi lớp học có chỉ số **Sĩ số tối đa** (`max_students`).
- Khi số học viên ghi danh đạt mức tối đa, hệ thống sẽ khoá nút thêm học viên mới và thông báo lớp đã đủ sĩ số.
- Nếu muốn nhận thêm học viên, Giảng viên có thể vào phần chỉnh sửa lớp học để nâng chỉ số `max_students`, hoặc mở thêm một lớp mới (Khoá 2, Khoá 3).

---

### Câu hỏi 7: Giảng viên chấm điểm câu tự luận của học viên ở đâu?

**Trả lời**:
1. Vào menu **"Lớp học & Tiến độ"**.
2. Nhấn nút **"Quản lý"** tại lớp học tương ứng.
3. Trong bảng danh sách học viên, tìm học viên đã nộp bài và nhấn **"Xem kết quả thi"**.
4. Kéo xuống phần câu hỏi tự luận, đọc bài làm của học viên, nhập điểm (thang 10) và viết lời nhận xét, sách tấn tu học.
5. Nhấn **"Lưu điểm"** để hoàn tất chấm thi và cấp chứng nhận tốt nghiệp cho học viên.

---

### Câu hỏi 8: Học viên tìm và ôn tập các câu hỏi mình làm sai ở đâu?

**Trả lời**:
- Bất kỳ câu hỏi nào bạn làm sai trong bài luyện tập theo bài hoặc bài thi kết thúc đều được hệ thống tự động lưu vào **Sổ tay câu sai cá nhân (Mistake Mastery)**.
- Bạn có thể vào mục này bất kỳ lúc nào để đọc lại lời giải nghĩa giáo lý của Giảng viên và làm lại câu hỏi đó cho đến khi chọn đúng 100%.

---

### Câu hỏi 9: Phật tử muốn cập nhật Pháp danh (`dhamma_name`) và thông tin cá nhân thì làm thế nào?

**Trả lời**:
- Sau khi đăng nhập, nhấn vào tên tài khoản ở góc phải trên cùng $\rightarrow$ chọn **"Hồ sơ cá nhân"** (Profile).
- Tại đây, quý Phật tử có thể cập nhật Họ và tên, **Pháp danh**, Số điện thoại, Ngày sinh và Địa chỉ.
- Thông tin Pháp danh mới sẽ lập tức được cập nhật trên các chứng chỉ khoá học tiếp theo của quý vị.

---

### Câu hỏi 10: Học viên quên mật khẩu thì phải làm thế nào?

**Trả lời**:
1. Học viên có thể sử dụng chức năng **"Quên mật khẩu"** trên trang Đăng nhập để nhận liên kết đặt lại mật khẩu qua email.
2. Hoặc liên hệ trực tiếp với Giảng viên/Quản trị viên: Quản trị viên vào mục **"Người dùng & Phân quyền"**, tìm tài khoản học viên và nhấn **"Đổi mật khẩu"** để cấp mật khẩu mới trong vài giây.

---

### Câu hỏi 11: Trình soạn thảo văn bản phong phú (Rich Text Editor) trong bài giảng hỗ trợ những định dạng gì?

**Trả lời**:
Trình soạn thảo mới của hệ thống hỗ trợ đầy đủ các định dạng chuẩn mực dành cho Phật học:
- In đậm, in nghiêng, gạch chân để làm nổi bật từ ngữ Pāḷi quan trọng.
- Định dạng trích dẫn khối (`Blockquote`) với viền vàng trang nghiêm chuyên dùng cho kệ ngôn kinh tụng.
- Danh sách chấm tròn và danh sách số để trình bày các chi phần giáo lý rõ ràng.
- Tiêu đề phụ (Heading 2, Heading 3) giúp chia bài học thành các phần ngắn gọn, dễ đọc trên điện thoại.

---

### Câu hỏi 12: Hệ thống có hỗ trợ học trên điện thoại thông minh (smartphone) không?

**Trả lời**:
**Hoàn toàn có**. Toàn bộ giao diện từ bài đọc, video YouTube, làm bài tập, thi tốt nghiệp cho đến xem Chứng chỉ điện tử đều được tối ưu tương thích hoàn hảo (Responsive) trên điện thoại di động (iPhone, Android), máy tính bảng (iPad) và máy tính cá nhân.
