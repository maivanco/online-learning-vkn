# 03. Coding Standards & Conventions

## PHP 8.3 & Laravel

1. **Strict Typing**:
   - Declare `declare(strict_types=1);` at the top of all new PHP files.
   - Enforce return types and argument types on all methods.
   - No implicit mixed types.

2. **Constructor Property Promotion**:
   - Utilize PHP 8 constructor property promotion for dependency injection to keep controllers and services clean:
     ```php
     public function __construct(
         private readonly UserService $userService,
     ) {}
     ```

3. **Naming Conventions**:
   - Models: `PascalCase` (Singular)
   - Tables: `snake_case` (Plural)
   - Foreign Keys: `singular_model_name_id`
   - Controllers: `PascalCase` suffixed with `Controller`
   - Methods: `camelCase`

## Frontend (React + TypeScript)

1. **TypeScript Strictness**:
   - Avoid `any`. Define proper interfaces for all Inertia Page Props.
   - Synchronize PHP models with TS interfaces located in `resources/js/types/index.d.ts`.

2. **Styling & Components**:
   - Use Tailwind CSS strictly. Do not create custom CSS classes unless absolutely necessary (if so, put in `resources/sass/app.scss`).
   - Use the `cn()` utility (`clsx` + `tailwind-merge`) from `resources/js/utils` for composing dynamic Tailwind class strings.
   - Components should follow a Shadcn UI-like pattern where applicable (in `resources/js/Components/ui/`).
