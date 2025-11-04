<?php

namespace App\Http\Resources\Lupon;

use Illuminate\Http\Request;
use App\Http\Resources\Lupon\LuponPartyResource;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\Lupon\LuponHearingResource;
use App\Http\Resources\Lupon\LuponAttachmentResource;

class LuponCaseResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'case_no'       => $this->case_no,
            'case_title'    => $this->case_title,
            'case_type'     => $this->case_type,
            'date_filed'    => $this->date_filed,
            'mediator'      => $this->mediator,
            'remarks'       => $this->remarks,
            'final_action'  => $this->final_action,
            'created_by'    => $this->created_by,
            'updated_by'    => $this->updated_by,
            'created_at'    => $this->created_at,
            'updated_at'    => $this->updated_at,
            
            'creator' => $this->whenLoaded('creator'),
            'parties' => LuponPartyResource::collection($this->whenLoaded('parties')),
            'hearings' => LuponHearingResource::collection($this->whenLoaded('hearings')),
            'attachments' => LuponAttachmentResource::collection($this->whenLoaded('attachments')),
        ];
    }
}
