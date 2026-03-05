<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Si tu n'as pas encore migré la table projects,
        // ajoute 'color' directement dans 2024_01_01_000002_create_projects_table.php
        // Sinon utilise cette migration séparée :
        Schema::table('projects', function (Blueprint $table) {
            $table->string('color')->default('teal')->after('description');
        });
    }

    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn('color');
        });
    }
};