<?php

namespace App\Services\Infrastructure;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Facades\Excel;
use App\Models\Infrastructure\Infrastructure;
use App\Imports\Infrastructure\InfrastructureImport;

class InfrastructureService
{
    public function list($search = null)
    {
        return Infrastructure::query()
            ->when(
                $search,
                fn($q) =>
                $q->where('type_of_project', 'ILIKE', "%{$search}%")
                ->orWhere('name_of_applicant', 'ILIKE', "%{$search}%")
            )
            ->orderBy('id', 'desc')->with(['creator'])
            ->paginate(10);
    }

    public function store(array $data): Infrastructure
    {
        return Infrastructure::create($data);
    }

    public function update(Infrastructure $infrastructureInfrastructure, array $data): Infrastructure
    {
        $infrastructureInfrastructure->update($data);
        return $infrastructureInfrastructure;
    }

    public function delete(Infrastructure $infrastructureInfrastructure): bool
    {
        return $infrastructureInfrastructure->delete();
    }

    /**
     * Import Excel or CSV into infrastructureInfrastructures
     *
     * @param UploadedFile $file
     * @return int Number of records imported
     */
    public function importExcel(UploadedFile $file): int
    {
        $import = new InfrastructureImport();
        Excel::import($import, $file);

        return $import->getRowCount();
    }
}
