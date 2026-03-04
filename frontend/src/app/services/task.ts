import { Injectable, signal, computed } from '@angular/core';

export type TaskStatus   = 'todo' | 'inprogress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';
export type ProjectColor = 'teal' | 'blue' | 'purple';

export interface Task {
  id:          number;
  name:        string;
  description: string;
  done:        boolean;
  tag:         'done' | 'late' | 'today' | 'new';
  project:     string;          // nom du projet (clé de liaison)
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

@Injectable({ providedIn: 'root' })
export class TaskService {

  tasks = signal<Task[]>([
    { id: 1, name: 'Setup project structure', description: '', done: true,  tag: 'done',  project: 'Website Redesign', status: 'done',       priority: 'low',    dueDate: '' },
    { id: 2, name: 'Design homepage mockup',  description: '', done: false, tag: 'late',  project: 'Website Redesign', status: 'inprogress', priority: 'high',   dueDate: '' },
    { id: 3, name: 'Implement auth system',   description: '', done: false, tag: 'late',  project: 'Mobile App v2',    status: 'todo',       priority: 'high',   dueDate: '' },
    { id: 4, name: 'Write API documentation', description: '', done: false, tag: 'today', project: 'API Integration',  status: 'inprogress', priority: 'medium', dueDate: '' },
    { id: 5, name: 'Deploy to staging',       description: '', done: false, tag: 'late',  project: 'Website Redesign', status: 'todo',       priority: 'medium', dueDate: '' },
    { id: 6, name: 'Code review backend',     description: '', done: false, tag: 'late',  project: 'API Integration',  status: 'todo',       priority: 'low',    dueDate: '' },
  ]);

  projects = signal<Project[]>([
    { id: 1, name: 'Website Redesign', description: '', taskCount: 12, dueDate: 'Mar 15', progress: 70, color: 'teal'   },
    { id: 2, name: 'Mobile App v2',    description: '', taskCount: 8,  dueDate: 'Apr 1',  progress: 40, color: 'blue'   },
    { id: 3, name: 'API Integration',  description: '', taskCount: 5,  dueDate: 'Mar 28', progress: 20, color: 'purple' },
  ]);

  total     = computed(() => this.tasks().length);
  completed = computed(() => this.tasks().filter(t => t.done).length);
  overdue   = computed(() => this.tasks().filter(t => !t.done).length);

  // ── Project helpers ──────────────────────────────────────────────

  getProject(id: number): Project | undefined {
    return this.projects().find(p => p.id === id);
  }

  addProject(name: string, description: string, color: ProjectColor): Project {
    const p: Project = {
      id: Date.now(), name, description, color,
      taskCount: 0, dueDate: '', progress: 0
    };
    this.projects.update(ps => [...ps, p]);
    return p;
  }

  updateProject(id: number, patch: Partial<Omit<Project, 'id'>>) {
    this.projects.update(ps =>
      ps.map(p => p.id === id ? { ...p, ...patch } : p)
    );
  }

  deleteProject(id: number) {
    this.projects.update(ps => ps.filter(p => p.id !== id));
    this.tasks.update(ts => ts.filter(t => {
      const proj = this.projects().find(p => p.id === id);
      return proj ? t.project !== proj.name : true;
    }));
  }

  projectNames = computed(() => this.projects().map(p => p.name));

  // ── Task helpers ─────────────────────────────────────────────────

  toggleTask(id: number) {
    this.tasks.update(tasks =>
      tasks.map(t => t.id === id
        ? { ...t, done: !t.done, tag: !t.done ? 'done' : 'late' as Task['tag'] }
        : t
      )
    );
  }

  addTask(data: Omit<Task, 'id' | 'done' | 'tag'>): Task {
    const t: Task = { id: Date.now(), done: false, tag: 'new', ...data };
    this.tasks.update(ts => [...ts, t]);
    return t;
  }

  updateTask(id: number, patch: Partial<Omit<Task, 'id'>>) {
    this.tasks.update(ts =>
      ts.map(t => t.id === id ? { ...t, ...patch } : t)
    );
  }

  deleteTask(id: number) {
    this.tasks.update(ts => ts.filter(t => t.id !== id));
  }
}