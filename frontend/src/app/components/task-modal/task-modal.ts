import {
  Component, inject, signal, computed, Output, EventEmitter, Input, OnInit
} from '@angular/core';
import { NgClass } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { TaskService, Task, TaskStatus, TaskPriority } from '../../services/task';
import { ProjectService } from '../../services/project';
import { environment } from '../../../environments/environment';

interface AppUser {
  id:     number;
  name:   string;
  email:  string;
  avatar: string | null;
}

const COLORS = ['#06b6d4','#a855f7','#ec4899','#f97316','#10b981','#6366f1','#f59e0b','#ef4444'];
function strHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) & 0xffff;
  return h;
}

@Component({
  selector: 'app-task-modal',
  standalone: true,
  imports: [NgClass],
  templateUrl: './task-modal.html',
  styleUrl:    './task-modal.css'
})
export class TaskModalComponent implements OnInit {

  @Input()  task:          Task | null = null;
  @Input()  projectName:   string | null = null;
  @Input()  mode:          'create' | 'edit' = 'create';
  @Input()  lockedProject: string | null = null;
  @Output() close   = new EventEmitter<void>();
  @Output() saved   = new EventEmitter<Task>();
  @Output() deleted = new EventEmitter<number>();

  svc        = inject(TaskService);
  projectSvc = inject(ProjectService);
  http       = inject(HttpClient);

  private readonly API = environment.apiUrl;  // ← ici

  name        = signal('');
  description = signal('');
  priority    = signal<TaskPriority>('medium');
  status      = signal<TaskStatus>('todo');
  dueDate     = signal('');
  selProject  = signal('');
  visible     = signal(false);
  saving      = signal(false);
  errorMsg    = signal('');

  allUsers      = signal<AppUser[]>([]);
  selectedUsers = signal<AppUser[]>([]);
  userSearch    = signal('');
  loadingUsers  = signal(false);

  filteredUsers = computed(() => {
    const q = this.userSearch().toLowerCase().trim();
    if (!q) return this.allUsers();
    return this.allUsers().filter(u =>
      u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  });

  readonly priorities: { value: TaskPriority; label: string; color: string; icon: string }[] = [
    { value: 'low',    label: 'Faible',  color: '#10b981', icon: '↓' },
    { value: 'medium', label: 'Moyenne', color: '#f59e0b', icon: '→' },
    { value: 'high',   label: 'Haute',   color: '#ef4444', icon: '↑' },
  ];

  readonly statuses: { value: TaskStatus; label: string; color: string }[] = [
    { value: 'todo',       label: 'À faire',  color: '#6b7280' },
    { value: 'inprogress', label: 'En cours', color: '#6366f1' },
    { value: 'done',       label: 'Terminé',  color: '#10b981' },
  ];

  currentProject = computed(() =>
    this.projectSvc.projects().find(p => p.title === this.selProject())
  );

  isLocked = computed(() => !!this.lockedProject);

  ngOnInit() {
    if (this.task) {
      this.name.set(this.task.name);
      this.description.set(this.task.description);
      this.priority.set(this.task.priority);
      this.status.set(this.task.status);
      this.dueDate.set(this.task.dueDate);
      this.selProject.set(this.task.project);
    } else {
      this.selProject.set(
        this.lockedProject ?? this.projectName ?? this.projectSvc.projects()[0]?.title ?? ''
      );
    }
    this.loadUsers();
    requestAnimationFrame(() => this.visible.set(true));
  }

  private loadUsers() {
    this.loadingUsers.set(true);
    this.http.get<AppUser[]>(`${this.API}/users`).subscribe({
      next:  users => { this.allUsers.set(users); this.loadingUsers.set(false); },
      error: ()    => this.loadingUsers.set(false),
    });
  }

  isSelected(id: number): boolean {
    return this.selectedUsers().some(u => u.id === id);
  }

  toggleUser(user: AppUser) {
    if (this.isSelected(user.id)) {
      this.selectedUsers.update(list => list.filter(u => u.id !== user.id));
    } else {
      this.selectedUsers.update(list => [...list, user]);
    }
  }

  initials(name: string): string {
    return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  }

  avatarColor(name: string): string {
    return COLORS[strHash(name) % COLORS.length];
  }

  save() {
    if (!this.name().trim()) return;
    this.saving.set(true);
    this.errorMsg.set('');

    const project = this.currentProject();

    if (this.mode === 'edit' && this.task) {
      this.svc.updateTask(this.task.id, {
        name: this.name(), description: this.description(),
        priority: this.priority(), status: this.status(),
        dueDate: this.dueDate(), project: this.selProject(),
      }).subscribe({
        next:  () => this.syncAssignees(this.task!.id),
        error: (e: any) => { this.saving.set(false); this.errorMsg.set(e.error?.message ?? 'Erreur.'); },
      });
    } else if (project) {
      this.svc.addTask({
        name: this.name(), description: this.description(),
        priority: this.priority(), status: 'todo',
        dueDate: this.dueDate(), project: this.selProject(),
      }, project.id).subscribe({
        next: (api: any) => {
          if (this.selectedUsers().length > 0) this.syncAssignees(api.id);
          else { this.saving.set(false); this.dismiss(); }
        },
        error: (e: any) => { this.saving.set(false); this.errorMsg.set(e.error?.message ?? 'Erreur.'); },
      });
    }
  }

  private syncAssignees(taskId: number) {
    const calls = this.selectedUsers().map(u =>
      this.http.post(`${this.API}/tasks/${taskId}/assign`, { user_id: u.id }).toPromise()
    );
    Promise.all(calls).finally(() => { this.saving.set(false); this.dismiss(); });
  }

  delete() {
    if (!this.task) return;
    this.svc.deleteTask(this.task.id).subscribe({
      next:  () => { this.deleted.emit(this.task!.id); this.dismiss(); },
      error: (e: any) => this.errorMsg.set(e.error?.message ?? 'Erreur.'),
    });
  }

  dismiss() {
    this.visible.set(false);
    setTimeout(() => this.close.emit(), 280);
  }
}