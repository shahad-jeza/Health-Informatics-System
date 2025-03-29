import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import * as NoteActions from './notes.actions';
import { HttpClient } from '@angular/common/http';
import { Note } from '../../models/note.model';
import { NoteService } from '../../services/notes/note.service';
import { Note as StateNote } from './notes.state'; 

@Injectable()
export class NoteEffects {
  // Load notes by patient ID
  loadNotesByPatient$ = createEffect(() => this.actions$.pipe(
    ofType(NoteActions.loadNotesByPatient),
    mergeMap(({ patientId }) => 
      this.noteService.getNotesByPatientId(patientId).pipe(
        map(notes => {
          return NoteActions.loadNotesByPatientSuccess({ 
            notes: notes as unknown as StateNote[]
          });
        }),
        catchError(error => of(NoteActions.loadNotesByPatientFailure({ error })))
      )
    )
  ));
  // Add a new note
  addNote$ = createEffect(() => this.actions$.pipe(
    ofType(NoteActions.addNote),
    switchMap(({ note }) => 
      this.noteService.createNote(note as Note).pipe(
        map(createdNote => {
          return NoteActions.addNoteSuccess({ 
            note: createdNote as unknown as StateNote 
          });
        }),
        catchError(error => of(NoteActions.addNoteFailure({ error })))
      )
    )
  ));
  // Load notes by appointment ID
  loadNotesByAppointment$ = createEffect(() => this.actions$.pipe(
    ofType(NoteActions.loadNotesByAppointment),
    mergeMap(({ appointmentId, patientId }) => 
      this.noteService.getNotesByPatientId(patientId).pipe(
        map(notes => {
          // Filter notes for the specific appointment
          const appointmentNotes = notes.filter(note => 
            note.appointmentId === appointmentId
          );
          
          return NoteActions.loadNotesByAppointmentSuccess({ 
            notes: appointmentNotes as unknown as StateNote[],
            appointmentId 
          });
        }),
        catchError(error => of(NoteActions.loadNotesByAppointmentFailure({ 
          error,
          appointmentId 
        })))
      )
    )
  ));
  
  constructor(
    private actions$: Actions,
    private http: HttpClient,
    private noteService: NoteService
  ) {}
}