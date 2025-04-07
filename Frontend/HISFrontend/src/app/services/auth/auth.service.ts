import { Injectable,PLATFORM_ID,Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { BehaviorSubject, tap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

interface LoginResponse {
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = 'http://localhost:5219/api/auth';
  private jwtHelper = new JwtHelperService();
  private loggedIn = new BehaviorSubject<boolean>(false);



  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.checkToken();
  }

  login(email: string, password: string) {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((response: { token: string; }) => {
        this.storeToken(response.token);
        this.loggedIn.next(true);
        this.redirectBasedOnRole();
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    this.loggedIn.next(false);
    this.router.navigate(['/login']);
  }

  isLoggedIn() {
    return this.loggedIn.asObservable();
  }

  // Safe token access
  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('token');
    }
    return null;
  }

  // Safe token storage
  storeToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('token', token);
    }
  }

  // Safe token removal
  removeToken(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
    }
  }
  getCurrentUserId(): string | null {
    const token = this.getToken();
    if (!token) return null;
    
    const decoded = this.jwtHelper.decodeToken(token);
    return decoded?.Uuid; // Directly use the UUID from token
  }
  
  getRoleSpecificId(): string {
    const token = this.getToken();
    const decoded = this.jwtHelper.decodeToken(token!);
    return decoded[`${decoded.role}Id`]; // Throws if missing (intentional)
  }

  getUserRole(): string | null {
    const token = this.getToken();
    if (!token) return null;
    const decoded = this.jwtHelper.decodeToken(token);
    return decoded ? decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] : null;
  }


  private checkToken() {
    const token = this.getToken();
    if (token && !this.jwtHelper.isTokenExpired(token)) {
      this.loggedIn.next(true);
    }
  }

  redirectBasedOnRole() {
    const role = this.getUserRole();
    const userId = this.getCurrentUserId();
    console.log(`Redirecting - Role: ${role}, UserId: ${userId}`); // Debug log
    
    if (!role || !userId) {
      console.error('Missing role or userId');
      return;
    }
  
    switch(role.toLowerCase()) {
      case 'doctor':
        console.log('Redirecting to /doctor');
        this.router.navigate(['/doctor']);
        break;
      case 'patient':
        console.log('Redirecting to /patient');
        this.router.navigate(['/patient']);
        break;
      case 'admin':
        console.log('Redirecting to /admin');
        this.router.navigate(['/admin']);
        break;
      default:
        console.log('Redirecting to home (unknown role)');
        this.router.navigate(['/']);
    }
  }
}