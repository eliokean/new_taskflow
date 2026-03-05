<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    // GET /api/projects — projets de l'utilisateur connecté
    public function index(Request $request): JsonResponse
    {
        $projects = $request->user()
            ->projects()
            ->orderByDesc('created_at')
            ->get();

        return response()->json($projects);
    }

    // POST /api/projects — créer un projet
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'intitule'    => 'required|string|max:255',
            'description' => 'nullable|string',
            'color'       => 'nullable|string|max:50',
        ]);

        $project = $request->user()->projects()->create($validated);

        return response()->json($project, 201);
    }

    // GET /api/projects/{id} — détail d'un projet
    public function show(Request $request, Project $project): JsonResponse
    {
        $this->authorizeProject($request, $project);

        return response()->json($project->load('tasks'));
    }

    // PUT /api/projects/{id} — modifier un projet
    public function update(Request $request, Project $project): JsonResponse
    {
        $this->authorizeProject($request, $project);

        $validated = $request->validate([
            'intitule'    => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'color'       => 'nullable|string|max:50',
        ]);

        $project->update($validated);

        return response()->json($project);
    }

    // DELETE /api/projects/{id} — supprimer un projet
    public function destroy(Request $request, Project $project): JsonResponse
    {
        $this->authorizeProject($request, $project);

        $project->delete();

        return response()->json(['message' => 'Projet supprimé.']);
    }

    // ── Vérifier que le projet appartient à l'utilisateur ──────────
    private function authorizeProject(Request $request, Project $project): void
    {
        if ($project->user_id !== $request->user()->id) {
            abort(403, 'Action non autorisée.');
        }
    }
}