import { Component, computed } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

interface NavItem {
  id: string;
  title: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [NgClass, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class SidebarComponent {

  // Initiales calculées depuis le nom de l'utilisateur connecté
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

  navItems: NavItem[] = [
    { id: 'dashboard', title: 'Dashboard', route: '/dashboard' },
    { id: 'tasks',     title: 'Tasks',     route: '/tasks'     },
    { id: 'projects',  title: 'Projects',  route: '/projects'  },
    { id: 'calendar',  title: 'Calendar',  route: '/calendar'  },
    { id: 'team',      title: 'Team',      route: '/team'      },
  ];

  bottomItems: NavItem[] = [
    { id: 'notifications', title: 'Notifications', route: '/notifications' },
    { id: 'settings',      title: 'Settings',      route: '/settings'      },
  ];

  constructor(public auth: AuthService) {}

  logout() {
    this.auth.logout();
  }
}