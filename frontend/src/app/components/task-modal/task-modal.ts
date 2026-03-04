import {
  Component, inject, signal, computed, Output, EventEmitter, Input, OnInit
} from '@angular/core';
import { NgClass, NgFor } from '@angular/common';
import { TaskService, Task, TaskStatus, TaskPriority } from '../../services/task';

@Component({
  selector: 'app-task-modal',
  standalone: true,
  imports: [NgClass, NgFor],
  templateUrl: './task-modal.html',
  styleUrl:    './task-modal.css'
})
export class TaskModalComponent implements OnInit {

  @Input()  task:        Task | null = null;
  @Input()  projectName: string | null = null;
  @Input()  mode:        'create' | 'edit' = 'create';
  @Output() close   = new EventEmitter<void>();
  @Output() saved   = new EventEmitter<Task>();
  @Output() deleted = new EventEmitter<number>();

  svc = inject(TaskService);

  name        = signal('');
  description = signal('');
  priority    = signal<TaskPriority>('medium');
  status      = signal<TaskStatus>('todo');
  dueDate     = signal('');
  selProject  = signal('');
  visible     = signal(false);

  readonly priorities: { value: TaskPriority; label: string; color: string; icon: string }[] = [
    { value: 'low',    label: 'Low',    color: '#10b981', icon: '↓' },
    { value: 'medium', label: 'Medium', color: '#f59e0b', icon: '→' },
    { value: 'high',   label: 'High',   color: '#ef4444', icon: '↑' },
  ];

  readonly statuses: { value: TaskStatus; label: string; color: string }[] = [
    { value: 'todo',       label: 'To Do',       color: '#6b7280' },
    { value: 'inprogress', label: 'In Progress',  color: '#6366f1' },
    { value: 'done',       label: 'Done',         color: '#10b981' },
  ];

  projectNames = computed(() => this.svc.projectNames());

  currentProject = computed(() =>
    this.svc.projects().find(p => p.name === this.selProject())
  );

  ngOnInit() {
    if (this.task) {
      this.name.set(this.task.name);
      this.description.set(this.task.description);
      this.priority.set(this.task.priority);
      this.status.set(this.task.status);
      this.dueDate.set(this.task.dueDate);
      this.selProject.set(this.task.project);
    } else {
      this.selProject.set(this.projectName ?? this.svc.projectNames()[0] ?? '');
    }
    requestAnimationFrame(() => this.visible.set(true));
  }

  save() {
    if (!this.name().trim() || !this.selProject()) return;
    if (this.mode === 'edit' && this.task) {
      this.svc.updateTask(this.task.id, {
        name:        this.name(),
        description: this.description(),
        priority:    this.priority(),
        status:      this.status(),
        dueDate:     this.dueDate(),
        project:     this.selProject(),
      });
      this.saved.emit(this.svc.tasks().find(t => t.id === this.task!.id)!);
    } else {
      const t = this.svc.addTask({
        name:        this.name(),
        description: this.description(),
        priority:    this.priority(),
        status:      'todo',
        dueDate:     this.dueDate(),
        project:     this.selProject(),
      });
      this.saved.emit(t);
    }
    this.dismiss();
  }

  delete() {
    if (!this.task) return;
    this.svc.deleteTask(this.task.id);
    this.deleted.emit(this.task.id);
    this.dismiss();
  }

  dismiss() {
    this.visible.set(false);
    setTimeout(() => this.close.emit(), 280);
  }
}