<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

/**
 * @property string $table_name
 * @property string $record_id
 * @property string $action_type
 * @property array|null $old_values
 * @property array|null $new_values
 * @property string|null $name (computed from causer relationship)
 * @property string|null $email (computed from causer relationship)
 * @property int $hour (computed from created_at)
 * @property int $day (computed from created_at)
 * @property int $activity_count (computed in queries)
 * @property string $timestamp (computed from created_at)
 */
class ActivityLog extends Model
{
    use HasUuids;
    
    protected $table = 'activity_logs';
    
    protected $fillable = [
        'log_name',
        'description',
        'subject_type',
        'subject_id',
        'causer_type',
        'causer_id',
        'properties',
        'event',
        'batch_uuid',
        'ip_address',
        'user_agent',
        'context',
        // Legacy fields for compatibility
        'user_id',
        'action_type',
        'table_name', 
        'record_id',
        'old_values',
        'new_values'
    ];

    protected $casts = [
        'properties' => 'json',
        'context' => 'json',
        'old_values' => 'json',
        'new_values' => 'json',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    /**
     * Create a new activity log entry
     * Maps legacy fields to new Spatie Activity Log format
     */
    public static function createLog(array $data): self
    {
        // Map legacy field names to new format
        $mappedData = [
            'log_name' => 'default',
            'description' => $data['description'] ?? '',
            'subject_type' => isset($data['table_name']) ? 'App\\Models\\' . ucfirst(str_replace('_', '', ucwords($data['table_name'], '_'))) : null,
            'subject_id' => $data['record_id'] ?? null,
            'causer_type' => isset($data['user_id']) ? 'App\\Models\\User' : null,
            'causer_id' => $data['user_id'] ?? null,
            'event' => $data['action_type'] ?? 'unknown',
            'ip_address' => $data['ip_address'] ?? request()->ip(),
            'user_agent' => $data['user_agent'] ?? request()->userAgent(),
            'properties' => [
                'old' => $data['old_values'] ?? null,
                'attributes' => $data['new_values'] ?? null,
            ],
        ];
        
        return static::create($mappedData);
    }

    /**
     * Relationship to the user who performed the action
     */
    public function causer()
    {
        return $this->morphTo();
    }

    /**
     * Relationship to the model that was acted upon
     */
    public function subject()
    {
        return $this->morphTo();
    }
}