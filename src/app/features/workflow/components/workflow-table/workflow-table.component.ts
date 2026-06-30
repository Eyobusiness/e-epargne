import {
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Workflow } from '../../models/workflow.model';

@Component({
  selector: 'app-workflow-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './workflow-table.component.html',
  styleUrls: ['./workflow-table.component.css'],
})
export class WorkflowTableComponent {

  readonly workflows = input<Workflow[]>([]);

  readonly create = output<void>();

  readonly edit = output<Workflow>();

  readonly remove = output<string>();

  readonly configure = output<Workflow>();

  readonly search = signal('');

  readonly currentPage = signal(1);

  readonly pageSize = 10;

  onSearch(value: string): void {

    this.search.set(value);

    this.currentPage.set(1);

  }

  readonly filteredItems = computed(() => {

    const term =
      this.search()
        .trim()
        .toLowerCase();

    if (!term) {

      return this.workflows();

    }

    return this.workflows().filter(workflow =>

      workflow.label
        .toLowerCase()
        .includes(term)

      ||

      workflow.endpoint
        .toLowerCase()
        .includes(term)

      ||

      (workflow.description ?? '')
        .toLowerCase()
        .includes(term)

    );

  });

  readonly totalPages = computed(() =>

    Math.max(
      1,
      Math.ceil(
        this.filteredItems().length /
        this.pageSize
      )
    )

  );

  readonly paginatedItems = computed(() => {

    const start =
      (this.currentPage() - 1) *
      this.pageSize;

    const end =
      start + this.pageSize;

    return this.filteredItems().slice(
      start,
      end
    );

  });

  changePage(page: number): void {

    if (
      page < 1 ||
      page > this.totalPages()
    ) {
      return;
    }

    this.currentPage.set(page);

  }

  openCreate(): void {

    this.create.emit();

  }

  onEdit(workflow: Workflow): void {

    this.edit.emit(workflow);

  }

  onDelete(id: string): void {

    this.remove.emit(id);

  }

  onConfigure(workflow: Workflow): void {

    this.configure.emit(workflow);

  }

}