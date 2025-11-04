<?php

namespace App\Http\Resources\Lupon;

use Illuminate\Http\Resources\Json\JsonResource;

class LuponAttachmentResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id'         => $this->id,
            'type'       => $this->type,
            'file_path'  => $this->file_path,
            'file_url'   => $this->file_url, // from model accessor
            'hearing_id' => $this->hearing_id,
            'created_at' => $this->created_at,
        ];
    }
}
