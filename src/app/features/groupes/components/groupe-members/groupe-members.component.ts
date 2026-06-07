// components/groupe-members/groupe-members.component.ts

import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';

import { AffectationAdherent } from '../../models/affectation-adherent.model';
import { getGroupStatusLabel, isGroupActive } from '../../utils/group-status.utils';

@Component({
  selector: 'app-groupe-members',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './groupe-members.component.html',
  styleUrls: ['./groupe-members.component.css'],
})
export class GroupeMembersComponent {
  readonly members = input<AffectationAdherent[]>([]);

  readonly remove = output<AffectationAdherent>();

  isActive(status?: string): boolean {
    return isGroupActive(status);
  }

  statusLabel(status?: string): string {
    return getGroupStatusLabel(status);
  }

  removeMember(item: AffectationAdherent): void {
    this.remove.emit(item);
  }
}
