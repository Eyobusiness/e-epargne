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
      useGrouping: true
    })
    .format(value)
    .replace(/\u202F/g, ' ')
    .replace(/\u00A0/g, ' ');
  }

}