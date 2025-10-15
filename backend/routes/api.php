<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ResidentController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\HouseholdController;
use App\Http\Controllers\Api\DocumentController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\ComplaintController;
use App\Http\Controllers\Api\SuggestionController;
use App\Http\Controllers\Api\BlotterController;
use App\Http\Controllers\Api\AppointmentController;
use App\Http\Controllers\Api\BarangayOfficialController;
use App\Http\Controllers\Api\SettingController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ReportsController;
use App\Http\Controllers\Api\FileUploadController;
use App\Http\Controllers\Api\ImportController;
use App\Http\Controllers\Api\TicketController;
use App\Http\Controllers\Api\AgendaController;
use App\Http\Controllers\Api\PermissionController;
use App\Http\Controllers\Api\ConsentController;
use App\Http\Controllers\Api\StorageController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public routes
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
});

// Public Help Desk Routes (these remain public for citizen access)
Route::middleware('auth:sanctum')->prefix('help-desk')->group(function () {
    // Public appointments
    Route::prefix('appointments')->group(function () {
        Route::get('/view/{id}', [AppointmentController::class, 'view']);
        Route::post('/', [AppointmentController::class, 'store']);
        Route::put('/{id}', [AppointmentController::class, 'update']);
        Route::get('/check-vacancy', [AppointmentController::class, 'checkScheduleVacancy']);
    });

    // Public blotter
    Route::prefix('blotter')->group(function () {
        Route::get('/view/{id}', [BlotterController::class, 'view']);
        Route::post('/', [BlotterController::class, 'store']);
        Route::put('/{id}', [BlotterController::class, 'update']);
        Route::post('/{id}/photo', [BlotterController::class, 'uploadPhoto']);
    });

    // Public complaints
    Route::prefix('complaint')->group(function () {
        Route::get('/view/{id}', [ComplaintController::class, 'view']);
        Route::post('/', [ComplaintController::class, 'store']);
        Route::put('/{id}', [ComplaintController::class, 'update']);
    });

    // Public suggestions
    Route::prefix('suggestion')->group(function () {
        Route::get('/view/{id}', [SuggestionController::class, 'view']);
        Route::post('/', [SuggestionController::class, 'store']);
        Route::put('/{id}', [SuggestionController::class, 'update']);
    });
});
// Protected routes - All administrative functions require authentication
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::prefix('auth')->group(function () {
        Route::get('/user', [AuthController::class, 'user']);
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::post('/change-password', [AuthController::class, 'changePassword']);
        Route::post('/refresh', [AuthController::class, 'refresh']);
    });

    // Import/Export functionality
    Route::prefix('import')->middleware('permission:manage-users')->group(function () {
        Route::post('/residents', [ImportController::class, 'importResidents'])->middleware('permission:create-residents');
        Route::post('/households', [ImportController::class, 'importHouseholds'])->middleware('permission:create-households');
        Route::get('/history', [ImportController::class, 'getImportHistory'])->middleware('permission:view-reports');
    });

    // Storage functionality
    Route::prefix('storage')->group(function () {
        Route::post('/upload', [StorageController::class, 'upload']);
        Route::delete('/delete', [StorageController::class, 'delete']);
        Route::get('/url', [StorageController::class, 'getUrl']);
        Route::get('/metadata', [StorageController::class, 'getMetadata']);
        Route::get('/test-connection', [StorageController::class, 'testConnection']);
        Route::post('/signed-upload-url', [StorageController::class, 'getSignedUploadUrl']);
    });

    // Residents Management
    Route::prefix('residents')->name('residents.')->middleware('permission:view-residents')->group(function () {
        // Statistics endpoints
        Route::get('/statistics', [ResidentController::class, 'statistics'])->middleware('permission:view-reports')->name('statistics');
        Route::get('/age-groups', [ResidentController::class, 'ageGroups'])->name('age-groups');

        // Special list endpoints (matching frontend service)
        Route::get('/senior-citizens', [ResidentController::class, 'seniorCitizens'])->name('senior-citizens');
        Route::get('/pwd', [ResidentController::class, 'pwd'])->name('pwd');
        Route::get('/four-ps', [ResidentController::class, 'fourPs'])->name('four-ps');
        Route::get('/household-heads', [ResidentController::class, 'householdHeads'])->name('household-heads');
        Route::get('/indigenous', [ResidentController::class, 'indigenous'])->name('indigenous');

        // Utility endpoints
        Route::post('/check-duplicates', [ResidentController::class, 'checkDuplicates'])->name('check-duplicates')->middleware('permission:create-residents');
        Route::put('/{resident}/restore', [ResidentController::class, 'restore'])->name('restore')->middleware('permission:edit-residents');

        // Photo upload
        Route::post('/{resident}/photo', [ResidentController::class, 'uploadPhoto'])->name('upload-photo')->middleware('permission:edit-residents');

        // Relationship endpoints
        Route::get('/{resident}/relationships', [ResidentController::class, 'getResidentWithRelationships'])->name('relationships');
        Route::get('/{resident}/households', [ResidentController::class, 'getResidentHouseholds'])->name('households');
        Route::get('/{resident}/documents', [ResidentController::class, 'getResidentDocuments'])->name('documents');
        Route::get('/{resident}/tickets', [ResidentController::class, 'getResidentTickets'])->name('tickets');

        // Main CRUD operations
        Route::get('/', [ResidentController::class, 'index'])->name('index');
        Route::post('/', [ResidentController::class, 'store'])->name('store')->middleware('permission:create-residents');
        Route::get('/{resident}', [ResidentController::class, 'show'])->name('show');
        Route::put('/{resident}', [ResidentController::class, 'update'])->name('update')->middleware('permission:edit-residents');
        Route::delete('/{resident}', [ResidentController::class, 'destroy'])->name('destroy')->middleware('permission:delete-residents');
    });

    // Household Management
    Route::prefix('households')->name('households.')->middleware('permission:view-households')->group(function () {
        Route::get('/statistics', [HouseholdController::class, 'statistics'])->middleware('permission:view-reports')->name('statistics');

        // Special list endpoints (matching frontend service)
        Route::get('/four-ps', [HouseholdController::class, 'fourPs'])->name('four-ps');
        Route::get('/with-senior-citizens', [HouseholdController::class, 'withSeniorCitizens'])->name('with-senior-citizens');
        Route::get('/with-pwd', [HouseholdController::class, 'withPwd'])->name('with-pwd');
        Route::get('/by-type', [HouseholdController::class, 'byType'])->name('by-type');
        Route::get('/by-ownership', [HouseholdController::class, 'byOwnership'])->name('by-ownership');

        // Utility endpoints
        Route::post('/check-duplicates', [HouseholdController::class, 'checkDuplicates'])->name('check-duplicates')->middleware('permission:create-households');

        // Member management endpoints
        Route::put('/{household}/members', [HouseholdController::class, 'updateMembers'])->name('update-members')->middleware('permission:edit-households');
        Route::post('/{household}/members', [HouseholdController::class, 'addMember'])->name('add-member')->middleware('permission:edit-households');
        Route::delete('/{household}/members', [HouseholdController::class, 'removeMember'])->name('remove-member')->middleware('permission:edit-households');

        // Main CRUD operations
        Route::get('/', [HouseholdController::class, 'index'])->name('index');
        Route::post('/', [HouseholdController::class, 'store'])->name('store')->middleware('permission:create-households');
        Route::get('/{household}', [HouseholdController::class, 'show'])->name('show');
        Route::put('/{household}', [HouseholdController::class, 'update'])->name('update')->middleware('permission:edit-households');
        Route::delete('/{household}', [HouseholdController::class, 'destroy'])->name('destroy')->middleware('permission:delete-households');
    });

    // User Management
    Route::prefix('users')->name('users.')->middleware('permission:manage-users')->group(function () {
        // Core CRUD
        Route::get('/', [UserController::class, 'index'])->name('index');
        Route::post('/', [UserController::class, 'store'])->name('store');
        Route::get('/{id}', [UserController::class, 'show'])->name('show');
        Route::put('/{id}', [UserController::class, 'update'])->name('update');
        Route::delete('/{id}', [UserController::class, 'destroy'])->name('destroy');

        // Current User (accessible to all authenticated users)
        Route::prefix('me')->name('me.')->withoutMiddleware('permission:manage-users')->group(function () {
            Route::get('/', [UserController::class, 'me'])->name('show');
            Route::put('/', [UserController::class, 'updateMe'])->name('update');
            Route::post('/change-password', [UserController::class, 'changeMyPassword'])->name('change-password');
        });

        // Password Management
        Route::prefix('{id}')->middleware('permission:manage-users')->group(function () {
            Route::post('/change-password', [UserController::class, 'changePassword'])->name('change-password');
            Route::post('/reset-password', [UserController::class, 'resetPassword'])->name('reset-password');
        });

        // Status Management
        Route::put('/{id}/status', [UserController::class, 'changeStatus'])->name('change-status');

        // Verification & Communication
        Route::prefix('{id}')->middleware('permission:manage-users')->group(function () {
            Route::post('/verify', [UserController::class, 'verify'])->name('verify');
            Route::post('/resend-verification', [UserController::class, 'resendVerification'])->name('resend-verification');
            Route::post('/send-credentials', [UserController::class, 'sendCredentials'])->name('send-credentials');
        });

        // Validation
        Route::prefix('check')->name('check.')->middleware('permission:create-users')->group(function () {
            Route::get('/username', [UserController::class, 'checkUsername'])->name('username');
            Route::get('/email', [UserController::class, 'checkEmail'])->name('email');
        });

        // Queries
        Route::prefix('by')->name('by.')->group(function () {
            Route::get('/role/{role}', [UserController::class, 'byRole'])->name('role');
            Route::get('/department/{department}', [UserController::class, 'byDepartment'])->name('department');
        });

        // Security & Monitoring
        Route::prefix('{id}')->middleware('permission:view-users')->group(function () {
            Route::get('/activity', [UserController::class, 'activity'])->name('activity');
            Route::prefix('sessions')->name('sessions.')->middleware('permission:manage-users')->group(function () {
                Route::get('/', [UserController::class, 'sessions'])->name('index');
                Route::delete('/{sessionId}', [UserController::class, 'terminateSession'])->name('terminate');
                Route::delete('/', [UserController::class, 'terminateAllSessions'])->name('terminate-all');
            });
        });

        // Bulk & Import/Export
        Route::post('/bulk-action', [UserController::class, 'bulkAction'])->middleware('permission:manage-users')->name('bulk-action');
        Route::get('/export', [UserController::class, 'export'])->name('export');
        Route::post('/import', [UserController::class, 'import'])->name('import');

        // Statistics
        Route::get('/statistics', [UserController::class, 'statistics'])->middleware('permission:view-reports')->name('statistics');
    });

    // Barangay Officials Management
    Route::prefix('barangay-officials')->middleware('permission:view-officials')->group(function () {
        Route::get('/statistics', [BarangayOfficialController::class, 'statistics'])->middleware('permission:view-reports');
        Route::get('/active', [BarangayOfficialController::class, 'getActiveOfficials']);
        Route::get('/position/{position}', [BarangayOfficialController::class, 'getByPosition']);
        Route::get('/committee/{committee}', [BarangayOfficialController::class, 'getByCommittee']);
        Route::get('/export', [BarangayOfficialController::class, 'export'])->middleware('permission:view-reports');
        Route::post('/check-duplicate', [BarangayOfficialController::class, 'checkDuplicate'])->middleware('permission:create-officials');
        Route::get('/eligible-users', [BarangayOfficialController::class, 'getEligibleUsers'])->middleware('permission:create-officials');
        Route::get('/eligible-residents', [BarangayOfficialController::class, 'getEligibleResidents'])->middleware('permission:create-officials');
        Route::patch('/{barangayOfficial}/performance', [BarangayOfficialController::class, 'updatePerformance'])->middleware('permission:edit-officials');
        Route::post('/{barangayOfficial}/archive', [BarangayOfficialController::class, 'archive'])->middleware('permission:edit-officials');
        Route::post('/{barangayOfficial}/reactivate', [BarangayOfficialController::class, 'reactivate'])->middleware('permission:edit-officials');
    });
    Route::apiResource('barangay-officials', BarangayOfficialController::class)->middleware('permission:view-officials');

    // Help Desk Management (Administrative)
    Route::prefix('help-desk')->middleware('permission:view-complaints')->group(function () {
        Route::get('/', [TicketController::class, 'index']);
        Route::get('/statistics', [TicketController::class, 'statistics'])->middleware('permission:view-reports');
        Route::delete('/{id}', [TicketController::class, 'destroy'])->middleware('permission:delete-complaints');

        // Administrative appointments - allow dashboard access with basic auth
        Route::get('/appointments', [AppointmentController::class, 'index'])->withoutMiddleware('permission:view-complaints');
    });

    // Settings Management
    Route::prefix('settings')->middleware('permission:system-settings')->group(function () {
        Route::get('/', [SettingController::class, 'index']);
        Route::put('/', [SettingController::class, 'update']);
        Route::post('/reset', [SettingController::class, 'reset']);
        Route::post('/backup', [SettingController::class, 'backup']);
        Route::get('/backups', [SettingController::class, 'backups']);
        Route::post('/restore', [SettingController::class, 'restore']);
        Route::get('/history', [SettingController::class, 'history']);
        Route::post('/test', [SettingController::class, 'test']);
    });

    // Dashboard
    Route::prefix('dashboard')->middleware('permission:view-dashboard')->group(function () {
        Route::get('/statistics', [DashboardController::class, 'statistics']);
        Route::get('/demographics', [DashboardController::class, 'demographics']);
        Route::get('/notifications', [DashboardController::class, 'notifications']);
        Route::get('/activities', [DashboardController::class, 'activities']);
        Route::get('/barangay-officials', [DashboardController::class, 'barangayOfficials']);
    });

    // Projects Management
    Route::prefix('projects')->middleware('permission:view-projects')->group(function () {
        Route::get('/statistics', [ProjectController::class, 'statistics']);
    });
    Route::apiResource('projects', ProjectController::class)->middleware('permission:view-projects');

    // Reports
    Route::prefix('reports')->middleware('permission:view-reports')->group(function () {
        Route::get('/statistics', [ReportsController::class, 'getStatisticsOverview']);
        Route::get('/age-group-distribution', [ReportsController::class, 'getAgeGroupDistribution']);
        Route::get('/special-population-registry', [ReportsController::class, 'getSpecialPopulationRegistry']);
        Route::get('/monthly-revenue', [ReportsController::class, 'getMonthlyRevenue']);
        Route::get('/population-distribution-by-street', [ReportsController::class, 'getPopulationDistributionByPurok']);
        Route::get('/document-types-issued', [ReportsController::class, 'getDocumentTypesIssued']);
        Route::get('/most-requested-services', [ReportsController::class, 'getMostRequestedServices']);
        Route::get('/filter-options', [ReportsController::class, 'getFilterOptions']);
    });

    // Document Management
    Route::prefix('documents')->middleware('permission:view-documents')->group(function () {
        Route::get('/', [DocumentController::class, 'index']);
        Route::post('/', [DocumentController::class, 'store'])->middleware('permission:create-documents');
        Route::get('/statistics', [DocumentController::class, 'statistics']);
        Route::get('/overdue', [DocumentController::class, 'overdue']);
        Route::get('/pending', [DocumentController::class, 'pending']);
        Route::get('/{id}', [DocumentController::class, 'show']);
        Route::put('/{id}', [DocumentController::class, 'update'])->middleware('permission:edit-documents');
        Route::delete('/{id}', [DocumentController::class, 'destroy'])->middleware('permission:delete-documents');
        Route::get('/{id}/tracking', [DocumentController::class, 'tracking']);
        Route::get('/{id}/history', [DocumentController::class, 'history']);
        Route::get('/{id}/pdf', [DocumentController::class, 'pdf']);
        Route::post('/{id}/process', [DocumentController::class, 'process'])->middleware('permission:process-documents');
        Route::post('/{id}/approve', [DocumentController::class, 'approve'])->middleware('permission:approve-documents');
        Route::post('/{id}/reject', [DocumentController::class, 'reject'])->middleware('permission:approve-documents');
        Route::post('/{id}/release', [DocumentController::class, 'release'])->middleware('permission:release-documents');
        Route::post('/{id}/cancel', [DocumentController::class, 'cancel'])->middleware('permission:edit-documents');
    });

    // File Upload
    Route::post('/upload', [FileUploadController::class, 'upload'])->middleware('permission:create-documents');

    // Agendas Management
    Route::prefix('agendas')->middleware('permission:view-projects')->group(function () {
        Route::get('/statistics', [AgendaController::class, 'statistics']);
        Route::get('/calendar', [AgendaController::class, 'calendar']);
        Route::get('/date-range', [AgendaController::class, 'dateRange']);
        Route::get('/search', [AgendaController::class, 'search']);
        Route::get('/export', [AgendaController::class, 'export'])->middleware('permission:view-reports');
        Route::patch('/{agenda}/status', [AgendaController::class, 'updateStatus'])->middleware('permission:edit-projects');
        Route::post('/{agenda}/duplicate', [AgendaController::class, 'duplicate'])->middleware('permission:create-projects');
    });
    Route::apiResource('agendas', AgendaController::class)->middleware('permission:view-projects');

    // Permission Management
    Route::prefix('permissions')->name('permissions.')->middleware('permission:manage-roles')->group(function () {
        Route::get('/', [PermissionController::class, 'getPermissions'])->name('index');
        Route::get('/roles', [PermissionController::class, 'getRolePermissions'])->name('roles');
        Route::put('/roles/{role}', [PermissionController::class, 'updateRolePermissions'])->name('update-role');
        Route::get('/users/{userId}', [PermissionController::class, 'getUserPermissions'])->name('user');
    });

    // Data Consent Management
    Route::prefix('consents')->name('consents.')->group(function () {
        // Public consent routes (for consent recording)
        Route::post('/', [ConsentController::class, 'recordConsent'])->name('record');
        Route::get('/types', [ConsentController::class, 'getConsentTypes'])->name('types');

        // Protected consent routes
        Route::middleware('auth:sanctum')->group(function () {
            Route::post('/check', [ConsentController::class, 'checkConsent'])->name('check');
            Route::put('/{consentId}/withdraw', [ConsentController::class, 'withdrawConsent'])->name('withdraw');
            Route::get('/user/{userId?}', [ConsentController::class, 'getUserConsents'])->name('user');
            Route::get('/active/{userId?}', [ConsentController::class, 'getActiveConsents'])->name('active');

            // Admin only routes
            Route::middleware('permission:manage-consents')->group(function () {
                Route::get('/all', [ConsentController::class, 'getAllConsents'])->name('all');
                Route::get('/export', [ConsentController::class, 'exportConsents'])->name('export');
            });
        });
    });
});
