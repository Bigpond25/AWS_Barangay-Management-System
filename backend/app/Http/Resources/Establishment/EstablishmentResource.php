<?php

namespace App\Http\Resources\Establishment;

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
            'telephone' => $this->telephone,
            'nature_of_business' => $this->nature_of_business,
            'representative' => $this->representative,
            'position' => $this->position,
            'date_approved' => $this->date_approved,
            'date_of_last_renewal' => $this->date_of_last_renewal,
            'type' => $this->type,
            'status' => $this->status,
            'capitalization' => $this->capitalization,
            'remarks' => $this->remarks,
            'ctc_no' => $this->ctc_no,
            'date_issued' => $this->date_issued,
            'amount_paid' => $this->amount_paid,
            'clearance_fee' => $this->clearance_fee,
            'remarks_on_print_business' => $this->remarks_on_print_business,
            'date_of_retirement' => $this->date_of_retirement,
            'sign_wordings' => $this->sign_wordings,
            'size' => $this->size,
            'material' => $this->material,
            'sign_amount_paid' => $this->sign_amount_paid,
            'sign_date' => $this->sign_date,
            'sign_or' => $this->sign_or,
            'custom_date' => $this->custom_date,
            'custom_paid' => $this->custom_paid,
            'custom_or' => $this->custom_or,
            'date_retirement_clearance' => $this->date_retirement_clearance,
            'personal_clearance_fee' => $this->personal_clearance_fee,
            'retirement_clearance' => $this->retirement_clearance,
            'docs_attachment' => $this->docs_attachment,
            'barangay_clearances_new' => $this->withBarangayClearancesNew(),
            'barangay_clearances_renewal' => $this->withBarangayClearancesRenewal(),
            'signature' => $this->signature,
            'created_by' => $this->created_by,
            'creator' => $this->whenLoaded('creator', function () {
                return [
                    'id' => $this->creator->id,
                    'name' => $this->creator->name,
                ];
            }),
            'updated_by' => $this->updated_by,
        ];
    }

    private function withBarangayClearancesNew()
    {
        return $this->whenLoaded('barangayClearancesNew', function () {
            return $this->barangayClearancesNew->map(function ($clearance) {
                return [
                    'id' => $clearance->id,
                    'applicant_name' => $clearance->applicant_name,
                    'business_name' => $clearance->business_name,
                    'location' => $clearance->location,
                    'issued_date' => $clearance->issued_date ? Carbon::parse($clearance->issued_date)->format('F d, Y') : null,
                    'ownership' => $clearance->ownership,
                    'record_no' => $clearance->record_no,
                    'clearance_fee' => $clearance->clearance_fee,
                    'or_no' => $clearance->or_no,
                    'remarks' => $clearance->remarks,
                    'file_name' => $clearance->file_name,
                    'issued_by' => $clearance->issuedByUser ? $clearance->issuedByUser->name : null,
                    'created_at' => $clearance->created_at ? Carbon::parse($clearance->created_at)->format('F d, Y g:i A') : null,
                    'updated_at' => $clearance->updated_at ? Carbon::parse($clearance->updated_at)->format('F d, Y g:i A') : null,
                ];
            });
        });
    }

    private function withBarangayClearancesRenewal()
    {
        return $this->whenLoaded('barangayClearancesRenewal', function () {
            return $this->barangayClearancesRenewal->map(function ($clearance) {
                return [
                    'id' => $clearance->id,
                    'applicant_name' => $clearance->applicant_name,
                    'business_name' => $clearance->business_name,
                    'location' => $clearance->location,
                    'issued_date' => $clearance->issued_date ? Carbon::parse($clearance->issued_date)->format('F d, Y') : null,
                    'ownership' => $clearance->ownership,
                    'record_no' => $clearance->record_no,
                    'clearance_fee' => $clearance->clearance_fee,
                    'or_no' => $clearance->or_no,
                    'remarks' => $clearance->remarks,
                    'file_name' => $clearance->file_name,
                    'issued_by' => $clearance->issuedByUser ? $clearance->issuedByUser->name : null,
                    'created_at' => $clearance->created_at ? Carbon::parse($clearance->created_at)->format('F d, Y g:i A') : null,
                    'updated_at' => $clearance->updated_at ? Carbon::parse($clearance->updated_at)->format('F d, Y g:i A') : null,
                ];
            });
        });
    }
}
