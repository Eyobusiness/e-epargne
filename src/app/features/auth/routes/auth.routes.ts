// features/auth/routes/auth.routes.ts

import { Routes } from '@angular/router';

import { ChangePasswordComponent } from '../pages/login/change-password/change-password.component';
import { ForgotPasswordComponent } from '../pages/login/forgot-password/forgot-password.component';
import { LoginComponent } from '../pages/login/login.component';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent,
  },
  {
    path: 'change-password',
    component: ChangePasswordComponent,
  },
];
