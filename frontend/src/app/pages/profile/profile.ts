import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { TaskService } from '../../services/task';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class ProfileComponent {

  initials = computed(() => {
    const user = this.auth.currentUser();
    if (!user?.name) return '?';
    return user.name
      .split(' ')
      .map(w => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  });

  // Stats calculées depuis TaskService
  totalTasks     = computed(() => this.taskService.total());
  completedTasks = computed(() => this.taskService.completed());
  inProgress     = computed(() => this.taskService.tasks().filter(t => t.status === 'inprogress').length);
  todoTasks      = computed(() => this.taskService.tasks().filter(t => t.status === 'todo').length);
  completionRate = computed(() => {
    const total = this.totalTasks();
    if (total === 0) return 0;
    return Math.round((this.completedTasks() / total) * 100);
  });

  // Formulaire mot de passe
  showPasswordForm = signal(false);
  currentPassword  = '';
  newPassword      = '';
  confirmPassword  = '';
  showCurrent      = signal(false);
  showNew          = signal(false);
  showConfirm      = signal(false);
  pwLoading        = signal(false);
  pwSuccess        = signal('');
  pwError          = signal('');

  constructor(
    public auth: AuthService,
    public taskService: TaskService,
    private http: HttpClient
  ) {}

  avatarColor(): string {
    const colors = ['#00e5a0', '#a78bfa', '#f97316', '#38bdf8', '#ec4899'];
    const name = this.auth.currentUser()?.name ?? '';
    return colors[name.charCodeAt(0) % colors.length];
  }

  onChangePassword() {
    this.pwError.set('');
    this.pwSuccess.set('');

    if (this.newPassword !== this.confirmPassword) {
      this.pwError.set('Les mots de passe ne correspondent pas.');
      return;
    }
    if (this.newPassword.length < 8) {
      this.pwError.set('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }

    this.pwLoading.set(true);
    this.http.put('http://localhost:8000/api/user/password', {
      current_password:      this.currentPassword,
      password:              this.newPassword,
      password_confirmation: this.confirmPassword,
    }).subscribe({
      next: () => {
        this.pwLoading.set(false);
        this.pwSuccess.set('Mot de passe modifié avec succès !');
        this.currentPassword = '';
        this.newPassword     = '';
        this.confirmPassword = '';
        setTimeout(() => {
          this.pwSuccess.set('');
          this.showPasswordForm.set(false);
        }, 2500);
      },
      error: (e) => {
        this.pwLoading.set(false);
        this.pwError.set(e.error?.message ?? 'Erreur lors du changement de mot de passe.');
      }
    });
  }

  logout() {
    this.auth.logout();
  }
}