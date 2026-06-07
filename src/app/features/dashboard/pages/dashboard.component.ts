import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  readonly currentPeriod = new Intl.DateTimeFormat('fr-FR', {
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  readonly stats = [
    {
      tone: 'primary',
      badge: 'AD',
      trend: '+12%',
      trendType: 'positive',
      label: 'Total adherents',
      value: '1 250',
      description: 'Membres enregistres'
    },
    {
      tone: 'secondary',
      badge: 'CO',
      trend: '+18%',
      trendType: 'positive',
      label: 'Total cotisations',
      value: '125 000 XAF',
      description: 'Revenus collectes'
    },
    {
      tone: 'danger',
      badge: 'DE',
      trend: '-4%',
      trendType: 'negative',
      label: 'Total depenses',
      value: '50 000 XAF',
      description: 'Charges financieres'
    },
    {
      tone: 'warning',
      badge: 'PF',
      trend: '+9%',
      trendType: 'positive',
      label: 'Solde portefeuille',
      value: '75 000 XAF',
      description: 'Solde disponible'
    }
  ];

  readonly activities = [
    {
      badge: 'NA',
      tone: 'primary',
      title: 'Nouvel adherent ajoute',
      subtitle: 'Ferdinand Kone',
      time: '2 min'
    },
    {
      badge: 'CT',
      tone: 'success',
      title: 'Nouvelle cotisation',
      subtitle: '25 000 XAF recus',
      time: '12 min'
    },
    {
      badge: 'DP',
      tone: 'danger',
      title: 'Depense enregistree',
      subtitle: 'Achat fournitures',
      time: '30 min'
    }
  ];

  readonly overview = [
    { label: 'Taux de croissance', value: '+14%', tone: 'success-text' },
    { label: 'Revenus mensuels', value: '450 000 XAF', tone: '' },
    { label: 'Depenses mensuelles', value: '120 000 XAF', tone: 'danger-text' },
    { label: 'Operations validees', value: '92%', tone: '' }
  ];
}
