import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Output,
  computed,
  forwardRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface SearchableSelectOption {
  label: string;
  value: string;
  subtitle?: string;
}

@Component({
  selector: 'app-searchable-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app-searchable-select.component.html',
  styleUrls: ['./app-searchable-select.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AppSearchableSelectComponent),
      multi: true,
    },
  ],
})
export class AppSearchableSelectComponent implements ControlValueAccessor {
  private readonly elementRef = inject(ElementRef);

  readonly label = input<string>('');
  readonly options = input<SearchableSelectOption[]>([]);
  readonly placeholder = input<string>('Sélectionner...');
  readonly searchPlaceholder = input<string>('Rechercher...');
  readonly error = input<string | null>(null);
  readonly clearable = input<boolean>(true);
  readonly disabled = input<boolean>(false);
  readonly id = input<string>('search-select-' + Math.random().toString(36).substring(2, 9));

  readonly selectedValue = signal<string>('');
  readonly isOpen = signal<boolean>(false);
  readonly searchQuery = signal<string>('');
  readonly isDisabled = signal<boolean>(false);

  @Output() readonly selectionChange = new EventEmitter<string>();

  onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  readonly selectedOption = computed(() => {
    const val = this.selectedValue();
    return this.options().find((opt) => String(opt.value) === String(val)) ?? null;
  });

  readonly filteredOptions = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const opts = this.options();
    if (!query) {
      return opts;
    }
    return opts.filter(
      (opt) =>
        opt.label.toLowerCase().includes(query) ||
        (opt.subtitle && opt.subtitle.toLowerCase().includes(query)),
    );
  });

  writeValue(value: string | number | null): void {
    this.selectedValue.set(value != null ? String(value) : '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }

  toggleOpen(): void {
    if (this.isDisabled() || this.disabled()) {
      return;
    }
    const nextState = !this.isOpen();
    this.isOpen.set(nextState);
    if (nextState) {
      this.searchQuery.set('');
    } else {
      this.onTouched();
    }
  }

  selectOption(option: SearchableSelectOption | null, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    const val = option ? String(option.value) : '';
    this.selectedValue.set(val);
    this.onChange(val);
    this.selectionChange.emit(val);
    this.isOpen.set(false);
    this.searchQuery.set('');
    this.onTouched();
  }

  clearSelection(event: Event): void {
    event.stopPropagation();
    this.selectOption(null);
  }

  onSearchInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.searchQuery.set(val);
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      if (this.isOpen()) {
        this.isOpen.set(false);
        this.onTouched();
      }
    }
  }
}
