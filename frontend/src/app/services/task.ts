import { Injectable, signal, computed } from '@angular/core';

export interface Task {
  id: number;
  name: string;
  done: boolean;
  tag: 'done' | 'late' | 'today' | 'new';
  project: string;
}

export interface Project {
  id: number;
  name: string;
  taskCount: number;
  dueDate: string;
  progress: number;
  color: 'teal' | 'blue' | 'purple';
}

@Injectable({ providedIn: 'root' })
export class TaskService {

  tasks = signal<Task[]>([
    { id: 1, name: 'Setup project structure', done: true,  tag: 'done',  project: 'Website Redesign' },
    { id: 2, name: 'Design homepage mockup',  done: false, tag: 'late',  project: 'Website Redesign' },
    { id: 3, name: 'Implement auth system',   done: false, tag: 'late',  project: 'Mobile App v2'    },
    { id: 4, name: 'Write API documentation', done: false, tag: 'today', project: 'API Integration'  },
    { id: 5, name: 'Deploy to staging',       done: false, tag: 'late',  project: 'Website Redesign' },
    { id: 6, name: 'Code review backend',     done: false, tag: 'late',  project: 'API Integration'  },
  ]);

  projects = signal<Project[]>([
    { id: 1, name: 'Website Redesign', taskCount: 12, dueDate: 'Mar 15', progress: 70, color: 'teal'   },
    { id: 2, name: 'Mobile App v2',    taskCount: 8,  dueDate: 'Apr 1',  progress: 40, color: 'blue'   },
    { id: 3, name: 'API Integration',  taskCount: 5,  dueDate: 'Mar 28', progress: 20, color: 'purple' },
  ]);

  total     = computed(() => this.tasks().length);
  completed = computed(() => this.tasks().filter(t => t.done).length);
  overdue   = computed(() => this.tasks().filter(t => !t.done).length);

  toggleTask(id: number) {
    this.tasks.update(tasks =>
      tasks.map(t => t.id === id
        ? { ...t, done: !t.done, tag: !t.done ? 'done' : 'late' as any }
        : t
      )
    );
  }

  addTask(name: string, project: string) {
    const newTask: Task = {
      id: Date.now(),
      name,
      project,
      done: false,
      tag: 'new'
    };
    this.tasks.update(tasks => [...tasks, newTask]);
  }
}