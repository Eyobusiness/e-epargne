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
import { AppModalComponent } from '../../ui/app-modal/app-modal.component';
import { AdherentService } from '../../../features/adherents/services/adherent.service';
import { Adherent } from '../../../features/adherents/models/adherent.model';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, AvatarBgPipe, AppModalComponent, FormsModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly sessionService = inject(SessionService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  readonly notifService = inject(NotificationService);
  private readonly adherentService = inject(AdherentService);
  private readonly toastService = inject(ToastService);

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

  private nowTime = Date.now();

  constructor() {
    this.initializeTheme();
    this.notifService.loadNotifications();

    if (isPlatformBrowser(this.platformId)) {
      setInterval(() => {
        this.nowTime = Date.now();
      }, 30000);
    }
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

  // State for sending notification modal
  readonly isSendModalOpen = signal(false);
  readonly allAdherents = signal(true);
  readonly selectedAdherentIds = signal<string[]>([]);
  readonly notificationTitle = signal('');
  readonly notificationBody = signal('');
  readonly notificationType = signal('GENERAL');
  readonly isSending = signal(false);

  // Loaded adherents
  readonly adherents = signal<Adherent[]>([]);
  readonly searchAdherentQuery = signal('');
  readonly filteredAdherents = computed(() => {
    const query = this.searchAdherentQuery().toLowerCase().trim();
    if (!query) return this.adherents();
    return this.adherents().filter(a => a.name.toLowerCase().includes(query) || (a.phone && a.phone.includes(query)));
  });

  openSendModal(): void {
    this.isSendModalOpen.set(true);
    this.isNotificationsOpen.set(false);
    this.isProfileMenuOpen.set(false);
    // Reset state
    this.allAdherents.set(true);
    this.selectedAdherentIds.set([]);
    this.notificationTitle.set('');
    this.notificationBody.set('');
    this.notificationType.set('GENERAL');
    this.searchAdherentQuery.set('');

    // Fetch active adherents
    this.adherentService.getAll(1, 1000, '', '200').subscribe({
      next: (res) => {
        this.adherents.set(res?.data?.items ?? []);
      },
      error: (err) => {
        console.error('Erreur chargement adhérents', err);
      }
    });
  }

  toggleAdherentSelection(id: string): void {
    this.selectedAdherentIds.update(ids => {
      if (ids.includes(id)) {
        return ids.filter(x => x !== id);
      } else {
        return [...ids, id];
      }
    });
  }

  isAdherentSelected(id: string): boolean {
    return this.selectedAdherentIds().includes(id);
  }

  toggleAllAdherentsSelection(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const filteredIds = this.filteredAdherents().map(a => a.id).filter((id): id is string => !!id);
    if (checked) {
      this.selectedAdherentIds.update(ids => {
        const uniqueIds = new Set([...ids, ...filteredIds]);
        return Array.from(uniqueIds);
      });
    } else {
      this.selectedAdherentIds.update(ids => ids.filter(id => !filteredIds.includes(id)));
    }
  }

  areAllAdherentsSelected(): boolean {
    const filtered = this.filteredAdherents();
    if (filtered.length === 0) return false;
    return filtered.every(a => a.id && this.selectedAdherentIds().includes(a.id));
  }

  sendNotification(): void {
    if (!this.notificationTitle().trim() || !this.notificationBody().trim()) {
      this.toastService.show('Veuillez remplir le titre et le message de la notification', 'warning');
      return;
    }

    if (!this.allAdherents() && this.selectedAdherentIds().length === 0) {
      this.toastService.show('Veuillez sélectionner au moins un adhérent', 'warning');
      return;
    }

    this.isSending.set(true);

    const payload = {
      allAdherents: this.allAdherents(),
      adherentIds: this.allAdherents() ? [] : this.selectedAdherentIds(),
      title: this.notificationTitle().trim(),
      body: this.notificationBody().trim(),
      type: this.notificationType(),
      data: {
        idObject: this.allAdherents() ? undefined : this.selectedAdherentIds()[0],
        type: this.notificationType()
      }
    };

    this.notifService.sendAdherentNotification(payload).subscribe({
      next: (res) => {
        this.isSending.set(false);
        this.isSendModalOpen.set(false);
        this.toastService.show(res?.message || 'Notifications envoyées avec succès !', 'success');
        // Add local notif
        this.notifService.add({
          type: 'adherent',
          action: 'validate',
          title: 'Notification envoyée',
          message: `Notification "${payload.title}" envoyée à ${this.allAdherents() ? 'tous les' : this.selectedAdherentIds().length} adhérent(s).`
        });
      },
      error: (err) => {
        this.isSending.set(false);
        const errMsg = err?.error?.message || 'Erreur lors de l\'envoi des notifications';
        this.toastService.show(errMsg, 'error');
      }
    });
  }

  relativeTime(isoString: string): string {
    const diff = this.nowTime - new Date(isoString).getTime();
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
