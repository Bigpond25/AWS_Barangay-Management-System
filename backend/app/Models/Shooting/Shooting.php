<?php

namespace App\Models\Shooting;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Shooting extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'date_of_application',
        'name_of_outfit',
        'program_title',
        'location',
        'time',
        'date_of_shooting',
        'requested_by',
        'or_no',
        'amount_paid',
        'remarks',
        'created_by',
        'updated_by',
    ];
}
