import { Component, EventEmitter, Output, input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommissionConfig } from '../../models/commission.model';
import { Groupe } from '../../../groupes/models/groupe.model';

@Component({
  selector: 'app-commission-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './commission-table.component.html',
  styleUrls: ['./commission-table.component.css'],
})
export class CommissionTableComponent {
  readonly commissions = input<CommissionConfig[]>([]);
  readonly groupes = input<Groupe[]>([]);
  @Output() readonly edit = new EventEmitter<CommissionConfig>();
  @Output() readonly delete = new EventEmitter<CommissionConfig>();
  @Output() readonly toggleStatus = new EventEmitter<CommissionConfig>();

  readonly search = signal('');
  readonly currentPage = signal(1);
  readonly pageSize = 5;

  onSearch(value: string): void {
    this.search.set(value);
    this.currentPage.set(1);
  }

  getGroupName(groupId: string): string {
    const group = this.groupes().find((g) => g.id === groupId);
    return group ? group.name : 'Groupe inconnu';
  }

  readonly filteredItems = computed(() => {
    const term = this.search().trim().toLowerCase();
    if (!term) {
      return this.commissions();
    }
    return this.commissions().filter((item) => {
      const groupName = this.getGroupName(item.groupe_cotisation_id).toLowerCase();
      return (
        (item.libelle ?? '').toLowerCase().includes(term) ||
        (item.type_operation ?? '').toLowerCase().includes(term) ||
        groupName.includes(term) ||
        (item.mode_commission ?? '').toLowerCase().includes(term) ||
        item.valeur.toString().includes(term)
      );
    });
  });

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredItems().length / this.pageSize))
  );

  readonly paginatedItems = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredItems().slice(start, start + this.pageSize);
  });

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages()) {
      return;
    }
    this.currentPage.set(page);
  }
}
