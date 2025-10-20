<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Models\Establishment;
use App\Http\Controllers\Controller;
use App\Services\EstablishmentService;
use App\Http\Requests\EstablishmentRequest;
use App\Http\Resources\EstablishmentResource;

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
}
