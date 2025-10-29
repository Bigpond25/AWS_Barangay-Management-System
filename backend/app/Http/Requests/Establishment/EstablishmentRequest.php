<?php

namespace App\Http\Requests\Establishment;

use Illuminate\Foundation\Http\FormRequest;

class EstablishmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'business_name' => 'required|string|max:255',
            'location' => 'nullable|string|max:255',
            'owner' => 'nullable|string|max:255',
            'nature_of_business' => 'nullable|string|max:255',
            'date_approved' => 'nullable|date',
            'date_of_last_renewal' => 'nullable|date',
            'date_of_retirement' => 'nullable|date',
            'docs_attachment' => 'nullable|array',
        ];
    }
}
