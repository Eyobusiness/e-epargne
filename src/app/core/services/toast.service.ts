import { Injectable, signal } from '@angular/core';

export interface Toast {
  message: string;
  type: 'success' | 'error' | 'warning';
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private readonly toastMessage = signal<string>('');
  private readonly toastType = signal<'success' | 'error' | 'warning'>('success');
  private readonly toastVisible = signal<boolean>(false);
  private toastTimeoutId: ReturnType<typeof setTimeout> | null = null;

  readonly message = this.toastMessage.asReadonly();
  readonly type = this.toastType.asReadonly();
  readonly isVisible = this.toastVisible.asReadonly();

  show(message: string, type: 'success' | 'error' | 'warning' = 'success'): void {
    this.toastMessage.set(message);
    this.toastType.set(type);
    this.toastVisible.set(true);

    if (this.toastTimeoutId) {
      clearTimeout(this.toastTimeoutId);
    }

    this.toastTimeoutId = setTimeout(() => {
      this.toastVisible.set(false);
      this.toastTimeoutId = null;
    }, 3000);
  }

  hide(): void {
    this.toastVisible.set(false);
    if (this.toastTimeoutId) {
      clearTimeout(this.toastTimeoutId);
      this.toastTimeoutId = null;
    }
  }
}
