<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Project extends Model
{
    protected $fillable = [
        'user_id',
        'intitule',
        'description',
        'color',
    ];

    // Un projet appartient à un utilisateur (créateur)
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Un projet contient plusieurs tâches
    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }
}