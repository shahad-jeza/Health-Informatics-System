import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';

// doctor.guard.ts
export const doctorGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  const role = authService.getUserRole();
  const userId = authService.getCurrentUserId();

  console.log(`Guard Check - Role: ${role}, UserId: ${userId}`);

  if (role === 'Doctor' && userId) {
    return true;
  }
  
  console.log('Access denied - redirecting to login');
  router.navigate(['/login']);
  return false;
};