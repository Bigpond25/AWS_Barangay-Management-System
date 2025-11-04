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
            $case = LuponCase::create([
                'case_no' => $data['case_no'] ?? null,
                'case_title' => $data['case_title'] ?? null,
                'date_filed' => $data['date_filed'] ?? null,
                'mediator' => $data['mediator'] ?? null,
                'remarks' => $data['remarks'] ?? null,
                'final_action' => $data['final_action'] ?? null,
                'created_by' => $data['created_by'] ?? null,
            ]);

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
                foreach ($data['hearings'] as $hearing) {
                    $case->hearings()->create([
                        'sequence_no' => $hearing['sequence_no'] ?? 1,
                        'notice_date' => $hearing['notice_date'] ?? null,
                        'hearing_date' => $hearing['hearing_date'] ?? null,
                        'hearing_time' => $hearing['hearing_time'] ?? null,
                        'remarks' => $hearing['remarks'] ?? null,
                        'proceedings' => $hearing['proceedings'] ?? null,
                        'created_by' => $hearing['created_by'] ?? $data['created_by'] ?? null,
                    ]);
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
            $case->update([
                'case_no' => $data['case_no'] ?? $case->case_no,
                'case_title' => $data['case_title'] ?? $case->case_title,
                'date_filed' => $data['date_filed'] ?? $case->date_filed,
                'mediator' => $data['mediator'] ?? $case->mediator,
                'remarks' => $data['remarks'] ?? $case->remarks,
                'final_action' => $data['final_action'] ?? $case->final_action,
            ]);

            // Optionally handle nested updates later (for now, we don't overwrite)
            return $case->fresh(['parties', 'hearings', 'attachments']);
        });
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
