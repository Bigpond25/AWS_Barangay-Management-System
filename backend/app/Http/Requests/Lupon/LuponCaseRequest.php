<?php

namespace App\Http\Requests\Lupon;

use Illuminate\Foundation\Http\FormRequest;

class LuponCaseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'case_no' => ['required', 'string', 'max:100'],
            'case_type' => ['required', 'string', 'max:100'],
            'case_title' => ['required', 'string', 'max:255'],
            'date_filed' => ['required', 'date'],
            'mediator' => ['nullable', 'string', 'max:255'],
            'remarks' => ['nullable', 'string'],
            'final_action' => ['nullable', 'string'],

            'parties' => ['array'],
            'parties.*.type' => ['required_with:parties', 'in:1,2'],
            'parties.*.name' => ['required_with:parties', 'string', 'max:255'],
            'parties.*.address_line1' => ['nullable', 'string'],
            'parties.*.address_line2' => ['nullable', 'string'],
            'parties.*.address_line3' => ['nullable', 'string'],

            'hearings' => ['array'],
            'hearings.*.hearing_no' => ['nullable', 'integer'],
            'hearings.*.hearing_date' => ['nullable', 'date'],
            'hearings.*.hearing_time' => ['nullable'],
            'hearings.*.notice_date' => ['nullable', 'date'],
            'hearings.*.remarks' => ['nullable', 'string'],
            'hearings.*.proceedings' => ['nullable', 'string'],
        ];
    }
}
