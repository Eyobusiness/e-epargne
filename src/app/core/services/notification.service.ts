import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TokenService } from './token.service';
import { ToastService } from './toast.service';

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
  isServerNotif?: boolean;
}

const STORAGE_KEY = 'ee_notifications';
const MAX_HISTORY = 100;
const DISPLAY_COUNT = 10;

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly http = inject(HttpClient);
  private readonly tokenService = inject(TokenService);
  private readonly toastService = inject(ToastService);

  private readonly _notifications = signal<AppNotification[]>(this.loadFromStorage());
  private isFirstLoad = true;

  /** Les 10 dernières notifications affichées dans le panel */
  readonly notifications = computed(() => this._notifications().slice(0, DISPLAY_COUNT));

  /** Toutes les notifications (historique complet) */
  readonly allNotifications = this._notifications.asReadonly();

  readonly unreadCount = computed(
    () => this._notifications().filter((n) => !n.read).length,
  );

  readonly hasUnread = computed(() => this.unreadCount() > 0);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      // Chargement initial après un court instant
      setTimeout(() => {
        this.loadNotifications();
      }, 1000);

      // Polling toutes les 30 secondes
      setInterval(() => {
        this.loadNotifications();
      }, 30000);
    }
  }

  loadNotifications(): void {
    if (!isPlatformBrowser(this.platformId) || !this.tokenService.hasToken()) {
      return;
    }

    const now = new Date();
    const startDate = `${now.getFullYear() - 2}-01-01`;
    const endDate = `${now.getFullYear() + 4}-12-31`;

    const notifParams = new HttpParams()
      .set('page', '1')
      .set('limit', '100')
      .set('sort', 'created_at')
      .set('startDate', startDate)
      .set('endDate', endDate)
      .set('status', '100,200');

    const opParams = new HttpParams()
      .set('page', '1')
      .set('limit', '50')
      .set('status', '100');

    forkJoin({
      notifs: this.http.get<any>(`${environment.apiUrl}/users/notifications/all`, { params: notifParams }),
      ops: this.http.get<any>(`${environment.apiUrl}/operations/all`, { params: opParams })
    }).subscribe({
      next: ({ notifs, ops }) => {
        const serverItems = notifs?.data?.items ?? [];
        const mappedServer: AppNotification[] = serverItems.map((item: any) => this.mapServerNotification(item));

        const opItems = ops?.data?.items ?? [];
        const pendingWithdrawals = opItems.filter((op: any) => op.type_operation === 'RETRAIT');

        const existingLocalNotifs = this.loadFromStorage();
        const readOpIds = new Set(
          existingLocalNotifs.filter(n => n.id.startsWith('op-') && n.read).map(n => n.id)
        );

        const mappedOps: AppNotification[] = pendingWithdrawals.map((op: any) => {
          const notifId = `op-${op.id}`;
          const isRead = readOpIds.has(notifId);
          return this.mapOperationToNotification(op, isRead);
        });

        const localOnly = existingLocalNotifs.filter((n) => !n.isServerNotif);

        const combined = [...mappedServer, ...mappedOps, ...localOnly];
        combined.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        const updated = combined.slice(0, MAX_HISTORY);

        const currentNotifs = this._notifications();
        if (!this.isFirstLoad && currentNotifs.length > 0) {
          const existingIds = new Set(currentNotifs.map((n) => n.id));
          const newUnreadServerNotifs = combined.filter(
            (n) => !n.read && !existingIds.has(n.id)
          );

          newUnreadServerNotifs.forEach((n) => {
            this.toastService.show(`${n.title} : ${n.message}`, 'warning');
          });
        }
        this.isFirstLoad = false;

        this._notifications.set(updated);
        this.saveToStorage(updated);
      },
      error: (err) => {
        console.error('Erreur chargement des notifications et opérations serveur:', err);
      },
    });
  }

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
    const target = this._notifications().find((n) => n.id === id);

    this._notifications.update((list) => {
      const updated = list.map((n) => (n.id === id ? { ...n, read: true } : n));
      this.saveToStorage(updated);
      return updated;
    });

    if (target?.isServerNotif) {
      if (id.startsWith('op-')) {
        return;
      }
      this.http.put<any>(`${environment.apiUrl}/users/notifications/${id}/read`, {}).subscribe({
        error: (err) => {
          console.error(`Erreur lors du marquage comme lu de la notification ${id} sur le serveur:`, err);
        },
      });
    }
  }

  markAllRead(): void {
    const unreadServerNotifs = this._notifications().filter((n) => n.isServerNotif && !n.read);

    this._notifications.update((list) => {
      const updated = list.map((n) => ({ ...n, read: true }));
      this.saveToStorage(updated);
      return updated;
    });

    unreadServerNotifs.forEach((n) => {
      if (n.id.startsWith('op-')) {
        return;
      }
      this.http.put<any>(`${environment.apiUrl}/users/notifications/${n.id}/read`, {}).subscribe({
        error: (err) => {
          console.error(`Erreur lors du marquage comme lu de la notification ${n.id} sur le serveur:`, err);
        },
      });
    });
  }

  clear(): void {
    this._notifications.set([]);
    this.saveToStorage([]);
  }

  sendAdherentNotification(payload: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/notifications/adherents/send`, payload);
  }

  // ─── Private helpers ─────────────────────────────────────────────────────

  private mapServerNotification(item: any): AppNotification {
    const isRead = item.read_at !== null;
    let type: NotifType = 'operation';
    let action: NotifAction = 'withdraw';

    const typeStr = (item.type || '').toUpperCase();
    if (typeStr.includes('RETRAIT') || typeStr.includes('WITHDRAWAL')) {
      type = 'operation';
      action = 'withdraw';
    } else if (typeStr.includes('ADHERENT') || typeStr.includes('MEMBER')) {
      type = 'adherent';
      action = 'create';
    } else if (typeStr.includes('COTISATION') || typeStr.includes('SAVING')) {
      type = 'cotisation';
      action = 'create';
    } else if (typeStr.includes('USER') || typeStr.includes('UTILISATEUR')) {
      type = 'utilisateur';
      action = 'create';
    } else if (typeStr.includes('GROUPE') || typeStr.includes('GROUP')) {
      type = 'groupe';
      action = 'create';
    } else if (typeStr.includes('DEPENSE') || typeStr.includes('EXPENSE')) {
      type = 'depense';
      action = 'create';
    } else if (typeStr.includes('WORKFLOW')) {
      type = 'workflow';
      action = 'create';
    } else {
      type = 'operation';
      action = 'withdraw';
    }

    return {
      id: item.id,
      type,
      action,
      title: item.title || 'Notification',
      message: item.body || item.message || '',
      timestamp: item.created_at || new Date().toISOString(),
      read: isRead,
      icon: this.getIcon(type, action),
      color: this.getColor(type, action),
      isServerNotif: true,
    };
  }

  private mapOperationToNotification(op: any, isRead: boolean): AppNotification {
    const amount = Number(op.montant || 0);
    const amountStr = amount ? ` de ${amount.toLocaleString('fr-FR')} F CFA` : '';
    const name = op.adherent?.name || 'Un adhérent';
    return {
      id: `op-${op.id}`,
      type: 'operation',
      action: 'withdraw',
      title: 'Nouvelle demande de retrait',
      message: `${name} a demandé un retrait${amountStr}.`,
      timestamp: op.created_at || op.date_operation || new Date().toISOString(),
      read: isRead,
      icon: this.getIcon('operation', 'withdraw'),
      color: this.getColor('operation', 'withdraw'),
      isServerNotif: true,
    };
  }

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
