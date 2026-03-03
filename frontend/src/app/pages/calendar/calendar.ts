import { Component, signal, computed } from '@angular/core';
import { NgClass, SlicePipe } from '@angular/common';

interface CalendarEvent {
  id: number;
  title: string;
  date: string; // 'YYYY-MM-DD'
  time: string;
  color: 'green' | 'orange' | 'purple' | 'blue' | 'cyan';
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [NgClass, SlicePipe],
  templateUrl: './calendar.html',
  styleUrl: './calendar.css'
})
export class CalendarComponent {

  today = new Date();
  currentYear  = signal(this.today.getFullYear());
  currentMonth = signal(this.today.getMonth()); // 0-indexed

  events = signal<CalendarEvent[]>([
    { id: 1, title: 'Design landing page', date: '2026-03-05', time: '10:00 AM', color: 'green'  },
    { id: 2, title: 'Team meeting',        date: '2026-03-05', time: '2:00 PM',  color: 'orange' },
    { id: 3, title: 'Code review',         date: '2026-03-08', time: '11:00 AM', color: 'purple' },
    { id: 4, title: 'Client presentation', date: '2026-03-12', time: '3:00 PM',  color: 'orange' },
    { id: 5, title: 'Update docs',         date: '2026-03-12', time: '5:00 PM',  color: 'cyan'   },
    { id: 6, title: 'Sprint planning',     date: '2026-03-18', time: '9:00 AM',  color: 'green'  },
    { id: 7, title: 'Design review',       date: '2026-03-22', time: '2:00 PM',  color: 'blue'   },
  ]);

  monthNames = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];
  dayNames   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  monthLabel = computed(() =>
    `${this.monthNames[this.currentMonth()]} ${this.currentYear()}`
  );

  calendarDays = computed(() => {
    const year  = this.currentYear();
    const month = this.currentMonth();
    const firstDay   = new Date(year, month, 1).getDay();
    const daysInMonth= new Date(year, month + 1, 0).getDate();
    const days: (number | null)[] = [];

    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    while (days.length % 7 !== 0) days.push(null);

    return days;
  });

  upcomingEvents = computed(() => {
    const year  = this.currentYear();
    const month = this.currentMonth();

    // Grouper par date pour la semaine à venir
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
}