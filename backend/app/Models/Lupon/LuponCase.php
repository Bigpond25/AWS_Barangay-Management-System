<?php

namespace App\Models\Lupon;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class LuponCase extends Model
{
    use HasFactory;

    protected $fillable = [
        'case_no',
        'case_title',
        'case_type',
        'date_filed',
        'mediator',
        'remarks',
        'final_action',
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

    public function parties()
    {
        return $this->hasMany(LuponParty::class);
    }

    public function hearings()
    {
        return $this->hasMany(LuponHearing::class);
    }

    public function attachments()
    {
        return $this->hasMany(LuponAttachment::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
