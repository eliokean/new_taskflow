<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class HandleCors
{
    private function allowedOrigins(): array
    {
        return array_filter([
            'http://localhost:4200',
            env('FRONTEND_URL'),        // ex: https://ton-app.vercel.app
        ]);
    }

    private function resolveOrigin(Request $request): string
    {
        $origin = $request->headers->get('Origin', '');

        return in_array($origin, $this->allowedOrigins())
            ? $origin
            : 'http://localhost:4200';
    }

    public function handle(Request $request, Closure $next): Response
    {
        $origin = $this->resolveOrigin($request);

        if ($request->isMethod('OPTIONS')) {
            return response()->noContent()
                ->header('Access-Control-Allow-Origin',      $origin)
                ->header('Access-Control-Allow-Methods',     'GET, POST, PUT, PATCH, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers',     'Authorization, Content-Type, Accept, X-Requested-With')
                ->header('Access-Control-Allow-Credentials', 'true');
        }

        $response = $next($request);

        $response->headers->set('Access-Control-Allow-Origin',      $origin);
        $response->headers->set('Access-Control-Allow-Methods',     'GET, POST, PUT, PATCH, DELETE, OPTIONS');
        $response->headers->set('Access-Control-Allow-Headers',     'Authorization, Content-Type, Accept, X-Requested-With');
        $response->headers->set('Access-Control-Allow-Credentials', 'true');

        return $response;
    }
}