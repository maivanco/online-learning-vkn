# 01. HMVC Architecture Guidelines

This project utilizes a Hierarchical Model-View-Controller (HMVC) architecture powered by `nwidart/laravel-modules`.

## Core Principles

1. **Module Independence**:
   - Each module MUST be as self-contained as possible. 
   - A module (e.g., `Users`, `Lesson`, `Student`) should encapsulate its own Controllers, Models, Routes, and Service Providers.
   
2. **Centralized Frontend**:
   - Despite backend modularity, the React frontend remains centralized in `resources/js/Pages` and `resources/js/Components`.
   - Backend controllers MUST resolve Inertia views using standard paths corresponding to the frontend folder structure. Example: `Inertia::render('Lesson/CourseCategories/Index')`.

3. **Cross-Module Communication**:
   - Avoid direct database queries from one module to another's tables if possible, use internal APIs/Services or shared models instead.
   - If a model is heavily shared across all modules (like `User`), it may reside in the core `app/Models` directory, or within a dedicated `Users` module if that module explicitly exports it.

4. **Directory Structure per Module**:
   ```text
   Modules/
     └── ModuleName/
         ├── Config/
         ├── Http/
         │   ├── Controllers/
         │   └── Requests/
         ├── Models/
         ├── Providers/
         └── routes/
             ├── api.php
             └── web.php
   ```

5. **Commands**:
   - Use `php artisan module:make <ModuleName>` to generate a new module.
   - Use `php artisan module:make-controller <ControllerName> <ModuleName>` to generate a module-specific controller.
