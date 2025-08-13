<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\DataConsent;

class ConsentValidation
{
    /**
     * Handle an incoming request - check for required consents
     */
    public function handle(Request $request, Closure $next, string $consentType = null)
    {
        // Skip consent validation for certain routes
        $skipRoutes = [
            'api/auth/*',
            'api/consents/*',
            'api/help-desk/*', // Public help desk routes
        ];

        foreach ($skipRoutes as $pattern) {
            if ($request->is($pattern)) {
                return $next($request);
            }
        }

        // Skip if user is not authenticated
        if (!auth()->check()) {
            return $next($request);
        }

        $userId = auth()->id();
        
        // Check for required consent types based on the operation
        $requiredConsents = $this->getRequiredConsents($request, $consentType);

        foreach ($requiredConsents as $consent) {
            if (!DataConsent::hasValidConsent($userId, $consent)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Consent required to proceed with this operation',
                    'required_consent' => $consent,
                    'consent_type_description' => DataConsent::getConsentTypes()[$consent] ?? $consent
                ], 403);
            }
        }

        return $next($request);
    }

    /**
     * Determine required consents based on request and operation type
     */
    private function getRequiredConsents(Request $request, ?string $consentType): array
    {
        // If specific consent type is provided, use it
        if ($consentType) {
            return [$consentType];
        }

        $requiredConsents = [DataConsent::TYPE_DATA_PROCESSING]; // Always required for data operations

        // Determine additional consents based on the route
        $path = $request->path();
        $method = $request->method();

        // Personal data routes require registration consent
        if (str_contains($path, 'residents') || str_contains($path, 'households')) {
            $requiredConsents[] = DataConsent::TYPE_REGISTRATION;
        }

        // Document creation/processing routes
        if (str_contains($path, 'documents') && in_array($method, ['POST', 'PUT', 'PATCH'])) {
            $requiredConsents[] = DataConsent::TYPE_REGISTRATION;
        }

        // Analytics and reporting routes
        if (str_contains($path, 'reports') || str_contains($path, 'analytics') || str_contains($path, 'statistics')) {
            $requiredConsents[] = DataConsent::TYPE_ANALYTICS;
        }

        return array_unique($requiredConsents);
    }
}
