<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller
{
    // ──────────────────────────────────────────────
    // REGISTER
    // ──────────────────────────────────────────────
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
        ]);

        $user = User::create([
            'name'     => $validated['name'],
            'email'    => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        $token = $user->createToken('taskflow-token')->plainTextToken;

        return response()->json([
            'user'  => $user,
            'token' => $token,
        ], 201);
    }

    // ──────────────────────────────────────────────
    // LOGIN
    // ──────────────────────────────────────────────
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'message' => 'Identifiants incorrects.',
            ], 401);
        }

        // Supprimer les anciens tokens (optionnel)
        $user->tokens()->delete();

        $token = $user->createToken('taskflow-token')->plainTextToken;

        return response()->json([
            'user'  => $user,
            'token' => $token,
        ]);
    }

    // ──────────────────────────────────────────────
    // LOGOUT
    // ──────────────────────────────────────────────
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Déconnecté avec succès.']);
    }

    // ──────────────────────────────────────────────
    // ME (utilisateur connecté)
    // ──────────────────────────────────────────────
    public function me(Request $request): JsonResponse
    {
        return response()->json($request->user());
    }

    // ──────────────────────────────────────────────
    // OAUTH — Redirection (Google / GitHub)
    // ──────────────────────────────────────────────
    public function redirectToProvider(string $provider): JsonResponse
    {
        $this->validateProvider($provider);

        $url = Socialite::driver($provider)
            ->stateless()
            ->redirect()
            ->getTargetUrl();

        return response()->json(['url' => $url]);
    }

    // ──────────────────────────────────────────────
    // OAUTH — Callback (Google / GitHub)
    // ──────────────────────────────────────────────
    public function handleProviderCallback(string $provider): JsonResponse
    {
        $this->validateProvider($provider);

        try {
            $socialUser = Socialite::driver($provider)->stateless()->user();
        } catch (\Exception $e) {
            return response()->json(['message' => 'Authentification OAuth échouée.'], 422);
        }

        // Trouver ou créer l'utilisateur
        $user = User::updateOrCreate(
            ['email' => $socialUser->getEmail()],
            [
                'name'              => $socialUser->getName() ?? $socialUser->getNickname(),
                'provider'          => $provider,
                'provider_id'       => $socialUser->getId(),
                'avatar'            => $socialUser->getAvatar(),
                'password'          => Hash::make(Str::random(24)), // mot de passe aléatoire
                'email_verified_at' => now(),
            ]
        );

        $user->tokens()->delete();
        $token = $user->createToken('taskflow-token')->plainTextToken;

        return response()->json([
            'user'  => $user,
            'token' => $token,
        ]);
    }

    // ──────────────────────────────────────────────
    // Validation du provider
    // ──────────────────────────────────────────────
    private function validateProvider(string $provider): void
    {
        if (! in_array($provider, ['google', 'github'])) {
            abort(400, "Provider '{$provider}' non supporté.");
        }
    }
}