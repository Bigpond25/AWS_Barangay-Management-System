<?php

// app/Models/Ticket.php
namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Ticket extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'ticket_number',
        'description',
        'category',
        'type',
        'subject',
        'message',
        'priority',
        'status',
        'resident_id',
        'assigned_to',
        'resolved_at',
        'resolution_notes',
        'created_by',
        'updated_by'
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Constants for enums
    const CATEGORIES = ['APPOINTMENT', 'BLOTTER', 'COMPLAINT', 'SUGGESTION'];
    const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    const STATUSES = ['OPEN', 'IN_PROGRESS', 'PENDING', 'RESOLVED', 'CLOSED'];

    public function appointment(): HasOne
    {
        return $this->hasOne(Appointment::class, 'base_ticket_id');
    }

    public function resident(): BelongsTo
    {
        return $this->belongsTo(Resident::class);
    }

    // Scopes
    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function createdByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    // Boot method to generate ticket number
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($ticket) {
            if (empty($ticket->ticket_number)) {
                $ticket->ticket_number = static::generateTicketNumber($ticket->type);
            }
            if (empty($ticket->status)) {
                $ticket->status = 'OPEN';
            }
        });
    }

    private static function generateTicketNumber($type): string
    {
        $prefix = match ($type) {
            'APPOINTMENT' => 'APT',
            'BLOTTER' => 'BLT',
            'COMPLAINT' => 'CMP',
            'SUGGESTION' => 'SUG',
            default => 'TKT'
        };

        $year = date('Y');
        $month = date('m');

        // Get the latest ticket number for this type and month
        $lastTicket = static::where('type', $type)
            ->where('ticket_number', 'like', "{$prefix}-{$year}{$month}%")
            ->orderBy('ticket_number', 'desc')
            ->first();

        if ($lastTicket) {
            $lastNumber = (int) substr($lastTicket->ticket_number, -4);
            $nextNumber = $lastNumber + 1;
        } else {
            $nextNumber = 1;
        }

        return sprintf('%s-%s%s-%04d', $prefix, $year, $month, $nextNumber);
    }
}
