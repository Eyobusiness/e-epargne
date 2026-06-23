import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { RapportFilter } from '../../models/rapport-filter.model';

@Component({
  selector: 'app-rapport-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rapport-filter.component.html',
  styleUrls: ['./rapport-filter.component.css'],
})
export class RapportFilterComponent {
  readonly filter = input.required<RapportFilter>();

  readonly apply = output<RapportFilter>();

  readonly reset = output<void>();

  onApply(): void {
    this.apply.emit(this.filter());
  }

  onReset(): void {
    this.reset.emit();
  }
}
