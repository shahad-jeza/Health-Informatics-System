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
  console.log(`[AppointmentService] Fetching appointments for doctor: ${doctorId}`);
  
  return this.http.get<Appointment[]>(
    this.apiConfig.getEndpoint(`Appointment/doctor/${doctorId}`),
    this.apiConfig.httpOptions
  ).pipe(
    map(appointments => {
      console.log(`[AppointmentService] Received ${appointments.length} appointments for doctor ${doctorId}`);
      return appointments;
    }),
    catchError(error => {
      console.error(`[AppointmentService] Error fetching doctor appointments: ${error.message}`);
      return throwError(() => new Error(`Failed to fetch doctor appointments: ${error.message}`));
    })
  );
}
  // Create a new appointment
  createAppointment(appointment: any): Observable<Appointment> {
    // Step 1: Create the appointment
    const createPayload = {
      DoctorUserId: appointment.doctorUserId, 
      Date: appointment.date,
    };
    
    return this.http.post<any>(
      this.apiConfig.getEndpoint('Appointment'),
      createPayload,
      this.apiConfig.httpOptions
    ).pipe(
      switchMap(createdAppointment => {
        const appointmentId = createdAppointment.appointmentId;
        const patientId = appointment.patientId || 3;
        
        // Step 2: Update with patient information
        const updatePayload = {
          updateDto: {
            Status: 1, // Confirmed status
            PatientUserId: String(patientId) 
          }
        };
        
        return this.http.put(
          this.apiConfig.getEndpoint(`Appointment/${appointmentId}`),
          updatePayload,
          this.apiConfig.httpOptions
        ).pipe(
          map(response => {
            const finalAppointment = {
              ...createdAppointment,
              status: AppointmentStatus.Confirmed,
              patientId: patientId,
              patientUserId: String(patientId)
            };
            
            this.cacheAppointment(finalAppointment as Appointment);
            return finalAppointment as Appointment;
          }),
          catchError(updateError => {
            return of({
              ...createdAppointment,
              patientId: patientId,
              patientUserId: String(patientId),
              _updateFailed: true
            } as Appointment);
          })
        );
      }),
      catchError(createError => {
        return throwError(() => new Error(`Failed to create appointment: ${createError.message}`));
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

  // Cache appointment data in localStorage
  private cacheAppointment(appointment: Appointment): void {
    try {
      const cachedAppointmentsJson = localStorage.getItem('cachedAppointments');
      let cachedAppointments: Appointment[] = [];
      
      if (cachedAppointmentsJson) {
        cachedAppointments = JSON.parse(cachedAppointmentsJson);
      }
      
      const existingIndex = cachedAppointments.findIndex(a => a.appointmentId === appointment.appointmentId);
      
      if (existingIndex >= 0) {
        cachedAppointments[existingIndex] = appointment;
      } else {
        cachedAppointments.push(appointment);
      }
      
      // Save back to localStorage
      localStorage.setItem('cachedAppointments', JSON.stringify(cachedAppointments));
      localStorage.setItem(`appointment_${appointment.appointmentId}`, JSON.stringify(appointment));
    } catch (e) {
      // Silently fail if localStorage is unavailable
    }
  }
}