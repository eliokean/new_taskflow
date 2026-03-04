<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',        // ← assure-toi que api.php est chargé
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {

        // ── CORS : doit être en tout premier ───────────────────────
        $middleware->prepend(\App\Http\Middleware\HandleCors::class);

        // ── Ignorer CSRF sur toutes les routes API ─────────────────
        $middleware->validateCsrfTokens(except: ['api/*']);

        // ── Sanctum SPA ────────────────────────────────────────────
        $middleware->api(prepend: [
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        ]);

    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })
    ->create();