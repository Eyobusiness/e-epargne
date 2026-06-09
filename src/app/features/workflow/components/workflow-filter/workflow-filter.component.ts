import { CommonModule } from '@angular/common';
import { Component, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface WorkflowFilter {
  search: string;
  status: string;
}

@Component({
  selector: 'app-workflow-filter',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './workflow-filter.component.html',
  styleUrls: ['./workflow-filter.component.css'],
})
export class WorkflowFilterComponent {

  readonly filterChange =
    output<WorkflowFilter>();

  readonly search =
    signal('');

  readonly status =
    signal('');

  applyFilters(): void {

    this.filterChange.emit({
      search: this.search(),
      status: this.status(),
    });

  }

  resetFilters(): void {

    this.search.set('');
    this.status.set('');

    this.applyFilters();

  }
}