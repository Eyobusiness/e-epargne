// shared/pipes/format-montant.pipe.ts

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatMontant',
  standalone: true,
})
export class FormatMontantPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value == null) return '0';
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value).replace(/\s/g, '.');
  }
}