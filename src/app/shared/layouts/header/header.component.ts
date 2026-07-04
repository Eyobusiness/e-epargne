import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Output,
  PLATFORM_ID,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { SessionService } from '../../../core/services/session.service';
import { NotificationService, AppNotification } from '../../../core/services/notification.service';
import { AvatarBgPipe } from '../../pipes/avatar-bg.pipe';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, AvatarBgPipe],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly sessionService = inject(SessionService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  readonly notifService = inject(NotificationService);

  @Output()
  toggleSidebar = new EventEmitter<void>();

  readonly isDarkMode = signal(false);
  readonly isProfileMenuOpen = signal(false);
  readonly isNotificationsOpen = signal(false);

  readonly currentUser = this.sessionService.currentUser;
  readonly displayName = this.sessionService.displayName;
  readonly profilLabel = this.sessionService.profilLabel;
  readonly initials = this.sessionService.initials;

  // Delegate to notification service
  readonly notifications = this.notifService.notifications;
  readonly unreadCount = this.notifService.unreadCount;
  readonly hasUnread = this.notifService.hasUnread;

  constructor() {
    this.initializeTheme();
  }

  private initializeTheme(): void {
    if (isPlatformBrowser(this.platformId)) {
      const theme = localStorage.getItem('theme');
      const isDark = theme === 'dark';

      this.isDarkMode.set(isDark);
      if (isDark) {
        document.body.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
      }
    }
  }

  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }

  toggleNotifications(): void {
    this.isNotificationsOpen.update((value) => !value);

    if (this.isNotificationsOpen()) {
      this.isProfileMenuOpen.set(false);
    }
  }

  markNotifRead(id: string): void {
    this.notifService.markAsRead(id);
  }

  markAllNotificationsRead(): void {
    this.notifService.markAllRead();
  }

  toggleProfileMenu(): void {
    this.isProfileMenuOpen.update((value) => !value);

    if (this.isProfileMenuOpen()) {
      this.isNotificationsOpen.set(false);
    }
  }

  openProfile(): void {
    this.isProfileMenuOpen.set(false);
    this.router.navigate(['/auth/change-password']);
  }

  logout(): void {
    this.isProfileMenuOpen.set(false);
    this.isNotificationsOpen.set(false);
    this.sessionService.logout();
  }

  toggleDarkMode(): void {
    this.isDarkMode.update((value) => !value);
    const isDark = this.isDarkMode();
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
      if (isDark) {
        document.body.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
      }
    }
  }

  relativeTime(isoString: string): string {
    const diff = Date.now() - new Date(isoString).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "à l'instant";
    if (minutes < 60) return `il y a ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `il y a ${hours}h`;
    const days = Math.floor(hours / 24);
    return `il y a ${days}j`;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.isProfileMenuOpen.set(false);
      this.isNotificationsOpen.set(false);
    }
  }
}
