import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AppPageHeaderComponent } from '../../ui/app-page-header/app-page-header.component';

@Component({
  selector: 'app-feature-placeholder',
  standalone: true,
  imports: [CommonModule, AppPageHeaderComponent],
  templateUrl: './feature-placeholder.component.html',
  styleUrls: ['./feature-placeholder.component.css'],
})
export class FeaturePlaceholderComponent {
  private readonly route = inject(ActivatedRoute);

  readonly title = computed(() => this.route.snapshot.data['title'] ?? 'Module');
  readonly description = computed(
    () => this.route.snapshot.data['description'] ?? 'Cette page sera bientot disponible.',
  );
}
