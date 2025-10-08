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
     * Display a paginated listing of documents with filters (OPTIMIZED).
     */
    public function index(Request $request): JsonResponse
    {
        $startTime = microtime(true);
        \Log::info('DocumentController::index started', ['timestamp' => $startTime]);
        
        try {
            // OPTIMIZED: Start with selective fields and optimized relationships
            $step1 = microtime(true);
            $query = Document::select([
                'id', 'type', 'status', 'priority', 'payment_status',
                'document_number', 'serial_number', 'applicant_name',
                'resident_id', 'submitted_at', 'processed_at', 'approved_at',
                'released_at', 'needed_date', 'processing_fee', 'purpose',
                // Cash bond fields
                'received_from', 'representing_entity', 'acknowledgement_address', 'bond_amount',
                // CRITICAL: Include foreign keys for relationships
                'processed_by', 'approved_by', 'released_by', 'created_by', 'updated_by',
                'created_at', 'updated_at'
            ]);
            \Log::info('Query initialized', ['elapsed' => microtime(true) - $step1]);

            // OPTIMIZED: Only load necessary relationship fields
            $step2 = microtime(true);
            $query->with([
                'resident:id,first_name,last_name,middle_name,suffix,complete_address,mobile_number,email_address',
                'processedByUser:id,first_name,last_name,role,position',
                'approvedByUser:id,first_name,last_name,role,position',
                'releasedByUser:id,first_name,last_name,role,position'
            ]);
            \Log::info('Relationships added', ['elapsed' => microtime(true) - $step2]);

            // Existing filters
            $step3 = microtime(true);
            if ($request->filled('type')) {
                $query->where('type', $request->type);
            }

            if ($request->filled('status')) {
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

            // Cash Bond specific filters
            if ($request->filled('received_from')) {
                $query->where('received_from', 'LIKE', '%' . $request->received_from . '%');
            }

            if ($request->filled('representing_entity')) {
                $query->where('representing_entity', 'LIKE', '%' . $request->representing_entity . '%');
            }

            if ($request->filled('acknowledgement_address')) {
                $query->where('acknowledgement_address', 'LIKE', '%' . $request->acknowledgement_address . '%');
            }

            if ($request->filled('bond_amount')) {
                $query->where('bond_amount', $request->bond_amount);
            }
            \Log::info('Filters applied', ['elapsed' => microtime(true) - $step3]);

            // OPTIMIZED: Search functionality using LEFT JOIN instead of EXISTS subquery
            $step4 = microtime(true);
            if ($request->filled('search')) {
                $searchTerm = $request->search;
                
                // For search queries, use LEFT JOIN to avoid expensive EXISTS subqueries
                $query->leftJoin('residents', 'documents.resident_id', '=', 'residents.id')
                      ->where(function ($q) use ($searchTerm) {
                          $q->where('documents.document_number', 'ILIKE', "%{$searchTerm}%")
                            ->orWhere('documents.serial_number', 'ILIKE', "%{$searchTerm}%")
                            ->orWhere('documents.applicant_name', 'ILIKE', "%{$searchTerm}%")
                            ->orWhere('documents.received_from', 'ILIKE', "%{$searchTerm}%")
                            ->orWhere('documents.representing_entity', 'ILIKE', "%{$searchTerm}%")
                            ->orWhere('documents.acknowledgement_address', 'ILIKE', "%{$searchTerm}%")
                            ->orWhere('residents.first_name', 'ILIKE', "%{$searchTerm}%")
                            ->orWhere('residents.last_name', 'ILIKE', "%{$searchTerm}%");
                      })
                      ->whereNull('residents.deleted_at') // Exclude soft-deleted residents
                      ->select('documents.*'); // Only select document columns to avoid conflicts
            }
            \Log::info('Search applied', ['elapsed' => microtime(true) - $step4]);

            // Apply sorting
            $step5 = microtime(true);
            $sortBy = $request->get('sort_by', 'submitted_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);
            \Log::info('Sorting applied', ['elapsed' => microtime(true) - $step5]);

            // Pagination
            $step6 = microtime(true);
            $perPage = $request->get('per_page', 15);
            $documents = $query->paginate($perPage);
            \Log::info('Pagination executed', ['elapsed' => microtime(true) - $step6]);

            $step7 = microtime(true);
            $response = response()->json([
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
            \Log::info('Response built', ['elapsed' => microtime(true) - $step7]);
            
            $totalTime = microtime(true) - $startTime;
            \Log::info('DocumentController::index completed', ['total_time' => $totalTime]);
            
            return $response;

        } catch (\Exception $e) {
            $totalTime = microtime(true) - $startTime;
            \Log::error('DocumentController::index failed', [
                'total_time' => $totalTime,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
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

            // Mass create includes cash-bond fields if present in validation rules & $fillable
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
            $validationRules = array_map(function ($rule) use ($id) {
                return str_replace('{id}', $id, $rule);
            }, $validationRules);

            $validated = $request->validate($validationRules);

            // Mass update includes cash-bond fields if present in validation rules & $fillable
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
     * Get document statistics (OPTIMIZED - single query approach).
     */
    public function statistics(): JsonResponse
    {
        try {
            // Single optimized query to get all basic counts at once
            $basicStats = Document::selectRaw("
                COUNT(*) as total_documents,
                COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pending_documents,
                COUNT(CASE WHEN status = 'PROCESSING' THEN 1 END) as processing_documents,
                COUNT(CASE WHEN status = 'APPROVED' THEN 1 END) as approved_documents,
                COUNT(CASE WHEN status = 'RELEASED' THEN 1 END) as released_documents,
                COUNT(CASE WHEN status = 'REJECTED' THEN 1 END) as rejected_documents,
                COUNT(CASE WHEN priority IN ('urgent', 'rush') THEN 1 END) as urgent_documents,
                SUM(processing_fee) as total_processing_fees,
                SUM(CASE WHEN payment_status = 'UNPAID' THEN processing_fee ELSE 0 END) as unpaid_fees,
                SUM(CASE WHEN payment_status = 'PAID' THEN processing_fee ELSE 0 END) as paid_fees
            ")->first();

            // Optimized overdue count with single query
            $overdueCount = Document::whereRaw("needed_date < NOW() AND status NOT IN ('RELEASED', 'REJECTED', 'CANCELLED')")
                ->count();

            // Optimized grouped queries
            $byStatus = Document::selectRaw('status, COUNT(*) as count')
                ->groupBy('status')
                ->get()
                ->mapWithKeys(function ($item) {
                    return [$item->status => $item->count];
                });

            $byDocumentType = Document::selectRaw('type, COUNT(*) as count')
                ->groupBy('type')
                ->orderByDesc('count')
                ->get()
                ->mapWithKeys(function ($item) {
                    return [$item->type => $item->count];
                });

            $byPriority = Document::selectRaw('priority, COUNT(*) as count')
                ->groupBy('priority')
                ->get()
                ->mapWithKeys(function ($item) {
                    return [$item->priority => $item->count];
                });

            $byPaymentStatus = Document::selectRaw('payment_status, COUNT(*) as count')
                ->groupBy('payment_status')
                ->get()
                ->mapWithKeys(function ($item) {
                    return [$item->payment_status => $item->count];
                });

            // Monthly stats for current year only
            $monthlyStats = Document::selectRaw('
                    EXTRACT(YEAR FROM submitted_at) as year,
                    EXTRACT(MONTH FROM submitted_at) as month,
                    COUNT(*) as total_requests
                ')
                ->whereYear('submitted_at', now()->year)
                ->groupBy('year', 'month')
                ->orderBy('month')
                ->get();

            $stats = [
                'total_documents' => (int) $basicStats->total_documents,
                'pending_documents' => (int) $basicStats->pending_documents,
                'processing_documents' => (int) $basicStats->processing_documents,
                'approved_documents' => (int) $basicStats->approved_documents,
                'released_documents' => (int) $basicStats->released_documents,
                'rejected_documents' => (int) $basicStats->rejected_documents,
                'overdue_documents' => (int) $overdueCount,
                'urgent_documents' => (int) $basicStats->urgent_documents,
                'by_status' => $byStatus,
                'by_document_type' => $byDocumentType,
                'by_priority' => $byPriority,
                'by_payment_status' => $byPaymentStatus,
                'revenue' => [
                    'total_processing_fees' => (float) $basicStats->total_processing_fees,
                    'unpaid_fees' => (float) $basicStats->unpaid_fees,
                    'paid_fees' => (float) $basicStats->paid_fees,
                ],
                'monthly_stats' => $monthlyStats
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

    public function approve(Request $request, string $id): JsonResponse
    {
        try {
            $document = Document::findOrFail($id);

            $request->validate([
                'notes' => 'nullable|string',
                'certifying_official' => 'nullable|string|max:255'
            ]);

            if (!$document->canBeApproved()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Document cannot be approved from current status: ' . $document->status . '. Document must be in PENDING or PROCESSING status.'
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
                        'name' => $document->processedByUser->first_name . ' ' . $document->processedByUser->last_name,
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
                        'name' => $document->approvedByUser->first_name . ' ' . $document->approvedByUser->last_name,
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
                        'name' => $document->releasedByUser->first_name . ' ' . $document->releasedByUser->last_name,
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

            try {
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


    public function upload(Request $request, $id)
    {
        $request->validate([
            'file' => 'required|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:10240', // max 10MB
        ]);

        $document = \App\Models\Document::findOrFail($id);

        // Store file in /storage/app/public/documents
        $path = $request->file('file')->store('documents', 'public');

        // Generate public URL (assuming 'storage' is linked via php artisan storage:link)
        $url = asset('storage/' . $path);

        // Save URL in DB
        $document->uploaded_file_url = $url;
        $document->save();

        return response()->json([
            'success' => true,
            'uploaded_file_url' => $url,
        ], 200);
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

            $history[] = [
                'action' => 'created',
                'status' => 'pending',
                'description' => 'Document request created',
                'date' => $document->created_at,
                'user' => null
            ];

            if ($document->processed_at) {
                $history[] = [
                    'action' => 'processed',
                    'status' => 'processing',
                    'description' => 'Document processing started',
                    'date' => $document->processed_at,
                    'user' => $document->processedByUser ? [
                        'id' => $document->processedByUser->id,
                        'name' => $document->processedByUser->first_name . ' ' . $document->processedByUser->last_name,
                        'role' => $document->processedByUser->role,
                        'position' => $document->processedByUser->position
                    ] : null
                ];
            }

            if ($document->approved_at) {
                $history[] = [
                    'action' => 'approved',
                    'status' => 'approved',
                    'description' => 'Document approved for release',
                    'date' => $document->approved_at,
                    'user' => $document->approvedByUser ? [
                        'id' => $document->approvedByUser->id,
                        'name' => $document->approvedByUser->first_name . ' ' . $document->approvedByUser->last_name,
                        'role' => $document->approvedByUser->role,
                        'position' => $document->approvedByUser->position
                    ] : null
                ];
            }

            if ($document->released_at) {
                $history[] = [
                    'action' => 'released',
                    'status' => 'released',
                    'description' => 'Document released to applicant',
                    'date' => $document->released_at,
                    'user' => $document->releasedByUser ? [
                        'id' => $document->releasedByUser->id,
                        'name' => $document->releasedByUser->first_name . ' ' . $document->releasedByUser->last_name,
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

    private function mapFrontendStatusToBackend(string $frontendStatus): string
    {
        $statusMap = [
            'PENDING' => 'PENDING',
            'PROCESSING' => 'PROCESSING',
            'UNDER_REVIEW' => 'PROCESSING',
            'APPROVED' => 'APPROVED',
            'RELEASED' => 'RELEASED',
            'REJECTED' => 'REJECTED',
            'CANCELLED' => 'CANCELLED'
        ];

        return $statusMap[$frontendStatus] ?? $frontendStatus;
    }

    private function mapBackendStatusToFrontend(string $backendStatus): string
    {
        $statusMap = [
            'PENDING' => 'PENDING',
            'PROCESSING' => 'PROCESSING',
            'APPROVED' => 'APPROVED',
            'RELEASED' => 'RELEASED',
            'REJECTED' => 'REJECTED',
            'CANCELLED' => 'CANCELLED'
        ];

        return $statusMap[$backendStatus] ?? $backendStatus;
    }

    /**
     * Generate PDF for certificate document — now includes cash bond fields if present.
     */
    private function generateCertificatePDF($document): string
    {
        $content = "BARANGAY CERTIFICATE\n\n";
        $content .= "Document Number: " . $document->document_number . "\n";
        $content .= "Document Type: " . $document->type . "\n";
        $content .= "Applicant: " . $document->applicant_name . "\n";
        $content .= "Date Issued: " . now()->format('F d, Y') . "\n\n";

        // Cash Bond fields (optional lines)
        if (!empty($document->received_from)) {
            $content .= "Received From: " . $document->received_from . "\n";
        }
        if (!is_null($document->bond_amount)) {
            $content .= "Bond Amount: " . number_format((float) $document->bond_amount, 2) . "\n";
        }
        if (!empty($document->representing_entity)) {
            $content .= "Representing Entity: " . $document->representing_entity . "\n";
        }
        if (!empty($document->acknowledgement_address)) {
            $content .= "Acknowledgement Address: " . $document->acknowledgement_address . "\n";
        }

        $content .= "\nThis is to certify that the above information is true and correct.\n\n";
        $content .= "Issued by: Barangay " . config('app.name', 'LGU-IMS') . "\n";

        // Placeholder: return text (replace with actual PDF bytes in production)
        return $content;
    }
}
