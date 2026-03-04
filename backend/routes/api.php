<?php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;

// ── Routes publiques ────────────────────────────────────────────
Route::prefix('auth')->group(function () {

    // Email / password
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login']);

    // OAuth — Angular demande l'URL de redirection
    Route::get('/oauth/{provider}/redirect',  [AuthController::class, 'redirectToProvider']);

    // OAuth — Le provider redirige ici après autorisation
    Route::get('/oauth/{provider}/callback',  [AuthController::class, 'handleProviderCallback']);
});

// ── Routes protégées (Sanctum) ──────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me',      [AuthController::class, 'me']);

    // Tes autres routes protégées ici...
    // Route::apiResource('projects', ProjectController::class);
    // Route::apiResource('tasks',    TaskController::class);
});