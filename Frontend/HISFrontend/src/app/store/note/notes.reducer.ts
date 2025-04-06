import { createReducer, on } from '@ngrx/store';
import * as NoteActions from './notes.actions';
import { NotesState } from './notes.state';

export const initialNotesState: NotesState = {
  notes: [],
  loading: false,
  error: null
};

export const notesReducer = createReducer(
  initialNotesState,
  
  // Load notes by patient 
  on(NoteActions.loadNotesByPatient, state => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(NoteActions.loadNotesByPatientSuccess, (state, { notes }) => ({
    ...state,
    notes,
    loading: false
  })),
  
  on(NoteActions.loadNotesByPatientFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false
  })),
  
  // Clear errors - utility action
  on(NoteActions.clearNoteErrors, state => ({
    ...state,
    error: null
  }))
);