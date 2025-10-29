<?php

namespace App\Http\Requests\Infrastructure;

use Illuminate\Foundation\Http\FormRequest;

class InfrastructureRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'date_of_application'          => ['nullable', 'date'],
            'type_of_project'              => ['nullable', 'string', 'max:255'],
            'classification'               => ['nullable', 'string', 'max:255'],
            'name_of_applicant'            => ['nullable', 'string', 'max:1000'],
            'address_of_applicant'         => ['nullable', 'string', 'max:1000'],
            'applicant_contact_no'         => ['nullable', 'string', 'max:1000'],
            'applicants_representative'    => ['nullable', 'string', 'max:1000'],
            'location_of_project'          => ['nullable', 'string', 'max:1000'],
            'property_owner'               => ['nullable', 'string', 'max:1000'],
            'contractor'                   => ['nullable', 'string', 'max:1000'],
            'contractors_address'          => ['nullable', 'string', 'max:1000'],
            'contractors_contact_person'   => ['nullable', 'string', 'max:1000'],
            'contractors_contact_no'       => ['nullable', 'string', 'max:1000'],
            'remarks_on_clearance'         => ['nullable', 'string'],
            'remarks_hidden'               => ['nullable', 'string'],
            'bond_amount_words'            => ['nullable', 'string', 'max:1000'],
            'bond_amount_figure'           => ['nullable', 'numeric', 'min:0'],
        ];
    }
}
