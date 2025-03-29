import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, shareReplay } from 'rxjs/operators';
import { User } from '../../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  private apiUrl = 'http://localhost:5223/api';
  private doctorCache: Map<number, string> = new Map();
  private allDoctorsCache$: Observable<User[]> | null = null;
  
  constructor(private http: HttpClient) { }

  getAllDoctors(): Observable<User[]> {
    // Use cached observable if available to avoid multiple API calls
    if (!this.allDoctorsCache$) {
      this.allDoctorsCache$ = this.http.get<User[]>(`${this.apiUrl}/doctor/all`).pipe(
        shareReplay(1),
        catchError(error => {
          console.error('Error fetching doctors:', error);
          return of([]);
        })
      );
    }
    return this.allDoctorsCache$;
  }
  
  formatDoctorName(doctor: any): string {
    if (!doctor) return 'Unknown Doctor';
    
    if (doctor.firstName && doctor.lastName) {
      return `Dr. ${doctor.firstName} ${doctor.lastName}`;
    } else if (typeof doctor.name === 'string') {
      const nameParts = doctor.name.replace(/^Dr\.\s+/, '').split(' ');
      if (nameParts.length >= 2) {
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ');
        return `Dr. ${firstName} ${lastName}`;
      } else {
        return doctor.name; 
      }
    } else {
      return `Doctor (ID: ${doctor.id})`;
    }
  }

  getDoctorNameById(doctorId: number | undefined): Observable<string> {
    if (doctorId === undefined) {
      return of('Unknown Doctor');
    }
    
    // Check cache first
    const cachedName = this.doctorCache.get(doctorId);
    if (cachedName) {
      return of(cachedName);
    }
    
    // If not in cache, fetch all doctors and find the one we need
    return this.getAllDoctors().pipe(
      map(doctors => {
        const doctor = doctors.find(d => d.id === doctorId);
        if (!doctor) {
          return `Doctor (ID: ${doctorId})`;
        }
        
        const formattedName = this.formatDoctorName(doctor);
        // Update cache for future use
        this.doctorCache.set(doctorId, formattedName);
        return formattedName;
      })
    );
  }
  
  getDoctorNameFromCache(doctorId: number | undefined): string | undefined {
    if (doctorId === undefined) return 'Unknown Doctor';
    return this.doctorCache.get(doctorId);
  }
  
  clearCache(): void {
    this.doctorCache.clear();
    this.allDoctorsCache$ = null;
  }
}