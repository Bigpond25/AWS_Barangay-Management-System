<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\Resident;
use App\Models\Schemas\DocumentSchema;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class DocumentController extends Controller
{
    /**
     * Display a paginated listing of documents with filters.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Document::with([
                'resident:id,first_name,last_name,middle_name,suffix,complete_address,mobile_number,email_address',
                'processedByUser:id,first_name,last_name,role,position',
                'approvedByUser:id,first_name,last_name,role,position',
                'releasedByUser:id,first_name,last_name,role,position'
            ]);

            // Apply filters
            if ($request->filled('type')) {
                $query->where('type', $request->type);
            }

            if ($request->filled('status')) {
                // Map frontend status to backend status
                $status = $this->mapFrontendStatusToBackend($request->status);
                $query->where('status', $status);
            }

            if ($request->filled('priority')) {
                $query->where('priority', $request->priority);
            }

            if ($request->filled('payment_status')) {
                $query->where('payment_status', $request->payment_status);
            }

            if ($request->filled('resident_id')) {
                $query->where('resident_id', $request->resident_id);
            }

            if ($request->filled('date_from')) {
                $query->whereDate('submitted_at', '>=', $request->date_from);
            }

            if ($request->filled('date_to')) {
                $query->whereDate('submitted_at', '<=', $request->date_to);
            }

            // Search functionality
            if ($request->filled('search')) {
                $searchTerm = $request->search;
                $query->where(function ($q) use ($searchTerm) {
                    $q->where('document_number', 'LIKE', "%{$searchTerm}%")
                      ->orWhere('serial_number', 'LIKE', "%{$searchTerm}%")
                      ->orWhere('applicant_name', 'LIKE', "%{$searchTerm}%")
                      ->orWhereHas('resident', function ($subQuery) use ($searchTerm) {
                          $subQuery->where('first_name', 'LIKE', "%{$searchTerm}%")
                                   ->orWhere('last_name', 'LIKE', "%{$searchTerm}%");
                      });
                });
            }

            // Apply sorting
            $sortBy = $request->get('sort_by', 'submitted_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            // Pagination
            $perPage = $request->get('per_page', 15);
            $documents = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $documents->items(),
                'meta' => [
                    'current_page' => $documents->currentPage(),
                    'from' => $documents->firstItem(),
                    'last_page' => $documents->lastPage(),
                    'per_page' => $documents->perPage(),
                    'to' => $documents->lastItem(),
                    'total' => $documents->total(),
                ],
                'message' => 'Documents retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve documents: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created document.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validationRules = DocumentSchema::getCreateValidationRules();
            $validated = $request->validate($validationRules);
            
            $document = Document::create($validated);
            $document->load([
                'resident:id,first_name,last_name,middle_name,suffix,complete_address,mobile_number,email_address'
            ]);

            return response()->json([
                'success' => true,
                'data' => $document,
                'message' => 'Document created successfully'
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create document: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified document.
     */
    public function show(string $id): JsonResponse
    {
        try {
            $document = Document::with([
                'resident:id,first_name,last_name,middle_name,suffix,complete_address,mobile_number,email_address',
                'processedByUser:id,first_name,last_name,role,position',
                'approvedByUser:id,first_name,last_name,role,position',
                'releasedByUser:id,first_name,last_name,role,position'
            ])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $document,
                'message' => 'Document retrieved successfully'
            ]);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Document not found'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve document: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified document.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $document = Document::findOrFail($id);

            $validationRules = DocumentSchema::getUpdateValidationRules();
            // Replace {id} placeholder with actual document ID for unique validation
            $validationRules = array_map(function ($rule) use ($id) {
                return str_replace('{id}', $id, $rule);
            }, $validationRules);

            $validated = $request->validate($validationRules);
            
            $document->update($validated);
            $document->load([
                'resident:id,first_name,last_name,middle_name,suffix,complete_address,mobile_number,email_address',
                'processedByUser:id,first_name,last_name,role,position',
                'approvedByUser:id,first_name,last_name,role,position',
                'releasedByUser:id,first_name,last_name,role,position'
            ]);

            return response()->json([
                'success' => true,
                'data' => $document,
                'message' => 'Document updated successfully'
            ]);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Document not found'
            ], 404);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update document: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified document.
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $document = Document::findOrFail($id);
            
            // Only allow deletion of pending or cancelled documents
            if (!in_array($document->status, ['PENDING', 'CANCELLED'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete document that is already being processed'
                ], 422);
            }

            $document->delete();

            return response()->json([
                'success' => true,
                'message' => 'Document deleted successfully'
            ]);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Document not found'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete document: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get document statistics.
     */
    public function statistics(): JsonResponse
    {
        try {
            $stats = [
                'total_documents' => Document::count(),
                'pending_documents' => Document::where('status', 'PENDING')->count(),
                'processing_documents' => Document::where('status', 'PROCESSING')->count(),
                'approved_documents' => Document::where('status', 'APPROVED')->count(),
                'released_documents' => Document::where('status', 'RELEASED')->count(),
                'rejected_documents' => Document::where('status', 'REJECTED')->count(),
                'overdue_documents' => Document::overdue()->count(),
                'urgent_documents' => Document::whereIn('priority', ['urgent', 'rush'])->count(),
                'by_status' => Document::selectRaw('status, COUNT(*) as count')
                    ->groupBy('status')
                    ->get()
                    ->mapWithKeys(function ($item) {
                        return [$item->status => $item->count];
                    }),
                'by_document_type' => Document::selectRaw('type, COUNT(*) as count')
                    ->groupBy('type')
                    ->orderByDesc('count')
                    ->get()
                    ->mapWithKeys(function ($item) {
                        return [$item->type => $item->count];
                    }),
                'by_priority' => Document::selectRaw('priority, COUNT(*) as count')
                    ->groupBy('priority')
                    ->get()
                    ->mapWithKeys(function ($item) {
                        return [$item->priority => $item->count];
                    }),
                'by_payment_status' => Document::selectRaw('payment_status, COUNT(*) as count')
                    ->groupBy('payment_status')
                    ->get()
                    ->mapWithKeys(function ($item) {
                        return [$item->payment_status => $item->count];
                    }),
                'revenue' => [
                    'total_processing_fees' => Document::sum('processing_fee'),
                    'unpaid_fees' => Document::where('payment_status', 'UNPAID')->sum('processing_fee'),
                    'paid_fees' => Document::where('payment_status', 'PAID')->sum('processing_fee'),
                ],
                'monthly_stats' => Document::selectRaw('
                        EXTRACT(YEAR FROM submitted_at) as year,
                        EXTRACT(MONTH FROM submitted_at) as month,
                        COUNT(*) as total_requests
                    ')
                    ->whereYear('submitted_at', now()->year)
                    ->groupBy('year', 'month')
                    ->orderBy('month')
                    ->get()
            ];

            return response()->json([
                'success' => true,
                'data' => $stats,
                'message' => 'Document statistics retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve statistics: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Process a document (change status to processing).
     */
    public function process(Request $request, string $id): JsonResponse
    {
        try {
            $document = Document::findOrFail($id);

            $request->validate([
                'notes' => 'nullable|string',
                'certifying_official' => 'nullable|string|max:255'
            ]);

            if (!$document->canBeProcessed()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Document cannot be processed. Check current status and requirements.'
                ], 422);
            }

            $document->update([
                'status' => 'PROCESSING',
                'processed_by' => Auth::id(),
                'processed_at' => now(),
                'notes' => $request->notes,
                'certifying_official' => $request->certifying_official
            ]);

            $document->load([
                'resident:id,first_name,last_name,middle_name,suffix',
                'processedByUser:id,first_name,last_name,role,position'
            ]);

            return response()->json([
                'success' => true,
                'data' => $document,
                'message' => 'Document is now being processed'
            ]);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Document not found'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to process document: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reject a document.
     */
    public function reject(Request $request, string $id): JsonResponse
    {
        try {
            $document = Document::findOrFail($id);

            $request->validate([
                'reason' => 'required|string|min:5',
                'notes' => 'nullable|string'
            ]);

            if (!$document->canBeRejected()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Document cannot be rejected'
                ], 422);
            }

            $document->update([
                'status' => 'REJECTED',
                'remarks' => $request->reason,
                'notes' => $request->notes,
                'processed_by' => Auth::id(),
                'processed_at' => now()
            ]);

            $document->load(['resident:id,first_name,last_name,middle_name,suffix']);

            return response()->json([
                'success' => true,
                'data' => $document,
                'message' => 'Document rejected successfully'
            ]);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Document not found'
            ], 404);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to reject document: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Approve a document.
     */
    public function approve(Request $request, string $id): JsonResponse
    {
        try {
            $document = Document::findOrFail($id);

            $request->validate([
                'notes' => 'nullable|string',
                'certifying_official' => 'nullable|string|max:255'
            ]);

            if (!in_array($document->status, ['PENDING', 'PROCESSING'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Document cannot be approved from current status'
                ], 422);
            }

            $document->update([
                'status' => 'APPROVED',
                'approved_by' => Auth::id(),
                'approved_at' => now(),
                'notes' => $request->notes,
                'certifying_official' => $request->certifying_official
            ]);

            $document->load([
                'resident:id,first_name,last_name,middle_name,suffix',
                'approvedByUser:id,first_name,last_name,role,position'
            ]);

            return response()->json([
                'success' => true,
                'data' => $document,
                'message' => 'Document approved successfully'
            ]);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Document not found'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to approve document: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Release a document.
     */
    public function release(Request $request, string $id): JsonResponse
    {
        try {
            $document = Document::findOrFail($id);

            $request->validate([
                'notes' => 'nullable|string',
                'released_to' => 'nullable|string|max:255'
            ]);

            if (!$document->canBeReleased()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Document cannot be released. Check approval and payment status.'
                ], 422);
            }

            $document->update([
                'status' => 'RELEASED',
                'released_by' => Auth::id(),
                'released_at' => now(),
                'notes' => $request->notes
            ]);

            $document->load([
                'resident:id,first_name,last_name,middle_name,suffix',
                'releasedByUser:id,first_name,last_name,role,position'
            ]);

            return response()->json([
                'success' => true,
                'data' => $document,
                'message' => 'Document released successfully'
            ]);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Document not found'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to release document: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cancel a document.
     */
    public function cancel(Request $request, string $id): JsonResponse
    {
        try {
            $document = Document::findOrFail($id);

            $request->validate([
                'reason' => 'required|string|min:5'
            ]);

            if (in_array($document->status, ['RELEASED', 'CANCELLED'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Document cannot be cancelled'
                ], 422);
            }

            $document->update([
                'status' => 'CANCELLED',
                'remarks' => $request->reason,
                'processed_by' => Auth::id(),
                'processed_at' => now()
            ]);

            $document->load(['resident:id,first_name,last_name,middle_name,suffix']);

            return response()->json([
                'success' => true,
                'data' => $document,
                'message' => 'Document cancelled successfully'
            ]);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Document not found'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to cancel document: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get document tracking information.
     */
    public function tracking(string $id): JsonResponse
    {
        try {
            $document = Document::with([
                'resident:id,first_name,last_name,middle_name,suffix',
                'processedByUser:id,first_name,last_name,role,position',
                'approvedByUser:id,first_name,last_name,role,position',
                'releasedByUser:id,first_name,last_name,role,position'
            ])->findOrFail($id);

            // Build timeline
            $timeline = [
                [
                    'status' => 'submitted',
                    'title' => 'Request Submitted',
                    'description' => 'Document request has been submitted',
                    'date' => $document->submitted_at,
                    'completed' => true,
                    'user' => null
                ]
            ];

            if ($document->processed_at) {
                $timeline[] = [
                    'status' => 'processing',
                    'title' => 'Under Processing',
                    'description' => 'Document is being processed',
                    'date' => $document->processed_at,
                    'completed' => true,
                    'user' => $document->processedByUser ? [
                        'name' => $document->processedByUser->name,
                        'role' => $document->processedByUser->role
                    ] : null
                ];
            }

            if ($document->approved_at) {
                $timeline[] = [
                    'status' => 'approved',
                    'title' => 'Approved',
                    'description' => 'Document has been approved',
                    'date' => $document->approved_at,
                    'completed' => true,
                    'user' => $document->approvedByUser ? [
                        'name' => $document->approvedByUser->name,
                        'role' => $document->approvedByUser->role
                    ] : null
                ];
            }

            if ($document->released_at) {
                $timeline[] = [
                    'status' => 'released',
                    'title' => 'Released',
                    'description' => 'Document has been released',
                    'date' => $document->released_at,
                    'completed' => true,
                    'user' => $document->releasedByUser ? [
                        'name' => $document->releasedByUser->name,
                        'role' => $document->releasedByUser->role
                    ] : null
                ];
            }

            $trackingData = [
                'document' => $document,
                'timeline' => $timeline,
                'current_status' => $document->status,
                'estimated_completion' => $document->needed_date,
                'is_overdue' => $document->is_overdue,
                'processing_days' => $document->processing_days
            ];

            return response()->json([
                'success' => true,
                'data' => $trackingData,
                'message' => 'Document tracking information retrieved successfully'
            ]);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Document not found'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve tracking information: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate document PDF.
     */
    public function pdf(string $id)
    {
        try {
            $document = Document::with('resident')->findOrFail($id);

            if ($document->status !== 'approved' && $document->status !== 'released') {
                return response()->json([
                    'success' => false,
                    'message' => 'Document must be approved before generating PDF'
                ], 422);
            }

            // Implement PDF generation using Laravel's built-in functionality
            // You can use libraries like DomPDF, mPDF, or TCPDF
            try {
                // For now, we'll create a basic PDF response
                // In production, you would generate the actual certificate PDF
                $pdfContent = $this->generateCertificatePDF($document);
                
                return response($pdfContent)
                    ->header('Content-Type', 'application/pdf')
                    ->header('Content-Disposition', 'inline; filename="' . $document->document_number . '.pdf"');
                    
            } catch (\Exception $e) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to generate PDF: ' . $e->getMessage()
                ], 500);
            }

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Document not found'
            ], 404);
        }
    }

    /**
     * Get processing history.
     */
    public function history(string $id): JsonResponse
    {
        try {
            $document = Document::with([
                'processedByUser:id,first_name,last_name,role,position',
                'approvedByUser:id,first_name,last_name,role,position',
                'releasedByUser:id,first_name,last_name,role,position'
            ])->findOrFail($id);

            $history = [];

            // Add creation entry
            $history[] = [
                'action' => 'created',
                'status' => 'pending',
                'description' => 'Document request created',
                'date' => $document->created_at,
                'user' => null
            ];

            // Add processing entry
            if ($document->processed_at) {
                $history[] = [
                    'action' => 'processed',
                    'status' => 'processing',
                    'description' => 'Document processing started',
                    'date' => $document->processed_at,
                    'user' => $document->processedByUser ? [
                        'id' => $document->processedByUser->id,
                        'name' => $document->processedByUser->name,
                        'role' => $document->processedByUser->role,
                        'position' => $document->processedByUser->position
                    ] : null
                ];
            }

            // Add approval entry
            if ($document->approved_at) {
                $history[] = [
                    'action' => 'approved',
                    'status' => 'approved',
                    'description' => 'Document approved for release',
                    'date' => $document->approved_at,
                    'user' => $document->approvedByUser ? [
                        'id' => $document->approvedByUser->id,
                        'name' => $document->approvedByUser->name,
                        'role' => $document->approvedByUser->role,
                        'position' => $document->approvedByUser->position
                    ] : null
                ];
            }

            // Add release entry
            if ($document->released_at) {
                $history[] = [
                    'action' => 'released',
                    'status' => 'released',
                    'description' => 'Document released to applicant',
                    'date' => $document->released_at,
                    'user' => $document->releasedByUser ? [
                        'id' => $document->releasedByUser->id,
                        'name' => $document->releasedByUser->name,
                        'role' => $document->releasedByUser->role,
                        'position' => $document->releasedByUser->position
                    ] : null
                ];
            }

            return response()->json([
                'success' => true,
                'data' => $history,
                'message' => 'Processing history retrieved successfully'
            ]);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Document not found'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve processing history: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get overdue documents.
     */
    public function overdue(): JsonResponse
    {
        try {
            $documents = Document::overdue()
                ->with([
                    'resident:id,first_name,last_name,middle_name,suffix',
                    'processedByUser:id,first_name,last_name,role'
                ])
                ->orderBy('needed_date', 'asc')
                ->paginate(15);

            return response()->json([
                'success' => true,
                'data' => $documents->items(),
                'meta' => [
                    'current_page' => $documents->currentPage(),
                    'from' => $documents->firstItem(),
                    'last_page' => $documents->lastPage(),
                    'per_page' => $documents->perPage(),
                    'to' => $documents->lastItem(),
                    'total' => $documents->total(),
                ],
                'message' => 'Overdue documents retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve overdue documents: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get pending documents.
     */
    public function pending(): JsonResponse
    {
        try {
            $documents = Document::pending()
                ->with([
                    'resident:id,first_name,last_name,middle_name,suffix',
                    'processedByUser:id,first_name,last_name,role'
                ])
                ->orderBy('submitted_at', 'asc')
                ->paginate(15);

            return response()->json([
                'success' => true,
                'data' => $documents->items(),
                'meta' => [
                    'current_page' => $documents->currentPage(),
                    'from' => $documents->firstItem(),
                    'last_page' => $documents->lastPage(),
                    'per_page' => $documents->perPage(),
                    'to' => $documents->lastItem(),
                    'total' => $documents->total(),
                ],
                'message' => 'Pending documents retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve pending documents: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Map frontend status values to backend status values
     */
    private function mapFrontendStatusToBackend(string $frontendStatus): string
    {
        $statusMap = [
            'PENDING' => 'PENDING',
            'PROCESSING' => 'PROCESSING', // Fixed: frontend now uses PROCESSING
            'UNDER_REVIEW' => 'PROCESSING', // Legacy support
            'APPROVED' => 'APPROVED',
            'RELEASED' => 'RELEASED',
            'REJECTED' => 'REJECTED',
            'CANCELLED' => 'CANCELLED'
        ];
        
        return $statusMap[$frontendStatus] ?? strtoupper($frontendStatus);
    }

    /**
     * Map backend status values to frontend status values
     */
    private function mapBackendStatusToFrontend(string $backendStatus): string
    {
        $statusMap = [
            'PENDING' => 'PENDING',
            'PROCESSING' => 'PROCESSING', // Fixed: backend maps to PROCESSING
            'APPROVED' => 'APPROVED',
            'RELEASED' => 'RELEASED',
            'REJECTED' => 'REJECTED',
            'CANCELLED' => 'CANCELLED'
        ];
        
        return $statusMap[$backendStatus] ?? strtoupper($backendStatus);
    }

    /**
     * Generate PDF for certificate document
     * TODO: Implement actual PDF generation with proper templates
     */
    private function generateCertificatePDF($document): string
    {
        // This is a placeholder implementation
        // In production, you would use a PDF library like DomPDF or TCPDF
        // to generate a proper certificate with the barangay letterhead and signature
        
        $content = "BARANGAY CERTIFICATE\n\n";
        $content .= "Document Number: " . $document->document_number . "\n";
        $content .= "Document Type: " . $document->type . "\n";
        $content .= "Applicant: " . $document->applicant_name . "\n";
        $content .= "Date Issued: " . now()->format('F d, Y') . "\n\n";
        $content .= "This is to certify that the above information is true and correct.\n\n";
        $content .= "Issued by: Barangay " . config('app.name', 'LGU-IMS') . "\n";
        
        // This would normally be PDF binary content
        // For now, return plain text (this should be replaced with actual PDF generation)
        return $content;
    }
}