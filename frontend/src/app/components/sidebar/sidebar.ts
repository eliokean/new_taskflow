import { Component } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem {
  id: string;
  title: string;
  route: string;   // ← cette ligne manquait dans ton ancienne interface
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [NgClass, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class SidebarComponent {

  navItems: NavItem[] = [
    { id: 'dashboard', title: 'Dashboard', route: '/dashboard'       },
    { id: 'tasks',     title: 'Tasks',     route: '/tasks'  },
    { id: 'projects',  title: 'Projects',  route: '/projects' },
    { id: 'calendar',  title: 'Calendar',  route: '/calendar' },
    { id: 'team',      title: 'Team',      route: '/team'   },
  ];

  bottomItems: NavItem[] = [
    { id: 'notifications', title: 'Notifications', route: '/notifications' },
    { id: 'settings',      title: 'Settings',      route: '/settings'      },
    { id: 'profil',          title: 'Profile',          route: '/profile'          },
  ];
}