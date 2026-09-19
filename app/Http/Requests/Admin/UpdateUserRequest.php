<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $role = $this->input('role');
        if ($role === 'administrator') {
            $role = 'admin';
        }

        $this->merge([
            'role' => $role,
            'username' => $this->input('username') ? trim((string) $this->input('username')) : null,
            'phone' => $this->input('phone') ? trim((string) $this->input('phone')) : null,
        ]);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $userId = (int) $this->route('id');

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,' . $userId],
            'role' => ['required', 'string', 'in:admin,teacher,student'],
            'phone' => ['nullable', 'string', 'max:20'],
            'username' => ['nullable', 'string', 'max:50', 'unique:users,username,' . $userId],
            'status' => ['required', 'string', 'in:active,inactive'],
        ];
    }
}
