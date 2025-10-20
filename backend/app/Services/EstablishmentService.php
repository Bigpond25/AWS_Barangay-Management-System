<?php

namespace App\Services;

use App\Models\Establishment;
use Illuminate\Http\UploadedFile;
use Maatwebsite\Excel\Facades\Excel;
use App\Imports\EstablishmentsImport;

class EstablishmentService
{
    public function list($search = null)
    {
        return Establishment::query()
            ->when(
                $search,
                fn($q) =>
                $q->where('business_name', 'like', "%{$search}%")
                    ->orWhere('owner', 'like', "%{$search}%")
            )
            ->orderBy('id', 'desc')
            ->paginate(10);
    }

    public function store(array $data): Establishment
    {
        // Handle file uploads
        if (isset($data['file_attachments'])) {
            $files = [];
            foreach ($data['file_attachments'] as $file) {
                /** @var UploadedFile $file */
                $path = $file->store('establishments');
                $files[] = $path;
            }
            $data['file_attachments'] = $files;
        }

        return Establishment::create($data);
    }

    public function update(Establishment $establishment, array $data): Establishment
    {
        // Handle file uploads on update
        if (isset($data['file_attachments'])) {
            $files = $establishment->file_attachments ?? [];
            foreach ($data['file_attachments'] as $file) {
                /** @var UploadedFile $file */
                $path = $file->store('establishments');
                $files[] = $path;
            }
            $data['file_attachments'] = $files;
        }

        $establishment->update($data);
        return $establishment;
    }

    public function delete(Establishment $establishment): bool
    {
        return $establishment->delete();
    }

    /**
     * Import Excel or CSV into establishments
     *
     * @param UploadedFile $file
     * @return int Number of records imported
     */
    public function importExcel(UploadedFile $file): int
    {
        $import = new EstablishmentsImport();
        Excel::import($import, $file);

        return $import->getRowCount();
    }
}
