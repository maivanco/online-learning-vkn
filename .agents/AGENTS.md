# AI Agent Project Guide & Tech Stack Index

> **Quick Context**: This document provides a token-efficient summary of the tech stack, repository structure, and operational rules for AI agents and developers working on this project.

---

## 1. Core Tech Stack & Versions

| Layer | Technology | Version | Notes & Conventions |
| :--- | :--- | :--- | :--- |
| **Backend Runtime** | **PHP** | `^8.3` | Modern strict typing, constructor promotion |
| **Backend Framework** | **Laravel** | `^11.x` | HMVC Architecture using `nwidart/laravel-modules` |
| **Monolith Bridge** | **Inertia.js** | `v1.x` | Backend: `inertiajs/inertia-laravel`<br>Frontend: `@inertiajs/react` |
| **Frontend Framework**| **React** | `^18/19` | Client SPA with React (`createInertiaApp` in `resources/js/app.tsx`) |
| **Language (FE)** | **TypeScript**| `^5.x` | Strict types; checked during `npm run build` (`tsc && vite build`) |
| **Build Tool** | **Vite** | `^5.x` | `laravel-vite-plugin` + `@vitejs/plugin-react` |
| **Routing Helper** | **Ziggy** | `^2.0` | `tightenco/ziggy` + `@types/ziggy-js` — use `route('route.name')` in TSX |
| **Styling & CSS** | **Tailwind CSS** + **Sass** | `^3.4` | `@tailwindcss/forms`, base SCSS in `resources/sass/app.scss` |
| **UI Components** | **shadcn/ui** style + **Headless UI** |  | Aliases `@/Components/ui`, `@/utils` (`clsx` + `tailwind-merge`), Heroicons |
| **Database** | **MySQL** | `8.0` | Managed via Laravel Sail (`mysql/mysql-server:8.0`) on host port `3306` |
| **Container Engine** | **Laravel Sail** | `^1.x` | Docker environment via `docker-compose.yml` (`sail-8.3/app`) |
| **Testing** | **PHPUnit** | `^11.x` | Unit and feature test suites in `tests/` |

---

## 2. Directory Architecture (HMVC)

```text
├── Modules/                   # HMVC Modules (Backend Logic)
│   ├── Users/                 # User & Role management
│   ├── Lesson/                # Course categories & Lessons (Curriculum)
│   └── Student/               # Student portal & learning progression
├── app/                       # Global Core Logic (Http/Kernel, Global Models)
├── database/                  # Global migrations, factories, seeders
├── resources/
│   ├── js/
│   │   ├── Pages/             # Inertia views (Centralized frontend)
│   │   │   ├── Admin/
│   │   │   ├── Student/
│   │   │   └── Auth/
│   │   ├── Components/        # Reusable UI components
│   │   ├── types/             # Shared TS global interfaces
│   │   └── utils/             # Utility helpers (e.g. cn() class merger)
│   └── sass/app.scss          # Core styling entry
└── start                      # Unified launch script (Sail + Vite on Node 22)
```

---

## 3. Detailed Agent Rules

Before executing tasks, AI Agents MUST read the following rule files located in `.agents/rules/`:

1. [01-architecture-hmvc.md](file:///Users/itcvn/Pet-Projects/online-learning/.agents/rules/01-architecture-hmvc.md): Rules for HMVC module boundaries, centralized frontend, and cross-module communication.
2. [02-security.md](file:///Users/itcvn/Pet-Projects/online-learning/.agents/rules/02-security.md): Security practices including RBAC roles, standard authentication, Mass Assignment prevention, and Inertia state leaks.
3. [03-coding-standards.md](file:///Users/itcvn/Pet-Projects/online-learning/.agents/rules/03-coding-standards.md): PHP 8.3 strict typing, constructor promotion, TypeScript standards, and Tailwind UI patterns.

---

## 4. Key Domain Entities

- **Users Module**: Manages `User` and `Role` entities. Admins create users and define roles (Administrator, Teacher, Student).
- **Lesson Module**: Manages `CourseCategory` (hierarchical) and `Lesson` entities. Course Categories hold essay and quiz questions. Lessons support multiple video and document links.
- **Student Module**: Enforces the 5-step learning pipeline:
  `Self-Study -> Video -> Practice Quizzes (10x) -> Final Exam -> Master Incorrect Questions`.

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
