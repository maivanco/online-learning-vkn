<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class ImportQuestionsRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->isTeacherOrAdmin() ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'course_id' => ['required', 'integer', 'exists:courses,id'],
            'lesson_id' => ['required', 'integer', 'exists:lessons,id'],
            'file' => ['required', 'file', 'mimes:xlsx,xls,csv', 'max:10240'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'course_id.required' => __('questions.error_course_required', [], 'Please select a course for importing questions.'),
            'lesson_id.required' => __('questions.error_lesson_required', [], 'Please select a lesson to import questions into.'),
            'file.required' => __('questions.error_file_required', [], 'Please select an Excel file (.xlsx) to upload.'),
            'file.mimes' => __('questions.error_file_mimes', [], 'The file must be an Excel spreadsheet (.xlsx, .xls) or CSV.'),
            'file.max' => __('questions.error_file_max', [], 'The file size must not exceed 10MB.'),
        ];
    }
}
