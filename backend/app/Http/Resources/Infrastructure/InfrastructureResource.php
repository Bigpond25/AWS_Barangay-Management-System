<?php

namespace App\Http\Resources\Infrastructure;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InfrastructureResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'date_of_application'       => $this->date_of_application,
            'type_of_project'           => $this->type_of_project,
            'classification'            => $this->classification,
            'name_of_applicant'         => $this->name_of_applicant,
            'address_of_applicant'      => $this->address_of_applicant,
            'applicant_contact_no'      => $this->applicant_contact_no,
            'applicants_representative' => $this->applicants_representative,
            'location_of_project'       => $this->location_of_project,
            'property_owner'            => $this->property_owner,
            'contractor'                => $this->contractor,
            'contractors_address'       => $this->contractors_address,
            'contractors_contact_person' => $this->contractors_contact_person,
            'contractors_contact_no'    => $this->contractors_contact_no,
            'remarks_on_clearance'      => $this->remarks_on_clearance,
            'remarks_hidden'            => $this->remarks_hidden,
            'bond_amount_words'         => $this->bond_amount_words,
            'bond_amount_figure'        => $this->bond_amount_figure,

            'created_by' => $this->created_by,
            'updated_by' => $this->updated_by,

            'created_at' => $this->created_at?->toDateTimeString(),
            'updated_at' => $this->updated_at?->toDateTimeString(),
        ];
    }
}
