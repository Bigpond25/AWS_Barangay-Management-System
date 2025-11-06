<?php

namespace App\Models\Infrastructure;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\Infrastructure\InfrastructureClearance;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Infrastructure\InfrastructureAttachment;


class Infrastructure extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'date_of_application',
        'type_of_project',
        'classification',
        'name_of_applicant',
        'address_of_applicant',
        'applicant_contact_no',
        'applicants_representative',
        'location_of_project',
        'property_owner',
        'contractor',
        'contractors_address',
        'contractors_contact_person',
        'contractors_contact_no',
        'remarks_on_clearance',
        'remarks_hidden',
        'bond_amount_words',
        'bond_amount_figure',
        'created_by',
        'updated_by',
    ];

    public function attachments()
    {
        return $this->hasMany(InfrastructureAttachment::class);
    }

    public function barangayClearances()
    {
        return $this->hasMany(InfrastructureClearance::class);
    }
}
