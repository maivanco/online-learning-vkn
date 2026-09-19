# AI Agent Project Guide & Tech Stack Index

> **Quick Context**: This document provides a token-efficient summary of the tech stack, repository structure, and operational rules for AI agents and developers working on this project.

---

## 1. Core Tech Stack & Versions

| Layer | Technology | Version | Notes & Conventions |
| :--- | :--- | :--- | :--- |
| **Backend Runtime** | **PHP** | `^8.3` | Modern strict typing, constructor promotion |
| **Backend Framework** | **Laravel** | `^11.x` | Standard MVC Monolith with Inertia.js |
| **Monolith Bridge** | **Inertia.js** | `v1.x` | Backend: `inertiajs/inertia-laravel`<br>Frontend: `@inertiajs/react` |
| **Frontend Framework**| **React** | `^18/19` | Client SPA with React (`createInertiaApp` in `resources/js/app.tsx`) |
| **Language (FE)** | **TypeScript**| `^5.x` | Strict types; checked during `npm run build` (`tsc && vite build`) |
| **Build Tool** | **Vite** | `^5.x` | `laravel-vite-plugin` + `@vitejs/plugin-react` |
| **Routing Helper** | **Ziggy** | `^2.0` | `tightenco/ziggy` + `@types/ziggy-js` — use `route('route.name')` in TSX |
| **Styling & CSS** | **Tailwind CSS** + **Sass** | `^3.4` | `@tailwindcss/forms`, `@tailwindcss/typography`, base SCSS in `resources/sass/app.scss` |
| **Rich Text Editor** | **TipTap** | `^3.31` | `@tiptap/react` + starter-kit; standard editor component in `@/Components/RichTextEditor` |
| **UI Components** | **shadcn/ui** style + **Headless UI** |  | Aliases `@/Components/ui`, `@/utils` (`clsx` + `tailwind-merge`), Heroicons |
| **Database** | **MySQL** | `8.0` | Managed via Laravel Sail (`mysql/mysql-server:8.0`) on host port `3306` |
| **Container Engine** | **Laravel Sail** | `^1.x` | Docker environment via `docker-compose.yml` (`sail-8.3/app`) |
| **Testing** | **PHPUnit** | `^11.x` | Unit and feature test suites in `tests/` |

---

## 2. Directory Architecture (Standard MVC)

```text
├── app/
│   ├── Http/
│   │   ├── Controllers/       # Controllers grouped by domain: Admin/, Student/, Auth/
│   │   ├── Middleware/        # Route & Role Middleware (RoleMiddleware, etc.)
│   │   └── Requests/          # Form Request validation classes
│   ├── Models/                # Eloquent Models (Course, Lesson, CourseClass, User, Question, etc.)
│   └── Providers/             # Core Service Providers
├── database/
│   ├── migrations/            # Database schema migrations
│   ├── factories/             # Model factories
│   └── seeders/               # Database seeders (BuddhistCurriculumSeeder, UserSeeder)
├── routes/
│   ├── web.php                # Core application & Inertia routes (/admin, /student, /)
│   ├── auth.php               # Authentication & password management routes
│   └── api.php                # API endpoints
├── resources/
│   ├── js/
│   │   ├── Pages/             # Inertia views (Admin/, Student/, Auth/, Home/)
│   │   ├── Components/        # Reusable UI components & layouts
│   │   ├── types/             # Shared TS global interfaces (models, props)
│   │   └── utils/             # Utility helpers (e.g. cn() class merger)
│   └── sass/app.scss          # Core styling entry
└── start.local                # Local launch script (Sail + Vite on Node 22)
```

---

## 3. Detailed Agent Rules

Before executing tasks, AI Agents MUST read the following rule files located in `.agents/rules/`:

1. [01-architecture.md](file:///Users/itcvn/Pet-Projects/online-learning/.agents/rules/01-architecture.md): Rules for standard Laravel MVC architecture, controller grouping, and centralized Inertia frontend.
2. [02-security.md](file:///Users/itcvn/Pet-Projects/online-learning/.agents/rules/02-security.md): Security practices including RBAC roles, standard authentication, Mass Assignment prevention, and Inertia state leaks.
3. [03-coding-standards.md](file:///Users/itcvn/Pet-Projects/online-learning/.agents/rules/03-coding-standards.md): PHP 8.3 strict typing, constructor promotion, TypeScript standards, and Tailwind UI patterns.

---

## 4. Key Domain Entities & Workflow

- **Users & Roles**: Managed by `UserManagerController` and `User` model with `role` column (`admin`, `teacher`, `student`). Authentication uses `username` or `email`.
- **Curriculum & Materials**: Managed by `ClassManagerController`, `MaterialController`, `QuestionBankController`. Courses have categories (`category` string enum), classes (`CourseClass`), lessons (`Lesson`), and questions (`Question`).
- **Student Progression**: Enforces the 5-step learning pipeline in `StudentCourseController`:
  `Self-Study (Reading) -> Video -> Practice Quizzes -> Final Exam -> Master Incorrect Questions`.
- **Rich Text & Content Editing**: All formatted text areas (Course Catalog `description`, Lesson `reading_content`, articles, guides) **MUST** use the shared `RichTextEditor` component (`@/Components/RichTextEditor`) based on TipTap rather than raw `<textarea>`. Rich text is rendered via Tailwind `@tailwindcss/typography` (`prose prose-stone` / `prose prose-xs`) and normalized on the backend.

---

## 5. Execution Environment Commands

- **Backend / PHP / Artisan**: Use Laravel Sail when Docker is running:
  ```bash
  ./vendor/bin/sail artisan <command>
  ./vendor/bin/sail composer <command>
  ./vendor/bin/sail test
  ```
- **Frontend**: Requires Node 22. Build validation command:
  ```bash
  npm run build    # Runs 'tsc && vite build' — always test this to ensure type correctness
  ```
