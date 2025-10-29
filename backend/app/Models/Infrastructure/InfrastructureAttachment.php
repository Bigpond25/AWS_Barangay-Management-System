<?php

namespace App\Models\Infrastructure;


use Illuminate\Database\Eloquent\Model;
use App\Models\Infrastructure\Infrastructure;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class InfrastructureAttachment extends Model
{
    use HasFactory;

    protected $fillable = [
        'infrastructure_id',
        'file_path',
        'file_name',
        'mime_type',
        'size',
    ];

    public function infrastructure()
    {
        return $this->belongsTo(Infrastructure::class);
    }
}
