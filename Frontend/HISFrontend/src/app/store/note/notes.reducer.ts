import { createReducer, on } from '@ngrx/store';
import * as NoteActions from './notes.actions';
import { NotesState } from './notes.state';

export const initialNotesState: NotesState = {
  notes: [],
  notesByAppointment: {},
  loading: false,
  error: null,
  selectedNoteId: null
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
  
  // Add note
  on(NoteActions.addNote, state => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(NoteActions.addNoteSuccess, (state, { note }) => ({
    ...state,
    notes: [...state.notes, note],
    loading: false
  })),
  
  on(NoteActions.addNoteFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false
  })),
  
  // Load notes by appointment
  on(NoteActions.loadNotesByAppointment, state => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(NoteActions.loadNotesByAppointmentSuccess, (state, { notes, appointmentId }) => ({
    ...state,
    notesByAppointment: {
      ...state.notesByAppointment,
      [appointmentId]: notes
    },
    loading: false
  })),
  
  on(NoteActions.loadNotesByAppointmentFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false
  })),
  
  // UI actions
  on(NoteActions.selectNote, (state, { noteId }) => ({
    ...state,
    selectedNoteId: noteId
  })),
  
  on(NoteActions.clearSelectedNote, state => ({
    ...state,
    selectedNoteId: null
  })),
  
  on(NoteActions.clearNoteErrors, state => ({
    ...state,
    error: null
  }))
);