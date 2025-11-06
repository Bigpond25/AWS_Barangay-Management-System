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
            'telephone' => 'nullable|string|max:255',
            'room_unit' => 'nullable|string|max:255',
            'building' => 'nullable|string|max:255',
            'no' => 'nullable|string|max:255',
            'location' => 'nullable|string|max:255',
            'owner' => 'nullable|string|max:255',
            'nature_of_business' => 'nullable|string|max:255',
            'date_approved' => 'nullable|date',
            'date_of_last_renewal' => 'nullable|date',
            'date_of_retirement' => 'nullable|date',
            // 'docs_attachment' => 'nullable|array',
            'signature' => 'nullable|string|max:255',
            'representative' => 'nullable|string|max:255',
            'position' => 'nullable|string|max:255',
            'type' => 'nullable|string|max:255',
            'status' => 'nullable|string|max:255',
            'capitalization' => 'nullable|string|max:255',
            'remarks' => 'nullable|string|max:255',
            'ctc_no' => 'nullable|string|max:255',
            'date_issued' => 'nullable|date',
            'amount_paid' => 'nullable|string|max:255',
            'clearance_fee' => 'nullable|string|max:255',
            'remarks_on_print_business' => 'nullable|string|max:255',
            'date_of_retirement' => 'nullable|date',
            'sign_wordings' => 'nullable|string|max:255',
            'size' => 'nullable|string|max:255',
            'material' => 'nullable|string|max:255',
            'sign_amount_paid' => 'nullable|string|max:255',
            'sign_date' => 'nullable|date',
            'sign_or' => 'nullable|string|max:255',
            'custom_date' => 'nullable|date',
            'custom_paid' => 'nullable|string|max:255',
            'custom_or' => 'nullable|string|max:255',
            'date_retirement_clearance' => 'nullable|date',
            'personal_clearance_fee' => 'nullable|string|max:255',
            'retirement_clearance' => 'nullable|string|max:255',
        ];
    }
}
