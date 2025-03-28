import { createReducer, on } from '@ngrx/store';
import * as NoteActions from './notes.actions';
import { NoteState } from './notes.state';

export const initialNoteState: NoteState = {
  notes: [],
  loading: false,
  error: null,
  selectedNoteId: null  
};

export const noteReducer = createReducer(
  initialNoteState,
  
  on(NoteActions.loadNotes, state => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(NoteActions.loadNotesSuccess, (state, { notes }) => ({
    ...state,
    notes,
    loading: false
  })),
  
  on(NoteActions.loadNotesFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false
  })),
  
  on(NoteActions.addNoteSuccess, (state, { note }) => ({
    ...state,
    notes: [...state.notes, note]
  }))
);