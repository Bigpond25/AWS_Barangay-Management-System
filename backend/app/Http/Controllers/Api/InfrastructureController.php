<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Requests\Infrastructure\InfrastructureRequest;
use App\Models\Infrastructure\Infrastructure;
use App\Services\Infrastructure\InfrastructureService;
use App\Http\Resources\Infrastructure\InfrastructureResource;

class InfrastructureController extends Controller
{
    protected InfrastructureService $service;

    public function __construct(InfrastructureService $service)
    {
        $this->service = $service;
    }

    public function index(Request $request)
    {
        $search = $request->get('search');
        $infrastructures = $this->service->list($search);
        return InfrastructureResource::collection($infrastructures);
    }

    public function store(InfrastructureRequest $request)
    {
        $data = $request->validated();

        $infrastructure = $this->service->store($data);
        return InfrastructureResource::make($infrastructure);
    }

    public function show(Infrastructure $infrastructure)
    {
        $infrastructure->load('barangayClearances.issuedByUser');
        return InfrastructureResource::make($infrastructure);
    }

    public function update(InfrastructureRequest $request, Infrastructure $infrastructure)
    {
        $data = $request->validated();
        $updated = $this->service->update($infrastructure, $data);
        return InfrastructureResource::make($updated);
    }

    public function destroy(Infrastructure $infrastructure)
    {
        $this->service->delete($infrastructure);
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
