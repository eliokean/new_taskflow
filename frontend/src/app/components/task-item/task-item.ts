import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { Task } from '../../services/task';
import { ProjectService } from '../../services/project';

const COLORS = ['#06b6d4','#a855f7','#ec4899','#f97316','#10b981','#6366f1','#f59e0b','#ef4444'];
function strHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) & 0xffff;
  return h;
}

@Component({
  selector: 'app-task-item',
  standalone: true,
  imports: [NgClass],
  templateUrl: './task-item.html',
  styleUrl: './task-item.css'
})
export class TaskItemComponent {
  @Input() task!: Task;
  @Output() toggle = new EventEmitter<number>();

  projectService = inject(ProjectService);

  projectColor(): string {
    const p = this.projectService.projects().find(p => p.title === this.task.project);
    return p?.color ?? '#6b7280';
  }

  priorityLabel(): string {
    return ({ low: 'Faible', medium: 'Moyenne', high: 'Haute' } as any)[this.task.priority] ?? 'Faible';
  }

  priorityClass(): string {
    return this.task.priority ?? 'low';
  }

  formattedDueDate(): string {
    if (!this.task.dueDate) return '';
    return new Date(this.task.dueDate).toLocaleDateString('fr-FR');
  }

  // Initiales depuis le nom de la tâche (placeholder jusqu'à ce qu'on ait les vrais assignés)
  assigneeInitials(): string {
    return this.task.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  }

  // Couleur déterministe basée sur le nom
  assigneeColor(): string {
    return COLORS[strHash(this.task.name) % COLORS.length];
  }
}