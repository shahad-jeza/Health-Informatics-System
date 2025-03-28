import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';
import * as NoteActions from './notes.actions';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class NoteEffects {
  
  loadNotes$ = createEffect(() => this.actions$.pipe(
    ofType(NoteActions.loadNotes),
    mergeMap(() => this.http.get<any[]>('/api/notes')
      .pipe(
        map(notes => NoteActions.loadNotesSuccess({ notes })),
        catchError(error => of(NoteActions.loadNotesFailure({ error })))
      ))
  ));
  
  addNote$ = createEffect(() => this.actions$.pipe(
    ofType(NoteActions.addNote),
    mergeMap(action => this.http.post<any>('/api/notes', action.note)
      .pipe(
        map(note => NoteActions.addNoteSuccess({ note })),
        catchError(error => of(NoteActions.addNoteFailure({ error })))
      ))
  ));
  
  constructor(
    private actions$: Actions,
    private http: HttpClient
  ) {}
}