# 04. Business Logic & System Rules

This document clearly outlines automated workflows, progression algorithms, validation schemas, and scoring formulas configured within the Buddhist Online Learning Portal.

---

## 1. Sequential Progression Logic

To prevent superficial skimming and ensure steady comprehension, the portal enforces step prerequisites:

```
[Reading (Incomplete)]  ──>  [Video (Locked)]
          │ (Click Complete)
          ▼
[Reading (Completed)]   ──>  [Video (Unlocked)]  ──>  [Practice (Locked)]
                                      │ (Click Complete)
                                      ▼
                              [Video (Completed)] ──>  [Practice (Unlocked)]
```

### Lesson Completion Criteria
A lesson is marked **Completed** only when all three sub-steps are fulfilled:
1. `reading_completed = true`: Student confirmed reading canonical passages.
2. `video_completed = true`: Student confirmed watching the video discourse.
3. `practice_completed = true`: Student completed and submitted the lesson practice quiz.

---

## 2. Class Enrollment Capacity (`max_students`)

To protect educational mentoring standards and manageable essay grading queues, each class cohort has an explicit capacity limit:
- **Enrollment Validation Check**:
  $$\text{Current Enrolled Students} < \text{max\_students}$$
- When a cohort reaches capacity, the system **blocks further student additions** and displays an alert to the instructor.
- **Duplicate Prevention**: A student cannot be enrolled multiple times into the same cohort.

---

## 3. Class Lock Mechanism (`is_locked`)

Instructors and Administrators can toggle the **Lock Class** status (`is_locked = true`):

| Action | When Class is OPEN (`is_locked = false`) | When Class is LOCKED (`is_locked = true`) |
| :--- | :---: | :---: |
| Review past readings & discourse videos | Allowed | Allowed |
| Confirm new reading completions | Allowed | **Blocked** |
| Confirm new video completions | Allowed | **Blocked** |
| Submit new practice quiz attempts | Allowed | **Blocked** |
| Submit lesson inquiry reflections | Allowed | **Blocked** |
| Begin or submit final examinations | Allowed | **Blocked** |
| View past exam results & Certificates | Allowed | Allowed |

> **Purpose**: Freezes class state upon semester graduation or while instructors evaluate final rankings, ensuring student data integrity.

---

## 4. Final Exam Eligibility & Execution Rules

### Eligibility Prerequisite
The **"Take Final Exam"** button remains disabled until:
$$\text{Completed Lessons} == \text{Total Lessons in Cohort} \quad (100\%)$$
Upon reaching 100%, student enrollment status shifts to `ready_for_exam`, activating the examination entry.

### Exam Duration & Real-time Countdown
- Each course exam defines a time allowance in minutes (`duration_minutes`, e.g., 30, 45, or 60 minutes).
- When a student initiates the exam, a countdown clock ticks against the server-verified start time (`started_at`).

### Autosave & Auto-Submit Protection
- If the countdown reaches `00:00:00` before the student manually submits, the system **automatically posts all currently selected answers to the server**.
- This failsafe prevents data loss caused by clock expiration, sudden distraction, or transient network blips.

---

## 5. Grading Engine & Distinction Classifications

Final exams utilize a hybrid automated and manual grading engine:

### Multiple Choice (Objective)
- Evaluated **instantly** by the server upon submission according to each question's configured points.

### Essay Questions (Subjective)
- Forwarded to the instructor's grading queue (`exam-result`).
- Instructors evaluate each essay on a 10-point scale and provide personal doctrinal feedback.

### Final Grade & Graduation Threshold
$$\text{Final Grade} = \text{Multiple Choice Score} + \text{Essay Score}$$
- **Graduation Passing Cutoff**: Students must achieve at least **50% of total points** ($\ge 5.0$ out of 10.0) to graduate.
- Upon passing, class status transitions to `completed`.

### Distinction Honours Matrix
| Final Grade (Scale 10) | Vietnamese Ranking | English Distinction |
| :---: | :---: | :---: |
| $\ge 9.0$ | **Xuất sắc** | High Distinction |
| $8.0 \le \text{Grade} < 9.0$ | **Giỏi** | Distinction |
| $7.0 \le \text{Grade} < 8.0$ | **Khá** | Credit |
| $5.0 \le \text{Grade} < 7.0$ | **Đạt** | Pass |
| $< 5.0$ | Chưa đạt | Fail |

---

## 6. Question Bank & Excel Bulk Import Rules

Spreadsheet bulk import enforces data sanitization rules:

1. **Supported File Formats**: `.xlsx`, `.xls`, `.csv`.
2. **Mandatory Header Fields**:
   - `course_code`: Must match an active course identifier.
   - `type`: Must be strictly `multiple_choice` or `essay`.
   - `title`: Question prompt string (required).
   - `level`: Must be strictly `easy`, `medium`, or `hard`.
   - `points`: Numeric value (defaults to 1 if blank).
3. **Multiple Choice Requirements**:
   - Must supply all 4 options: `option_a`, `option_b`, `option_c`, `option_d`.
   - `correct_option`: Must be strictly one of `A`, `B`, `C`, or `D`.
4. **Row-by-Row Isolation**:
   - Valid rows are staged for safe database insertion.
   - Invalid rows are flagged with specific row numbers and diagnostic reasons in the Preview interface, ensuring no silent data corruption.

---

## 7. Certificate Engine & Public QR Verification

- **Automatic Issuance**: As soon as a student passes the class (`status = 'completed'`), the platform provisions a graduation certificate.
- **Unique Certificate Code**: Formatted with unique cryptographic randomness (e.g., `VKN-CERT-A1B2C3`).
- **Public Verification Endpoint (`/certificate/verify/{code}`)**:
  - The live QR code printed on the certificate links directly to this route.
  - External verifiers (monastery administration, family, peers) can instantly verify the student's Full Name, Buddhist Dharma Name, Course, Completion Date, Final Grade, and Distinction Honours without requiring an account.

---

## 8. Mistake Mastery Lifecycle (`StudentIncorrectQuestion`)

1. Incorrect answers from either lesson practice quizzes or final exams are saved into `StudentIncorrectQuestion`.
2. Missed questions persist in the student's review queue until the student re-attempts the question and selects the correct answer.
3. Upon selecting the correct answer, the record is flagged as `is_mastered = true`, validating that the practitioner has rectified the misunderstanding.

---

## 9. Class Comments & Discussion Rules (`ClassComment`)

The platform implements a bounded 2-level discussion thread system to maintain clean, readable conversations:

### 1. 2-Level Strict Hierarchy & Thread Flattening
- **Level 1 (Root Comments)**: Have `parent_id = null`. Represents a main inquiry or topic starter.
- **Level 2 (Thread Replies)**: Have `parent_id = root_comment_id`.
- **Flattening Rule**: If a user replies to an existing level-2 reply:
  - The system resolves the parent link:
    $$\text{parent\_id} = \text{targetComment.parent\_id} \quad (\text{the root comment ID})$$
  - The system records the targeted user:
    $$\text{reply\_to\_user\_id} = \text{targetComment.user\_id}$$
  - The comment is displayed under the root comment thread with an `@Username` mention badge, ensuring the tree never indents deeper than 2 levels.

### 2. Authorization & Permission Matrix
| Role / User | Post Root Comment | Post Reply | Edit Comment | Delete Comment |
| :--- | :---: | :---: | :---: | :---: |
| Enrolled Student | Allowed | Allowed | Own comments only | Own comments only |
| Non-Enrolled Student | **Blocked** | **Blocked** | **Blocked** | **Blocked** |
| Assigned Instructor | Allowed | Allowed | Own comments only | **Any comment** (moderation) |
| Administrator | Allowed | Allowed | Own comments only | **Any comment** (moderation) |

### 3. Cascading Deletions
- When a root comment is deleted, all nested level-2 replies are automatically cascaded and removed (`onDelete('cascade')`), preventing orphan records.

### 4. Content Sanitization & XSS Defense
- **Allowed HTML Tags**: `p`, `br`, `strong`, `b`, `em`, `i`, `u`, `s`, `strike`, `ul`, `ol`, `li`, `blockquote`.
- **Stripped Markup**: `<script>`, `<iframe>`, `<object>`, `<embed>`, `<style>`, inline style attributes, and all inline DOM event handlers (`onclick`, `onerror`, `onload`, etc.) are stripped on save.
- **Non-empty Check**: Comments containing only whitespace or empty tags (such as `<p></p>`) fail validation with an informative localized error.

