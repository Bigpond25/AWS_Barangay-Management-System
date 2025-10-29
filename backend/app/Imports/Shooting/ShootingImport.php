<?php

namespace App\Imports\Shooting;

use Carbon\Carbon;
use App\Models\Shooting\Shooting;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use PhpOffice\PhpSpreadsheet\Shared\Date as ExcelDate;

class ShootingImport implements ToModel, WithHeadingRow, WithValidation
{
    private int $rowCount = 0;

    public function model(array $row)
    {
        $this->rowCount++;

        return new Shooting([
            'date_of_application' => $this->transformDate($row['date_of_application'] ?? null),
            'name_of_outfit'      => $row['name_of_outfit'] ?? null,
            'program_title'       => $row['program_title'] ?? null,
            'location'            => $row['location'] ?? null,
            'time'                => $row['time'] ?? null,
            'date_of_shooting'    => $this->transformDate($row['date_of_shooting'] ?? null),
            'requested_by'        => $row['requested_by'] ?? null,
            'or_no'               => $row['or_no'] ?? null,
            'amount_paid'         => isset($row['amount_paid'])
                ? (float) $row['amount_paid']
                : null,
            'remarks'             => $row['remarks'] ?? null,
            'created_by'          => Auth::id(),
        ]);
    }

    public function rules(): array
    {
        return [
            '*.date_of_application' => ['nullable'],
            '*.name_of_outfit'      => ['nullable', 'string', 'max:255'],
            '*.program_title'       => ['nullable', 'string', 'max:255'],
            '*.location'            => ['nullable', 'string', 'max:255'],
            '*.time'                => ['nullable', 'string', 'max:255'],
            '*.date_of_shooting'    => ['nullable'],
            '*.requested_by'        => ['nullable', 'string', 'max:255'],
            '*.or_no'               => ['nullable', 'string', 'max:255'],
            '*.amount_paid'         => ['nullable', 'numeric'],
            '*.remarks'             => ['nullable', 'string'],
        ];
    }

    public function getRowCount(): int
    {
        return $this->rowCount;
    }

    /**
     * Convert Excel serial or text date into Carbon instance
     */
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
