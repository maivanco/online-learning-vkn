# 04. Business Logic & System Rules

This document clearly outlines automated workflows, progression algorithms, and scoring formulas configured within the platform.

---

## 1. Sequential Progression Logic

To prevent skimming and ensure steady comprehension, the platform prevents skipping steps:

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
A lesson is marked **Completed** (`is_completed = true`) only when all three sub-steps are fulfilled:
1. `reading_completed = true` (Student confirmed reading)
2. `video_completed = true` (Student confirmed video)
3. `practice_completed = true` (Student completed practice quizzes)

---

## 2. Final Exam Unlocking Rule

- The **"Take Final Exam"** button remains disabled (greyed out) until:
  $$\text{Completed Lessons} == \text{Total Lessons in Class}$$
- Once progress reaches **100%**, student status updates to `ready_for_exam`, activating the exam entry.
- **Important**: If even a single step is missed in any lesson, the final exam remains locked.

---

## 3. Class Lock Mechanism (`is_locked`)

Instructors or Admins can toggle the **Lock Class** status:

| Action | When Class is OPEN | When Class is LOCKED |
| :--- | :---: | :---: |
| Review past readings & videos | Allowed | Allowed |
| Confirm new reading completions | Allowed | **Blocked** |
| Submit new practice quiz answers | Allowed | **Blocked** |
| Submit lesson feedback inquiries | Allowed | **Blocked** |
| Start or submit final exam | Allowed | **Blocked** |

> **Purpose**: Freezes class state after semester conclusion or while teachers finalize official grades.

---

## 4. Grading Formula & Exam Scoring

Final exams feature a hybrid automated and manual grading engine:

### Multiple Choice (Objective)
- Evaluated **instantly** by the server upon submission.
- Formula:
  $$\text{MC Points} = \left(\frac{\text{Correct MC Answers}}{\text{Total MC Questions}}\right) \times \text{MC Weight}$$

### Essay Questions (Subjective)
- Forwarded to the instructor's grading queue upon submission.
- Teachers grade each essay on a 10-point scale with commentary.

### Final Grade Calculation
- Once essay grades are submitted:
  $$\text{Final Grade} = \text{MC Points} + \text{Essay Points}$$
- Stored in `final_grade` and class status transitions to `completed` (Graduated).

---

## 5. Countdown Timer & Autosave Protection

- Exam countdown timers run based on synchronized server timestamps.
- **Data Protection**: If the countdown reaches `00:00:00` before the student clicks submit, the system **automatically posts all currently selected answers** to the server, safeguarding the student's work from accidental loss.

---

## 6. Mistake Mastery Bank (`StudentIncorrectQuestion`)

- Incorrect selections during quizzes or exams are recorded in `StudentIncorrectQuestion`.
- When students re-attempt and correctly answer these questions in the review area, their status updates to Mastered.
