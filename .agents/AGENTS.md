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
3. [03-coding-standards.md](file:///Users/itcvn/Pet-Projects/online-learning/.agents/rules/03-coding-standards.md): PHP 8.3 strict typing, constructor promotion, TypeScript standards, Tailwind UI patterns, and Language & Localization rules.

---

## 4. Key Domain Entities & Workflow

- **Users & Roles**: Managed by `UserManagerController` and `User` model with `role` column (`admin`, `teacher`, `student`). Authentication uses `username` or `email`.
- **Curriculum & Materials**: Managed by `ClassManagerController`, `MaterialController`, `QuestionBankController`. Courses have categories (`category` string enum), classes (`CourseClass`), lessons (`Lesson`), and questions (`Question`).
- **Student Progression**: Enforces the 5-step learning pipeline in `StudentCourseController`:
  `Self-Study (Reading) -> Video -> Practice Quizzes -> Final Exam -> Master Incorrect Questions`.
- **Rich Text & Content Editing**: All formatted text areas (Course Catalog `description`, Lesson `reading_content`, articles, guides) **MUST** use the shared `RichTextEditor` component (`@/Components/RichTextEditor`) based on TipTap rather than raw `<textarea>`. Rich text is rendered via Tailwind `@tailwindcss/typography` (`prose prose-stone` / `prose prose-xs`) and normalized on the backend.
- **Language & Localization Standard**:
  - **AI Agent Response Language**: All AI assistant responses, plans, walkthroughs, code comments, and docblocks MUST strictly be written in **English**.
  - **Code & UI Localization**: No non-English (e.g., Vietnamese) strings may be hardcoded in React TSX components, Blade views, or PHP logic. All localized strings must reside in `lang/vi/*.php` with symmetric `lang/en/*.php` entries, accessed via `useTranslation()` / `t(...)` in frontend or `__()` / `trans()` in backend.

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

===

<laravel-boost-guidelines>
=== foundation rules ===

# Laravel Boost Guidelines

## Foundational Context

This application is a Laravel application running on PHP 8.3. Always use the APIs that match the installed major version of each package — do not assume a version.

Before relying on a package's API, confirm its installed version:
- PHP packages: run `vendor/bin/sail composer show --direct` to list direct dependencies with versions, or `vendor/bin/sail composer show <vendor/package>` for a single package.
- JS packages: check `package.json` for the installed versions.

## Skills Activation

This project has domain-specific skills available in `**/skills/**`. You MUST activate the relevant skill whenever you work in that domain—don't wait until you're stuck.

## Conventions

- You must follow all existing code conventions used in this application. When creating or editing a file, check sibling files for the correct structure, approach, and naming.
- Use descriptive names for variables and methods. For example, `isRegisteredForDiscounts`, not `discount()`.
- Check for existing components to reuse before writing a new one.

## Verification Scripts

- Do not create verification scripts or tinker when tests cover that functionality and prove they work. Unit and feature tests are more important.

## Application Structure & Architecture

- Stick to existing directory structure; don't create new base folders without approval.
- Do not change the application's dependencies without approval.

## Frontend Bundling

- If a frontend change doesn't show in the UI or you get a "Unable to locate file in Vite manifest" error, run `vendor/bin/sail npm run build` or ask the user to run `vendor/bin/sail npm run dev` or `vendor/bin/sail composer run dev`.

## Documentation Files

- You must only create documentation files if explicitly requested by the user.

=== boost rules ===

# Laravel Boost

## Tools

- Laravel Boost is an MCP server with tools designed specifically for this application. Prefer Boost tools over manual alternatives like shell commands or file reads.
- Use `database-query` to run read-only queries against the database instead of writing raw SQL in tinker.
- Use `database-schema` to inspect table structure before writing migrations or models.
- Use `get-absolute-url` to resolve the correct scheme, domain, and port for project URLs. Always use this before sharing a URL with the user.
- Use `browser-logs` to read browser logs, errors, and exceptions. Only recent logs are useful, ignore old entries.

## Searching Documentation (IMPORTANT)

- Use `search-docs` before changes that depend on Laravel ecosystem APIs, behavior, configuration, or version-specific syntax. Skip it for copy-only edits and other changes where package documentation is irrelevant. Reuse sufficient results already in context instead of searching again.
- Pass a `packages` array to scope results when you know which packages are relevant.
- Use multiple broad, topic-based queries: `['rate limiting', 'routing rate limiting', 'routing']`. Expect the most relevant results first.
- Do not add package names to queries because package info is already shared. Use `test resource table`, not `filament 4 test resource table`.

### Search Syntax

1. Use words for auto-stemmed AND logic: `rate limit` matches both "rate" AND "limit".
2. Use `"quoted phrases"` for exact position matching: `"infinite scroll"` requires adjacent words in order.
3. Combine words and phrases for mixed queries: `middleware "rate limit"`.
4. Use multiple queries for OR logic: `queries=["authentication", "middleware"]`.

## Project Rules

- This project contains committed, area-grouped rules in `.ai/rules` when that directory exists, including path-scoped framework guidelines under `.ai/rules/boost`. Before you enter plan mode or create/edit any file, you MUST first: open @.ai/rules/index.md (it maps file globs to rule files), read every rule file whose globs cover the path(s) in scope, and run `grep -rin 'keyword' .ai/rules` to catch what a path match alone misses. Do not write code until you have read and are following every matching rule. If `.ai/rules` does not exist, continue without it.

## Artisan

- Run Artisan commands directly via the command line (e.g., `vendor/bin/sail artisan route:list`). Use `vendor/bin/sail artisan list` to discover available commands and `vendor/bin/sail artisan [command] --help` to check parameters.
- Inspect routes with `vendor/bin/sail artisan route:list`. Filter with: `--method=GET`, `--name=users`, `--path=api`, `--except-vendor`, `--only-vendor`.
- Read configuration values using dot notation: `vendor/bin/sail artisan config:show app.name`, `vendor/bin/sail artisan config:show database.default`. Or read config files directly from the `config/` directory.

## Tinker

- Execute PHP in app context for debugging and testing code. Do not create models without user approval, prefer tests with factories instead. Prefer existing Artisan commands over custom tinker code.
- Always use single quotes to prevent shell expansion: `vendor/bin/sail artisan tinker --execute 'Your::code();'`
  - Double quotes for PHP strings inside: `vendor/bin/sail artisan tinker --execute 'User::where("active", true)->count();'`

=== php rules ===

# PHP

- Always use curly braces for control structures, even for single-line bodies.
- Use PHP 8 constructor property promotion: `public function __construct(public GitHub $github) { }`. Do not leave empty zero-parameter `__construct()` methods unless the constructor is private.
- Use explicit return type declarations and type hints for all method parameters: `function isAccessible(User $user, ?string $path = null): bool`
- Use TitleCase for Enum keys: `FavoritePerson`, `BestLake`, `Monthly`.
- Prefer PHPDoc blocks over inline comments. Only add inline comments for exceptionally complex logic.
- Use array shape type definitions in PHPDoc blocks.

=== deployments rules ===

# Deployment

- Laravel can be deployed using [Laravel Cloud](https://cloud.laravel.com/), which is the fastest way to deploy and scale production Laravel applications.
- Activate the `deploying-to-cloud` skill whenever deploying to Laravel Cloud, configuring Cloud environments or resources, using the Cloud CLI, or troubleshooting Cloud deployments.

=== sail rules ===

# Laravel Sail

- This project runs inside Laravel Sail's Docker containers. You MUST execute all commands through Sail.
- Start services using `vendor/bin/sail up -d` and stop them with `vendor/bin/sail stop`.
- Open the application in the browser by running `vendor/bin/sail open`.
- Always prefix PHP, Artisan, Composer, and Node commands with `vendor/bin/sail`. Examples:
    - Run Artisan Commands: `vendor/bin/sail artisan migrate`
    - Install Composer packages: `vendor/bin/sail composer install`
    - Execute Node commands: `vendor/bin/sail npm run dev`
    - Execute PHP scripts: `vendor/bin/sail php [script]`
- View all available Sail commands by running `vendor/bin/sail` without arguments.

=== tests rules ===

# Test Enforcement

- Add or update tests for behavior and logic changes when a test provides meaningful regression coverage.
- Pure copy, styling, and layout-only changes do not require new or updated tests.
- When test coverage applies, run the affected tests and ensure they pass.
- Test the changed behavior and its important failure modes, but do not add tests beyond them.
- Read the `testing-best-practices` skill before writing tests.

=== inertia-laravel/core rules ===

# Inertia

- Inertia creates fully client-side rendered SPAs without modern SPA complexity, leveraging existing server-side patterns.
- Components live in `resources/js/Pages` (unless specified in `vite.config.js`). Use `Inertia::render()` for server-side routing instead of Blade views.
- ALWAYS use `search-docs` tool for version-specific Inertia documentation and updated code examples.
- IMPORTANT: Activate `inertia-react-development` when working with Inertia client-side patterns.

# Inertia v3

- Use all Inertia features from v1, v2, and v3. Check the documentation before making changes to ensure the correct approach.
- New v3 features: standalone HTTP requests (`useHttp` hook), optimistic updates with automatic rollback, layout props (`useLayoutProps` hook), instant visits, simplified SSR via `@inertiajs/vite` plugin, custom exception handling for error pages.
- Carried over from v2: deferred props, infinite scroll, merging props, polling, prefetching, once props, flash data.
- When using deferred props, add an empty state with a pulsing or animated skeleton.
- Axios has been removed. Use the built-in XHR client with interceptors, or install Axios separately if needed.
- `Inertia::lazy()` / `LazyProp` has been removed. Use `Inertia::optional()` instead.
- Prop types (`Inertia::optional()`, `Inertia::defer()`, `Inertia::merge()`) work inside nested arrays with dot-notation paths.
- SSR works automatically in Vite dev mode with `@inertiajs/vite` - no separate Node.js server needed during development.
- Event renames: `invalid` is now `httpException`, `exception` is now `networkError`.
- `router.cancel()` replaced by `router.cancelAll()`.
- The `future` configuration namespace has been removed - all v2 future options are now always enabled.

=== laravel/core rules ===

# Do Things the Laravel Way

- Use `vendor/bin/sail artisan make:` commands to create new files (i.e. migrations, controllers, models, etc.). You can list available Artisan commands using `vendor/bin/sail artisan list` and check their parameters with `vendor/bin/sail artisan [command] --help`.
- If you're creating a generic PHP class, use `vendor/bin/sail artisan make:class`.
- Pass `--no-interaction` to all Artisan commands to ensure they work without user input. You should also pass the correct `--options` to ensure correct behavior.

### Model Creation

- When creating new models, create useful factories and seeders for them too. Ask the user if they need any other things, using `vendor/bin/sail artisan make:model --help` to check the available options.

## APIs & Eloquent Resources

- For APIs, default to using Eloquent API Resources and API versioning unless existing API routes do not, then you should follow existing application convention.

## URL Generation

- When generating links to other pages, prefer named routes and the `route()` function.

## Testing

- When creating models for tests, use the factories for the models. Check if the factory has custom states that can be used before manually setting up the model.
- Faker: Use methods such as `$this->faker->word()` or `fake()->randomDigit()`. Follow existing conventions whether to use `$this->faker` or `fake()`.
- When creating tests, make use of `vendor/bin/sail artisan make:test [options] {name}` to create a feature test, and pass `--unit` to create a unit test. Most tests should be feature tests.

=== laravel-octane/core rules ===

# Laravel Octane

This application uses Laravel Octane, a long-running PHP server. The application bootstraps once and handles many requests within the same process.

- Never store request-specific state in singletons or static properties, because it can leak across requests.
- Use `config('octane.server')` to detect the active driver (`swoole`, `roadrunner`, or `frankenphp`).
- Prefer scoped bindings (`$this->app->scoped()`) over singletons for per-request services.

When working on Octane-specific features (concurrency, shared tables, memory, driver configuration, testing), invoke `octane-development` for detailed rules.

=== pint/core rules ===

# Laravel Pint Code Formatter

- If you have modified any PHP files, you must run `vendor/bin/sail bin pint --dirty --format agent` before finalizing changes to ensure your code matches the project's expected style.
- Do not run `vendor/bin/sail bin pint --test --format agent`, simply run `vendor/bin/sail bin pint --format agent` to fix any formatting issues.

=== phpunit/core rules ===

# PHPUnit

- This project uses PHPUnit. Create tests with `vendor/bin/sail artisan make:test --phpunit {name}`.
- Do not include the test suite directory in `{name}`. Use `SomeFeatureTest`, not `Feature/SomeFeatureTest`.
- Read the `testing-best-practices` skill for guidance on coverage, naming, structure, dependency isolation, and review.

## Running Tests

- Run the narrowest set of tests that covers the change. Pass a file path or `--filter=testName` to `vendor/bin/sail artisan test --compact`.
- Rerun a test after each change to it.
- Run `vendor/bin/sail bin phpunit` to call the test runner directly. It accepts the same file path and `--filter=testName` arguments.

=== inertia-react/core rules ===

# Inertia + React

- IMPORTANT: Activate `inertia-react-development` when working with Inertia React client-side patterns.

</laravel-boost-guidelines>
