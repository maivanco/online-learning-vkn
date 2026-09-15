# 02. Security & Authentication Rules

## Identity and Access

1. **Standard Authentication**:
   - The primary identifiers for users in the system are a standard `username` or `email`.
   - The Citizen Identity Card (`CCCD`) is no longer required or tracked for accounts.

2. **Role-Based Access Control (RBAC)**:
   - The system uses a dynamic role-based architecture.
   - Default roles are: `Administrator`, `Teacher`, and `Student`.
   - Always protect routes and controllers using Laravel middleware (e.g., `role:Administrator,Teacher`). Do not allow raw access to module endpoints.

## Database & API Security

1. **Mass Assignment**:
   - All models MUST declare a `$fillable` array. Do NOT use `protected $guarded = [];` unless explicitly safe.
   - Validate all incoming HTTP requests using Form Request classes (`app/Http/Requests/...` or module-specific Requests) before data touches the controller logic.

2. **Authorization Gates & Policies**:
   - Implement Laravel Policies or Gates for fine-grained actions (e.g., only a Teacher assigned to a class can modify it).

3. **Inertia State**:
   - Never leak sensitive model attributes (e.g., hashed passwords, internal IDs that should be hidden) into the React frontend.
   - Use API Resources or explicit array mapping when passing `$props` to `Inertia::render()`.
