import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { switchMap, catchError, map } from 'rxjs/operators';
import { Appointment, AppointmentStatus } from '../../models/appointment.model';
import { ApiConfigService } from '../api-config/api-config.service';

@Injectable({
  providedIn: 'root'
})
  export class AppointmentService {
    constructor(
      private http: HttpClient,
      private apiConfig: ApiConfigService
    ) { }

  // Get all available appointments
  getAllAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(
      this.apiConfig.getEndpoint('Appointment/created'),
      this.apiConfig.httpOptions
    );
  }
  
  // Get appointments for a specific patient
  getAppointmentsByPatient(patientId: string): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(
      this.apiConfig.getEndpoint(`Appointment/patient/${patientId}`),
      this.apiConfig.httpOptions
    );
  }

  // Get appointments for a specific doctor
  getDoctorAppointments(doctorId: string): Observable<Appointment[]> {
    // Make HTTP GET request to the doctor-specific appointments endpoint
    return this.http.get<Appointment[]>(
      // Build the endpoint URL with the doctor's ID parameter
      this.apiConfig.getEndpoint(`Appointment/doctor/${doctorId}`),
      // Include authentication headers and other HTTP options
      this.apiConfig.httpOptions
    ).pipe(
      map(appointments => {
        return appointments;
      }),
      // Handle any errors that occur during the HTTP request
      catchError(error => {
        // Log the error
        console.error(`[AppointmentService] Error fetching doctor appointments: ${error.message}`);
        // Return a new error with user-friendly message
        return throwError(() => new Error(`Failed to fetch doctor appointments: ${error.message}`));
      })
    );
  }

  // Update an existing appointment
  updateAppointment(appointmentId: string, payload: any): Observable<Appointment> {
    return this.http.put<Appointment>(
      this.apiConfig.getEndpoint(`Appointment/${appointmentId}`),
      payload,
      this.apiConfig.httpOptions
    ).pipe(
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  // Get appointment by ID
  getAppointmentById(appointmentId: string): Observable<Appointment | null> {
    return this.http.get<Appointment>(
      this.apiConfig.getEndpoint(`Appointment/${appointmentId}`),
      this.apiConfig.httpOptions
    ).pipe(
      catchError(error => {
        return of(null);
      })
    );
  }

  getDoctorById(doctorId: string): Observable<any> {
    return this.http.get<any>(
      this.apiConfig.getEndpoint(`Appointment/doctor/${doctorId}`),
      this.apiConfig.httpOptions
    ).pipe(
      catchError(error => {
        console.error(`[AppointmentService] Error fetching doctor details: ${error.message}`);
        return throwError(() => new Error(`Failed to fetch doctor details: ${error.message}`));
      })
    );
  }
  updateAppointmentStatus(appointmentId: string, status: AppointmentStatus): Observable<Appointment> {
    const updatePayload = {
      updateDto: {
        Status: status
      }
    };
    
    return this.http.put<Appointment>(
      this.apiConfig.getEndpoint(`Appointment/${appointmentId}`),
      updatePayload,
      this.apiConfig.httpOptions
    ).pipe(
      catchError(error => {
        console.error(`[AppointmentService] Error updating appointment status: ${error.message}`);
        return throwError(() => new Error(`Failed to update appointment status: ${error.message}`));
      })
    );
  }

}