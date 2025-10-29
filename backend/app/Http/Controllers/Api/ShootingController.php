<?php

namespace App\Http\Controllers\Api;

use App\Models\Shooting\Shooting;
use Illuminate\Http\Request;
use App\Services\Shooting\ShootingService;
use App\Http\Requests\Shooting\ShootingRequest;
use App\Http\Controllers\Controller;

class ShootingController extends Controller
{
    protected ShootingService $service;

    public function __construct(ShootingService $service)
    {
        $this->service = $service;
    }

    public function index(Request $request)
    {
        $search = $request->query('search');
        return response()->json($this->service->list($search));
    }

    public function store(ShootingRequest $request)
    {
        $shooting = $this->service->store($request->validated());
        return response()->json($shooting, 201);
    }

    public function show(Shooting $shooting)
    {
        return response()->json($shooting);
    }

    public function update(ShootingRequest $request, Shooting $shooting)
    {
        $shooting = $this->service->update($shooting, $request->validated());
        return response()->json($shooting);
    }

    public function destroy(Shooting $shooting)
    {
        $this->service->delete($shooting);
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
