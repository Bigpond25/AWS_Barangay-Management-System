<?php

namespace App\Models\Establishment\Clearances;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use App\Models\Establishment\Establishment;

class BarangayClearanceNew extends Model
{
    protected $table = 'barangay_clearances_new';

    protected $fillable = [
        'establishment_id',
        'applicant_name',
        'business_name',
        'location',
        'ownership',
        'record_no',
        'clearance_fee',
        'or_no',
        'remarks',
        'issued_date',
        'file_name',
        'file_path',
        'file_size',
        'file_type',
        'file_extension',
        'status',
        'issued_by',
    ];

    protected $hidden = [
        'file_name',
        'file_path',
        'file_size',
        'file_type',
        'file_extension',
    ];

    public function establishment()
    {
        return $this->belongsTo(Establishment::class);
    }

    public function issuedByUser()
    {
        return $this->belongsTo(User::class, 'issued_by', 'id');
    }
}
