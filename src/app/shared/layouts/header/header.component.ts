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
import { AvatarBgPipe } from '../../pipes/avatar-bg.pipe';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

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

  @Output()
  toggleSidebar = new EventEmitter<void>();

  readonly isDarkMode = signal(false);
  readonly isProfileMenuOpen = signal(false);
  readonly isNotificationsOpen = signal(false);

  readonly currentUser = this.sessionService.currentUser;
  readonly displayName = this.sessionService.displayName;
  readonly profilLabel = this.sessionService.profilLabel;
  readonly initials = this.sessionService.initials;

  readonly notifications = signal<NotificationItem[]>([]);

  readonly unreadCount = computed(
    () => this.notifications().filter((item) => !item.read).length,
  );

  readonly hasUnread = computed(() => this.unreadCount() > 0);

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

  markAllNotificationsRead(): void {
    this.notifications.update((items) =>
      items.map((item) => ({ ...item, read: true })),
    );
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

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.isProfileMenuOpen.set(false);
      this.isNotificationsOpen.set(false);
    }
  }
}
