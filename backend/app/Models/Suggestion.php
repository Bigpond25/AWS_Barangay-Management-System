<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

/**
 * @property-read Ticket|null $ticket
 */
class Suggestion extends Model
{
    use HasFactory;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'ticket_id',
        'category',
        'expected_benefits',
        'implementation_ideas',
        'resources_needed',
        'expected_benefits',
        'implementation_ideas',
        'resources_needed',
    ];

    const CATEGORIES = [
        'PUBLIC_SERVICES',
        'INFRASTRUCTURE',
        'SOCIAL_WELFARE',
        'PUBLIC_SAFETY',
        'HEALTH_SERVICES',
        'ENVIRONMENTAL',
        'EDUCATION',
        'BUSINESS_PERMITS',
        'COMMUNITY_PROGRAMS',
        'OTHERS'
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->id)) {
                $model->id = Str::uuid()->toString();
            }
        });
    }

    /**
     * Get the ticket that this suggestion belongs to
     */
    public function ticket(): BelongsTo
    {
        return $this->belongsTo(Ticket::class, 'ticket_id');
    }
}
