<?php

namespace App\Models\Lupon;

use Illuminate\Support\Facades\Auth;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class LuponParty extends Model
{
    use HasFactory;

    protected $fillable = [
        'lupon_case_id',
        'type',
        'name',
        'address_line1',
        'address_line2',
        'address_line3',
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


    public function creator()
    {
        return $this->belongsTo(\App\Models\User::class, 'created_by');
    }
}
