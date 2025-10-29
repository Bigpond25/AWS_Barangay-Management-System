<?php

namespace App\Models\Infrastructure;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class InfrastructureClearance extends Model
{
    use HasFactory;

    protected $fillable = [
        'infrastructure_id',
        'applicant_name',
        'type_of_project',
        'address',
        'issued_date',
        'record_no',
        'remarks_and_condition',
        'file_name',
        'file_path',
        'file_size',
        'file_type',
        'file_extension',
        'issued_by',
    ];

    public function infrastructure()
    {
        return $this->belongsTo(Infrastructure::class);
    }

    public function issuedByUser()
    {
        return $this->belongsTo(User::class, 'issued_by');
    }
}
