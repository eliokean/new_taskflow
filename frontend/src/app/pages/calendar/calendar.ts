import { Component, inject, signal, computed } from '@angular/core';
import { NgClass, SlicePipe } from '@angular/common';
import { TaskService, Task } from '../../services/task';

interface CalendarEvent {
  id:    number;
  title: string;
  date:  string; // 'YYYY-MM-DD'
  time:  string;
  color: 'green' | 'orange' | 'purple' | 'blue' | 'cyan';
  priority?: string;
}

// Mappe la priorité de la tâche vers une couleur de calendrier
function priorityToColor(p: string): CalendarEvent['color'] {
  return ({ high: 'orange', medium: 'blue', low: 'green' } as any)[p] ?? 'cyan';
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [NgClass, SlicePipe],
  templateUrl: './calendar.html',
  styleUrl: './calendar.css'
})
export class CalendarComponent {

  taskService = inject(TaskService);

  today        = new Date();
  currentYear  = signal(this.today.getFullYear());
  currentMonth = signal(this.today.getMonth());

  monthNames = ['Janvier','Février','Mars','Avril','Mai','Juin',
                'Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
  dayNames   = ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'];

  // Convertit les tâches avec dueDate en CalendarEvent
  events = computed<CalendarEvent[]>(() =>
    this.taskService.tasks()
      .filter(t => !!t.dueDate)
      .map(t => ({
        id:       t.id,
        title:    t.name,
        date:     t.dueDate.substring(0, 10), // 'YYYY-MM-DD'
        time:     'Échéance',
        color:    priorityToColor(t.priority),
        priority: t.priority,
      }))
  );

  monthLabel = computed(() =>
    `${this.monthNames[this.currentMonth()]} ${this.currentYear()}`
  );

  calendarDays = computed(() => {
    const year  = this.currentYear();
    const month = this.currentMonth();
    const firstDay    = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: (number | null)[] = [];

    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    while (days.length % 7 !== 0) days.push(null);

    return days;
  });

  upcomingEvents = computed(() => {
    const year  = this.currentYear();
    const month = this.currentMonth();

    const grouped: { [date: string]: CalendarEvent[] } = {};
    this.events()
      .filter(e => {
        const d = new Date(e.date);
        return d.getFullYear() === year && d.getMonth() === month;
      })
      .forEach(e => {
        if (!grouped[e.date]) grouped[e.date] = [];
        grouped[e.date].push(e);
      });

    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(0, 3)
      .map(([date, evts]) => ({ date, events: evts }));
  });

  prevMonth() {
    if (this.currentMonth() === 0) {
      this.currentMonth.set(11);
      this.currentYear.update(y => y - 1);
    } else {
      this.currentMonth.update(m => m - 1);
    }
  }

  nextMonth() {
    if (this.currentMonth() === 11) {
      this.currentMonth.set(0);
      this.currentYear.update(y => y + 1);
    } else {
      this.currentMonth.update(m => m + 1);
    }
  }

  goToday() {
    this.currentMonth.set(this.today.getMonth());
    this.currentYear.set(this.today.getFullYear());
  }

  isToday(day: number | null): boolean {
    if (!day) return false;
    return day === this.today.getDate()
      && this.currentMonth() === this.today.getMonth()
      && this.currentYear() === this.today.getFullYear();
  }

  getEventsForDay(day: number | null): CalendarEvent[] {
    if (!day) return [];
    const y = this.currentYear();
    const m = String(this.currentMonth() + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    const key = `${y}-${m}-${d}`;
    return this.events().filter(e => e.date === key);
  }

  formatUpcomingDate(dateStr: string): string {
    const d = new Date(dateStr);
    return `${this.monthNames[d.getMonth()]} ${d.getDate()}`;
  }

  // Statut lisible pour la section "upcoming"
  taskStatus(t: CalendarEvent): string {
    const task = this.taskService.tasks().find(tk => tk.id === t.id);
    if (!task) return '';
    return ({ todo: 'À faire', inprogress: 'En cours', done: 'Terminé' } as any)[task.status] ?? '';
  }
}