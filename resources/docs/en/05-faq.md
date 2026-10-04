# 05. Frequently Asked Questions & Troubleshooting

This guide collects real-world questions commonly raised by Instructors and Students alongside clear, actionable instructions.

---

### Question 1: I am a student. Why is the "Take Final Exam" button disabled?

**Answer**:
The final examination button unlocks only after you achieve **100% completion across all lessons** in that class cohort:
1. Review each lesson in the curriculum to ensure you clicked **"Complete Reading"**, **"Complete Video"**, and answered the practice quiz questions.
2. Every lesson in the list must show a green completed checkmark.
3. Also, check with your instructor to ensure that the class has not been placed in "Lock" status (`is_locked = true`).

---

### Question 2: Is there a countdown timer for exams, and what happens if time runs out before I submit?

**Answer**:
- **Yes**. Every final exam has an allotted duration in minutes (e.g., 45 minutes). When you begin, a live countdown clock appears on screen, perfectly synchronized with the server clock.
- **Autosave & Auto-Submit Protection**: If the countdown reaches `00:00:00` before you manually click submit, the system **automatically posts all your currently selected answers to the server**. Your progress is fully protected, ensuring you will never lose points due to time lapse or sudden distraction.

---

### Question 3: Where do students view, print, or download their Buddhist Certificate of Completion?

**Answer**:
- As soon as your instructor finalizes grading and your total score reaches at least 50% ($\ge 5.0$ on a 10-point scale), your enrollment status transitions to "Graduated / Completed".
- You can click the **"View Certificate"** button located:
  1. On your **Student Dashboard** directly on the completed class card.
  2. On the post-exam completion results modal.
- In the certificate view, click the **"Print / Save PDF"** button at the top to print directly or download as a high-resolution A4 landscape PDF document.

---

### Question 4: What is the purpose of the certificate code and QR code?

**Answer**:
- Every issued certificate features a **Unique Certificate Code** (format `VKN-CERT-XXXXXX`) and a **Live Verification QR Code**.
- Anyone (family, fellow practitioners, sangha council) can scan the QR code using their smartphone camera to open the official public verification page on the Vien Khong Ni Monastery website. This page publicly displays: Student Full Name, Buddhist Dharma Name, Course Title, Completion Date, Final Grade, and Distinction Honours to guarantee authenticity and prevent tampering.

---

### Question 5: How do instructors bulk import questions via Excel and troubleshoot file errors?

**Answer**:
1. Navigate to **"Question Bank"** $\rightarrow$ click **"Import Excel"**.
2. Click **"Download Template"** to retrieve the official standardized format (`course_code`, `lesson_order`, `type`, `title`, `level`, `points`, `option_a`, `option_b`, `option_c`, `option_d`, `correct_option`, `explanation`).
3. Populate the spreadsheet and upload it to the platform.
4. The **Preview & Validation** screen separates valid rows ready for import from erroneous rows (e.g., missing answers or invalid answer keys). You can adjust any flagged rows in your Excel file and re-upload before clicking "Confirm Import".

---

### Question 6: What is the class capacity limit (`max_students`) and how is a full class handled?

**Answer**:
- To preserve high pedagogical mentoring standards and allow thorough review of essay answers, each cohort has a defined **Maximum Students Limit** (`max_students`).
- Once a class reaches this limit, the system disables further student additions and alerts the instructor.
- To admit more students, the instructor or administrator can increase `max_students` in the class settings or establish a new cohort (Intake 2, Intake 3).

---

### Question 7: Where does an instructor grade student essay questions and leave commentary?

**Answer**:
1. Go to **"Classes & Progress"** in the sidebar.
2. Click **"Manage"** on the relevant cohort.
3. In the student table, locate the student and click **"View Exam Result"**.
4. Scroll to the essay questions, review the student's submission, input a score (0 to 10 scale), and write compassionate spiritual guidance.
5. Click **"Save Grade"** to calculate the final combined grade and officially graduate the student.

---

### Question 8: Where do students find and practice questions they answered incorrectly?

**Answer**:
- Every question missed during lesson practice quizzes or final exams is automatically recorded in your personal **Mistake Review Bank** (`StudentIncorrectQuestion`).
- Access this area anytime to review detailed explanations from the teacher and re-attempt the questions until you achieve 100% mastery.

---

### Question 9: How can practitioners update their Buddhist Dharma Name (`dhamma_name`) and profile details?

**Answer**:
- After logging in, click your account name at the top right $\rightarrow$ select **"Profile"**.
- Update your Full Legal Name, **Buddhist Dharma Name (`dhamma_name`)**, Phone Number, Date of Birth, and Address.
- Your updated Dharma Name will immediately appear on all subsequent Buddhist certificates issued by the monastery.

---

### Question 10: How can a user recover a forgotten password?

**Answer**:
1. Learners can click **"Forgot your password?"** on the Login page to receive a password reset link by email.
2. Alternatively, contact an Instructor or Administrator: In the **"Users & Roles"** panel, an admin can find the student's account and click **"Change Password"** to assign a new password immediately.

---

### Question 11: What typography and formatting does the Rich Text Editor support?

**Answer**:
The platform's TipTap editor provides specialized tools for Buddhist scripture presentation:
- Bold, italic, and underline styling for highlighting Pāḷi terminology.
- Dignified gold-bordered blockquotes (`Blockquote`) specifically styled for sutta verses and chant citations.
- Bulleted and numbered lists for categorizing spiritual teachings and precepts.
- Section headings (H2, H3) for structuring long discourses into digestible segments on mobile screens.

---

### Question 12: Does the portal work smoothly on mobile smartphones and tablets?

**Answer**:
**Yes, completely**. The entire user experience—including reading scripture, watching YouTube lectures, interactive quizzes, timed final exams, and electronic certificates—is fully responsive and tailored for smartphones (iOS/Android), tablets, and desktop computers.
