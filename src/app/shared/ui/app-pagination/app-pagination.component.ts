import { Component, EventEmitter, Output, computed, input } from '@angular/core';

import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app-pagination.component.html',
  styleUrls: ['./app-pagination.component.css'],
})
export class AppPaginationComponent {
  readonly currentPage = input<number>(1);

  readonly totalPages = input<number>(1);

  readonly disabled = input<boolean>(false);

  @Output()
  readonly pageChange = new EventEmitter<number>();

  readonly pages = computed(() => {
    const totalPages = Math.max(this.totalPages(), 1);

    return Array.from({ length: totalPages }, (_, index) => index + 1);
  });

  previous(): void {
    if (this.disabled()) {
      return;
    }

    if (this.currentPage() > 1) {
      this.pageChange.emit(this.currentPage() - 1);
    }
  }

  next(): void {
    if (this.disabled()) {
      return;
    }

    if (this.currentPage() < this.totalPages()) {
      this.pageChange.emit(this.currentPage() + 1);
    }
  }

  goTo(page: number): void {
    if (this.disabled()) {
      return;
    }

    if (page < 1 || page > this.totalPages() || page === this.currentPage()) {
      return;
    }

    this.pageChange.emit(page);
  }
}
