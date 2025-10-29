<?php

namespace App\Http\Resources\Shooting;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ShootingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'date_of_application' => $this->date_of_application,
            'name_of_outfit' => $this->name_of_outfit,
            'program_title' => $this->program_title,
            'location' => $this->location,
            'time' => $this->time,
            'date_of_shooting' => $this->date_of_shooting,
            'requested_by' => $this->requested_by,
            'or_no' => $this->or_no,
            'amount_paid' => $this->amount_paid,
            'remarks' => $this->remarks,
            'created_at' => $this->created_at,
        ];
    }
}
