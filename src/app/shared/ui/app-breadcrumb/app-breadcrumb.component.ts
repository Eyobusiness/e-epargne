// import { Component, OnInit, inject, signal } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
// import { filter } from 'rxjs/operators';

// export interface Breadcrumb {
//   label: string;
//   url: string;
// }

// @Component({
//   selector: 'app-breadcrumb',
//   standalone: true,
//   imports: [CommonModule, RouterModule],
//   templateUrl: './app-breadcrumb.component.html',
//   styleUrl: './app-breadcrumb.component.css'
// })
// export class AppBreadcrumbComponent implements OnInit {
//   private router = inject(Router);
//   private activatedRoute = inject(ActivatedRoute);

//   breadcrumbs = signal<Breadcrumb[]>([]);

//   ngOnInit(): void {
//     this.router.events.pipe(
//       filter(event => event instanceof NavigationEnd)
//     ).subscribe(() => {
//       this.breadcrumbs.set(this.createBreadcrumbs(this.activatedRoute.root));
//     });

//     // Initialisation au chargement
//     this.breadcrumbs.set(this.createBreadcrumbs(this.activatedRoute.root));
//   }

//   private createBreadcrumbs(route: ActivatedRoute, url: string = '', breadcrumbs: Breadcrumb[] = []): Breadcrumb[] {
//     const children: ActivatedRoute[] = route.children;

//     if (children.length === 0) {
//       return breadcrumbs;
//     }

//     for (const child of children) {
//       const routeURL: string = child.snapshot.url.map(segment => segment.path).join('/');
//       if (routeURL !== '') {
//         url += `/${routeURL}`;
//       }

//       const label = child.snapshot.data['breadcrumb'];
//       if (label) {
//         breadcrumbs.push({ label, url });
//       }

//       return this.createBreadcrumbs(child, url, breadcrumbs);
//     }

//     return breadcrumbs;
//   }
// }
