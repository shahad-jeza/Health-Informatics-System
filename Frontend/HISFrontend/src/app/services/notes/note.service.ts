import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Note } from '../../store/note/notes.state';
import { ApiConfigService } from '../api-config/api-config.service';

@Injectable({
  providedIn: 'root'
})
export class NoteService {
  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService
  ) {}
  
  getNotesByPatientId(patientUserId: string): Observable<Note[]> {
    return this.http.get<Note[]>(
      this.apiConfig.getEndpoint(`Note/patient/${patientUserId}`),
      this.apiConfig.httpOptions
    );
  }
  
  createNote(note: Note): Observable<Note> {
    return this.http.post<Note>(
      this.apiConfig.getEndpoint('Note'),
      note,
      this.apiConfig.httpOptions
    );
  }
}