<?php

namespace App\Services\Lupon;

use App\Models\Lupon\LuponCase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;
use App\Imports\Lupon\LuponCaseImport;

class LuponCaseService
{
    /**
     * Paginated list of Lupon cases with optional search.
     */
    public function list(?string $search = null, int $perPage = 15)
    {
        return LuponCase::query()
            ->with(['parties', 'hearings', 'attachments', 'creator'])
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('case_no', 'ILIKE', "%{$search}%")
                        ->orWhere('case_type', 'ILIKE', "%{$search}%")
                        ->orWhere('case_title', 'ILIKE', "%{$search}%")
                        ->orWhere('mediator', 'ILIKE', "%{$search}%")
                        ->orWhere('remarks', 'ILIKE', "%{$search}%");
                });
            })
            ->latest()
            ->paginate($perPage);
    }

    /**
     * Create a new Lupon case with nested relations.
     */
    public function store(array $data): LuponCase
    {
        return DB::transaction(function () use ($data) {
            // Create main case
            $case = LuponCase::create($data);

            // Parties
            if (!empty($data['parties'])) {
                foreach ($data['parties'] as $party) {
                    $case->parties()->create([
                        'type' => $party['type'] ?? 'complainant',
                        'name' => $party['name'] ?? '',
                        'address_line1' => $party['address_line1'] ?? null,
                        'address_line2' => $party['address_line2'] ?? null,
                        'address_line3' => $party['address_line3'] ?? null,
                        'created_by' => $party['created_by'] ?? $data['created_by'] ?? null,
                    ]);
                }
            }

            // Hearings
            if (!empty($data['hearings'])) {
                $sequenceNo = 1;
                foreach ($data['hearings'] as $hearing) {
                    $case->hearings()->create([
                        'sequence_no' => $hearing['sequence_no'] ?? $sequenceNo,
                        'notice_date' => $hearing['notice_date'] ?? null,
                        'hearing_date' => $hearing['hearing_date'] ?? null,
                        'hearing_time' => $hearing['hearing_time'] ?? null,
                        'remarks' => $hearing['remarks'] ?? null,
                        'proceedings' => $hearing['proceedings'] ?? null,
                        'created_by' => $hearing['created_by'] ?? $data['created_by'] ?? null,
                    ]);
                    $sequenceNo++;
                }
            }

            // Attachments
            if (!empty($data['attachments'])) {
                foreach ($data['attachments'] as $attachment) {
                    $case->attachments()->create([
                        'file_name' => $attachment['file_name'] ?? '',
                        'file_path' => $attachment['file_path'] ?? '',
                        'file_type' => $attachment['file_type'] ?? null,
                        'description' => $attachment['description'] ?? null,
                        'lupon_hearing_id' => $attachment['lupon_hearing_id'] ?? null,
                        'created_by' => $attachment['created_by'] ?? $data['created_by'] ?? null,
                    ]);
                }
            }

            return $case->load(['parties', 'hearings', 'attachments']);
        });
    }

    /**
     * Update an existing Lupon case.
     */
    public function update(LuponCase $case, array $data): LuponCase
    {
        return DB::transaction(function () use ($case, $data) {
            // Update main case
            $case->update($data);

            // Handle parties
            if (isset($data['parties'])) {
                $this->syncParties($case, $data['parties']);
            }

            // Handle hearings
            if (isset($data['hearings'])) {
                $this->syncHearings($case, $data['hearings']);
            }

            // Handle attachments
            if (isset($data['attachments'])) {
                $this->syncAttachments($case, $data['attachments']);
            }

            return $case->fresh(['parties', 'hearings', 'attachments']);
        });
    }

    /**
     * Sync parties for the case
     */
    private function syncParties(LuponCase $case, array $parties): void
    {
        $existingPartyIds = [];

        foreach ($parties as $partyData) {
            if (isset($partyData['id'])) {
                // Update existing party
                $party = $case->parties()->where('id', $partyData['id'])->first();
                if ($party) {
                    $party->update([
                        'type' => $partyData['type'] ?? $party->type,
                        'name' => $partyData['name'] ?? $party->name,
                        'address_line1' => $partyData['address_line1'] ?? $party->address_line1,
                        'address_line2' => $partyData['address_line2'] ?? $party->address_line2,
                        'address_line3' => $partyData['address_line3'] ?? $party->address_line3,
                        'updated_by' => $data['updated_by'] ?? $party->updated_by,
                    ]);
                    $existingPartyIds[] = $partyData['id'];
                }
            } else {
                // Create new party
                $newParty = $case->parties()->create([
                    'type' => $partyData['type'] ?? 'complainant',
                    'name' => $partyData['name'] ?? '',
                    'address_line1' => $partyData['address_line1'] ?? null,
                    'address_line2' => $partyData['address_line2'] ?? null,
                    'address_line3' => $partyData['address_line3'] ?? null,
                    'created_by' => $partyData['created_by'] ?? $data['created_by'] ?? null,
                ]);
                $existingPartyIds[] = $newParty->id;
            }
        }

        // Delete parties that were removed from the frontend
        $case->parties()->whereNotIn('id', $existingPartyIds)->delete();
    }

    /**
     * Sync hearings for the case
     */
    private function syncHearings(LuponCase $case, array $hearings): void
    {
        $existingHearingIds = [];
        $sequenceNo = 1;
        foreach ($hearings as $hearingData) {

            if (isset($hearingData['id'])) {
                // Update existing hearing
                $hearing = $case->hearings()->where('id', $hearingData['id'])->first();
                if ($hearing) {
                    $hearing->update([
                        'sequence_no' => $hearingData['sequence_no'] ?? $hearing->sequence_no,
                        'notice_date' => $hearingData['notice_date'] ?? $hearing->notice_date,
                        'hearing_date' => $hearingData['hearing_date'] ?? $hearing->hearing_date,
                        'hearing_time' => $hearingData['hearing_time'] ?? $hearing->hearing_time,
                        'remarks' => $hearingData['remarks'] ?? $hearing->remarks,
                        'proceedings' => $hearingData['proceedings'] ?? $hearing->proceedings,
                        'updated_by' => $data['updated_by'] ?? $hearing->updated_by,
                    ]);
                    $existingHearingIds[] = $hearingData['id'];
                }
            } else {
                // Create new hearing
                $newHearing = $case->hearings()->create([
                    'sequence_no' => $hearingData['sequence_no'] ?? $sequenceNo,
                    'notice_date' => $hearingData['notice_date'] ?? null,
                    'hearing_date' => $hearingData['hearing_date'] ?? null,
                    'hearing_time' => $hearingData['hearing_time'] ?? null,
                    'remarks' => $hearingData['remarks'] ?? null,
                    'proceedings' => $hearingData['proceedings'] ?? null,
                    'created_by' => $hearingData['created_by'] ?? $data['created_by'] ?? null,
                ]);
                $existingHearingIds[] = $newHearing->id;
            }

            $sequenceNo++;
        }

        // Delete hearings that were removed from the frontend
        $case->hearings()->whereNotIn('id', $existingHearingIds)->delete();
    }

    /**
     * Sync attachments for the case
     */
    private function syncAttachments(LuponCase $case, array $attachments): void
    {
        $existingAttachmentIds = [];

        foreach ($attachments as $attachmentData) {
            if (isset($attachmentData['id'])) {
                // Keep existing attachment
                $attachment = $case->attachments()->where('id', $attachmentData['id'])->first();
                if ($attachment) {
                    // Update description if provided
                    if (isset($attachmentData['description'])) {
                        $attachment->update([
                            'description' => $attachmentData['description'],
                            'updated_by' => $data['updated_by'] ?? $attachment->updated_by,
                        ]);
                    }
                    $existingAttachmentIds[] = $attachmentData['id'];
                }
            } else {
                // Create new attachment (assuming file has been uploaded and path is provided)
                $newAttachment = $case->attachments()->create([
                    'file_name' => $attachmentData['file_name'] ?? '',
                    'file_path' => $attachmentData['file_path'] ?? '',
                    'file_type' => $attachmentData['file_type'] ?? null,
                    'description' => $attachmentData['description'] ?? null,
                    'lupon_hearing_id' => $attachmentData['lupon_hearing_id'] ?? null,
                    'created_by' => $attachmentData['created_by'] ?? $data['created_by'] ?? null,
                ]);
                $existingAttachmentIds[] = $newAttachment->id;
            }
        }

        // Delete attachments that were removed from the frontend
        $case->attachments()->whereNotIn('id', $existingAttachmentIds)->delete();
    }

    /**
     * Delete a case and cascade its relations.
     */
    public function delete(LuponCase $case): bool
    {
        return $case->delete();
    }

    /**
     * (Optional) Import cases from Excel/CSV.
     */
    public function importExcel(UploadedFile $file): int
    {
        $import = new LuponCaseImport();
        Excel::import($import, $file);

        return $import->getRowCount();
    }
}
