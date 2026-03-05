import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

export interface KanbanTask {
  id: number;
  title: string;
  status: 'to-do' | 'in-progress' | 'completed';
  priority: 'High' | 'Medium' | 'Low' | null;
  assignee: { initials: string; color: string };
}

export interface KanbanProject {
  id: number;
  title: string;
  description: string;
  color: string;
  members: { initials: string; color: string }[];
  tasks: KanbanTask[];
}

interface ApiTask {
  id: number;
  titre: string;
  statut: 'a_faire' | 'en_cours' | 'termine';
  priorite: 'basse' | 'moyenne' | 'haute' | null;
  created_by: number;
}

interface ApiProject {
  id: number;
  intitule: string;
  description: string;
  color: string;
  tasks?: ApiTask[];
}

function toKanbanStatus(s: ApiTask['statut']): KanbanTask['status'] {
  return ({ a_faire: 'to-do', en_cours: 'in-progress', termine: 'completed' } as const)[s];
}

function toApiStatus(s: KanbanTask['status']): ApiTask['statut'] {
  return ({ 'to-do': 'a_faire', 'in-progress': 'en_cours', 'completed': 'termine' } as const)[s];
}

function toKanbanPriority(p: ApiTask['priorite']): KanbanTask['priority'] {
  if (!p) return null;
  return ({ basse: 'Low', moyenne: 'Medium', haute: 'High' } as const)[p];
}

function toApiPriority(p: KanbanTask['priority']): ApiTask['priorite'] {
  if (!p) return null;
  return ({ Low: 'basse', Medium: 'moyenne', High: 'haute' } as const)[p];
}

function toKanban(api: ApiProject): KanbanProject {
  return {
    id:          api.id,
    title:       api.intitule,
    description: api.description ?? '',
    color:       api.color ?? '#22c55e',
    members:     [],
    tasks:       (api.tasks ?? []).map(t => ({
      id:       t.id,
      title:    t.titre,
      status:   toKanbanStatus(t.statut),
      priority: toKanbanPriority(t.priorite),
      assignee: { initials: '?', color: '#6b7280' },
    })),
  };
}

@Injectable({ providedIn: 'root' })
export class ProjectService {

  private readonly API = 'http://localhost:8000/api';

  projects = signal<KanbanProject[]>([]);
  loading  = signal(false);

  constructor(private http: HttpClient) {}

  fetchAll(): Observable<ApiProject[]> {
    this.loading.set(true);
    return this.http.get<ApiProject[]>(`${this.API}/projects`).pipe(
      tap(list => {
        this.projects.set(list.map(toKanban));
        this.loading.set(false);
      })
    );
  }

  addProject(data: { title: string; description: string; color: string }): Observable<KanbanProject> {
    return this.http.post<ApiProject>(`${this.API}/projects`, {
      intitule:    data.title,
      description: data.description,
      color:       data.color,
    }).pipe(
      tap(api => this.projects.update(list => [toKanban(api), ...list]))
    ) as unknown as Observable<KanbanProject>;
  }

  updateProject(id: number, data: Partial<{ title: string; description: string; color: string }>): Observable<KanbanProject> {
    return this.http.put<ApiProject>(`${this.API}/projects/${id}`, {
      ...(data.title       !== undefined && { intitule:    data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.color       !== undefined && { color:       data.color }),
    }).pipe(
      tap(api => this.projects.update(list => list.map(p => p.id === id ? {
        // Préserve les tâches existantes lors d'une mise à jour (l'API ne les renvoie pas)
        ...toKanban(api),
        tasks: list.find(p => p.id === id)?.tasks ?? [],
      } : p)))
    ) as unknown as Observable<KanbanProject>;
  }

  deleteProject(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/projects/${id}`).pipe(
      tap(() => this.projects.update(list => list.filter(p => p.id !== id)))
    );
  }

  addTask(projectId: number, task: Omit<KanbanTask, 'id'>): Observable<ApiTask> {
    return this.http.post<ApiTask>(`${this.API}/projects/${projectId}/tasks`, {
      titre:    task.title,
      statut:   toApiStatus(task.status),
      priorite: toApiPriority(task.priority),
    }).pipe(
      tap(api => {
        this.projects.update(list =>
          list.map(p => p.id === projectId ? {
            ...p,
            tasks: [...p.tasks, {
              id:       api.id,
              title:    task.title,
              status:   task.status,
              priority: task.priority,
              assignee: task.assignee,
            }],
          } : p)
        );
      })
    );
  }

  updateTaskStatus(projectId: number, taskId: number, status: KanbanTask['status']): Observable<ApiTask> {
    return this.http.put<ApiTask>(`${this.API}/tasks/${taskId}`, {
      statut: toApiStatus(status),
    }).pipe(
      tap(() => {
        this.projects.update(list =>
          list.map(p => p.id === projectId ? {
            ...p,
            tasks: p.tasks.map(t => t.id === taskId ? { ...t, status } : t),
          } : p)
        );
      })
    );
  }

  // Met à jour les tâches d'un projet depuis TaskService (sync après fetchTasks)
  syncProjectTasks(projectId: number, tasks: { id: number; status: string; title: string }[]) {
    this.projects.update(list =>
      list.map(p => p.id === projectId ? {
        ...p,
        tasks: tasks.map(t => ({
          id:       t.id,
          title:    t.title,
          status:   (t.status === 'todo' ? 'to-do' : t.status === 'inprogress' ? 'in-progress' : 'completed') as KanbanTask['status'],
          priority: null,
          assignee: { initials: '?', color: '#6b7280' },
        })),
      } : p)
    );
  }

  getProject(id: number): KanbanProject | undefined {
    return this.projects().find(p => p.id === id);
  }
}