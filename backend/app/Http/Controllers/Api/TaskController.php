<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    // GET /api/projects/{project}/tasks
    public function index(Request $request, Project $project): JsonResponse
    {
        $this->authorizeProject($request, $project);

        $tasks = $project->tasks()
            ->with('assignees:id,name,avatar')
            ->orderByDesc('created_at')
            ->get();

        return response()->json($tasks);
    }

    // POST /api/projects/{project}/tasks
    public function store(Request $request, Project $project): JsonResponse
    {
        $this->authorizeProject($request, $project);

        $validated = $request->validate([
            'titre'    => 'required|string|max:255',
            'description' => 'nullable|string',
            'statut'   => 'in:a_faire,en_cours,termine',
            'priorite' => 'nullable|in:basse,moyenne,haute',
            'due_date' => 'nullable|date',
        ]);

        $task = $project->tasks()->create([
            ...$validated,
            'created_by' => $request->user()->id,
            'statut'     => $validated['statut']   ?? 'a_faire',
            'priorite'   => $validated['priorite'] ?? null,
        ]);

        return response()->json($task->load('assignees:id,name,avatar'), 201);
    }

    // GET /api/tasks/{task}
    public function show(Request $request, Task $task): JsonResponse
    {
        $this->authorizeTask($request, $task);

        return response()->json($task->load('assignees:id,name,avatar'));
    }

    // PUT /api/tasks/{task}
    public function update(Request $request, Task $task): JsonResponse
    {
        $this->authorizeTask($request, $task);

        $validated = $request->validate([
            'titre'       => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'statut'      => 'sometimes|in:a_faire,en_cours,termine',
            'priorite'    => 'nullable|in:basse,moyenne,haute',
            'due_date'    => 'nullable|date',
        ]);

        $task->update($validated);

        return response()->json($task->load('assignees:id,name,avatar'));
    }

    // DELETE /api/tasks/{task}
    public function destroy(Request $request, Task $task): JsonResponse
    {
        $this->authorizeTask($request, $task);

        $task->delete();

        return response()->json(['message' => 'Tâche supprimée.']);
    }

    // POST /api/tasks/{task}/assign — assigner un utilisateur
    public function assign(Request $request, Task $task): JsonResponse
    {
        $this->authorizeTask($request, $task);

        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $task->assignees()->syncWithoutDetaching([$request->user_id => [
            'assigned_at' => now(),
        ]]);

        return response()->json($task->load('assignees:id,name,avatar'));
    }

    // DELETE /api/tasks/{task}/unassign — retirer un utilisateur
    public function unassign(Request $request, Task $task): JsonResponse
    {
        $this->authorizeTask($request, $task);

        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $task->assignees()->detach($request->user_id);

        return response()->json($task->load('assignees:id,name,avatar'));
    }

    // ── Helpers ────────────────────────────────────────────────────
    private function authorizeProject(Request $request, Project $project): void
    {
        if ($project->user_id !== $request->user()->id) {
            abort(403, 'Action non autorisée.');
        }
    }

    private function authorizeTask(Request $request, Task $task): void
    {
        if ($task->project->user_id !== $request->user()->id) {
            abort(403, 'Action non autorisée.');
        }
    }
    public function assigned(Request $request): JsonResponse
{
    $tasks = $request->user()
        ->assignedTasks()
        ->with('project:id,intitule,color')
        ->get();

    return response()->json($tasks);
}
}