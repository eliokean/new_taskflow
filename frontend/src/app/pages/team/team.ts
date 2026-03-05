import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { NgClass } from '@angular/common';
import { HttpClient } from '@angular/common/http';

interface ApiUser {
  id:              number;
  name:            string;
  email:           string;
  avatar:          string | null;
  active_tasks:    number;
  completed_tasks: number;
}

const COLORS = ['#06b6d4','#a855f7','#ec4899','#f97316','#10b981','#6366f1','#f59e0b','#ef4444'];
function strHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) & 0xffff;
  return h;
}

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [NgClass],
  templateUrl: './team.html',
  styleUrl: './team.css'
})
export class TeamComponent implements OnInit {

  private http     = inject(HttpClient);
  private readonly API = 'http://localhost:8000/api';

  collaborators = signal<ApiUser[]>([]);
  loading       = signal(true);

  totalMembers = computed(() => this.collaborators().length);
  activeTasks  = computed(() => this.collaborators().reduce((acc, u) => acc + u.active_tasks, 0));
  completedAll = computed(() => this.collaborators().reduce((acc, u) => acc + u.completed_tasks, 0));

  ngOnInit() {
    this.http.get<ApiUser[]>(`${this.API}/users/stats`).subscribe({
      next:  users => { this.collaborators.set(users); this.loading.set(false); },
      error: ()    => this.loading.set(false),
    });
  }

  initials(name: string): string {
    return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  }

  avatarColor(name: string): string {
    return COLORS[strHash(name) % COLORS.length];
  }
}