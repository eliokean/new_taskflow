import { Injectable, signal } from '@angular/core';

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

@Injectable({ providedIn: 'root' })
export class ProjectService {

  projects = signal<KanbanProject[]>([
    {
      id: 1,
      title: 'Website Redesign',
      description: 'Complete redesign of company website',
      color: '#22c55e',
      members: [
        { initials: 'JD', color: '#06b6d4' },
        { initials: 'SJ', color: '#a855f7' },
        { initials: 'MC', color: '#ec4899' },
      ],
      tasks: [
        { id: 1, title: 'Design new landing page hero section', status: 'in-progress', priority: 'High', assignee: { initials: 'SJ', color: '#a855f7' } },
        { id: 2, title: 'Update project documentation', status: 'completed', priority: null, assignee: { initials: 'SJ', color: '#a855f7' } },
      ],
    },
    {
      id: 2,
      title: 'Mobile App',
      description: 'iOS and Android mobile application',
      color: '#f97316',
      members: [
        { initials: 'JD', color: '#06b6d4' },
        { initials: 'MC', color: '#ec4899' },
        { initials: 'ER', color: '#f97316' },
      ],
      tasks: [
        { id: 3, title: 'Implement user authentication flow', status: 'in-progress', priority: 'High', assignee: { initials: 'MC', color: '#ec4899' } },
      ],
    },
  ]);

  addProject(data: { title: string; description: string; color: string }) {
    this.projects.update(list => [...list, {
      id: Date.now(), ...data,
      members: [{ initials: 'JD', color: '#06b6d4' }],
      tasks: [],
    }]);
  }

  deleteProject(id: number) {
    this.projects.update(list => list.filter(p => p.id !== id));
  }

  addTask(projectId: number, task: Omit<KanbanTask, 'id'>) {
    this.projects.update(list =>
      list.map(p => p.id === projectId
        ? { ...p, tasks: [...p.tasks, { ...task, id: Date.now() }] }
        : p
      )
    );
  }
}