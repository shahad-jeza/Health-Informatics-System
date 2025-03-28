import { createAction, props } from '@ngrx/store';
import { Note } from './notes.state';

export const loadNotes = createAction(
  '[Note] Load Notes'
);

export const loadNotesSuccess = createAction(
  '[Note] Load Notes Success',
  props<{ notes: Note[] }>()
);

export const loadNotesFailure = createAction(
  '[Note] Load Notes Failure',
  props<{ error: any }>()
);

export const addNote = createAction(
  '[Note] Add Note',
  props<{ note: Note }>()
);

export const addNoteSuccess = createAction(
  '[Note] Add Note Success',
  props<{ note: Note }>()
);

export const addNoteFailure = createAction(
  '[Note] Add Note Failure',
  props<{ error: any }>()
);