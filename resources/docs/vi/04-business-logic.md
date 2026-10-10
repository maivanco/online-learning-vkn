# 04. Quy tắc Nghiệp vụ & Cơ chế Vận hành Hệ thống

Tài liệu này giải thích chi tiết, minh bạch các thuật toán, cơ chế tự động, quy tắc xác thực và công thức tính điểm được cài đặt trong hệ thống Cổng Học Phật Pháp Trực Tuyến - Tu viện Viên Không Ni.

---

## 1. Cơ chế Khoá mở Tuần tự (Sequential Progression)

Hệ thống được thiết kế theo nguyên tắc **không học nhảy cóc**, giúp Phật tử tiếp thu giáo lý một cách trọn vẹn:

```
[Bài đọc (Chưa xong)]  ──>  [Video (Bị khoá)]
        │ (Bấm Hoàn thành)
        ▼
[Bài đọc (Hoàn thành)] ──>  [Video (Mở khoá)]  ──>  [Luyện tập (Bị khoá)]
                                    │ (Bấm Hoàn thành)
                                    ▼
                            [Video (Hoàn thành)] ──>  [Luyện tập (Mở khoá)]
```

### Quy tắc hoàn thành một Bài học:
Một bài học chỉ được xem là **Hoàn thành (Completed)** khi học viên đã đạt đủ cả 3 điều kiện:
1. `reading_completed = true`: Học viên đã nhấn nút xác nhận đã đọc xong bài đọc.
2. `video_completed = true`: Học viên đã nhấn nút xác nhận đã xem xong video bài giảng.
3. `practice_completed = true`: Học viên đã nộp bài tập trắc nghiệm luyện tập của bài đó.

---

## 2. Giới hạn Sĩ số Lớp học (`max_students`) & Kiểm tra Ghi danh

Để đảm bảo chất lượng hướng dẫn và khả năng chấm bài tự luận của Giáo thọ, mỗi lớp học có một chỉ số giới hạn sĩ số:
- **Kiểm tra khi ghi danh**:
  $$\text{Số lượng học viên hiện tại} < \text{max\_students}$$
- Nếu lớp học đã đạt đủ sĩ số quy định, hệ thống sẽ **từ chối thêm học viên mới** và thông báo cảnh báo đến Giảng viên.
- **Ngăn chặn ghi danh trùng lặp**: Một học viên không thể được ghi danh 2 lần vào cùng một lớp học.

---

## 3. Cơ chế Khoá Lớp học (`is_locked`)

Giảng viên hoặc Quản trị viên có thể bật tính năng **Khoá lớp học** (`is_locked = true`):

| Thao tác | Khi lớp ĐANG MỞ (`is_locked = false`) | Khi lớp BỊ KHOÁ (`is_locked = true`) |
| :--- | :---: | :---: |
| Xem lại bài đọc, video đã học | Cho phép | Cho phép |
| Xác nhận hoàn thành bài đọc mới | Cho phép | **Bị chặn (Blocked)** |
| Xác nhận hoàn thành video mới | Cho phép | **Bị chặn (Blocked)** |
| Nộp bài tập luyện tập mới | Cho phép | **Bị chặn (Blocked)** |
| Gửi câu hỏi thắc mắc mới | Cho phép | **Bị chặn (Blocked)** |
| Bắt đầu bài thi kết thúc lớp | Cho phép | **Bị chặn (Blocked)** |
| Xem lại kết quả thi & Chứng chỉ | Cho phép | Cho phép |

> **Ý nghĩa**: Giúp bảo toàn dữ liệu học tập khi kỳ học kết thúc hoặc trong thời gian Giảng viên đang tiến hành chấm thi và xếp loại.

---

## 4. Điều kiện Mở khoá & Cơ chế Bài thi Kết thúc Lớp học

### Điều kiện Mở khoá Bài thi
Nút **"Làm bài thi kết thúc" (Class Final Exam)** ở trạng thái vô hiệu hoá (màu xám) cho đến khi:
$$\text{Số bài học đã hoàn thành} == \text{Tổng số bài học trong lớp} \quad (100\%)$$
Khi đạt 100%, trạng thái của học viên chuyển thành `ready_for_exam` (Sẵn sàng thi) và học viên được phép nhấn nút bắt đầu làm bài.

### Thời lượng Thi & Đồng hồ Đếm ngược
- Mỗi bài thi có thời lượng quy định tính bằng phút (`duration_minutes`, ví dụ: 30, 45, 60 phút).
- Khi học viên bấm bắt đầu thi, đồng hồ đếm ngược được kích hoạt và đồng bộ theo thời gian chuẩn của máy chủ (`started_at`).

### Cơ chế Tự động Nộp bài Bảo vệ Học viên
- Nếu đồng hồ đếm ngược về `00:00:00` mà học viên chưa bấm nút nộp bài, hệ thống sẽ **tự động gửi toàn bộ các phương án trắc nghiệm và câu trả lời tự luận hiện có lên máy chủ**.
- Giúp bảo vệ quyền lợi của học viên, không làm mất kết quả bài thi do sự cố quên giờ hoặc gián đoạn mạng.

---

## 5. Quy tắc Tính Điểm & Xếp loại Tốt nghiệp

Bài thi kết thúc lớp học được chấm điểm theo cơ chế kết hợp giữa Tự động và Thủ công:

### Phần Trắc nghiệm (Multiple Choice)
- Được hệ thống máy tính chấm điểm **tức thời** ngay khi học viên nộp bài.
- Điểm được tính theo trọng số điểm số cấu hình của từng câu hỏi trong đề thi.

### Phần Tự luận (Essay Questions)
- Chuyển vào danh sách chờ chấm của Giảng viên (`exam-result`).
- Giảng viên chấm điểm theo thang điểm 10 kèm nhận xét giáo lý chi tiết.

### Điểm Tổng kết & Điều kiện Tốt nghiệp
$$\text{Điểm tổng kết} = \text{Điểm trắc nghiệm} + \text{Điểm tự luận}$$
- **Ngưỡng đạt tốt nghiệp**: Học viên phải đạt **từ 50% tổng điểm trở lên** (tương đương $\ge 5.0$ trên thang điểm 10).
- Sau khi được lưu điểm, trạng thái của học viên chuyển thành `completed` (Đã tốt nghiệp).

### Bảng Phân loại Xếp loại Tốt nghiệp
| Điểm Tổng kết (Thang 10) | Xếp loại (Tiếng Việt) | Distinction (English) |
| :---: | :---: | :---: |
| $\ge 9.0$ | **Xuất sắc** | High Distinction |
| $8.0 \le \text{Điểm} < 9.0$ | **Giỏi** | Distinction |
| $7.0 \le \text{Điểm} < 8.0$ | **Khá** | Credit |
| $5.0 \le \text{Điểm} < 7.0$ | **Đạt** | Pass |
| $< 5.0$ | Chưa đạt | Fail |

---

## 6. Quy tắc Nhập Dữ liệu Câu hỏi từ File Excel

Tính năng nhập file Excel áp dụng các quy chuẩn xác thực nghiêm ngặt để bảo đảm tính toàn vẹn của dữ liệu:

1. **Định dạng file hỗ trợ**: `.xlsx`, `.xls`, `.csv`.
2. **Các trường bắt buộc**:
   - `course_code`: Phải khớp với mã hoặc tên khoá học đã tồn tại.
   - `type`: Chỉ chấp nhận `multiple_choice` hoặc `essay`.
   - `title`: Chuỗi nội dung câu hỏi (không được để trống).
   - `level`: Chỉ chấp nhận `easy`, `medium`, hoặc `hard`.
   - `points`: Số điểm (mặc định là 1 nếu để trống).
3. **Đối với câu hỏi trắc nghiệm (`multiple_choice`)**:
   - Bắt buộc phải có đủ `option_a`, `option_b`, `option_c`, `option_d`.
   - `correct_option`: Bắt buộc là một trong 4 ký tự: `A`, `B`, `C`, `D`.
4. **Cơ chế cách ly lỗi (Row-by-Row Isolation)**:
   - Các dòng hợp lệ được phân loại để đưa vào cơ sở dữ liệu.
   - Các dòng sai cú pháp được liệt kê chi tiết (số dòng, tên lỗi) trong màn hình Preview để Giảng viên kiểm tra và sửa đổi.

---

## 7. Động cơ Cấp & Xác thực Chứng chỉ Phật học

- **Tạo Chứng chỉ Tự động**: Ngay khi học viên đạt trạng thái `completed`, hệ thống tự sinh bản ghi chứng chỉ tốt nghiệp liên kết với tài khoản học viên và lớp học.
- **Mã Chứng chỉ Độc nhất**: Sinh mã định danh duy nhất (ví dụ: `VKN-CERT-A1B2C3`).
- **Liên kết Xác thực Công khai (`/certificate/verify/{code}`)**:
  - Mã QR in trên chứng chỉ trỏ trực tiếp đến tuyến đường xác thực này.
  - Người kiểm tra không cần đăng nhập vẫn có thể xác thực ngay tính nguyên bản của chứng chỉ: Họ tên học viên, Pháp danh, Khoá học, Ngày cấp, Điểm số và Xếp loại.
- **Tích hợp Pháp danh**: Tự động lấy Pháp danh từ `StudentProfile` để in ấn chứng chỉ trang nghiêm.

---

## 8. Vòng đời Sổ tay Câu hỏi Sai (`StudentIncorrectQuestion`)

1. Khi học viên chọn sai một câu hỏi trong bài luyện tập hoặc đề thi, hệ thống tự động ghi nhận câu hỏi đó vào bảng câu sai của học viên.
2. Câu hỏi này sẽ duy trì trong sổ tay cá nhân cho đến khi học viên vào làm lại câu hỏi đó và chọn đúng đáp án chính xác.
3. Khi trả lời đúng, trạng thái được đánh dấu là `is_mastered = true`, thể hiện học viên đã khắc phục hoàn toàn điểm nhầm lẫn giáo lý.

---

## 9. Quy tắc Thảo luận & Diễn đàn Lớp học (`ClassComment`)

Hệ thống thiết kế luồng thảo luận phân cấp tối đa 2 tầng nhằm giữ giao diện luôn gọn gàng và dễ theo dõi:

### 1. Cơ chế Cố định 2 Tầng & Gom Luồng Tự động (Thread Flattening)
- **Tầng 1 (Bình luận / Câu hỏi gốc)**: Có `parent_id = null`. Đại diện cho một câu hỏi hoặc chủ đề thảo luận chính.
- **Tầng 2 (Câu trả lời / Hồi đáp)**: Có `parent_id = root_comment_id`.
- **Quy tắc Gom Luồng (Flattening)**: Khi người dùng trả lời một câu bình luận đã nằm ở Tầng 2:
  - Hệ thống tự động xác định liên kết cha trực tiếp:
    $$\text{parent\_id} = \text{targetComment.parent\_id} \quad (\text{ID của câu hỏi gốc Tầng 1})$$
  - Hệ thống ghi nhận tài khoản được hồi đáp:
    $$\text{reply\_to\_user\_id} = \text{targetComment.user\_id}$$
  - Câu trả lời mới được hiển thị ngay trong danh sách trả lời của câu hỏi gốc kèm theo nhãn `@TênNgườiDùng`, đảm bảo độ sâu phân cấp không bao giờ vượt quá 2 tầng.

### 2. Ma trận Phân quyền & Thao tác
| Vai trò / Người dùng | Đăng câu hỏi gốc | Đăng câu trả lời | Chỉnh sửa | Xóa bình luận |
| :--- | :---: | :---: | :---: | :---: |
| Học viên đã ghi danh | Được phép | Được phép | Chỉ bài của mình | Chỉ bài của mình |
| Học viên chưa ghi danh | **Bị chặn** | **Bị chặn** | **Bị chặn** | **Bị chặn** |
| Giảng viên phụ trách | Được phép | Được phép | Chỉ bài của mình | **Mọi bình luận** (điều hành) |
| Quản trị viên | Được phép | Được phép | Chỉ bài của mình | **Mọi bình luận** (điều hành) |

### 3. Cơ chế Xóa Lan truyền (Cascading Delete)
- Khi một câu hỏi gốc bị xóa, toàn bộ các câu trả lời con thuộc câu hỏi đó sẽ được tự động xóa theo (`onDelete('cascade')`), không để lại dữ liệu mồ côi.

### 4. Lọc Thẻ & Phòng chống Mã độc (XSS Defense)
- **Các thẻ HTML hợp lệ**: `p`, `br`, `strong`, `b`, `em`, `i`, `u`, `s`, `strike`, `ul`, `ol`, `li`, `blockquote`.
- **Các thành phần bị loại bỏ**: `<script>`, `<iframe>`, `<object>`, `<embed>`, `<style>`, thuộc tính style tùy biến và tất cả các sự kiện DOM (`onclick`, `onerror`, `onload`,...).
- **Kiểm tra rỗng**: Các nội dung chỉ gồm khoảng trắng hoặc thẻ rỗng (như `<p></p>`) bị từ chối với thông báo lỗi rõ ràng.

