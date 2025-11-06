<?php

namespace App\Http\Resources\Lupon;

use Illuminate\Http\Resources\Json\JsonResource;

class LuponPartyResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id'        => $this->id,
            'type' => $this->type,
            'name' => $this->name,
            'address_line1' => $this->address_line1,
            'address_line2' => $this->address_line2,
            'address_line3' => $this->address_line3,
            'created_by' => $this->created_by,
            'updated_by' => $this->updated_by,
        ];
    }
}
