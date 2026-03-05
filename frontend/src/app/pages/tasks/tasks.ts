import { Component, inject, signal, computed } from '@angular/core';
import { NgClass, SlicePipe } from '@angular/common';
import { TaskService } from '../../services/task';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [NgClass, SlicePipe],
  templateUrl: './tasks.html',
  styleUrl: './tasks.css'
})
export class TasksComponent {
  taskService = inject(TaskService);
  searchQuery = signal('');

  private filtered = computed(() =>
    this.taskService.tasks().filter(t =>
      t.name.toLowerCase().includes(this.searchQuery().toLowerCase())
    )
  );

  // ── Colonnes filtrées par status ────────────────────────────────
  todoTasks       = computed(() => this.filtered().filter(t => t.status === 'todo'));
  inProgressTasks = computed(() => this.filtered().filter(t => t.status === 'inprogress'));
  completedTasks  = computed(() => this.filtered().filter(t => t.status === 'done'));

  todoCount       = computed(() => this.todoTasks().length);
  inProgressCount = computed(() => this.inProgressTasks().length);
  completedCount  = computed(() => this.completedTasks().length);

  onSearch(e: Event) {
    this.searchQuery.set((e.target as HTMLInputElement).value);
  }

  // Clic sur ✓ dans "À faire"      → passe en "En cours"
  // Clic sur ✓ dans "En cours"     → passe en "Terminée"
  // Clic sur ↺ dans "Terminée"     → repasse en "À faire"
  advance(id: number) {
    const task = this.taskService.tasks().find(t => t.id === id);
    if (!task) return;

    const next = task.status === 'todo'       ? 'inprogress'
               : task.status === 'inprogress' ? 'done'
               :                                'todo';

    this.taskService.updateTask(id, { status: next }).subscribe();
  }

  // Priorité réelle depuis le champ priority
  priorityLabel(priority: string): string {
    return ({ low: 'Faible', medium: 'Moyenne', high: 'Haute' } as any)[priority] ?? 'Faible';
  }

  priorityClass(priority: string): string {
    return ({ low: 'low', medium: 'medium', high: 'high' } as any)[priority] ?? 'low';
  }
}