<?php

namespace App\Services\Shooting;

use App\Models\Shooting\Shooting;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Facades\Excel;
use App\Imports\Shooting\ShootingImport;

class ShootingService
{
    public function list($search = null)
    {
        return Shooting::query()
            ->when($search, function ($q) use ($search) {
                $q->where(function ($query) use ($search) {
                    $query->where('program_title', 'ILIKE', "%{$search}%")
                        ->orWhere('name_of_outfit', 'ILIKE', "%{$search}%")
                        ->orWhere('location', 'ILIKE', "%{$search}%")
                        ->orWhere('requested_by', 'ILIKE', "%{$search}%")
                        ->orWhere('or_no', 'ILIKE', "%{$search}%")
                        ->orWhere('remarks', 'ILIKE', "%{$search}%")
                        ->orWhere('date_of_application', 'ILIKE', "%{$search}%")
                        ->orWhere('date_of_shooting', 'ILIKE', "%{$search}%")
                        ->orWhere('time', 'ILIKE', "%{$search}%");
                });
            })
            ->orderBy('id', 'desc')
            ->paginate(10);
    }

    public function store(array $data): Shooting
    {
        $data['created_by'] = Auth::id();
        return Shooting::create($data);
    }

    public function update(Shooting $shooting, array $data): Shooting
    {
        $data['updated_by'] = Auth::id();
        $shooting->update($data);
        return $shooting;
    }

    public function delete(Shooting $shooting): bool
    {
        return $shooting->delete();
    }

    public function importExcel(UploadedFile $file): int
    {
        $import = new ShootingImport();
        Excel::import($import, $file);

        return $import->getRowCount();
    }
}
