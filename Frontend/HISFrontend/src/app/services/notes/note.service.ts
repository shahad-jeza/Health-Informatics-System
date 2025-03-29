import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError, switchMap, tap } from 'rxjs/operators';
import { Note } from '../../models/note.model';
import { Appointment } from '../../models/appointment.model';
import { AppointmentService } from '../appointments/appointment.service';


@Injectable({
  providedIn: 'root'
})
export class NoteService {
  private apiUrl = 'http://localhost:5223/api';
  
  constructor(
    private http: HttpClient,
    private appointmentService: AppointmentService
  ) {}
  
  // Get all notes - GET /api/note/all
  getNotesByPatientId(patientId: number): Observable<Note[]> {
    // First get all appointments for this patient
    return this.http.get<Appointment[]>(`${this.apiUrl}/appointment/patient/${patientId}`).pipe(
      switchMap(appointments => {
        console.log(`Found ${appointments.length} appointments for patient ${patientId}`);
        
        if (appointments.length === 0) {
          return of([])
        }
        
        // Gert all notes for this patient - GET /api/note/patient/{patientId}
        return this.http.get<Note[]>(`${this.apiUrl}/note/patient/${patientId}`).pipe(
          map(notes => {
            console.log(`Found ${notes.length} notes for patient ${patientId}`);
            return notes;
          })
        );
      }),
      catchError(error => {
        console.error('Error in getNotesByPatientId:', error);
        return of([]);
      })
    );
  }

  // Create a new note - POST /api/note
  createNote(note: Note): Observable<Note> {
    return this.http.post<Note>(`${this.apiUrl}/note`, note);
  }
  

  // Update an existing note - PUT /api/note/{noteId}
  getNotesByAppointmentId(appointmentId: number): Observable<Note[]> {
    const patientId = 1;
    console.log(`Getting notes for appointment ID: ${appointmentId}`);
    
    return this.getNotesByPatientId(patientId).pipe(
      map(notes => {
        console.log(`Total notes for patient ${patientId}:`, notes);
        
        notes.forEach(note => {
          console.log(`Note ${note.id}: appointmentId=${note.appointmentId}, type=${typeof note.appointmentId}`);
        });
        
        const filteredNotes = notes.filter(note => 
          Number(note.appointmentId) === Number(appointmentId)
        );
        
        console.log(`After filtering, found ${filteredNotes.length} notes for appointmentId=${appointmentId}:`, filteredNotes);
        return filteredNotes;
      }),
      catchError(error => {
        console.error(`Error getting notes for appointment ${appointmentId}:`, error);
        return of([]);
      })
    );
  }
}