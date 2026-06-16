// components/groupe-filter/groupe-filter.component.ts

import { CommonModule } from '@angular/common';
import { Component, output, signal } from '@angular/core';

import { FormsModule } from '@angular/forms';

export interface GroupeFilter {
  search: string;
  status: string;
}

@Component({
  selector: 'app-groupe-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './groupe-filter.component.html',
  styleUrls: ['./groupe-filter.component.css'],
})
export class GroupeFilterComponent {
  readonly filterChange = output<GroupeFilter>();

  readonly search = signal('');

  readonly status = signal('200');

  applyFilters(): void {
    this.filterChange.emit({
      search: this.search(),
      status: this.status(),
    });
  }

  resetFilters(): void {
    this.search.set('');

    this.status.set('200');

    this.applyFilters();
  }
}
