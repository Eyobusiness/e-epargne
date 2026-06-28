import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';

import { Cotisation } from '../../models/cotisation.model';
import {
  getSubscriptionStatusLabel,
  isSubscriptionActive,
} from '../../utils/subscription-api.utils';

@Component({
  selector: 'app-cotisation-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cotisation-table.component.html',
  styleUrls: ['./cotisation-table.component.css'],
})
export class CotisationTableComponent {
  readonly cotisations = input<Cotisation[]>([]);
  readonly edit = output<Cotisation>();
  readonly delete = output<Cotisation>();
  readonly activate = output<Cotisation>();
  readonly deactivate = output<Cotisation>();

  getPeriodiciteLabel(periodicite: string): string {
    switch (periodicite) {
      case '1':
        return 'Journalière';

      case '2':
        return 'Hebdomadaire';

      case '3':
        return 'Mensuelle';

      case '4':
        return 'Annuelle';

      default:
        return '-';
    }
  }

  onEdit(item: Cotisation): void {
    this.edit.emit(item);
  }

  onDelete(item: Cotisation): void {
    this.delete.emit(item);
  }

  onActivate(item: Cotisation): void {
    this.activate.emit(item);
  }

  onDeactivate(item: Cotisation): void {
    this.deactivate.emit(item);
  }

  trackById(index: number, item: Cotisation): string {
    return item.id ?? String(index);
  }

  isActive(status?: string): boolean {
    return isSubscriptionActive(status);
  }

  statusLabel(status?: string): string {
    return getSubscriptionStatusLabel(status);
  }
}
