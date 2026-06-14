import { CommonModule } from '@angular/common';
import { Component, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile-filter',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile-filter.component.html',
})
export class ProfileFilterComponent {
  readonly filter = output<string>();

  private readonly fb = new FormBuilder();

  readonly form = this.fb.group({
    search: [''],
  });

  apply(): void {
    this.filter.emit(this.form.value.search ?? '');
  }
}
