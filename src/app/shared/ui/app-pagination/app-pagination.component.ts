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

  readonly pages = computed<(number | string)[]>(() => {
    const current = this.currentPage();
    const total = Math.max(this.totalPages(), 1);

    if (total <= 5) {
      return Array.from({ length: total }, (_, index) => index + 1);
    }

    const items: (number | string)[] = [];

    // Always show page 1
    items.push(1);

    if (current <= 3) {
      // Near the start: 1, 2, 3, 4, '...', total
      items.push(2, 3, 4);
      items.push('...');
      items.push(total);
    } else if (current >= total - 2) {
      // Near the end: 1, '...', total-3, total-2, total-1, total
      items.push('...');
      items.push(total - 3, total - 2, total - 1);
      items.push(total);
    } else {
      // In the middle: 1, '...', current-1, current, current+1, '...', total
      items.push('...');
      items.push(current - 1, current, current + 1);
      items.push('...');
      items.push(total);
    }

    return items;
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

  goTo(page: number | string): void {
    if (typeof page === 'string') {
      return;
    }
    if (this.disabled()) {
      return;
    }

    if (page < 1 || page > this.totalPages() || page === this.currentPage()) {
      return;
    }

    this.pageChange.emit(page);
  }
}
