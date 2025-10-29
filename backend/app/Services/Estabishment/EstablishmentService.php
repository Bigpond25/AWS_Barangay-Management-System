<?php

namespace App\Services\Estabishment;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Facades\Excel;
use App\Models\Establishment\Establishment;
use App\Imports\Establishment\EstablishmentsImport;

class EstablishmentService
{
    public function list($search = null)
    {
        return Establishment::query()
            ->when(
                $search,
                fn($q) => $q
                    ->where("business_name", "ILIKE", "%{$search}%")
                    ->orWhere("owner", "ILIKE", "%{$search}%")
                    ->orWhere("room_unit", "ILIKE", "%{$search}%")
                    ->orWhere("building", "ILIKE", "%{$search}%")
                    ->orWhere("no", "ILIKE", "%{$search}%")
                    ->orWhere("location", "ILIKE", "%{$search}%")
                    ->orWhere("nature_of_business", "ILIKE", "%{$search}%")
                    ->orWhere("representative", "ILIKE", "%{$search}%")
            )->orderBy('id', 'desc')
            ->paginate(10);
    }

    public function store(array $data): Establishment
    {
        // Handle file uploads
        if (isset($data["file_attachments"])) {
            $files = [];
            foreach ($data["file_attachments"] as $file) {
                /** @var UploadedFile $file */
                $path = $file->store("establishments");
                $files[] = $path;
            }
            $data["file_attachments"] = $files;
        }

        return Establishment::create($data);
    }

    public function update(
        Establishment $establishment,
        array $data,
    ): Establishment {
        // Handle file uploads on update
        if (isset($data["file_attachments"])) {
            $files = $establishment->file_attachments ?? [];
            foreach ($data["file_attachments"] as $file) {
                /** @var UploadedFile $file */
                $path = $file->store("establishments");
                $files[] = $path;
            }
            $data["file_attachments"] = $files;
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

    public function attachNewClearance(
        Establishment $establishment,
        $data,
        UploadedFile $file,
    ): Establishment {
        $path = "{$establishment->id}/clearances/new";
        $fileName =
            "barangay_clearance_new_" . now()->format("YmdHis") . ".pdf";

        // $path = $file->storeAs($path, $fileName, 'establishment');

        $establishment->barangayClearancesNew()->create([
            "applicant_name" => $data["applicant_name"],
            "business_name" => $data["business_name"],
            "location" => $data["location"],
            "issued_date" => $data["issued_date"],
            "ownership" => $data["ownership"],
            "record_no" => $data["record_no"],
            "clearance_fee" => $data["clearance_fee"],
            "or_no" => $data["or_no"],
            "remarks" => $data["remarks"],
            "file_name" => $fileName,
            // 'file_path' => $path,
            // 'file_size' => $file->getSize(),
            // 'file_type' => $file->getMimeType(),
            // 'file_extension' => 'pdf',
            "issued_by" => Auth::user()->id,
        ]);

        return $establishment;
    }

    public function attachRenewalClearance(
        Establishment $establishment,
        $data,
        UploadedFile $file,
    ): Establishment {
        $path = "{$establishment->id}/clearances/renewal";
        $fileName =
            "barangay_clearance_renewal_" . now()->format("YmdHis") . ".pdf";

        // $path = $file->storeAs($path, $fileName, 'establishment');

        $establishment->barangayClearancesRenewal()->create([
            "applicant_name" => $data["applicant_name"],
            "business_name" => $data["business_name"],
            "location" => $data["location"],
            "issued_date" => $data["issued_date"],
            "ownership" => $data["ownership"],
            "record_no" => $data["record_no"],
            "clearance_fee" => $data["clearance_fee"],
            "or_no" => $data["or_no"],
            "remarks" => $data["remarks"],
            "file_name" => $fileName,
            // 'file_path' => $path,
            // 'file_size' => $file->getSize(),
            // 'file_type' => $file->getMimeType(),
            // 'file_extension' => 'pdf',
            "issued_by" => Auth::user()->id,
        ]);

        return $establishment;
    }
}
