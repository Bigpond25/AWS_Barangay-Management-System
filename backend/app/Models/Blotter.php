<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

/**
 * @property Ticket|null $ticket The associated ticket relationship
 * @property string|null $date_of_incident Legacy/computed incident date field
 * @property string|null $time_of_incident Legacy/computed incident time field
 * @property string|null $location_of_incident Legacy/computed incident location field
 * @property string|null $description Legacy/computed incident description
 */
class Blotter extends Model
{
    use HasFactory;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'ticket_id',
        'base_ticket_id',
        'type_of_incident',
        'incident_date',
        'incident_time',
        'incident_location',
        'incident_narrative'
    ];

    protected $casts = [
        'incident_date' => 'date',
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

    public function ticket()
    {
        return $this->belongsTo(Ticket::class, 'ticket_id');
    }

    public function otherPeopleInvolved()
    {
        return $this->hasMany(OtherPersonInvolved::class);
    }

    public function supportingDocuments()
    {
        return $this->hasMany(SupportingDocument::class);
    }
}
