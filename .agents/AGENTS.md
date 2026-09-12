# AI Agent Project Guide & Tech Stack Index

> **Quick Context**: This document provides a token-efficient summary of the tech stack, repository structure, and operational rules for AI agents and developers working on this project.

---

## 1. Core Tech Stack & Versions

| Layer | Technology | Version | Notes & Conventions |
| :--- | :--- | :--- | :--- |
| **Backend Runtime** | **PHP** | `^8.3` | Modern strict typing, constructor promotion |
| **Backend Framework** | **Laravel** | `^13.0` | MVC, Eloquent ORM, Service Providers |
| **Monolith Bridge** | **Inertia.js** | `v3.x` | Backend: `inertiajs/inertia-laravel` (`^3.0`)<br>Frontend: `@inertiajs/react` (`^3.7.0`) |
| **Frontend Framework**| **React** | `^19.2.8` | Client SPA with React 19 (`createInertiaApp` in `resources/js/app.tsx`) |
| **Language (FE)** | **TypeScript**| `^5.7.2` | Strict types; checked during `npm run build` (`tsc && vite build`) |
| **Build Tool** | **Vite** | `^5.4.11` | `laravel-vite-plugin` + `@vitejs/plugin-react` (Port: `3000`, HMR host: `online-learning.localhost`) |
| **Routing Helper** | **Ziggy** | `^2.0` | `tightenco/ziggy` + `@types/ziggy-js` — use `route('route.name')` in TSX |
| **Styling & CSS** | **Tailwind CSS** + **Sass** | `^3.4.17` / `^1.83.0` | `@tailwindcss/forms`, base SCSS in `resources/sass/app.scss` |
| **UI Components** | **shadcn/ui** style + **Headless UI** | `^2.2.9` | Aliases `@/Components/ui`, `@/utils` (`clsx` + `tailwind-merge`), Heroicons (`^2.2.0`) |
| **Database** | **MySQL** | `8.0` | Managed via Laravel Sail (`mysql/mysql-server:8.0`) on host port `3306` |
| **Container Engine** | **Laravel Sail** | `^1.41` | Docker environment via `docker-compose.yml` (`sail-8.3/app`) |
| **Performance Engine**| **Laravel Octane**| `^2.9` | High-performance application server support |
| **Testing** | **PHPUnit** | `^11.5` | Unit and feature test suites in `tests/` |

---

## 2. Directory Architecture

```text
├── app/
│   ├── Http/Controllers/
│   │   ├── Admin/             # Admin features: ClassManager, Material, QuestionBank, StudentManager
│   │   ├── Student/           # Student portal: StudentCourseController
│   │   ├── Auth/              # Breeze auth controllers
│   │   └── ProfileController.php
│   └── Models/                # Domain models (Course, CourseClass, Lesson, Question,
│                              # StudentExamAttempt, StudentProgress, User, etc.)
├── database/
│   ├── migrations/            # Table schemas & relationships
│   ├── factories/             # Eloquent model factories
│   └── seeders/               # Database seeders
├── resources/
│   ├── js/
│   │   ├── app.tsx            # Inertia app initialization & router mount
│   │   ├── bootstrap.ts       # Axios and client setup
│   │   ├── Pages/             # Inertia views: Admin/, Student/, Auth/, Home/
│   │   ├── Components/        # Reusable UI components (shadcn pattern in Components/ui)
│   │   ├── Layouts/           # AuthenticatedLayout, GuestLayout
│   │   ├── types/index.d.ts   # Shared global interfaces (User, PageProps, roles)
│   │   └── utils/             # Utility helpers (e.g. cn() class merger)
│   └── sass/app.scss          # Core styling entry
├── routes/
│   ├── web.php                # Inertia web routes & role-gated middleware
│   ├── auth.php               # Breeze auth routes (login, register, reset)
│   └── api.php                # Stateless API routes
└── start                      # Unified launch script (Sail + Vite on Node 22)
```

---

## 3. Key Domain Entities & Roles

- **User Roles**: Defined as `'admin' | 'teacher' | 'student'` in `resources/js/types/index.d.ts`.
- **Domain Structure**:
  - `Course` ➔ `CourseClass` ➔ `Lesson`
  - `Question` ➔ `StudentExamAttempt` ➔ `StudentIncorrectQuestion`
  - `StudentProgress` (tracking lesson/course completion)
  - `MaterialFeedback` (student feedback on course materials)
  - Note: User profile includes identity fields such as `cccd` (citizen identification).

---

## 4. Operational Rules for AI Agents

### Rule 1: Respect the Inertia.js Monolith Contract
- Never treat backend and frontend as separate detached services.
- Controller endpoints serving web views **must** return `Inertia::render('Folder/Component', $props)`.
- Prop keys returned from controllers must align with page interface definitions in `resources/js/Pages/**/*.tsx`.
- All pages receive shared props (`auth.user`, `flash`, `translations`) via HandleInertiaRequests middleware.

### Rule 2: Execute Commands in the Proper Environment
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

### Rule 3: Maintain TypeScript Strictness & Type Safety
- Do not introduce implicit `any`.
- Keep `resources/js/types/index.d.ts` updated when extending global entities (e.g., User fields, flash messages).
- When modifying props passed to Inertia pages, update the corresponding TypeScript interface in the page file.

### Rule 4: Consistent Styling & UI Component Usage
- Use Tailwind CSS utilities.
- Use `cn(...)` from `@/utils` for conditional classes (`clsx` + `tailwind-merge`).
- Do not invent custom CSS classes unless necessary; leverage existing `tailwind.config.js` settings and `resources/sass/app.scss`.
- Use icons from `@heroicons/react` (`outline` or `solid`).

### Rule 5: Navigation and Named Routes
- Use Inertia's `<Link href={route('route.name', params)}>`.
- Always verify that the named route exists in `routes/web.php` or `routes/auth.php`.
- Do not hardcode internal URL strings if a named route exists.

### Rule 6: Database Migrations & Eloquent Conventions
- Follow standard Laravel conventions: table names in `plural_snake_case`, foreign keys as `singular_table_id`.
- Always define both sides of Eloquent relationships (`hasMany`, `belongsTo`) with explicit return types in `app/Models/`.
