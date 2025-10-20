<?php

namespace App\Imports;

use App\Models\Establishment;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;

class EstablishmentsImport implements ToModel, WithHeadingRow, WithValidation
{
    private int $rowCount = 0;

    public function model(array $row)
    {
        $this->rowCount++;

        return new Establishment([
            'business_name' => $row['business_name'] ?? null,
            'room_unit' => $row['room_unit'] ?? null,
            'building' => $row['building'] ?? null,
            'no' => $row['no'] ?? null,
            'location' => $row['location'] ?? null,
            'owner' => $row['owner'] ?? null,
            'nature_of_business' => $row['nature_of_business'] ?? null,
            'date_approved' => isset($row['date_approved']) ? date('Y-m-d', strtotime($row['date_approved'])) : null,
            'date_of_last_renewal' => isset($row['date_of_last_renewal']) ? date('Y-m-d', strtotime($row['date_of_last_renewal'])) : null,
            'remarks_on_print_business' => $row['remarks_on_print_business'] ?? null,
            'date_of_retirement' => isset($row['date_of_retirement']) ? date('Y-m-d', strtotime($row['date_of_retirement'])) : null,
            'created_by' => Auth::user()->id,
        ]);
    }

    public function rules(): array
    {
        return [
            '*.business_name' => 'nullable|string|max:255',
            '*.owner' => 'nullable|string|max:255',
        ];
    }

    public function getRowCount(): int
    {
        return $this->rowCount;
    }
}
