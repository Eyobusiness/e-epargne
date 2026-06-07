import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';

import { Adherent } from '../../models/adherent.model';
import { getMemberStatusLabel, isMemberActive } from '../../utils/member-api.utils';

@Component({
  selector: 'app-adherent-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './adherent-table.component.html',
  styleUrls: ['./adherent-table.component.css'],
})
export class AdherentTableComponent {
  readonly adherents = input<Adherent[]>([]);

  readonly edit = output<Adherent>();
  readonly delete = output<Adherent>();
  readonly detail = output<Adherent>();
  readonly wallet = output<Adherent>();

  onEdit(item: Adherent): void {
    this.edit.emit(item);
  }

  onDelete(item: Adherent): void {
    this.delete.emit(item);
  }

  onDetail(item: Adherent): void {
    this.detail.emit(item);
  }

  onWallet(item: Adherent): void {
    this.wallet.emit(item);
  }

  trackById(_index: number, item: Adherent): string {
    return item.id ?? String(_index);
  }

  isActive(status?: string): boolean {
    return isMemberActive(status);
  }

  statusLabel(status?: string): string {
    return getMemberStatusLabel(status);
  }
}
