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
            'lupon_case_id'  => $this->lupon_case_id,
            'sequence_no'    => $this->sequence_no,
            'notice_date'    => $this->notice_date,
            'hearing_date'   => $this->hearing_date,
            'hearing_time'   => $this->hearing_time,
            'remarks'        => $this->remarks,
            'proceedings'    => $this->proceedings,
            'created_by'     => $this->created_by,
            'updated_by'     => $this->updated_by,
            'attachments'    => LuponAttachmentResource::collection($this->whenLoaded('attachments')),
        ];
    }
}
