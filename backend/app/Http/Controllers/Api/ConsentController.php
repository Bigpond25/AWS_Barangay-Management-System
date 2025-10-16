<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DataConsent;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

class ConsentController extends Controller
{
    /**
     * Record user consent
     */
    public function recordConsent(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'nullable|uuid|exists:users,id',
            'consent_type' => [
                'required',
                'string',
                Rule::in(array_keys(DataConsent::getConsentTypes()))
            ],
            'consent_version' => 'nullable|string|max:10',
            'consent_data' => 'nullable|array',
            'ip_address' => 'nullable|ip',
            'user_agent' => 'nullable|string|max:500',
        ]);

        $consent = DataConsent::recordConsent(
            $validated['user_id'] ?? auth()->id(),
            $validated['consent_type'],
            $validated['consent_data'] ?? [],
            $validated['consent_version'] ?? '1.0',
            $validated['ip_address'] ?? null,
            $validated['user_agent'] ?? null
        );

        return response()->json([
            'success' => true,
            'message' => 'Consent recorded successfully',
            'data' => $consent
        ], 201);
    }

    /**
     * Withdraw consent
     */
    public function withdrawConsent(Request $request, string $consentId): JsonResponse
    {
        $validated = $request->validate([
            'withdrawal_reason' => 'nullable|string|max:500',
        ]);

        $consent = DataConsent::findOrFail($consentId);

        // Check if user can withdraw this consent
        if (auth()->id() !== $consent->user_id && !auth()->user()->can('manage-consents')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to withdraw this consent'
            ], 403);
        }

        if ($consent->isWithdrawn()) {
            return response()->json([
                'success' => false,
                'message' => 'Consent already withdrawn'
            ], 400);
        }

        $consent->withdraw($validated['withdrawal_reason'] ?? null);

        return response()->json([
            'success' => true,
            'message' => 'Consent withdrawn successfully',
            'data' => $consent->fresh()
        ]);
    }

    /**
     * Get user consents
     */
    public function getUserConsents(Request $request, ?string $userId = null): JsonResponse
    {
        $targetUserId = $userId ?? auth()->id();

        // Check permissions
        if (auth()->id() !== $targetUserId && !auth()->user()->can('view-user-consents')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to view these consents'
            ], 403);
        }

        $consents = DataConsent::getUserConsents($targetUserId);

        return response()->json([
            'success' => true,
            'data' => $consents
        ]);
    }

    /**
     * Get active consents for user
     */
    public function getActiveConsents(Request $request, ?string $userId = null): JsonResponse
    {
        $targetUserId = $userId ?? auth()->id();

        // Check permissions
        if (auth()->id() !== $targetUserId && !auth()->user()->can('view-user-consents')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to view these consents'
            ], 403);
        }

        $consents = DataConsent::getActiveConsents($targetUserId);

        return response()->json([
            'success' => true,
            'data' => $consents
        ]);
    }

    /**
     * Check if user has valid consent for specific type
     */
    public function checkConsent(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'nullable|uuid|exists:users,id',
            'consent_type' => [
                'required',
                'string',
                Rule::in(array_keys(DataConsent::getConsentTypes()))
            ],
        ]);

        $targetUserId = $validated['user_id'] ?? auth()->id();

        // Check permissions
        if (auth()->id() !== $targetUserId && !auth()->user()->can('view-user-consents')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to check this consent'
            ], 403);
        }

        $hasConsent = DataConsent::hasValidConsent($targetUserId, $validated['consent_type']);

        return response()->json([
            'success' => true,
            'has_consent' => $hasConsent,
            'consent_type' => $validated['consent_type']
        ]);
    }

    /**
     * Get all consent types
     */
    public function getConsentTypes(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => DataConsent::getConsentTypes()
        ]);
    }

    /**
     * Admin: Get all consents with pagination
     */
    public function getAllConsents(Request $request): JsonResponse
    {
        if (!auth()->user()->can('view-all-consents')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to view all consents'
            ], 403);
        }

        $validated = $request->validate([
            'per_page' => 'nullable|integer|min:1|max:100',
            'page' => 'nullable|integer|min:1',
            'consent_type' => 'nullable|string',
            'user_id' => 'nullable|uuid|exists:users,id',
            'status' => 'nullable|in:active,withdrawn,all',
        ]);

        $query = DataConsent::with('user:id,first_name,last_name,email');

        // Apply filters
        if (!empty($validated['consent_type'])) {
            $query->byType($validated['consent_type']);
        }

        if (!empty($validated['user_id'])) {
            $query->byUser($validated['user_id']);
        }

        if (!empty($validated['status'])) {
            switch ($validated['status']) {
                case 'active':
                    $query->consented();
                    break;
                case 'withdrawn':
                    $query->withdrawn();
                    break;
                // 'all' means no status filter
            }
        }

        $consents = $query->orderBy('created_at', 'desc')
            ->paginate($validated['per_page'] ?? 15);

        return response()->json([
            'success' => true,
            'data' => $consents
        ]);
    }

    /**
     * Admin: Export consents data
     */
    public function exportConsents(Request $request): JsonResponse
    {
        if (!auth()->user()->can('export-consents')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to export consents'
            ], 403);
        }

        $validated = $request->validate([
            'consent_type' => 'nullable|string',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date|after_or_equal:date_from',
            'status' => 'nullable|in:active,withdrawn,all',
        ]);

        $query = DataConsent::with('user:id,first_name,last_name,email');

        // Apply filters
        if (!empty($validated['consent_type'])) {
            $query->byType($validated['consent_type']);
        }

        if (!empty($validated['date_from'])) {
            $query->whereDate('created_at', '>=', $validated['date_from']);
        }

        if (!empty($validated['date_to'])) {
            $query->whereDate('created_at', '<=', $validated['date_to']);
        }

        if (!empty($validated['status'])) {
            switch ($validated['status']) {
                case 'active':
                    $query->consented();
                    break;
                case 'withdrawn':
                    $query->withdrawn();
                    break;
            }
        }

        $consents = $query->orderBy('created_at', 'desc')->get();

        // Transform data for export
        $exportData = $consents->map(function ($consent) {
            return [
                'id' => $consent->id,
                'user_name' => $consent->user ? $consent->user->first_name . ' ' . $consent->user->last_name : 'N/A',
                'user_email' => $consent->user->email ?? 'N/A',
                'consent_type' => $consent->consent_type,
                'consent_version' => $consent->consent_version,
                'consented' => $consent->consented ? 'Yes' : 'No',
                'consented_at' => $consent->consented_at?->format('Y-m-d H:i:s'),
                'withdrawn_at' => $consent->withdrawn_at?->format('Y-m-d H:i:s'),
                'withdrawal_reason' => $consent->withdrawal_reason,
                'ip_address' => $consent->ip_address,
                'created_at' => $consent->created_at->format('Y-m-d H:i:s'),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $exportData,
            'total' => $exportData->count()
        ]);
    }
}
