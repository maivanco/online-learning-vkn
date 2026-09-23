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

3. **WYSIWYG & Rich Text Content Standard**:
   - For all formatted text, rich description, and content-authoring inputs (such as Courses Catalog descriptions, Lesson reading materials, announcements, or articles), AI agents **MUST** use the shared `RichTextEditor` component (`@/Components/RichTextEditor`) based on TipTap instead of raw `<textarea>`.
   - **Component Usage**:
     ```tsx
     import RichTextEditor from '@/Components/RichTextEditor';

     <RichTextEditor
         value={form.data.description}
         onChange={(html) => form.setData('description', html)}
         placeholder="Enter description..."
         minHeight="140px"
         error={form.errors.description}
     />
     ```
   - **Rendering Content**: Always render rich text content inside a container styled with `@tailwindcss/typography` (`prose prose-stone` or `prose prose-xs`) using HTML rendering:
     ```tsx
     <div
         className="prose prose-stone max-w-none text-stone-800"
         dangerouslySetInnerHTML={{ __html: content }}
     />
     ```
   - **Backend Normalization**: In Laravel controllers, use `trim(strip_tags($content)) === ''` checks to ensure empty editor tags (like `<p></p>`) are converted to `null` (if nullable) or flagged as empty (if required).

## Language, Communication & Localization Standards

1. **AI Agent Response Language**:
   - AI agents MUST ALWAYS write conversation responses, implementation plans, walkthroughs, summaries, code comments, and docblocks strictly in **English**.
   - Do NOT respond or write explanations in Vietnamese or other non-English languages unless explicitly requested by the user in a specific turn.

2. **UI & Code Localization**:
   - **No Hardcoded Non-English Strings**: Never hardcode Vietnamese (or any other non-English language) directly in React TSX/JSX files, Blade templates, controllers, or notifications.
   - **Centralized Translation Files**: All user-facing localized strings must be placed strictly in Laravel translation files under `lang/vi/*.php` (e.g., `lang/vi/classes.php`, `lang/vi/common.php`, `lang/vi/courses.php`).
   - **Symmetric English Dictionaries**: Every key added to `lang/vi/*.php` MUST have a corresponding English translation in `lang/en/*.php`.
   - **Frontend Translation Access**: In React components, always use `useTranslation()` / `t('file.key')` rather than raw text.
   - **Backend Translation Access**: In PHP controllers, form requests, and mailables, use `__('file.key')` or `trans('file.key')`.
