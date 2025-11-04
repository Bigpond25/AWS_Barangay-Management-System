<?php

namespace App\Models\Lupon;

use Illuminate\Support\Facades\Auth;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class LuponAttachment extends Model
{
    use HasFactory;

    protected $fillable = [
        'lupon_case_id',
        'lupon_hearing_id',
        'file_name',
        'file_path',
        'file_type',
        'description',
        'created_by',
        'updated_by',
    ];

    protected static function booted()
    {
        parent::boot();

        static::creating(function ($case) {
            $case->created_by = Auth::user()->id;
        });

        static::updating(function ($case) {
            $case->updated_by = Auth::user()->id;
        });
    }

    /**
     * Relationship: belongs to a Lupon Case
     */
    public function case()
    {
        return $this->belongsTo(LuponCase::class, 'lupon_case_id');
    }

    /**
     * Relationship: belongs to a Lupon Hearing (optional)
     */
    public function hearing()
    {
        return $this->belongsTo(LuponHearing::class, 'lupon_hearing_id');
    }

    /**
     * Relationship: created by a user
     */
    public function creator()
    {
        return $this->belongsTo(\App\Models\User::class, 'created_by');
    }

    /**
     * Accessor for full file URL (optional)
     */
    public function getFileUrlAttribute(): ?string
    {
        return $this->file_path ? asset($this->file_path) : null;
    }
}
