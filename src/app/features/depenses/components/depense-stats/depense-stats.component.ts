import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';

import { Depense } from '../../models/depense.model';

@Component({
  selector: 'app-depense-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './depense-stats.component.html',
  styleUrls: ['./depense-stats.component.css'],
})
export class DepenseStatsComponent {
  readonly depenses = input<Depense[]>([]);
  readonly isLoading = input<boolean>(false);

  readonly totalAmount = computed(() => {
    return this.depenses().reduce((sum, item) => sum + Number(item.amount), 0);
  });

  readonly totalOperations = computed(() => this.depenses().length);

  readonly todayAmount = computed(() => {
    const today = new Date().toISOString().split('T')[0];

    return this.depenses()
      .filter((item) => this.getExpenseDate(item) === today)
      .reduce((sum, item) => sum + Number(item.amount), 0);
  });

  readonly monthlyAmount = computed(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    return this.depenses()
      .filter((item) => {
        const date = new Date(this.getExpenseDate(item) || '');

        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      })
      .reduce((sum, item) => sum + Number(item.amount), 0);
  });

  formatAmount(value: number): string {
    return new Intl.NumberFormat('fr-FR').format(value);
  }

  private getExpenseDate(item: Depense): string {
    const value = item.date_depense || item.created_at || '';

    return value.split('T')[0];
  }
}
