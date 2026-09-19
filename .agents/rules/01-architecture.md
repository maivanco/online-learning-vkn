# 01. Standard Laravel MVC Architecture Guidelines

This project utilizes a standard **Laravel MVC** monolithic architecture paired with **Inertia.js** and **React (TypeScript)** for the frontend.

## Core Architectural Principles

1. **Monolithic Standard Architecture**:
   - Do **NOT** use HMVC or modular packaging (`nwidart/laravel-modules`).
   - All backend code lives directly under `app/`, `routes/`, `database/`, and `config/`.

2. **Backend Structure**:
   - **Controllers (`app/Http/Controllers/`)**:
     - Group controllers logically by user role or domain:
       - `Admin/`: Administrative workflows (Classes, Materials, Question Bank, Users & Roles).
       - `Student/`: Student learning workflows (Course progress, reading, video, feedback, practice quizzes, exams).
       - `Auth/`: Authentication, password reset, social login.
     - Controllers should be concise; delegate complex logic to services or models when needed.
   - **Models (`app/Models/`)**:
     - All Eloquent models live in `app/Models/` (`Course`, `CourseClass`, `Lesson`, `Question`, `StudentProgress`, `User`, etc.).
     - Models MUST define `$fillable` (or guarded attributes) to prevent mass assignment.
     - Use Eloquent relationships with strict type definitions (`BelongsTo`, `HasMany`, `BelongsToMany`).
   - **Requests (`app/Http/Requests/`)**:
     - Validate incoming request payloads using Form Request classes.
   - **Middleware (`app/Http/Middleware/`)**:
     - Handle role-based access via `RoleMiddleware` using the `role` column on the `users` table (`admin`, `teacher`, `student`).

3. **Centralized Inertia.js Frontend**:
   - The React frontend lives in `resources/js/`.
   - **Pages (`resources/js/Pages/`)**:
     - Matches backend domain structure:
       - `Admin/`: Class management, materials, question bank, users.
       - `Student/`: Student dashboard, sequential lesson player, exams.
       - `Auth/`: Login, registration, password reset.
       - `Home/`: Public monastery landing page and course catalog.
     - Backend controllers render pages using `Inertia::render('Admin/Materials/Index', [...])`.
   - **Components (`resources/js/Components/`)**:
     - Reusable UI primitives in `Components/ui/` (shadcn-inspired) and layout wrappers in `Layouts/`.
   - **TypeScript Strictness**:
     - Define shared interfaces in `resources/js/types/index.d.ts` reflecting backend models.

4. **Routes (`routes/`)**:
   - `routes/web.php`: Primary web and Inertia routes (grouped with role middleware prefixes `/admin` and `/student`).
   - `routes/auth.php`: Authentication routes.
   - `routes/api.php`: API endpoints if needed.
