<?php

namespace App\Imports\Lupon;

use Carbon\Carbon;
use App\Models\Lupon\LuponCase;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use PhpOffice\PhpSpreadsheet\Shared\Date as ExcelDate;

class LuponCaseImport implements ToCollection, WithHeadingRow
{

    private int $rowCount = 0;

    public function collection(Collection $rows)
    {
        DB::transaction(function () use ($rows) {
            foreach ($rows as $row) {
                $this->rowCount++;
                // Skip if case type or complainant are missing
                if (empty($row['case']) && empty($row['case_'])) {
                    continue;
                }

                // Extract and normalize
                $caseNo = trim($row['case_#'] ?? $row['case_no'] ?? '');
                $caseType = strtoupper(trim($row['case'] ?? $row['case_'] ?? ''));
                $remarks = $row['remarks'] ?? null;

                Log::info($row['date_filed']);

                // Create Lupon Case
                $case = LuponCase::create([
                    'case_no'     => $caseNo,
                    'case_title'  => trim(($row['complainant'] ?? '') . ' vs ' . ($row['respondent'] ?? '')),
                    'case_type'   => $caseType,
                    'date_filed'  => $this->transformDate($row['date_filed']),
                    'mediator'    => null,
                    'remarks'     => $remarks,
                    'final_action' => null,
                ]);

                // Create Parties
                $parties = [];

                // Complainant
                if (!empty($row['complainant'])) {
                    $parties[] = [
                        'type'          => 1,
                        'name'          => trim($row['complainant']),
                        'address_line1' => $row['address'] ?? null,
                        'address_line2' => $row['address_comp_line_2'] ?? null,
                        'address_line3' => $row['address_comp_line_3'] ?? null,
                    ];
                }

                // Respondent
                if (!empty($row['respondent'])) {
                    $parties[] = [
                        'type'          => 2,
                        'name'          => trim($row['respondent']),
                        'address_line1' => $row['respondents_address'] ?? null,
                        'address_line2' => null,
                        'address_line3' => null,
                    ];
                }

                if (!empty($parties)) {
                    $case->parties()->createMany($parties);
                }

                // Create Hearings (sequence-based)
                $hearings = [];

                // 1st hearing
                if (!empty($row['hearing_date'])) {
                    $hearings[] = [
                        'sequence_no'   => 1,
                        'notice_date'   => null,
                        'hearing_date'  => $this->transformDate($row['hearing_date']),
                        'hearing_time'  => $this->transformDate($row['hearing_time']),
                        'remarks'       => null,
                        'proceedings'   => null,
                    ];
                }

                // 2nd hearing
                if (!empty($row['date_of_2nd_hearing'])) {
                    $hearings[] = [
                        'sequence_no'   => 2,
                        'notice_date'   => $this->transformDate($row['date_of_2nd_notice']),
                        'hearing_date'  => $this->transformDate($row['date_of_2nd_hearing']),
                        'hearing_time'  => $this->transformDate($row['time_of_2nd_hearing']),
                        'remarks'       => null,
                        'proceedings'   => null,
                    ];
                }

                // 3rd hearing
                if (!empty($row['date_of_3rd_hearing'])) {
                    $hearings[] = [
                        'sequence_no'   => 3,
                        'notice_date'   => $this->transformDate($row['date_of_3rd_notice']),
                        'hearing_date'  => $this->transformDate($row['date_of_3rd_hearing']),
                        'hearing_time'  => $this->transformDate($row['time_of_3rd_hearing']),
                        'remarks'       => null,
                        'proceedings'   => null,
                    ];
                }

                if (!empty($hearings)) {
                    $case->hearings()->createMany($hearings);
                }
            }
        });
    }

    public function getRowCount(): int
    {
        return $this->rowCount;
    }

    private function transformDate($value)
    {
        try {
            if (is_numeric($value)) {
                // Excel serial number → PHP DateTime
                return ExcelDate::excelToDateTimeObject($value);
            } elseif (!empty($value)) {
                return Carbon::parse($value);
            }
        } catch (\Exception $e) {
            return null;
        }

        return null;
    }
}
