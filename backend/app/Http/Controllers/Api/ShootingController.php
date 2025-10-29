<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Requests\Shooting\ShootingRequest;
use App\Http\Resources\Shooting\ShootingResource;
use App\Models\Shooting\Shooting;
use App\Services\Shooting\ShootingService;

class ShootingController extends Controller
{
    protected ShootingService $service;

    public function __construct(ShootingService $service)
    {
        $this->service = $service;
    }

    /**
     * Display a paginated listing of shootings.
     */
    public function index(Request $request)
    {
        $search = $request->get('search');
        $shootings = $this->service->list($search);
        return ShootingResource::collection($shootings);
    }

    /**
     * Store a newly created shooting record.
     */
    public function store(ShootingRequest $request)
    {
        $data = $request->validated();

        $shooting = $this->service->store($data);
        return ShootingResource::make($shooting);
    }

    /**
     * Display the specified shooting record.
     */
    public function show(Shooting $shooting)
    {
        return ShootingResource::make($shooting);
    }

    /**
     * Update the specified shooting record.
     */
    public function update(ShootingRequest $request, Shooting $shooting)
    {
        $data = $request->validated();
        $updated = $this->service->update($shooting, $data);
        return ShootingResource::make($updated);
    }

    /**
     * Remove the specified shooting record.
     */
    public function destroy(Shooting $shooting)
    {
        $this->service->delete($shooting);
        return response()->json(['message' => 'Deleted successfully']);
    }

    /**
     * Import shootings from an Excel or CSV file.
     */
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
