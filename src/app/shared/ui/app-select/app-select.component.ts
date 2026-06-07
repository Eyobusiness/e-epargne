import { CommonModule } from '@angular/common';

import { Component, EventEmitter, Output, forwardRef, input, signal } from '@angular/core';

import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/* =====================================================
OPTION MODEL
===================================================== */

export interface SelectOption {
  label: string;

  value: string;
}

@Component({
  selector: 'app-select',

  standalone: true,

  imports: [CommonModule],

  templateUrl: './app-select.component.html',

  styleUrls: ['./app-select.component.css'],

  providers: [
    {
      provide: NG_VALUE_ACCESSOR,

      useExisting: forwardRef(() => AppSelectComponent),

      multi: true,
    },
  ],
})
export class AppSelectComponent implements ControlValueAccessor {
  /* =====================================================
  INPUTS
  ===================================================== */

  readonly label = input<string>('');

  readonly options = input<SelectOption[]>([]);

  readonly placeholder = input<string>('Sélectionner une option');

  readonly error = input<string | null>(null);

  readonly id = input<string>('select-' + Math.random().toString(36).substring(2, 9));

  /* =====================================================
  STATE
  ===================================================== */

  readonly value = signal<string>('');

  readonly isDisabled = signal<boolean>(false);

  /* =====================================================
  CONTROL VALUE ACCESSOR
  ===================================================== */

  onChange: (value: string) => void = () => {};

  onTouched: () => void = () => {};

  @Output()
  readonly blurred = new EventEmitter<void>();

  /* =====================================================
  WRITE VALUE
  ===================================================== */

  writeValue(value: string): void {
    this.value.set(value || '');
  }

  /* =====================================================
  REGISTER CHANGE
  ===================================================== */

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  /* =====================================================
  REGISTER TOUCHED
  ===================================================== */

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  /* =====================================================
  DISABLED
  ===================================================== */

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }

  /* =====================================================
  CHANGE
  ===================================================== */

  onSelectChange(event: Event): void {
    const target = event.target as HTMLSelectElement;

    const value = target.value;

    this.value.set(value);

    this.onChange(value);

    this.onTouched();
  }

  onBlur(): void {
    this.onTouched();
    this.blurred.emit();
  }
}
