import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { CollectionService } from '../../services/collection.service';
import { Collection } from '../../models/collection.model';
import { ToastService } from '../../../../core/services/toast.service';

import { AppPageHeaderComponent } from '../../../../shared/ui/app-page-header/app-page-header.component';
import { AppEmptyStateComponent } from '../../../../shared/ui/app-empty-state/app-empty-state.component';

@Component({
  selector: 'app-collection-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AppPageHeaderComponent,
    AppEmptyStateComponent,
  ],
  templateUrl: './collection.component.html',
  styleUrls: ['./collection.component.css'],
})
export class CollectionComponent implements OnInit {
  private readonly collectionService = inject(CollectionService);
  private readonly toastService = inject(ToastService);

  readonly collections = signal<Collection[]>([]);
  readonly search = signal('');
  readonly isPageLoading = signal(false);

  readonly currentPage = signal(1);
  readonly pageSize = 10;

  ngOnInit(): void {
    this.loadCollections();
  }

  loadCollections(): void {
    this.isPageLoading.set(true);
    this.collectionService
      .getCollections()
      .pipe(finalize(() => this.isPageLoading.set(false)))
      .subscribe({
        next: (data) => this.collections.set(data),
        error: (err) => {
          this.collections.set([]);
          this.toastService.show(this.extractErrorMessage(err) || 'Erreur lors du chargement des collectes', 'error');
        },
      });
  }

  onSearch(value: string): void {
    this.search.set(value);
    this.currentPage.set(1);
  }

  readonly filteredCollections = computed(() => {
    const term = this.search().trim().toLowerCase();
    if (!term) {
      return this.collections();
    }
    return this.collections().filter((item) =>
      (item.agent?.name ?? '').toLowerCase().includes(term) ||
      (item.agent?.email ?? '').toLowerCase().includes(term) ||
      (item.amount ?? '').toString().includes(term) ||
      (item.status ?? '').toLowerCase().includes(term)
    );
  });

  readonly totalItems = computed(() => this.filteredCollections().length);
  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalItems() / this.pageSize))
  );

  readonly paginatedCollections = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredCollections().slice(start, start + this.pageSize);
  });

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages()) {
      return;
    }
    this.currentPage.set(page);
  }

  private extractErrorMessage(error: any): string {
    if (error?.error?.message && Array.isArray(error.error.message)) {
      return error.error.message
        .map((msg: any) => (typeof msg === 'string' ? msg : msg?.message || JSON.stringify(msg)))
        .join(', ');
    }
    if (error?.error?.message) {
      return error.error.message;
    }
    if (error?.message) {
      return error.message;
    }
    return '';
  }
}
