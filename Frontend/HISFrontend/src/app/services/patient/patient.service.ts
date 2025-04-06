import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, of, map, retry, timer } from 'rxjs';
import { ApiConfigService } from '../api-config/api-config.service';
import { Patient } from '../../models/patient.model';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService
  ) { }

  /**
   * Gets all patients from the API
   */
  getAllPatients(): Observable<Patient[]> {
    return this.http.get<Patient[]>(
      this.apiConfig.getEndpoint('Patient'),
      this.apiConfig.httpOptions
    ).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Error fetching patients:', error);
        return of([]);
      })
    );
  }

  /**
   * Gets a patient by ID from the retrieved list
   */
  getPatientById(userId: string): Observable<Patient | undefined> {
    return this.getAllPatients().pipe(
      map(patients => patients.find(p => p.userId === userId))
    );
  }

  /**
   * Gets a patient's full name by ID
   */
  getPatientName(userId: string): Observable<string> {
    return this.getPatientById(userId).pipe(
      map(patient => {
        if (!patient) return 'Unknown Patient';
        return `${patient.firstName} ${patient.lastName}`;
      })
    );
  }
}