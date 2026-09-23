<?php

use App\Http\Controllers\Admin\ClassManagerController;
use App\Http\Controllers\Admin\MaterialController;
use App\Http\Controllers\Admin\MediaController;
use App\Http\Controllers\Admin\QuestionBankController;
use App\Http\Controllers\Admin\UserManagerController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Student\StudentCourseController;
use App\Models\Course;
use App\Models\CourseClass;
use App\Models\User;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// Public Landing Page showcasing Course Catalog
Route::get('/', function () {
    $allCourses = Course::with([
        'user:id,name,username',
        'parent:id,title',
        'lessons' => fn($q) => $q->select(['id', 'course_id', 'title', 'slug', 'order'])->orderBy('order'),
        'children' => fn($q) => $q->with([
            'user:id,name,username',
            'lessons' => fn($lq) => $lq->select(['id', 'course_id', 'title', 'slug', 'order'])->orderBy('order'),
            'children' => fn($cq) => $cq->with([
                'user:id,name,username',
                'lessons' => fn($lq2) => $lq2->select(['id', 'course_id', 'title', 'slug', 'order'])->orderBy('order'),
            ])->withCount(['lessons', 'classes'])->orderBy('order'),
        ])->withCount(['lessons', 'classes'])->orderBy('order'),
    ])
    ->withCount(['lessons', 'classes'])
    ->orderBy('order')
    ->get();

    $courseIds = $allCourses->pluck('id')->all();
    $courses = $allCourses->filter(fn($c) => is_null($c->parent_id) || !in_array($c->parent_id, $courseIds))->values();
    $activeClassesCount = CourseClass::count();
    $hasAdmin = User::where('role', 'admin')->exists();

    return Inertia::render('Home/Index', [
        'courses' => $courses,
        'activeClassesCount' => $activeClassesCount,
        'hasAdmin' => $hasAdmin,
        'monastery' => [
            'name' => 'Vien Khong Ni',
            'tagline' => 'Buddhist Courses – Learning & Practice Path',
            'address' => 'Vien Khong Ni, Hamlet 4, Chau Pha, Ho Chi Minh City',
            'facebook' => 'https://www.facebook.com/share/1DCWqsCZSY/?mibextid=wwXIfr',
        ],
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
        'year' => date('Y'),
    ]);
})->name('home');

// Role-based Dashboard Entry Point
Route::get('/dashboard', function () {
    $user = auth()->user();
    if ($user && $user->isTeacherOrAdmin()) {
        return redirect()->route('admin.dashboard');
    }
    return redirect()->route('student.dashboard');
})->middleware(['auth'])->name('dashboard');

// ==========================================
// Admin & Teacher Routes (Class Management)
// ==========================================
Route::middleware(['auth', 'role:admin,teacher'])->prefix('admin')->name('admin.')->group(function () {
    // Classes Management
    Route::get('/dashboard', [ClassManagerController::class, 'index'])->name('dashboard');
    Route::get('/classes/{id}', [ClassManagerController::class, 'show'])->name('classes.show');
    Route::post('/classes', [ClassManagerController::class, 'store'])->name('classes.store');
    Route::put('/classes/{id}', [ClassManagerController::class, 'update'])->name('classes.update');
    Route::post('/classes/{id}/toggle-lock', [ClassManagerController::class, 'toggleLock'])->name('classes.toggle-lock');
    Route::post('/classes/{id}/students', [ClassManagerController::class, 'addStudent'])->name('classes.add-student');
    Route::delete('/classes/{id}/students/{userId}', [ClassManagerController::class, 'removeStudent'])->name('classes.remove-student');
    Route::get('/classes/{id}/students/{userId}/exam-result', [ClassManagerController::class, 'getStudentExamResult'])->name('classes.student-exam-result');
    Route::post('/classes/{id}/students/{userId}/grade-essay', [ClassManagerController::class, 'gradeEssayQuestion'])->name('classes.grade-essay');
    Route::delete('/classes/{id}', [ClassManagerController::class, 'destroy'])->name('classes.destroy');

    // Materials Management (Reading, Videos, Student Feedback)
    Route::get('/materials', [MaterialController::class, 'index'])->name('materials.index');
    Route::post('/materials', [MaterialController::class, 'store'])->name('materials.store');
    Route::put('/materials/{id}', [MaterialController::class, 'update'])->name('materials.update');
    Route::delete('/materials/{id}', [MaterialController::class, 'destroy'])->name('materials.destroy');
    Route::put('/feedbacks/{id}', [MaterialController::class, 'updateFeedback'])->name('feedbacks.update');

    // Media Library (Reusable Assets Management)
    Route::get('/media', [MediaController::class, 'index'])->name('media.index');
    Route::post('/media', [MediaController::class, 'store'])->name('media.store');
    Route::patch('/media/{id}', [MediaController::class, 'update'])->name('media.update');
    Route::delete('/media/{id}', [MediaController::class, 'destroy'])->name('media.destroy');

    // Courses Catalog Management (CRUD)
    Route::post('/materials/catalogs', [MaterialController::class, 'storeCatalog'])->name('materials.catalogs.store');
    Route::put('/materials/catalogs/{id}', [MaterialController::class, 'updateCatalog'])->name('materials.catalogs.update');
    Route::delete('/materials/catalogs/{id}', [MaterialController::class, 'destroyCatalog'])->name('materials.catalogs.destroy');

    // Question Bank Management
    Route::get('/questions', [QuestionBankController::class, 'index'])->name('questions.index');
    Route::post('/questions', [QuestionBankController::class, 'store'])->name('questions.store');
    Route::put('/questions/{id}', [QuestionBankController::class, 'update'])->name('questions.update');
    Route::delete('/questions/{id}', [QuestionBankController::class, 'destroy'])->name('questions.destroy');

    // Users & Roles Management
    Route::get('/users', [UserManagerController::class, 'index'])->name('users.index');
    Route::post('/users', [UserManagerController::class, 'store'])->name('users.store');
    Route::put('/users/{id}', [UserManagerController::class, 'update'])->name('users.update');
    Route::put('/users/{id}/password', [UserManagerController::class, 'updatePassword'])->name('users.password');
    Route::delete('/users/{id}', [UserManagerController::class, 'destroy'])->name('users.destroy');

    // Backward-compatible student routes
    Route::get('/students', fn () => redirect()->route('admin.users.index', ['role' => 'student']))->name('students.index');
    Route::post('/students', [UserManagerController::class, 'store'])->name('students.store');
    Route::put('/students/{id}/password', [UserManagerController::class, 'updatePassword'])->name('students.password');
});

// Profile Management (for all authenticated users)
Route::middleware('auth')->group(function () {
    Route::get('/admin/profile/edit', [ProfileController::class, 'edit'])->name('admin/profile.edit');
    Route::patch('/admin/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/admin/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// ==========================================
// Student Routes (Strict Sequential Learning)
// ==========================================
Route::middleware(['auth'])->prefix('student')->name('student.')->group(function () {
    Route::get('/dashboard', [StudentCourseController::class, 'dashboard'])->name('dashboard');
    Route::get('/classes/{classId}/lessons/{lessonId}', [StudentCourseController::class, 'showLesson'])->name('lesson');

    // Sequential Step Actions
    Route::post('/classes/{classId}/lessons/{lessonId}/reading-complete', [StudentCourseController::class, 'completeReading'])->name('reading.complete');
    Route::post('/classes/{classId}/lessons/{lessonId}/video-complete', [StudentCourseController::class, 'completeVideo'])->name('video.complete');
    Route::post('/classes/{classId}/lessons/{lessonId}/feedback', [StudentCourseController::class, 'submitFeedback'])->name('feedback.submit');

    // Practice Actions (Per Lesson)
    Route::post('/classes/{classId}/lessons/{lessonId}/practice-check', [StudentCourseController::class, 'checkPracticeAnswer'])->name('practice.check');
    Route::post('/classes/{classId}/lessons/{lessonId}/practice-record', [StudentCourseController::class, 'recordPracticeAttempt'])->name('practice.record');

    // Class Final Exam Actions (1 Exam Per Class)
    Route::get('/classes/{classId}/exam', [StudentCourseController::class, 'showClassExam'])->name('class.exam');
    Route::post('/classes/{classId}/exam/question-submit', [StudentCourseController::class, 'submitClassExamQuestion'])->name('class.exam.question-submit');
    Route::post('/classes/{classId}/exam-submit', [StudentCourseController::class, 'submitClassExam'])->name('class.exam.submit');
});

require __DIR__ . '/auth.php';
