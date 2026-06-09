import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';

import { Workflow } from '../../models/workflow.model';
import { WorkflowService } from '../../services/workflow.service';
import { Router } from '@angular/router';


import {
  WorkflowFilter,
  WorkflowFilterComponent,
} from '../../components/workflow-filter/workflow-filter.component';

import { WorkflowTableComponent } from '../../components/workflow-table/workflow-table.component';
import { WorkflowFormComponent } from '../../components/workflow-form/workflow-form.component';

import { AppModalComponent } from '../../../../shared/ui/app-modal/app-modal.component';
import { AppPageHeaderComponent } from '../../../../shared/ui/app-page-header/app-page-header.component';
import { AppPaginationComponent } from '../../../../shared/ui/app-pagination/app-pagination.component';
import { AppConfirmDialogComponent } from '../../../../shared/ui/app-confirm-dialog/app-confirm-dialog.component';
// import { AppEmptyStateComponent } from '../../../../shared/ui/app-empty-state/app-empty-state.component';

import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-workflows',
  standalone: true,
  imports: [
    CommonModule,
    AppModalComponent,
    AppPageHeaderComponent,
    AppPaginationComponent,
    AppConfirmDialogComponent,
    // AppEmptyStateComponent,
    WorkflowTableComponent,
    WorkflowFormComponent,
    WorkflowFilterComponent,
  ],
  templateUrl: './workflows.component.html',
  styleUrls: ['./workflows.component.css'],
})
export class WorkflowsComponent implements OnInit {
  private readonly service = inject(WorkflowService);

  private readonly toastService = inject(ToastService);

  private readonly router = inject(Router);

  readonly workflows = signal<Workflow[]>([]);

  readonly selected = signal<Workflow | null>(null);

  readonly isLoading = signal(false);

  readonly isPageLoading = signal(false);

  readonly isDeleteLoading = signal(false);

  readonly isModalOpen = signal(false);

  readonly isDeleteOpen = signal(false);

  readonly currentPage = signal(1);

  readonly itemsPerPage = 10;

  readonly filters = signal<WorkflowFilter>({
    search: '',
    status: '',
  });

  readonly filteredWorkflows = computed(() => {
    const filter = this.filters();

    return this.workflows().filter((item) => {
      const search = filter.search.toLowerCase();

      const matchSearch =
        !search ||
        item.label?.toLowerCase().includes(search) ||
        item.endpoint?.toLowerCase().includes(search);

      const matchStatus = !filter.status || item.status === filter.status;

      return matchSearch && matchStatus;
    });
  });

  readonly totalItems = computed(() => this.filteredWorkflows().length);

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalItems() / this.itemsPerPage)),
  );

  readonly paginatedWorkflows = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage;

    return this.filteredWorkflows().slice(start, start + this.itemsPerPage);
  });



  ngOnInit(): void {
    this.loadWorkflows();
  }

  loadWorkflows(): void {
    this.isPageLoading.set(true);

    this.service
      .getWorkflows()
      .pipe(finalize(() => this.isPageLoading.set(false)))
      .subscribe({
        next: (response) => {
          this.workflows.set(response);
        },

        error: () => {
          this.workflows.set([]);
        },
      });
  }

  onFilterChange(filters: WorkflowFilter): void {
    this.filters.set(filters);

    this.currentPage.set(1);
  }

  changePage(page: number): void {
    this.currentPage.set(page);
  }

  openCreateModal(): void {
    this.selected.set(null);

    this.isModalOpen.set(true);
  }

  openEditModal(workflow: Workflow): void {
    this.selected.set(workflow);

    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.selected.set(null);

    this.isModalOpen.set(false);
  }

  save(workflow: Workflow): void {

  this.isLoading.set(true);

  const selected = this.selected();

  const payload = {
    endpoint: workflow.endpoint,
    label: workflow.label,
    description: workflow.description,
    parent: workflow.parent,
  };

  const request = selected?.id
    ? this.service.updateWorkflow(
        selected.id,
        payload,
      )
    : this.service.createWorkflow(
        payload,
      );

  request
    .pipe(
      finalize(() =>
        this.isLoading.set(false),
      ),
    )
    .subscribe({
      next: () => {

        this.closeModal();

        this.loadWorkflows();

        this.toastService.show(
          'Workflow enregistré',
          'success',
        );
      },

      error: (error) => {

        console.log(error);

        this.toastService.show(
          'Erreur enregistrement',
          'error',
        );
      },
    });
}

  openDeleteDialog(workflow: Workflow): void {
    this.selected.set(workflow);

    this.isDeleteOpen.set(true);
  }

  delete(): void {
    const selected = this.selected();

    if (!selected?.id) {
      return;
    }

    this.isDeleteLoading.set(true);

    this.service
      .deleteWorkflow(selected.id)
      .pipe(finalize(() => this.isDeleteLoading.set(false)))
      .subscribe({
        next: () => {
          this.loadWorkflows();

          this.isDeleteOpen.set(false);

          this.toastService.show('Workflow supprimé', 'success');
        },

        error: () => {
          this.toastService.show('Erreur suppression', 'error');
        },
      });
  }

openDetails(workflow: Workflow): void {

  if (!workflow.id) {
    return;
  }

  this.router.navigate([
    '/workflow',
    workflow.id,
  ]);

}

}
