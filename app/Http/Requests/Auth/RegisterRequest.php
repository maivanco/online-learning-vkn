<?php

declare(strict_types=1);

namespace App\Http\Requests\Auth;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\Validator;

class RegisterRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // Personal Information
            'full_name' => ['required', 'string', 'min:2', 'max:255'],
            'date_of_birth' => ['required', 'date', 'before:today'],
            'gender' => ['required', 'string', 'in:male,female,other'],
            'phone' => ['required', 'string', 'regex:/^[0-9+\-\s()]{7,20}$/'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:'.User::class.',email'],
            'refuge_in_triple_gem' => ['required', 'boolean'],
            'dharma_name' => ['nullable', 'string', 'max:255'],

            // Buddhist Studies Information
            'student_type' => ['required', 'string', 'in:layperson,monastic'],
            'ordination_status' => [
                'required_if:student_type,monastic',
                'nullable',
                'string',
                'in:female_novice,male_novice,sikkhamana,bhikkhu,bhikkhuni',
            ],
            'ordination_date' => [
                'required_if:student_type,monastic',
                'nullable',
                'date',
                'before:today',
            ],
            'ordination_place' => ['required_if:student_type,monastic', 'nullable', 'string', 'max:255'],
            'preceptor_teacher' => ['required_if:student_type,monastic', 'nullable', 'string', 'max:255'],
            'current_residence' => ['required_if:student_type,monastic', 'nullable', 'string', 'max:255'],

            // Academic Information
            'study_purposes' => ['required', 'array', 'min:1'],
            'study_purposes.*' => [
                'string',
                'in:basic_buddhist_studies,pali_canon_studies,advanced_buddhist_studies,supplement_buddhist_knowledge,support_practice_and_dharma_propagation,other',
            ],
            'other_study_purpose' => ['nullable', 'string', 'max:500'],
            'buddhist_study_level' => [
                'required',
                'string',
                'in:none,beginner,intermediate,advanced,previously_studied',
            ],
            'previous_buddhist_programs' => ['nullable', 'string', 'max:1000'],

            // Account Credentials
            'username' => [
                'required',
                'string',
                'min:3',
                'max:50',
                'regex:/^[a-zA-Z0-9_\-]+$/',
                'unique:'.User::class.',username',
            ],
            'password' => ['required', 'confirmed', Password::defaults()],

            // Confirmation & Agreement
            'confirm_information' => ['accepted'],
            'agree_to_rules' => ['accepted'],
        ];
    }

    /**
     * Configure additional validation hooks.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $purposes = $this->input('study_purposes', []);
            if (is_array($purposes) && in_array('other', $purposes, true)) {
                $otherText = trim((string) $this->input('other_study_purpose', ''));
                if ($otherText === '') {
                    $validator->errors()->add(
                        'other_study_purpose',
                        __('validation.required', ['attribute' => __('auth.other_study_purpose')])
                    );
                }
            }
        });
    }
}
