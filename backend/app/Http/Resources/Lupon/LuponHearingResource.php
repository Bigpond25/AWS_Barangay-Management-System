<?php

namespace App\Http\Resources\Lupon;

use Illuminate\Support\Carbon;
use Illuminate\Http\Resources\Json\JsonResource;

class LuponHearingResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id'             => $this->id,
            'hearing_no'     => $this->hearing_no,
            'hearing_date'   => $this->hearing_date,
            'hearing_time'   => $this->hearing_time ? Carbon::parse($this->hearing_time)->format('H:i') : null,
            'notice_date'    => $this->notice_date,
            'address_line_2' => $this->address_line_2,
            'address_line_3' => $this->address_line_3,
            'attachments'    => LuponAttachmentResource::collection($this->whenLoaded('attachments')),
            'created_at'     => $this->created_at,
        ];
    }
}
