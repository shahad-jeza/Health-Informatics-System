import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Doctor } from '../../store/doctor/doctor.state';
import { ApiConfigService } from '../api-config/api-config.service';

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService
  ) { }

  getAllDoctors(): Observable<Doctor[]> {
    return this.http.get<Doctor[]>(
      this.apiConfig.getEndpoint('Doctor'),
      this.apiConfig.httpOptions
    ).pipe(
      catchError(error => {
        // Log error 
        console.error('Error fetching doctors:', error);
        return of([]);
      })
    );
  }
}