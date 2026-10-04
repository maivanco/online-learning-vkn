# 01. System Overview & Core Philosophy

Welcome Venerable Monks, Nuns, Instructors, and Dhamma Practitioners to the **Buddhist Online Learning Portal - Vien Khong Ni Monastery**.

This documentation is written in a clear, accessible style for non-technical users, explaining how the platform operates and how teachers and students interact across all modules.

---

## 1. Platform Purpose & Vision

The platform bridges timeless Dhamma wisdom with modern digital education tools:
- **Standardized Learning Roadmap**: Students study sequentially, from reading canonical scriptures and watching discourses to practicing quizzes and taking graduation exams.
- **Efficiency for Teachers**: Automated grading for objective quizzes, intuitive real-time student progress matrices, and rapid bulk question import via Excel spreadsheets.
- **Dedicated Spiritual Learning Environment**: Practitioners worldwide can self-study and practice anytime, anywhere on desktop or mobile devices; upon passing, students earn an official Buddhist Certificate of Completion featuring unique identification codes and public QR verification.

---

## 2. Educational Philosophy: Hearing – Contemplation – Practice

The platform embodies the classical Buddhist threefold wisdom (*Tisso Panha*):

1. **Suta-maya panna (Wisdom through Reading & Hearing)**:
   - Self-study reading canonical texts and commentaries rendered with elegant rich text formatting (Reading tab).
   - Listening to comprehensive Dharma discourses delivered by venerable teachers (Video Lecture tab).
2. **Cinta-maya panna (Wisdom through Reflection & Inquiry)**:
   - Reinforcing understanding through immediate-feedback practice quizzes with explanatory insights.
   - Submitting reflections and doctrinal questions to instructors via the lesson feedback form.
3. **Bhavana-maya panna (Wisdom through Realization & Mastery)**:
   - Taking the timed comprehensive class final exam (combining automated multiple-choice and thoughtful essays).
   - Reviewing and mastering questions answered incorrectly in the personal **Mistake Mastery Bank** until complete clarity is achieved.

---

## 3. The Three User Roles

| Role | Title | Core Responsibilities |
| :--- | :--- | :--- |
| **Administrator** | System Admin | Manages overall system configuration, user accounts and role permissions, media library assets, site branding, and maintenance modes. |
| **Teacher** | Instructor / Giao Tho | Manages assigned classes, enrolls students within class capacity limits, crafts rich-text lessons, creates questions (manually or via Excel), monitors progress, and grades essay exams. |
| **Student** | Learner / Practitioner | Registers an account (with Buddhist Dharma Name), follows the 5-step sequential roadmap (Reading $\rightarrow$ Video $\rightarrow$ Practice $\rightarrow$ Final Exam $\rightarrow$ Mistake Mastery), and downloads verified graduation certificates. |

---

## 4. Architectural Modules & Core Concepts

The platform is structured into cohesive modules designed for modern Buddhist education:

- **Courses & Curriculum Hierarchy**: Complete subjects (e.g. *Majjhima Nikaya*, *Satipatthana Meditation*, *Basic Dhamma Fundamentals*) organized in multi-level parent-child categories with ordered lessons.
- **Lessons & Rich Text Content**: Teaching units formatted with rich text typography (bold, italics, canonical quotes, lists), integrated YouTube video discourses, and lesson-specific practice quizzes.
- **Classes & Capacity Limits**: Cohorts linked to a course, supervised by an instructor, with defined enrollment limits (`max_students`) and a class lock toggle (`is_locked`) to freeze submissions upon semester completion.
- **Question Bank & Excel Bulk Import**: Centralized repository of multiple-choice and essay questions tagged by difficulty (`easy`, `medium`, `hard`). Supports bulk import of hundreds of questions via standardized `.xlsx`/`.csv` templates.
- **5-Step Sequential Learning Pipeline**: Enforces steady learning by preventing skips: Complete Reading $\rightarrow$ Unlock Video $\rightarrow$ Unlock Practice $\rightarrow$ Complete all lessons to Unlock Final Exam $\rightarrow$ Mistake Mastery.
- **Class Final Exam & Countdown Engine**: Timed summative examination with server-synced countdown timer and **automatic submission upon timeout** to protect student progress.
- **Buddhist Certificates & Public QR Verification**: Automatically generated upon graduation, displaying Student Name, Buddhist Dharma Name (`dhamma_name`), Course Title, Completion Date, Distinction Ranking, Certificate ID, and a live QR code linking to public verification.
- **Practitioner Profile & Dharma Name (`StudentProfile`)**: Stores Buddhist Dharma Name, phone number, gender, address, and birth date to personalize certificates and facilitate monastery records.
- **System Settings (General Settings)**: Centralized management of monastery contacts, support telephone lines, social links, and system maintenance flags.
