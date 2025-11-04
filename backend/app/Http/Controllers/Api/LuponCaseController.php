<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Lupon\LuponCaseRequest;
use App\Http\Resources\Lupon\LuponCaseResource;
use App\Models\Lupon\LuponCase;
use App\Services\Lupon\LuponCaseService;
use Illuminate\Http\Request;

class LuponCaseController extends Controller
{
    protected LuponCaseService $service;

    public function __construct(LuponCaseService $service)
    {
        $this->service = $service;
    }

    /**
     * Display a paginated list of Lupon cases.
     */
    public function index(Request $request)
    {
        $search = $request->get('search');
        $cases = $this->service->list($search);

        return LuponCaseResource::collection($cases);
    }

    /**
     * Store a newly created Lupon case (with nested parties, hearings, attachments).
     */
    public function store(LuponCaseRequest $request)
    {
        $data = $request->validated();
        $case = $this->service->store($data);

        return LuponCaseResource::make($case);
    }

    /**
     * Display a specific Lupon case with related data.
     */
    public function show(LuponCase $luponCase)
    {
        $luponCase->load(['parties', 'hearings', 'attachments']);
        return LuponCaseResource::make($luponCase);
    }

    /**
     * Update a Lupon case and its nested relationships.
     */
    public function update(LuponCaseRequest $request, LuponCase $luponCase)
    {
        $data = $request->validated();
        $case = $this->service->update($luponCase, $data);

        return LuponCaseResource::make($case);
    }

    /**
     * Delete a case and all related data.
     */
    public function destroy(LuponCase $luponCase)
    {
        $this->service->delete($luponCase);

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
