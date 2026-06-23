import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'changerDate',
  standalone: true,
})
export class ChangerDatePipe implements PipeTransform {

  transform(
    value: string | Date | null | undefined,
    withTime = true,
  ): string {

    if (!value) {
      return '--';
    }

    const date = new Date(value);

    if (withTime) {

      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);

    }

    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  }

}
