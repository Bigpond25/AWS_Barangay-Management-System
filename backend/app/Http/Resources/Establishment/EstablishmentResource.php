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
            'nature_of_business' => $this->nature_of_business,
            'date_approved' => $this->date_approved ? Carbon::parse($this->date_approved)->format('F d, Y g:i A') : null,
            'date_of_last_renewal' => $this->date_of_last_renewal ? Carbon::parse($this->date_of_last_renewal)->format('F d, Y g:i A') : null,
            'remarks_on_print_business' => $this->remarks_on_print_business,
            'date_of_retirement' => $this->date_of_retirement ? Carbon::parse($this->date_of_retirement)->format('F d, Y g:i A') : null,
            'barangay_clearances_new' => $this->withBarangayClearancesNew(),
            'barangay_clearances_renewal' => $this->withBarangayClearancesRenewal(),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
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
