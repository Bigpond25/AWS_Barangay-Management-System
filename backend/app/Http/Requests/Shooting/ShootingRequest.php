<?php

namespace App\Http\Requests\Shooting;

use Illuminate\Foundation\Http\FormRequest;

class ShootingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'date_of_application' => ['nullable', 'date'],
            'name_of_outfit'      => ['nullable', 'string', 'max:1000'],
            'program_title'       => ['nullable', 'string', 'max:1000'],
            'location'            => ['nullable', 'string', 'max:1000'],
            'time'                => ['nullable', 'string', 'max:255'],
            'date_of_shooting'    => ['nullable', 'date'],
            'requested_by'        => ['nullable', 'string', 'max:1000'],
            'or_no'               => ['nullable', 'string', 'max:255'],
            'amount_paid'         => ['nullable', 'numeric'],
            'remarks'             => ['nullable', 'string'],
        ];
    }
}
