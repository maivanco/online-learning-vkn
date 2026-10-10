# 02. Teacher's Operational Manual

This manual provides detailed, step-by-step guidance for Instructors and Administrators on curriculum authoring, class cohort administration, question bank management with Excel bulk import, progress tracking, essay grading, and certificate oversight.

---

## 1. Creating Courses & Adding Lessons

### Step 1: Open Courses & Lessons
- In the left sidebar, click **"Courses & Lessons"**.
- Click **"Add Course"** to create a new subject:
  - Enter the **Course Title** and select a **Parent Course** if this course is part of a series or sub-category.
  - Select the **Category** (e.g., *Tipitaka, Meditation, Core Dhamma Fundamentals*).
  - Write a comprehensive **Course Description** using the rich text editor (supports bold, lists, color emphasis).
  - Upload a high-resolution cover thumbnail image.
- Click **Save Course**.

### Step 2: Add Sequential Lessons
- Click on your newly created course to view its lesson manager.
- Click **"Add Lesson"**:
  - **Lesson Title**: e.g., *Lesson 1: The Threefold Refuge and Moral Precepts*.
  - **Reading Material (Reading Content)**: Use the built-in rich text editor (TipTap) to format canonical passages with dignity:
    - Use blockquote styling (`Blockquote`) for sutta verses and canonical quotes.
    - Organize spiritual lists and classifications with bulleted or numbered lists.
    - Set clear subheadings (Heading 2, Heading 3) to optimize legibility on smartphones.
  - **YouTube Video URL**: Paste the direct YouTube lecture discourse URL.
  - **Order**: Enter a positive sequence number (1, 2, 3...) to order lessons logically.
- Click **Save Lesson**.

---

## 2. Managing Classes, Capacity Limits & Enrollment

### Step 1: Create a New Class
- Navigate to **"Classes & Progress"** in the left sidebar.
- Click **"Create New Class"**:
  - Select the underlying Course curriculum.
  - Name the cohort (e.g., *Dhamma Fundamentals - Intake 1 / 2026*).
  - Assign the responsible **Instructor**.
  - Specify the **Maximum Students Limit (`max_students`)**: Sets the cohort capacity (e.g., 50 or 100 students) to maintain quality mentoring and manageable essay grading workloads.
- Click **Create Class**.

### Step 2: Enrolling & Managing Students
- On the class list, click **"Manage"** on the target class card.
- **Enrolling Students**:
  - Locate the **"Add Student to Class"** panel.
  - Choose a registered student account and click **Add**.
  - *Capacity Enforcement*: If the class has already reached its maximum student capacity (`max_students`), the system displays a clear warning banner and blocks over-enrollment.
- **Removing Students**: If a student drops out or transfers cohorts, click the red **Delete** (trash icon) button on the student row to safely remove them from the cohort.

### Step 3: Class Lock Mechanism (`is_locked`)
- At the top right of the Class Detail view, toggle the **"Lock Class"** button.
- **When Unlocked (`is_locked = false`)**: Students can freely read lessons, watch videos, submit practice quizzes, and attempt final exams.
- **When Locked (`is_locked = true`)**: Enrolled students can still revisit previously completed readings and videos for review, but **cannot confirm new reading/video steps, submit practice quizzes, or start new exam attempts**.
- *Usage*: Activate this lock when the semester has concluded or while instructors are finalizing official grades.

---

## 3. Building the Question Bank & Excel Bulk Import

The platform provides two flexible methods to build examination question pools: manual authoring and high-speed spreadsheet bulk import.

### Method 1: Authoring Questions Manually
1. Click **"Question Bank"** in the left sidebar.
2. Click **"Create Question"**:
   - Associate the question with a Course and an optional Lesson.
   - Choose the Question Type: **Multiple Choice** or **Essay**.
   - Select the **Difficulty Level**: **Easy**, **Medium**, or **Hard**.
3. **For Multiple Choice Questions**:
   - Enter the question prompt using the rich text editor (supports bold, italics, formatted quotations).
   - Enter 4 distinct options (A, B, C, D) and select the correct radio option.
   - Enter a **Detailed Explanation**: This explanation is shown when learners review missed questions to impart clear doctrinal understanding.
4. **For Essay Questions**:
   - Write the essay prompt asking students to reflect, contemplate, or articulate Buddhist insights.

### Method 2: High-Speed Bulk Import via Excel
When importing dozens or hundreds of questions at once:
1. In **"Question Bank"**, click the **"Import Excel"** button.
2. Click **"Download Template"** to obtain the standardized `.xlsx` spreadsheet.
3. Fill out the spreadsheet columns according to the defined schema:
   - `course_code`: Code or identifier of the course.
   - `lesson_order`: Numerical sequence of the lesson (leave blank for general final exam questions).
   - `type`: `multiple_choice` or `essay`.
   - `title`: Question prompt text.
   - `level`: `easy`, `medium`, or `hard`.
   - `points`: Numerical points awarded for a correct answer.
   - `option_a`, `option_b`, `option_c`, `option_d`: The 4 answer choices.
   - `correct_option`: Correct answer letter (`A`, `B`, `C`, or `D`).
   - `explanation`: In-depth doctrinal explanation.
4. Drag and drop the completed file into the upload zone and click **"Inspect & Preview"**.
5. The system performs strict validation and presents a preview table: valid rows ready for insertion are grouped separately from invalid rows (e.g. missing options, invalid answer letters) so you can verify before confirming import.

---

## 4. Monitoring Progress & Grading Final Exams

### The Live Progress Matrix
On the Class Detail page, review the student progress table:
- **Full Name & Buddhist Dharma Name (`dhamma_name`)**: Displayed together for clear identification.
- **Reading**: Displays a green checkmark when the reading step is confirmed.
- **Video**: Displays a green checkmark when the discourse video is completed.
- **Practice**: Displays quiz percentage scores across all lessons.
- **Status**: Automatically updates to **"Ready for Exam"** once 100% of all lesson steps are fulfilled.

### Grading Essay Exams & Calculating Final Grades
When a student submits their final examination:
1. Click **"View Exam Result"** on the student's row.
2. The grading modal displays the student's complete attempt:
   - **Multiple Choice**: Automatically calculated based on configured question points.
   - **Essay Questions**: Read the student's written contemplation, input a score (0 to 10 scale), and write personalized spiritual encouragement.
3. Click **"Save Grade"**:
   - The system aggregates multiple-choice and essay scores into a **Final Grade**.
   - If the combined percentage meets or exceeds the pass threshold (50%), the student status transitions to **"Graduated / Completed"**.

---

## 5. Viewing & Verifying Student Certificates

- Once a student graduates, a **"View Certificate"** button appears in their row within the class progress table.
- Instructors and Admins can view the official electronic Buddhist Certificate of Completion:
  - Check the student's Legal Full Name and Buddhist Dharma Name (`dhamma_name`), Course Title, Completion Date, Final Grade, and Distinction Honour (*High Distinction, Distinction, Credit, Pass*).
  - Verify the unique certificate code (format `VKN-CERT-XXXXXX`).
  - Scan the live QR code on the certificate using any smartphone to immediately confirm its public verification page on the monastery portal.

---

## 6. Student Inquiries & Practitioner Support

- **Responding to Student Inquiries**: Go to **"Courses & Lessons"** $\rightarrow$ switch to the **"Student Feedback"** tab. Read doctrinal questions submitted from lesson players and write compassionate responses.
- **Dharma Name & Password Support**: In **"Users & Roles"**, instructors can look up students by legal name or Buddhist Dharma Name, verify contact details, and use the **"Change Password"** tool to assist learners who forget their credentials.

---

## 7. Class Discussions, Q&A Moderation & Student Interaction

The platform provides a dedicated 2-level discussion board within each Class Detail page (`/admin/classes/{id}`) under the **"Discussions & Q&A"** tab:

### Participating in Discussions
- Instructors and Administrators can initiate discussion topics or reply to student questions across any cohort.
- All comments support basic text formatting via the built-in rich text editor: bold, italic, underline, strikethrough, bulleted/numbered lists, and canonical blockquotes.

### 2-Level Discussion Structure
- **Level 1 (Root Questions)**: Students or teachers ask questions or open discussion topics.
- **Level 2 (Thread Replies)**: Direct replies under each root thread. When a user replies to an existing reply, the system automatically flattens it under the root thread while tagging `@Username` so the conversation context remains crystal clear without endless indentation.

### Moderation & Editing Privileges
- **Editing**: Authors can edit their own comments and replies at any time.
- **Moderation Deletion**: Instructors and Administrators hold full moderation authority to delete any inappropriate or off-topic comments or replies. When a root question is removed, all nested replies underneath are safely removed.
- **Security**: Insecure HTML markup (scripts, iframes, styles, click events) is automatically stripped upon submission to guarantee a safe learning environment.

