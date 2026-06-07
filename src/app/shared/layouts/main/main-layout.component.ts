import { Component, signal } from "@angular/core";

import { CommonModule } from "@angular/common";

import { RouterOutlet } from "@angular/router";

import { HeaderComponent } from "../header/header.component";

import { SidebarComponent } from "../sidebar/sidebar.component";

import { FooterComponent } from "../footer/footer.component";

@Component({
  selector: "app-main-layout",
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    SidebarComponent,
    FooterComponent,
  ],
  templateUrl: "./main-layout.component.html",
  styleUrls: ["./main-layout.component.css"],
})
export class MainLayoutComponent {
  readonly sidebarOpen = signal<boolean>(
    typeof window === "undefined" ? true : window.innerWidth > 1200
  );

  toggleSidebar(): void {
    this.sidebarOpen.update((value) => !value);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }
}
