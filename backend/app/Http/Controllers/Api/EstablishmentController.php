<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Requests\Establishment\EstablishmentRequest;
use App\Models\Establishment\Establishment;
use App\Services\Estabishment\EstablishmentService;
use App\Http\Resources\Establishment\EstablishmentResource;

class EstablishmentController extends Controller
{
    protected EstablishmentService $service;

    public function __construct(EstablishmentService $service)
    {
        $this->service = $service;
    }

    public function index(Request $request)
    {
        $search = $request->get('search');
        $establishments = $this->service->list($search);
        return EstablishmentResource::collection($establishments);
    }

    public function store(EstablishmentRequest $request)
    {
        $data = $request->validated();

        // Attach files if uploaded
        if ($request->hasFile('file_attachments')) {
            $data['file_attachments'] = $request->file('file_attachments');
        }

        $establishment = $this->service->store($data);
        return EstablishmentResource::make($establishment);
    }

    public function show(Establishment $establishment)
    {
        $establishment->load('barangayClearancesNew.issuedByUser', 'barangayClearancesRenewal.issuedByUser');
        return EstablishmentResource::make($establishment);
    }

    public function update(EstablishmentRequest $request, Establishment $establishment)
    {
        $data = $request->validated();

        // Attach files if uploaded
        if ($request->hasFile('file_attachments')) {
            $data['file_attachments'] = $request->file('file_attachments');
        }

        $updated = $this->service->update($establishment, $data);
        return EstablishmentResource::make($updated);
    }

    public function destroy(Establishment $establishment)
    {
        $this->service->delete($establishment);
        return response()->json(['message' => 'Deleted successfully']);
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,csv',
        ]);

        $importedCount = $this->service->importExcel($request->file('file'));

        return response()->json([
            'message' => 'Import successful',
            'imported' => $importedCount,
        ]);
    }

    public function attachNewClearance(Request $request, Establishment $establishment)
    {
        $request->validate([
            'id' => 'required|exists:establishments,id',
            'file' => 'required|file|mimes:pdf',
        ]);

        $data = [
            'id' => $establishment->id,
            'applicant_name' => $request->applicant_name,
            'business_name' => $request->business_name,
            'location' => $request->location,
            'issued_date' => $request->issued_date,
            'ownership' => $request->ownership,
            'record_no' => $request->record_no,
            'clearance_fee' => $request->clearance_fee,
            'or_no' => $request->or_no,
            'remarks' => $request->remarks,
        ];

        $this->service->attachNewClearance($establishment, $data, $request->file('file'));

        return response()->json([
            'message' => 'Clearance attached successfully',
            'data' => $establishment,
        ]);
    }

    public function attachRenewalClearance(Request $request, Establishment $establishment)
    {
        $request->validate([
            'id' => 'required|exists:establishments,id',
            'file' => 'required|file|mimes:pdf',
        ]);

        $data = [
            'id' => $establishment->id,
            'applicant_name' => $request->applicant_name,
            'business_name' => $request->business_name,
            'location' => $request->location,
            'issued_date' => $request->issued_date,
            'ownership' => $request->ownership,
            'record_no' => $request->record_no,
            'clearance_fee' => $request->clearance_fee,
            'or_no' => $request->or_no,
            'remarks' => $request->remarks,
        ];

        $this->service->attachRenewalClearance($establishment, $data, $request->file('file'));

        return response()->json([
            'message' => 'Clearance attached successfully',
            'data' => $establishment,
        ]);
    }
}
