import { Component, signal, computed } from '@angular/core';
import { NgClass } from '@angular/common';

interface Member {
  id: number;
  name: string;
  role: string;
  status: 'online' | 'away' | 'offline';
  isAdmin?: boolean;
  avatar: string;
  completed: number;
  active: number;
  email: string;
}

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [NgClass],
  templateUrl: './team.html',
  styleUrl: './team.css'
})
export class TeamComponent {

  members = signal<Member[]>([
    { id: 1, name: 'Sarah Johnson',   role: 'Product Designer',    status: 'online',  isAdmin: true, avatar: 'https://randomuser.me/api/portraits/women/44.jpg', completed: 45, active: 8,  email: 'sarah@taskflow.io'   },
    { id: 2, name: 'Michael Chen',    role: 'Frontend Developer',  status: 'online',  avatar: 'https://randomuser.me/api/portraits/men/32.jpg',   completed: 52, active: 12, email: 'michael@taskflow.io' },
    { id: 3, name: 'Emily Rodriguez', role: 'Backend Developer',   status: 'away',    avatar: 'https://randomuser.me/api/portraits/women/68.jpg', completed: 38, active: 6,  email: 'emily@taskflow.io'   },
    { id: 4, name: 'James Wilson',    role: 'DevOps Engineer',     status: 'offline', avatar: 'https://randomuser.me/api/portraits/men/75.jpg',   completed: 61, active: 3,  email: 'james@taskflow.io'   },
    { id: 5, name: 'Aisha Patel',     role: 'UI/UX Designer',      status: 'online',  avatar: 'https://randomuser.me/api/portraits/women/90.jpg', completed: 29, active: 9,  email: 'aisha@taskflow.io'   },
    { id: 6, name: 'Lucas Martin',    role: 'Full Stack Developer', status: 'away',   avatar: 'https://randomuser.me/api/portraits/men/11.jpg',   completed: 15, active: 8,  email: 'lucas@taskflow.io'   },
  ]);

  totalMembers  = computed(() => this.members().length);
  onlineCount   = computed(() => this.members().filter(m => m.status === 'online').length);
  activeTasks   = computed(() => this.members().reduce((acc, m) => acc + m.active, 0));
  completedAll  = computed(() => this.members().reduce((acc, m) => acc + m.completed, 0));
}