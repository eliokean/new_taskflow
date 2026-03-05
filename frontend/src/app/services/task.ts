import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type TaskStatus   = 'todo' | 'inprogress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';
export type ProjectColor = 'teal' | 'blue' | 'purple';

export interface Task {
  id:          number;
  name:        string;
  description: string;
  done:        boolean;
  tag:         'done' | 'late' | 'today' | 'new';
  project:     string;
  status:      TaskStatus;
  priority:    TaskPriority;
  dueDate:     string;
}

export interface Project {
  id:          number;
  name:        string;
  description: string;
  taskCount:   number;
  dueDate:     string;
  progress:    number;
  color:       ProjectColor;
}

interface ApiTask {
  id:          number;
  project_id:  number;
  titre:       string;
  description: string;
  statut:      'a_faire' | 'en_cours' | 'termine';
  priorite:    'basse' | 'moyenne' | 'haute' | null;
  due_date:    string | null;
  project?:    { id: number; intitule: string; color: string };
}

function toStatus(s: ApiTask['statut']): TaskStatus {
  return ({ a_faire: 'todo', en_cours: 'inprogress', termine: 'done' } as const)[s];
}
function toApiStatus(s: TaskStatus): ApiTask['statut'] {
  return ({ todo: 'a_faire', inprogress: 'en_cours', done: 'termine' } as const)[s];
}
function toPriority(p: ApiTask['priorite']): TaskPriority {
  return ({ basse: 'low', moyenne: 'medium', haute: 'high', null: 'medium' } as any)[p ?? 'null'];
}
function toApiPriority(p: TaskPriority): ApiTask['priorite'] {
  return ({ low: 'basse', medium: 'moyenne', high: 'haute' } as const)[p];
}
function toTask(api: ApiTask, projectName = ''): Task {
  return {
    id:          api.id,
    name:        api.titre,
    description: api.description ?? '',
    done:        api.statut === 'termine',
    tag:         api.statut === 'termine' ? 'done' : 'late',
    project:     projectName || api.project?.intitule || '',
    status:      toStatus(api.statut),
    priority:    toPriority(api.priorite),
    dueDate:     api.due_date ?? '',
  };
}

@Injectable({ providedIn: 'root' })
export class TaskService {

  private readonly API = environment.apiUrl;  // ← ici

  tasks    = signal<Task[]>([]);
  projects = signal<Project[]>([]);

  total        = computed(() => this.tasks().length);
  completed    = computed(() => this.tasks().filter(t => t.done).length);
  overdue      = computed(() => this.tasks().filter(t => !t.done).length);
  projectNames = computed(() => this.projects().map(p => p.name));

  constructor(private http: HttpClient) {}

  fetchTasks(projectId: number, projectName: string): Observable<ApiTask[]> {
    return this.http.get<ApiTask[]>(`${this.API}/projects/${projectId}/tasks`).pipe(
      tap(list => {
        const newTasks = list.map(t => toTask(t, projectName));
        this.tasks.update(existing => {
          const ids = new Set(newTasks.map(t => t.id));
          return [...existing.filter(t => !ids.has(t.id)), ...newTasks];
        });
      })
    );
  }

  fetchAssigned(): Observable<ApiTask[]> {
    return this.http.get<ApiTask[]>(`${this.API}/tasks/assigned`).pipe(
      tap(list => {
        const newTasks = list.map(t => toTask(t));
        this.tasks.update(existing => {
          const ids = new Set(newTasks.map(t => t.id));
          return [...existing.filter(t => !ids.has(t.id)), ...newTasks];
        });
      })
    );
  }

  addTask(data: Omit<Task, 'id' | 'done' | 'tag'>, projectId: number): Observable<ApiTask> {
    return this.http.post<ApiTask>(`${this.API}/projects/${projectId}/tasks`, {
      titre:       data.name,
      description: data.description,
      statut:      toApiStatus(data.status),
      priorite:    toApiPriority(data.priority),
      due_date:    data.dueDate || null,
    }).pipe(
      tap(api => this.tasks.update(ts => [...ts, toTask(api, data.project)]))
    );
  }

  updateTask(id: number, patch: Partial<Omit<Task, 'id'>>): Observable<ApiTask> {
    return this.http.put<ApiTask>(`${this.API}/tasks/${id}`, {
      ...(patch.name        && { titre:       patch.name }),
      ...(patch.description && { description: patch.description }),
      ...(patch.status      && { statut:      toApiStatus(patch.status) }),
      ...(patch.priority    && { priorite:    toApiPriority(patch.priority) }),
      ...(patch.dueDate     && { due_date:    patch.dueDate }),
    }).pipe(
      tap(api => {
        this.tasks.update(ts =>
          ts.map(t => t.id === id ? { ...t, ...toTask(api, t.project) } : t)
        );
      })
    );
  }

  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/tasks/${id}`).pipe(
      tap(() => this.tasks.update(ts => ts.filter(t => t.id !== id)))
    );
  }

  toggleTask(id: number): void {
    const task = this.tasks().find(t => t.id === id);
    if (!task) return;
    const newStatus: TaskStatus = task.done ? 'todo' : 'done';
    this.updateTask(id, { status: newStatus }).subscribe();
  }

  getProject(id: number): Project | undefined {
    return this.projects().find(p => p.id === id);
  }

  syncProjects(projects: Project[]) {
    this.projects.set(projects);
  }
}