# 04. Quy tắc Nghiệp vụ & Cơ chế Vận hành Hệ thống

Tài liệu này giải thích rõ ràng và minh bạch các cơ chế tự động, quy tắc nghiệp vụ và công thức tính điểm được cài đặt trong hệ thống.

---

## 1. Cơ chế Khoá mở Tuần tự (Sequential Progression)

Hệ thống được thiết kế theo nguyên tắc **không học nhảy cóc** nhằm đảm bảo Phật tử tiếp thu giáo lý một cách trọn vẹn:

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
- Một bài học chỉ được xem là **Hoàn thành (Completed)** khi học viên đã hoàn thành đủ cả 3 điều kiện:
  1. `reading_completed = true` (Đã xác nhận đọc bài)
  2. `video_completed = true` (Đã xác nhận xem video)
  3. `practice_completed = true` (Đã hoàn thành các câu trắc nghiệm luyện tập)

---

## 2. Điều kiện Mở khoá Bài thi Kết thúc Lớp học

- Nút **"Làm bài thi kết thúc" (Class Final Exam)** ở trạng thái vô hiệu hoá (màu xám) cho đến khi:
  $$\text{Số bài học đã hoàn thành} == \text{Tổng số bài học trong lớp}$$
- Khi tỉ lệ hoàn thành đạt **100%**, trạng thái của học viên chuyển thành `ready_for_exam` (Sẵn sàng thi) và nút thi sẽ sáng lên cho phép học viên bắt đầu.
- **Lưu ý**: Nếu còn dù chỉ 1 bài học chưa hoàn thành 1 trong 3 bước, học viên sẽ không thể vào thi.

---

## 3. Cơ chế Khoá Lớp học (Class Lock)

Giảng viên hoặc Quản trị viên có thể bật tính năng **Khoá lớp học** (`is_locked = true`):

| Thao tác | Khi lớp ĐANG MỞ | Khi lớp BỊ KHOÁ |
| :--- | :---: | :---: |
| Xem lại bài đọc, video đã học | Có | Có |
| Xác nhận hoàn thành bài đọc mới | Có | **Bị chặn** |
| Nộp bài tập luyện tập mới | Có | **Bị chặn** |
| Gửi câu hỏi thắc mắc mới | Có | **Bị chặn** |
| Bắt đầu bài thi kết thúc | Có | **Bị chặn** |

> **Mục đích**: Bảo toàn dữ liệu lớp học sau khi bế giảng hoặc trong thời gian Giảng viên đang tổng kết điểm số.

---

## 4. Quy tắc Tính Điểm & Chấm thi

Bài thi kết thúc lớp học được chấm điểm theo cơ chế kết hợp giữa Tự động và Thủ công:

### Phần Trắc nghiệm (Multiple Choice)
- Được hệ thống máy tính chấm điểm **tức thời** ngay khi học viên nộp bài.
- Công thức: 
  $$\text{Điểm trắc nghiệm} = \left(\frac{\text{Số câu đúng}}{\text{Tổng số câu trắc nghiệm}}\right) \times \text{Hệ số trắc nghiệm}$$

### Phần Tự luận (Essay Questions)
- Khi học viên nộp bài, các câu tự luận được chuyển vào danh sách chờ chấm của Giảng viên.
- Giảng viên chấm điểm theo thang điểm 10 kèm nhận xét chi tiết.

### Điểm Tổng kết (Final Grade)
- Khi Giảng viên lưu điểm tự luận, hệ thống tự động tính:
  $$\text{Điểm tổng kết} = \text{Điểm trắc nghiệm} + \text{Điểm tự luận}$$
- Điểm tổng kết được cập nhật vào hồ sơ học viên (`final_grade`), đồng thời trạng thái chuyển thành `completed` (Đã tốt nghiệp).

---

## 5. Đồng hồ Đếm ngược & Cơ chế Tự động Nộp bài

- Khi học viên nhấn "Bắt đầu làm bài thi", đồng hồ đếm ngược được kích hoạt.
- Thời gian làm bài chạy theo đồng hồ chuẩn của máy chủ để đảm bảo tính công bằng.
- **Cơ chế bảo vệ dữ liệu**: Nếu đồng hồ đếm ngược về `00:00:00` mà học viên chưa bấm nộp bài, hệ thống sẽ **tự động nộp toàn bộ các đáp án đã chọn lên máy chủ** để ghi nhận điểm số, tránh trường hợp học viên bị mất bài làm do hết giờ.

---

## 6. Sổ tay Khắc phục Câu sai (`StudentIncorrectQuestion`)

- Bất cứ khi nào học viên chọn sai một câu hỏi trong bài luyện tập hoặc đề thi, câu hỏi đó sẽ được tự động lưu vào bảng lưu trữ câu sai của học viên.
- Khi học viên vào mục ôn tập và làm lại chính xác câu hỏi đó, trạng thái câu hỏi sẽ được ghi nhận đã hoàn thành (Mastered).
