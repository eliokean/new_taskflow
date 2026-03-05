<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')              // projet parent
                  ->constrained()
                  ->cascadeOnDelete();
            $table->foreignId('created_by')              // utilisateur qui a créé la tâche
                  ->constrained('users')
                  ->cascadeOnDelete();
            $table->string('titre');
            $table->longText('description')->nullable();
            $table->enum('statut',   ['a_faire', 'en_cours', 'termine'])->default('a_faire');
            $table->enum('priorite', ['basse', 'moyenne', 'haute'])->default('moyenne');
            $table->timestamp('due_date')->nullable();   // date limite optionnelle
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};