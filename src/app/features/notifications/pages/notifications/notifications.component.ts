import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, AppNotification } from '../../../../core/services/notification.service';
import { AppPageHeaderComponent } from '../../../../shared/ui/app-page-header/app-page-header.component';
import { AppEmptyStateComponent } from '../../../../shared/ui/app-empty-state/app-empty-state.component';

@Component({
  selector: 'app-notifications-page',
  standalone: true,
  imports: [CommonModule, AppPageHeaderComponent, AppEmptyStateComponent],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css'],
})
export class NotificationsPageComponent {
  readonly notifService = inject(NotificationService);

  readonly notifications = this.notifService.allNotifications;
  readonly unreadCount = this.notifService.unreadCount;

  markAsRead(id: string): void {
    this.notifService.markAsRead(id);
  }

  markAllAsRead(): void {
    this.notifService.markAllRead();
  }

  clearAll(): void {
    if (confirm('Voulez-vous vraiment supprimer tout l\'historique des notifications ?')) {
      this.notifService.clear();
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
}
