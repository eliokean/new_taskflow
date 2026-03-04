<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class HandleCors
{
    public function handle(Request $request, Closure $next): Response
    {
        // Répondre immédiatement aux preflight OPTIONS
        if ($request->isMethod('OPTIONS')) {
            return response()->noContent()
                ->header('Access-Control-Allow-Origin',      'http://localhost:4200')
                ->header('Access-Control-Allow-Methods',     'GET, POST, PUT, PATCH, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers',     'Authorization, Content-Type, Accept, X-Requested-With')
                ->header('Access-Control-Allow-Credentials', 'true');
        }

        $response = $next($request);

        $response->headers->set('Access-Control-Allow-Origin',      'http://localhost:4200');
        $response->headers->set('Access-Control-Allow-Methods',     'GET, POST, PUT, PATCH, DELETE, OPTIONS');
        $response->headers->set('Access-Control-Allow-Headers',     'Authorization, Content-Type, Accept, X-Requested-With');
        $response->headers->set('Access-Control-Allow-Credentials', 'true');

        return $response;
    }
}