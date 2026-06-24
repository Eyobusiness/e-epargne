import {
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { WorkflowState } from '../../models/workflow-state.model';

@Component({
  selector: 'app-workflow-states',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './workflow-states.component.html',
  styleUrls: ['./workflow-states.component.css'],
})
export class WorkflowStatesComponent {

  readonly states = input<WorkflowState[]>([]);

  readonly create = output<void>();

  readonly edit = output<WorkflowState>();

  readonly remove = output<string>();

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

    const data = this.states().map(state => {

      const previousState =
        this.states().find(
          s => s.id === state.beforeStep
        );

      return {

        state,

        id: state.id,

        name: state.name,

        description:
          state.description ?? '',

        etatPrecedent:
          previousState?.name ??
          'Première étape',

      };

    });

    if (!term) {
      return data;
    }

    return data.filter(item =>

      item.name
        .toLowerCase()
        .includes(term)

      ||

      item.etatPrecedent
        .toLowerCase()
        .includes(term)

      ||

      item.description
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

  onEdit(row: any): void {

    this.edit.emit(row.state);

  }

  onDelete(id: string): void {

    this.remove.emit(id);

  }

}