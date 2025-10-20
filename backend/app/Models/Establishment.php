<?php

namespace App\Models;

use Illuminate\Support\Facades\Auth;
use Illuminate\Database\Eloquent\Model;

class Establishment extends Model
{
    protected $fillable = [
        'business_name',
        'room_unit',
        'building',
        'no',
        'location',
        'owner',
        'telephone',
        'nature_of_business',
        'representative',
        'position',
        'date_approved',
        'date_of_last_renewal',
        'type',
        'status',
        'capitalization',
        'remarks',
        'ctc_no',
        'date_issued',
        'amount_paid',
        'clearance_fee',
        'remarks_on_print_business',
        'date_of_retirement',
        'sign_wordings',
        'size',
        'material',
        'sign_amount_paid',
        'sign_date',
        'sign_or',
        'custom_date',
        'custom_paid',
        'custom_or',
        'date_retirement_clearance',
        'personal_clearance_fee',
        'retirement_clearance',
        'docs_attachment',
        'signature',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'docs_attachment' => 'array',
    ];

    protected static function booted() {
        parent::boot();

        static::creating(function ($establishment) {
            $establishment->created_by = Auth::user()->id;
        });

        static::updating(function ($establishment) {
            $establishment->updated_by = Auth::user()->id;
        });
    }
}
