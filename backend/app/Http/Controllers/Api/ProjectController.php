<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    // GET /api/projects
    public function index(Request $request): JsonResponse
    {
        $projects = $request->user()
            ->projects()
            ->with(['tasks:id,project_id,titre,statut,priorite'])  // ← tâches incluses
            ->get();

        return response()->json($projects);
    }

    // POST /api/projects
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'intitule'    => 'required|string|max:255',
            'description' => 'nullable|string',
            'color'       => 'nullable|string|max:20',
        ]);

        $project = $request->user()->projects()->create($validated);

        return response()->json($project->load('tasks:id,project_id,titre,statut,priorite'), 201);
    }

    // GET /api/projects/{project}
    public function show(Request $request, Project $project): JsonResponse
    {
        $this->authorize($request, $project);

        return response()->json($project->load(['tasks:id,project_id,titre,statut,priorite', 'tasks.assignees:id,name,avatar']));
    }

    // PUT /api/projects/{project}
    public function update(Request $request, Project $project): JsonResponse
    {
        $this->authorize($request, $project);

        $validated = $request->validate([
            'intitule'    => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'color'       => 'nullable|string|max:20',
        ]);

        $project->update($validated);

        return response()->json($project->load('tasks:id,project_id,titre,statut,priorite'));
    }

    // DELETE /api/projects/{project}
    public function destroy(Request $request, Project $project): JsonResponse
    {
        $this->authorize($request, $project);

        $project->delete();

        return response()->json(['message' => 'Projet supprimé.']);
    }

    private function authorize(Request $request, Project $project): void
    {
        if ($project->user_id !== $request->user()->id) {
            abort(403, 'Action non autorisée.');
        }
    }
}