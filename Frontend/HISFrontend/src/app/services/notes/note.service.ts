import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Note } from '../../store/note/notes.state';
import { ApiConfigService } from '../api-config/api-config.service';
export interface CreateNoteDto {
  appointmentId: string;
  noteText: string;
  medicalHistoryId: string;
}
@Injectable({
  providedIn: 'root'
})
export class NoteService {
  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService
  ) {}
  
  // Get all notes for a specific patient - GET /api/Note/patient/{patientUserId}
  getNotesByPatientId(patientUserId: string): Observable<Note[]> {
    return this.http.get<Note[]>(
      this.apiConfig.getEndpoint(`Note/patient/${patientUserId}`),
      this.apiConfig.httpOptions
    );
  }
  
// Create a new note - POST /api/Note
createNote(note: CreateNoteDto): Observable<Note> {
  return this.http.post<Note>(
    this.apiConfig.getEndpoint('Note'),
    note,
    this.apiConfig.httpOptions
  );
}
}