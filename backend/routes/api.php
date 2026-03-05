<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\TaskController;
use Illuminate\Support\Facades\Route;

// ── Routes publiques ────────────────────────────────────────────
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login']);
    Route::get('/oauth/{provider}/redirect', [AuthController::class, 'redirectToProvider']);
    Route::get('/oauth/{provider}/callback', [AuthController::class, 'handleProviderCallback']);
});

// ── Routes protégées (Sanctum) ──────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me',      [AuthController::class, 'me']);

    // Projets
    Route::apiResource('projects', ProjectController::class);

    // Utilisateurs (pour l'assignation)
    Route::get('users/stats', [AuthController::class, 'usersWithStats']);
    Route::get('users', [AuthController::class, 'users']);
    

    // Tâches imbriquées dans un projet (liste + création)
    Route::get ('projects/{project}/tasks', [TaskController::class, 'index']);
    Route::post('projects/{project}/tasks', [TaskController::class, 'store']);

    Route::get('tasks/assigned', [TaskController::class, 'assigned']);
    Route::get('tasks/{task}',   [TaskController::class, 'show']);
// ...

    // Tâches standalone (détail + modif + suppression)
    Route::get   ('tasks/{task}',          [TaskController::class, 'show']);
    Route::put   ('tasks/{task}',          [TaskController::class, 'update']);
    Route::delete('tasks/{task}',          [TaskController::class, 'destroy']);

    // Assignation d'utilisateurs à une tâche
    Route::post  ('tasks/{task}/assign',   [TaskController::class, 'assign']);
    Route::delete('tasks/{task}/unassign', [TaskController::class, 'unassign']);
});