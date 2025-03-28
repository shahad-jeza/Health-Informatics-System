import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Note } from '../../models/note.model';

@Injectable({
  providedIn: 'root'
})
export class NoteService {
  private apiUrl = 'http://localhost:5066/api/notes';
  
  constructor(private http: HttpClient) {}
  
  getNotes(): Observable<Note[]> {
    return this.http.get<Note[]>(this.apiUrl);
  }
  
  getNotesByAppointmentId(appointmentId: number): Observable<Note> {
    return this.http.get<Note>(`${this.apiUrl}/appointment/${appointmentId}`);
  }
  
  // Add this new method to get notes by patient ID
  getNotesByPatientId(patientId: number): Observable<Note[]> {
    return this.http.get<Note[]>(`${this.apiUrl}/patient/${patientId}`);
  }
  
  createNote(note: Note): Observable<Note> {
    return this.http.post<Note>(this.apiUrl, note);
  }
  
  updateNote(note: Note): Observable<Note> {
    return this.http.put<Note>(`${this.apiUrl}/${note.id}`, note);
  }
  
  deleteNote(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}