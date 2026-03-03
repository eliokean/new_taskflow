import { Component, inject, signal, computed } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../services/task';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [NgClass, FormsModule],
  templateUrl: './tasks.html',
  styleUrl: './tasks.css'
})
export class TasksComponent {
  taskService = inject(TaskService);
  searchQuery = signal('');

  todoTasks = computed(() =>
    this.taskService.tasks().filter(t =>
      !t.done && t.tag !== 'today' &&
      t.name.toLowerCase().includes(this.searchQuery().toLowerCase())
    )
  );

  inProgressTasks = computed(() =>
    this.taskService.tasks().filter(t =>
      !t.done && t.tag === 'today' &&
      t.name.toLowerCase().includes(this.searchQuery().toLowerCase())
    )
  );

  completedTasks = computed(() =>
    this.taskService.tasks().filter(t =>
      t.done &&
      t.name.toLowerCase().includes(this.searchQuery().toLowerCase())
    )
  );

  todoCount       = computed(() => this.todoTasks().length);
  inProgressCount = computed(() => this.inProgressTasks().length);
  completedCount  = computed(() => this.completedTasks().length);

  onSearch(e: Event) {
    this.searchQuery.set((e.target as HTMLInputElement).value);
  }

  toggle(id: number) {
    this.taskService.toggleTask(id);
  }

  getPriority(tag: string): string {
    if (tag === 'late')  return 'Haute';
    if (tag === 'today') return 'Moyenne';
    if (tag === 'new')   return 'Basse';
    return 'Basse';
  }
}