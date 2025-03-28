import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Appointment } from '../../models/appointment.model';
import { Note } from '../../models/note.model';

@Injectable({
  providedIn: 'root',
})
export class AppointmentService {
  private apiUrl = 'http://localhost:5066/api/appointments';
  private notesUrl = 'http://localhost:5066/api/notes';

  constructor(private http: HttpClient) {}

    // Get all appointments (without filtering)
    getAppointments(): Observable<Appointment[]> {
      return this.http.get<Appointment[]>(this.apiUrl);
    }
  
  // Fetch appointments by type (upcoming or past)
  getAppointmentsByType(type: 'upcoming' | 'past'): Observable<Appointment[]> {
    const endpoint = `${this.apiUrl}?type=${type}`;
    return this.http.get<Appointment[]>(endpoint);
  }

  getFilteredAppointments(type: 'upcoming' | 'past'): Observable<Appointment[]> {
    const endpoint = `${this.apiUrl}?type=${type}`;
    return this.http.get<Appointment[]>(endpoint);
  }

  // Fetch available appointment slots
  getAvailableAppointmentSlots(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/available`);
  }

  // Book an appointment
  bookAppointment(appointmentId: number, patientId: number): Observable<Appointment> {
    return this.http.post<Appointment>(`${this.apiUrl}/book`, { appointmentId, patientId });
  }

  // Cancel an appointment
  cancelAppointment(appointmentId: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${appointmentId}/cancel`, {});
  }

  // Reschedule an appointment
  rescheduleAppointment(appointmentId: number, date: string, time: string): Observable<Appointment> {
    return this.http.put<Appointment>(`${this.apiUrl}/${appointmentId}/reschedule`, {
      date,
      time
    });
  }

    // Get notes for a specific appointment
    getAppointmentNotes(appointmentId: number): Observable<Note[]> {
      return this.http.get<Note[]>(`${this.notesUrl}/appointment/${appointmentId}`);
    }
}