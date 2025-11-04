<?php

namespace App\Http\Resources\Lupon;

use Illuminate\Http\Resources\Json\JsonResource;

class LuponPartyResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id'        => $this->id,
            'type'      => $this->type, // complainant | respondent
            'name'      => $this->name,
            'address'   => $this->address,
            'created_at' => $this->created_at,
        ];
    }
}
