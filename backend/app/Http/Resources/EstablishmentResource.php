<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Carbon;

class EstablishmentResource extends JsonResource
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
            'business_name' => $this->business_name,
            'room_unit' => $this->room_unit,
            'building' => $this->building,
            'no' => $this->no,
            'location' => $this->location,
            'owner' => $this->owner,
            'nature_of_business' => $this->nature_of_business,
            'date_approved' => $this->date_approved ? Carbon::parse($this->date_approved)->format('F d, Y g:i A') : null,
            'date_of_last_renewal' => $this->date_of_last_renewal ? Carbon::parse($this->date_of_last_renewal)->format('F d, Y g:i A') : null,
            'remarks_on_print_business' => $this->remarks_on_print_business,
            'date_of_retirement' => $this->date_of_retirement ? Carbon::parse($this->date_of_retirement)->format('F d, Y g:i A') : null,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
