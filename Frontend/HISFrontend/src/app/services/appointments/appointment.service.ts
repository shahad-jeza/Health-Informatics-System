import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { of } from 'rxjs';
import { throwError } from 'rxjs'; 
import { switchMap, catchError, map } from 'rxjs/operators';
import { Appointment } from '../../models/appointment.model';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private apiUrl = 'http://localhost:5223/api';

  constructor(private http: HttpClient) { }

  // Get all appointments -  /api/appointment/all
  getAllAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/appointment/all`);
  }
  // Get available appointments - filter from all appointments
  getAvailableAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/appointment/all`).pipe(
      map(appointments => appointments.filter(a => a.status === 'available')),
      catchError(error => {
        console.error('Error fetching available appointments:', error);
        return of([]);
      })
    );
  }
  // Get appointments for a specific doctor -  /api/appointment/doctor/{doctorId}
  getAppointmentsByDoctor(doctorId: number): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/appointment/doctor/${doctorId}`);
  }
  
  // Get appointments for a specific patient -  /api/appointment/patient/{patientId}
  getAppointmentsByPatient(patientId: number): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/appointment/patient/${patientId}`);
  }
  
  // Create a new appointment -  POST /api/appointment
  createAppointment(appointment: Appointment): Observable<Appointment> {
    return this.http.post<Appointment>(`${this.apiUrl}/appointment`, appointment);
  }
  
  // Update an existing appointment - matches PUT /api/appointment/{appointmentId}
  updateAppointment(id: number, appointment: any): Observable<Appointment> {
    const payload = {
      patientId: appointment.patientId,
      status: appointment.status
    };
  
  console.log(`Sending PUT request to ${this.apiUrl}/appointment/${id} with data:`, payload);
  
  return this.http.put<Appointment>(`${this.apiUrl}/appointment/${id}`, payload)
    .pipe(
      catchError(error => {
        console.error(`Error updating appointment ${id}:`, error);
        console.error('Response body:', error.error);
        return throwError(() => error);
      })
    );
}

// Get appointments for a specific patient -  /api/appointment/patient/{patientId}
getPatientAppointments(patientId: number): Observable<Appointment[]> {
  return this.http.get<Appointment[]>(`${this.apiUrl}/appointment/patient/${patientId}`)
    .pipe(
      catchError(error => {
        console.error(`Error fetching appointments for patient ${patientId}:`, error);
        return of([]);
      })
    );
}
  
// Reschedule an appointment -  /api/appointment/{appointmentId}
  rescheduleAppointment(
    appointmentId: number, 
    newDate: string, 
    newTime: string
  ): Observable<Appointment> {
    // First, get all appointments and find the specific one
    return this.getAllAppointments()
      .pipe(
        switchMap(appointments => {
          const appointment = appointments.find(a => a.id === appointmentId);
          if (!appointment) {
            return throwError(() => new Error('Appointment not found'));
          }
          
          // Update the appointment with new date and time
          const updatedAppointment = {
            ...appointment,
            date: newDate,
            time: newTime
          };
          
          // Call the update endpoint
          return this.updateAppointment(appointmentId, updatedAppointment);
        }),
        catchError(error => {
          console.error('Error rescheduling appointment:', error);
          return throwError(() => error);
        })
      );
  }
  
// Cancel an appointment -  /api/appointment/{appointmentId}
cancelAppointment(appointmentId: number): Observable<Appointment> {

  console.log(`Direct API call to cancel appointment ${appointmentId}`);
  
  // Create payload
  const payload = {
    status: 'available',
    patientId: 0  
  };
  
  // Make a direct API call
  return this.http.put<Appointment>(`${this.apiUrl}/appointment/${appointmentId}`, payload)
    .pipe(
      map(response => {
        console.log(`Successfully canceled appointment ${appointmentId}:`, response);
        return response;
      }),
      catchError(error => {
        console.error(`Error canceling appointment ${appointmentId}:`, error);
        return throwError(() => new Error('Failed to cancel appointment. Please try again.'));
      })
    );
}

// Get filtered appointments based on type (upcoming/past) -  /api/appointment/patient/{patientId}
  getFilteredAppointments(appointmentType: 'upcoming' | 'past'): Observable<Appointment[]> {
    // Get appointments for patient ID 1 (replace with auth later)
    return this.getAppointmentsByPatient(1).pipe(
      map(appointments => {
        if (appointmentType === 'upcoming') {
          return this.filterUpcomingAppointments(appointments);
        } else {
          return this.filterPastAppointments(appointments);
        }
      })
    );
  }

// Filter upcoming appointments 
private filterUpcomingAppointments(appointments: Appointment[]): Appointment[] {
  const today = new Date();
  return appointments.filter(appointment => {
    // Don't show canceled appointments in upcoming list
    if (appointment.status === 'canceled' || appointment.status === 'available') {
      return false;
    }
    
    const appointmentDate = new Date(appointment.date);
    return appointmentDate > today || 
      (appointmentDate.setHours(0,0,0,0) === today.setHours(0,0,0,0) && 
       this.isTimeAfterNow(appointment.time));
  });
}

// Filter past appointments 
private filterPastAppointments(appointments: Appointment[]): Appointment[] {
  const today = new Date();
  return appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.date);
    return appointmentDate < today || 
      (appointmentDate.setHours(0,0,0,0) === today.setHours(0,0,0,0) && 
       !this.isTimeAfterNow(appointment.time));
  });
}

  // check if a time is after current time
  private isTimeAfterNow(timeString: string): boolean {
    const now = new Date();
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours > now.getHours() || (hours === now.getHours() && minutes > now.getMinutes());
  }

  // Book an appointment -  /api/appointment
  bookAppointment(appointmentId: number, patientId: number): Observable<Appointment> {
    const bookingData = {
      appointmentId: appointmentId,
      patientId: patientId
    };
    
    console.log(`Booking appointment with data:`, bookingData);
    
    return this.http.post<Appointment>(`${this.apiUrl}/appointment`, bookingData)
      .pipe(
        catchError(error => {
          console.error(`Error booking appointment ${appointmentId}:`, error);
          return throwError(() => error);
        })
      );
  }

}