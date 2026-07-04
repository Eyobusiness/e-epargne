import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type NotifType =
  | 'adherent'
  | 'utilisateur'
  | 'operation'
  | 'cotisation'
  | 'groupe'
  | 'plafond'
  | 'depense'
  | 'workflow'
  | 'collection'
  | 'portefeuille';

export type NotifAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'activate'
  | 'deactivate'
  | 'validate'
  | 'reject'
  | 'withdraw'
  | 'reset';

export interface AppNotification {
  id: string;
  type: NotifType;
  action: NotifAction;
  title: string;
  message: string;
  timestamp: string; // ISO string for safe JSON serialization
  read: boolean;
  icon: string;
  color: string;
}

const STORAGE_KEY = 'ee_notifications';
const MAX_HISTORY = 100;
const DISPLAY_COUNT = 10;

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly platformId = inject(PLATFORM_ID);

  private readonly _notifications = signal<AppNotification[]>(this.loadFromStorage());

  /** Les 10 dernières notifications affichées dans le panel */
  readonly notifications = computed(() => this._notifications().slice(0, DISPLAY_COUNT));

  /** Toutes les notifications (historique complet) */
  readonly allNotifications = this._notifications.asReadonly();

  readonly unreadCount = computed(
    () => this._notifications().filter((n) => !n.read).length,
  );

  readonly hasUnread = computed(() => this.unreadCount() > 0);

  add(params: {
    type: NotifType;
    action: NotifAction;
    title: string;
    message: string;
  }): void {
    const notif: AppNotification = {
      id: this.generateId(),
      type: params.type,
      action: params.action,
      title: params.title,
      message: params.message,
      timestamp: new Date().toISOString(),
      read: false,
      icon: this.getIcon(params.type, params.action),
      color: this.getColor(params.type, params.action),
    };

    this._notifications.update((list) => {
      const updated = [notif, ...list].slice(0, MAX_HISTORY);
      this.saveToStorage(updated);
      return updated;
    });
  }

  markAsRead(id: string): void {
    this._notifications.update((list) => {
      const updated = list.map((n) => (n.id === id ? { ...n, read: true } : n));
      this.saveToStorage(updated);
      return updated;
    });
  }

  markAllRead(): void {
    this._notifications.update((list) => {
      const updated = list.map((n) => ({ ...n, read: true }));
      this.saveToStorage(updated);
      return updated;
    });
  }

  clear(): void {
    this._notifications.set([]);
    this.saveToStorage([]);
  }

  // ─── Private helpers ─────────────────────────────────────────────────────

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  private loadFromStorage(): AppNotification[] {
    if (!isPlatformBrowser(this.platformId)) {
      return [];
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as AppNotification[]) : [];
    } catch {
      return [];
    }
  }

  private saveToStorage(list: AppNotification[]): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
      // quota exceeded — ignore silently
    }
  }

  private getIcon(type: NotifType, action: NotifAction): string {
    if (action === 'delete') return 'bi-trash3-fill';
    if (action === 'validate') return 'bi-check-circle-fill';
    if (action === 'reject') return 'bi-x-circle-fill';
    if (action === 'withdraw') return 'bi-cash-coin';
    if (action === 'activate') return 'bi-toggle-on';
    if (action === 'deactivate') return 'bi-toggle-off';
    if (action === 'reset') return 'bi-arrow-counterclockwise';

    // create / update — icon depends on type
    switch (type) {
      case 'adherent':    return 'bi-person-plus-fill';
      case 'utilisateur': return 'bi-person-gear';
      case 'operation':   return 'bi-arrow-left-right';
      case 'cotisation':  return 'bi-piggy-bank-fill';
      case 'groupe':      return 'bi-people-fill';
      case 'plafond':     return 'bi-shield-check';
      case 'depense':     return 'bi-receipt';
      case 'workflow':    return 'bi-diagram-3-fill';
      case 'collection':  return 'bi-collection-fill';
      case 'portefeuille':return 'bi-wallet2';
      default:            return 'bi-bell-fill';
    }
  }

  private getColor(type: NotifType, action: NotifAction): string {
    if (action === 'delete' || action === 'reject' || action === 'deactivate') return '#dc3545';
    if (action === 'validate' || action === 'activate') return '#198754';
    if (action === 'withdraw') return '#fd7e14';
    if (action === 'reset') return '#6f42c1';

    switch (type) {
      case 'adherent':    return '#0d6efd';
      case 'utilisateur': return '#6610f2';
      case 'operation':   return '#fd7e14';
      case 'cotisation':  return '#20c997';
      case 'groupe':      return '#0dcaf0';
      case 'plafond':     return '#198754';
      case 'depense':     return '#dc3545';
      case 'workflow':    return '#6f42c1';
      case 'collection':  return '#0d6efd';
      case 'portefeuille':return '#fd7e14';
      default:            return '#6c757d';
    }
  }
}
