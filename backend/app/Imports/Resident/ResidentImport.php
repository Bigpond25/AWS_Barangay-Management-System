<?php

namespace App\Imports\Resident;

use Carbon\Carbon;
use App\Models\Resident;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use App\Models\Schemas\ResidentSchema;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\SkipsOnFailure;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Validators\Failure;
use PhpOffice\PhpSpreadsheet\Shared\Date as ExcelDate;

class ResidentImport implements ToModel, WithHeadingRow, WithValidation, SkipsOnFailure
{
    private int $rowCount = 0;

    public function model(array $row)
    {
        $this->rowCount++;

        // Convert Excel date or text date
        $birthDate = $this->transformDate($row['birthday'] ?? null);

        return new Resident([
            // Basic Info
            'first_name'  => $row['first_name'] ?? null,
            'last_name'   => $row['surname'] ?? null,
            'middle_name' => $row['middle_name'] ?? null,
            'suffix'      => null, //  Missing from Excel — maybe include later if suffix column is added

            'birth_date'  => $birthDate,
            'birth_place' => $row['birthplace'] ?? null,

            // Map "Sex" to gender enum values
            'gender' => $this->mapGender($row['sex'] ?? null),

            'civil_status' => $this->normalizeCivilStatus($row['civil_status'] ?? null),
            'nationality'  => $this->normalizeNationality($row['nationality'] ?? null),

            // Religion — Missing from Excel
            'religion' => 'PREFER_NOT_TO_SAY',

            // Education & Employment — Missing from Excel
            'educational_attainment' => 'OTHER',
            'employment_status'      => null,

            'occupation' => $row['occupation'] ?? null,
            'employer'   => $row['employer'] ?? null,

            // Contact
            'mobile_number'  => $row['contact_no'] ?? null,
            'landline_number' => $row['telephone'] ?? null,
            'email_address'  => $row['email'] ?? null,

            // Address
            'region'           => null,
            'province'         => null,
            'city'             => null,
            'barangay'         => null,
            'house_number'     => $row['house_no'] ?? null,
            'street'           => $row['street'] ?? null,
            'complete_address' => trim(($row['house_no'] ?? '') . ' ' . ($row['street'] ?? '')),

            // Family / Emergency — Missing from Excel
            'mother_name' => null,
            'father_name' => null,
            'emergency_contact_name' => null,
            'emergency_contact_number' => null,
            'emergency_contact_relationship' => null,

            // IDs
            'primary_id_type'    => null,
            'id_number'          => $row['ctc_no'] ?? null, // using CTC no if available
            'voters_id_number'   => null,
            'voter_status'       => 'REGISTERED',
            'precinct_number'    => $row['precinct_no'] ?? null,

            // Health / Special
            'medical_conditions' => null,
            'allergies'          => null,
            'senior_citizen'     => false,
            'person_with_disability' => false,
            'indigenous_people'      => false,
            'four_ps_beneficiary'    => false,

            // Photo
            'profile_photo_url' => $row['photo'] ?? $row['pictures'] ?? null,
            'photo_storage_provider' => 'local',

            // Status
            'status' => 'ACTIVE',

            // Audit
            'created_by' => Auth::id(),
        ]);
    }

    public function onFailure(Failure ...$failures)
    {
        foreach ($failures as $failure) {
            Log::error('Failed to import resident', [
                'row' => $failure->row(),
                'attribute' => $failure->attribute(),
                'values' => $failure->values(),
                'errors' => $failure->errors(),
            ]);
        }
    }

    public function rules(): array
    {
        return [
            '*.first_name' => ['required', 'string', 'max:255'],
            '*.surname'    => ['required', 'string', 'max:255'],
            '*.birthday'   => ['nullable'],
        ];
    }

    public function getRowCount(): int
    {
        return $this->rowCount;
    }

    private function transformDate($value)
    {
        try {
            if (is_numeric($value)) {
                return ExcelDate::excelToDateTimeObject($value);
            } elseif (!empty($value)) {
                return Carbon::parse($value);
            }
        } catch (\Exception $e) {
            return null;
        }
        return null;
    }

    private function mapGender(?string $value): ?string
    {
        if (!$value) return null;
        $value = strtolower(trim($value));
        return match ($value) {
            'male', 'm' => 'MALE',
            'female', 'f' => 'FEMALE',
            default => null,
        };
    }

    private function normalizeCivilStatus(?string $value): ?string
    {
        if (!$value) return null;
        $value = strtolower($value);
        return match (true) {
            str_contains($value, 'single') => 'SINGLE',
            str_contains($value, 'married') => 'MARRIED',
            str_contains($value, 'widow') => 'WIDOWED',
            str_contains($value, 'separated') => 'SEPARATED',
            default => 'SINGLE'
        };
    }

    private function normalizeNationality(?string $value): ?string
    {
        $availableNationalities = ResidentSchema::NATIONALITIES;

        if (!in_array(strtoupper($value), $availableNationalities)) {
            $value = 'OTHER';
        }

        if (!$value) return 'FILIPINO';
        $v = strtolower($value);
        return str_contains($v, 'filipino') || str_contains($v, 'philippine')
            ? 'FILIPINO'
            : strtoupper($v);
    }
}
