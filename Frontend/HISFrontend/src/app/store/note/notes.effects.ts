import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';
import * as NoteActions from './notes.actions';
import { NoteService } from '../../services/notes/note.service';

@Injectable()
export class NoteEffects {
  // Load notes by patient ID 
  loadNotesByPatient$ = createEffect(() => this.actions$.pipe(
    ofType(NoteActions.loadNotesByPatient),
    mergeMap(({ patientUserId }) => 
      this.noteService.getNotesByPatientId(patientUserId).pipe(
        map(notes => {
          return NoteActions.loadNotesByPatientSuccess({ notes });
        }),
        catchError(error => {
          console.error('Error loading notes:', error);
          return of(NoteActions.loadNotesByPatientFailure({ error }));
        })
      )
    )
  ));
  
  constructor(
    private actions$: Actions,
    private noteService: NoteService
  ) {}
}