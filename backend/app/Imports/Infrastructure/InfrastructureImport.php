<?php

namespace App\Imports\Infrastructure;

use App\Models\Infrastructure\Infrastructure;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Carbon\Carbon;

class InfrastructureImport implements ToModel, WithHeadingRow, WithValidation
{
    private int $rowCount = 0;

    public function model(array $row)
    {
        $this->rowCount++;

        // Convert Excel date if needed
        $date = $this->transformDate($row['date_of_application'] ?? null);

        return new Infrastructure([
            'date_of_application'      => $date,
            'type_of_project'          => $row['type_of_project'] ?? null,
            'classification'           => $row['classification'] ?? null,
            'name_of_applicant'        => $row['name_of_applicant'] ?? null,
            'address_of_applicant'     => $row['address_of_applicant'] ?? null,
            'applicant_contact_no'     => $row['applicant_contact_no'] ?? null,
            'applicants_representative' => $row['applicants_representative'] ?? null,
            'location_of_project'      => $row['location_of_project'] ?? null,
            'property_owner'           => $row['property_owner'] ?? null,
            'contractor'               => $row['contractor'] ?? null,
            'contractors_address'      => $row['contractors_address'] ?? null,
            'contractors_contact_person' => $row['contractors_contact_person'] ?? null,
            'contractors_contact_no'   => $row['contractors_contact_no'] ?? null,
            'remarks_on_clearance'     => $row['remarks_on_clearance'] ?? null,
            'remarks_hidden'           => $row['remarks_hidden'] ?? null,
            'bond_amount_words'        => $row['bond_amount_words'] ?? null,
            'bond_amount_figure'       => isset($row['bond_amount_figure'])
                ? (float) $row['bond_amount_figure']
                : null,
            'created_by'               => Auth::user()->id,
        ]);
    }

    public function rules(): array
    {
        return [
            '*.type_of_project'     => ['nullable', 'string', 'max:1000'],
            '*.classification'      => ['nullable', 'string', 'max:1000'],
            '*.name_of_applicant'   => ['nullable', 'string', 'max:1000'],
            '*.address_of_applicant' => ['nullable', 'string', 'max:1000'],
            '*.applicant_contact_no' => ['nullable', 'string', 'max:1000'],
            '*.location_of_project' => ['nullable', 'string', 'max:1000'],
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
                // Excel date serial
                return \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject($value);
            } elseif (!empty($value)) {
                return Carbon::parse($value);
            }
        } catch (\Exception $e) {
            return null;
        }

        return null;
    }
}
