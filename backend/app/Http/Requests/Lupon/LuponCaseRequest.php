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
            'case_title' => ['required', 'string', 'max:255'],
            'date_filed' => ['required', 'date'],
            'mediator' => ['nullable', 'string', 'max:255'],
            'remarks' => ['nullable', 'string'],
            'final_action' => ['nullable', 'string'],

            'parties' => ['array'],
            'parties.*.type' => ['required_with:parties', 'in:complainant,respondent'],
            'parties.*.name' => ['required_with:parties', 'string', 'max:255'],
            'parties.*.address' => ['nullable', 'string'],

            'hearings' => ['array'],
            'hearings.*.hearing_no' => ['nullable', 'integer'],
            'hearings.*.hearing_date' => ['nullable', 'date'],
            'hearings.*.hearing_time' => ['nullable', 'date_format:H:i'],
            'hearings.*.notice_date' => ['nullable', 'date'],
        ];
    }
}
