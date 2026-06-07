import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';

import { Operation } from '../../models/operation.model';

@Component({
  selector: 'app-operation-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './operation-table.component.html',
  styleUrls: ['./operation-table.component.css'],
})
export class OperationTableComponent {
  readonly operations = input<Operation[]>([]);

  readonly pay = output<Operation>();

  readonly delete = output<Operation>();

  onPay(item: Operation): void {
    this.pay.emit(item);
  }

  onDelete(item: Operation): void {
    this.delete.emit(item);
  }

  trackById(index: number, item: Operation): string | number {
    return item.id ?? index;
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case '100':
        return 'En attente';

      case '200':
        return 'Payé';

      case '300':
        return 'Annulé';

      default:
        return '-';
    }
  }

  getTypeLabel(type: string): string {
    switch (type) {
      case 'DEPOT':
        return 'Dépôt';

      case 'RETRAIT':
        return 'Retrait';

      default:
        return type;
    }
  }

  getMoyenLabel(moyen: string): string {
    switch (moyen) {
      case 'ORANGE_MONEY':
        return 'Orange Money';

      case 'MTN_MONEY':
        return 'MTN Money';

      case 'WAVE':
        return 'Wave';

      case 'CASH':
        return 'Espèces';

      default:
        return moyen;
    }
  }
}
