<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use OwenIt\Auditing\Contracts\Auditable;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Appointment extends Model implements Auditable
{
    use HasFactory, HasUuids;
    use \OwenIt\Auditing\Auditable;

    protected $auditModel = ActivityLog::class;

    public function transformAudit(array $data): array
    {
        return [
            'user_id' => Auth::id() ?? null,
            'action_type' => $data['event'], // created, updated, deleted
            'auditable_type' => get_class($this),
            'auditable_id' => $this->getKey(),
            'table_name' => $this->getTable(),
            'record_id' => $this->getKey(),
            'old_values' => $data['old_values'] ?? null,
            'new_values' => $data['new_values'] ?? null,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'timestamp' => now(),
            'description' => $this->generateDescription($data['event'])
        ];
    }

    private function generateDescription($event)
    {
        $user = Auth::user() ? Auth::user()->name : 'System';
        return match ($event) {
            'created' => "{$user} created a new appointment record",
            'updated' => "{$user} updated appointment information",
            'deleted' => "{$user} deleted a appointment record",
            default => "{$user} performed {$event} action"
        };
    }

    protected $keyType = 'string';
    public $incrementing = false;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'ticket_id',
        'department',
        'purpose',
        
        // Scheduling Information
        'preferred_date',
        'preferred_time',
        'alternative_date',
        'alternative_time',
        'additional_notes',
        
        // System Processing Fields
        'appointment_date',
        'appointment_time',
        'end_time',
        'duration_minutes',
        
        // Location & Assignment
        'location',
        'room_venue',
        'assigned_official',
        'assigned_official_name',
        
        // Status & Dates
        'status',
        'date_requested',
        'confirmed_date',
        'actual_start_time',
        'actual_end_time',
        
        // Rescheduling
        'original_date',
        'original_time',
        'reschedule_reason',
        'reschedule_count',
        
        // Meeting Details
        'meeting_notes',
        'action_items',
        'outcome_summary',
        'resolution_status',
        
        // Priority & Special Flags
        'priority',
        'is_walk_in',
        'is_emergency',
        
        // Notifications
        'confirmation_sent',
        'reminder_sent',
        'confirmation_sent_at',
        'reminder_sent_at',
        
        // Additional
        'attachments',
        'reference_number',
        'remarks',
        
        // System Fields
        'created_by',
        'updated_by',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'preferred_date' => 'date',
        'alternative_date' => 'date',
        'appointment_date' => 'date',
        'appointment_time' => 'datetime:H:i',
        'end_time' => 'datetime:H:i',
        'date_requested' => 'date',
        'confirmed_date' => 'datetime',
        'actual_start_time' => 'datetime',
        'actual_end_time' => 'datetime',
        'original_date' => 'date',
        'original_time' => 'datetime:H:i',
        'reschedule_count' => 'integer',
        'duration_minutes' => 'integer',
        'is_walk_in' => 'boolean',
        'is_emergency' => 'boolean',
        'confirmation_sent' => 'boolean',
        'reminder_sent' => 'boolean',
        'confirmation_sent_at' => 'datetime',
        'reminder_sent_at' => 'datetime',
        'attachments' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Constants for status values
     */
    const STATUS_PENDING = 'PENDING';
    const STATUS_CONFIRMED = 'CONFIRMED';
    const STATUS_RESCHEDULED = 'RESCHEDULED';
    const STATUS_COMPLETED = 'COMPLETED';
    const STATUS_CANCELLED = 'CANCELLED';
    const STATUS_NO_SHOW = 'NO_SHOW';

    /**
     * Constants for priority values
     */
    const PRIORITY_LOW = 'LOW';
    const PRIORITY_NORMAL = 'NORMAL';
    const PRIORITY_HIGH = 'HIGH';
    const PRIORITY_URGENT = 'URGENT';

    /**
     * Constants for resolution status
     */
    const RESOLUTION_PENDING = 'PENDING';
    const RESOLUTION_RESOLVED = 'RESOLVED';
    const RESOLUTION_ONGOING = 'ONGOING';
    const RESOLUTION_ESCALATED = 'ESCALATED';

    /**
     * Constants for departments
     */
    const DEPARTMENTS = [
        'ADMINISTRATION',
        'HEALTH_SERVICES',
        'SOCIAL_SERVICES',
        'SECURITY_PUBLIC_SAFETY',
        'FINANCE_TREASURY',
        'RECORDS_MANAGEMENT',
        'COMMUNITY_DEVELOPMENT',
        'DISASTER_RISK_REDUCTION',
        'ENVIRONMENTAL_MANAGEMENT',
        'YOUTH_SPORTS_DEVELOPMENT',
        'SENIOR_CITIZEN_AFFAIRS',
        'WOMENS_AFFAIRS',
        'BUSINESS_PERMITS',
        'INFRASTRUCTURE_DEVELOPMENT'
    ];

    /**
     * Get the validation rules for creating a new appointment
     */
    public static function getCreateRules(): array
    {
        return [
            'appointment_number' => 'required|string|max:255|unique:appointments,appointment_number',
            'full_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:20',
            'department' => 'required|string|max:255',
            'purpose' => 'required|string',
            'preferred_date' => 'required|date',
            'preferred_time' => 'required|string|max:10',
            'alternative_date' => 'nullable|date',
            'alternative_time' => 'nullable|string|max:10',
            'additional_notes' => 'nullable|string',
            'appointment_date' => 'nullable|date',
            'appointment_time' => 'nullable|date_format:H:i',
            'end_time' => 'nullable|date_format:H:i',
            'duration_minutes' => 'nullable|integer|min:15|max:480',
            'location' => 'nullable|string|max:255',
            'room_venue' => 'nullable|string|max:255',
            'assigned_official' => 'nullable|exists:users,id',
            'assigned_official_name' => 'nullable|string|max:255',
            'status' => 'nullable|in:PENDING,CONFIRMED,RESCHEDULED,COMPLETED,CANCELLED,NO_SHOW',
            'date_requested' => 'required|date',
            'confirmed_date' => 'nullable|date',
            'actual_start_time' => 'nullable|date',
            'actual_end_time' => 'nullable|date',
            'original_date' => 'nullable|date',
            'original_time' => 'nullable|date_format:H:i',
            'reschedule_reason' => 'nullable|string',
            'reschedule_count' => 'nullable|integer|min:0',
            'meeting_notes' => 'nullable|string',
            'action_items' => 'nullable|string',
            'outcome_summary' => 'nullable|string',
            'resolution_status' => 'nullable|in:PENDING,RESOLVED,ONGOING,ESCALATED',
            'priority' => 'nullable|in:LOW,NORMAL,HIGH,URGENT',
            'is_walk_in' => 'nullable|boolean',
            'is_emergency' => 'nullable|boolean',
            'confirmation_sent' => 'nullable|boolean',
            'reminder_sent' => 'nullable|boolean',
            'confirmation_sent_at' => 'nullable|date',
            'reminder_sent_at' => 'nullable|date',
            'attachments' => 'nullable|array',
            'reference_number' => 'nullable|string|max:100',
            'remarks' => 'nullable|string',
            'created_by' => 'nullable|exists:users,id',
            'updated_by' => 'nullable|exists:users,id',
        ];
    }

    /**
     * Get the validation rules for updating an appointment
     */
    public static function getUpdateRules(): array
    {
        return [
            'appointment_number' => 'sometimes|required|string|max:255|unique:appointments,appointment_number',
            'full_name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|max:255',
            'phone' => 'sometimes|required|string|max:20',
            'department' => 'sometimes|required|string|max:255',
            'purpose' => 'sometimes|required|string',
            'preferred_date' => 'sometimes|required|date',
            'preferred_time' => 'sometimes|required|string|max:10',
            'alternative_date' => 'nullable|date',
            'alternative_time' => 'nullable|string|max:10',
            'additional_notes' => 'nullable|string',
            'appointment_date' => 'nullable|date',
            'appointment_time' => 'nullable|date_format:H:i',
            'end_time' => 'nullable|date_format:H:i',
            'duration_minutes' => 'nullable|integer|min:15|max:480',
            'location' => 'nullable|string|max:255',
            'room_venue' => 'nullable|string|max:255',
            'assigned_official' => 'nullable|exists:users,id',
            'assigned_official_name' => 'nullable|string|max:255',
            'status' => 'nullable|in:PENDING,CONFIRMED,RESCHEDULED,COMPLETED,CANCELLED,NO_SHOW',
            'date_requested' => 'sometimes|required|date',
            'confirmed_date' => 'nullable|date',
            'actual_start_time' => 'nullable|date',
            'actual_end_time' => 'nullable|date',
            'original_date' => 'nullable|date',
            'original_time' => 'nullable|date_format:H:i',
            'reschedule_reason' => 'nullable|string',
            'reschedule_count' => 'nullable|integer|min:0',
            'meeting_notes' => 'nullable|string',
            'action_items' => 'nullable|string',
            'outcome_summary' => 'nullable|string',
            'resolution_status' => 'nullable|in:PENDING,RESOLVED,ONGOING,ESCALATED',
            'priority' => 'nullable|in:LOW,NORMAL,HIGH,URGENT',
            'is_walk_in' => 'nullable|boolean',
            'is_emergency' => 'nullable|boolean',
            'confirmation_sent' => 'nullable|boolean',
            'reminder_sent' => 'nullable|boolean',
            'confirmation_sent_at' => 'nullable|date',
            'reminder_sent_at' => 'nullable|date',
            'attachments' => 'nullable|array',
            'reference_number' => 'nullable|string|max:100',
            'remarks' => 'nullable|string',
            'created_by' => 'nullable|exists:users,id',
            'updated_by' => 'nullable|exists:users,id',
        ];
    }

    /**
     * Relationships
     */

    /**
     * Get the ticket associated with this appointment
     */
    public function ticket(): BelongsTo
    {
        return $this->belongsTo(Ticket::class, 'ticket_id');
    }

    /**
     * Get the assigned official for this appointment
     */
    public function assignedOfficial(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_official');
    }

    /**
     * Get the user who created this appointment
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who last updated this appointment
     */
    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Scopes
     */

    /**
     * Scope for checking schedule conflicts
     */
    public function scopeByDateAndTime($query, $date, $time)
    {
        return $query->whereDate('appointment_date', $date)
            ->where('appointment_time', $time);
    }

    /**
     * Scope to filter by department
     */
    public function scopeByDepartment($query, $department)
    {
        return $query->where('department', $department);
    }
<<<<<<< HEAD

    /**
     * Scope to filter by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope to filter by priority
     */
    public function scopeByPriority($query, $priority)
    {
        return $query->where('priority', $priority);
    }

    /**
     * Scope to filter by date range
     */
    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('appointment_date', [$startDate, $endDate]);
    }

    /**
     * Scope for pending appointments
     */
    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    /**
     * Scope for confirmed appointments
     */
    public function scopeConfirmed($query)
    {
        return $query->where('status', self::STATUS_CONFIRMED);
    }

    /**
     * Scope for today's appointments
     */
    public function scopeToday($query)
    {
        return $query->whereDate('appointment_date', now()->toDateString());
    }

    /**
     * Scope for upcoming appointments
     */
    public function scopeUpcoming($query, $days = 7)
    {
        return $query->where('appointment_date', '>=', now()->toDateString())
                    ->where('appointment_date', '<=', now()->addDays($days)->toDateString())
                    ->orderBy('appointment_date')
                    ->orderBy('appointment_time');
    }

    /**
     * Methods
     */

    /**
     * Confirm the appointment
     */
    public function confirm($confirmedDate = null, $confirmedTime = null)
    {
        $this->update([
            'status' => self::STATUS_CONFIRMED,
            'appointment_date' => $confirmedDate ?: $this->preferred_date,
            'appointment_time' => $confirmedTime ?: $this->preferred_time,
            'confirmed_date' => now(),
            'updated_by' => Auth::id(),
        ]);

        return $this;
    }

    /**
     * Reschedule the appointment
     */
    public function reschedule($newDate, $newTime, $reason = null)
    {
        $this->update([
            'status' => self::STATUS_RESCHEDULED,
            'original_date' => $this->appointment_date ?: $this->preferred_date,
            'original_time' => $this->appointment_time ?: $this->preferred_time,
            'appointment_date' => $newDate,
            'appointment_time' => $newTime,
            'reschedule_reason' => $reason,
            'reschedule_count' => $this->reschedule_count + 1,
            'updated_by' => Auth::id(),
        ]);

        return $this;
    }

    /**
     * Cancel the appointment
     */
    public function cancel($reason = null)
    {
        $this->update([
            'status' => self::STATUS_CANCELLED,
            'remarks' => $reason ? $this->remarks . "\n\nCancelled: " . $reason : $this->remarks,
            'updated_by' => Auth::id(),
        ]);

        return $this;
    }

    /**
     * Mark appointment as completed
     */
    public function complete($notes = null, $outcome = null)
    {
        $this->update([
            'status' => self::STATUS_COMPLETED,
            'actual_end_time' => now(),
            'meeting_notes' => $notes,
            'outcome_summary' => $outcome,
            'updated_by' => Auth::id(),
        ]);

        return $this;
    }

    /**
     * Start the appointment
     */
    public function start()
    {
        $this->update([
            'actual_start_time' => now(),
            'updated_by' => Auth::id(),
        ]);

        return $this;
    }
}
=======
}
>>>>>>> dev
