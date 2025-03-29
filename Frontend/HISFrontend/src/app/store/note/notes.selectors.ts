import { createFeatureSelector, createSelector } from '@ngrx/store';
import { NotesState } from './notes.state';

// Update to match your feature state name (NotesState)
export const selectNotesState = createFeatureSelector<NotesState>('notes');

export const selectAllNotes = createSelector(
  selectNotesState,
  (state) => state?.notes ?? []
);

export const selectNotesLoading = createSelector(
  selectNotesState,
  (state) => state?.loading ?? false
);

export const selectNotesError = createSelector(
  selectNotesState,
  (state) => state?.error ?? null
);

// Select notes by patient ID 
export const selectNotesByPatientId = (patientId: number) => createSelector(
  selectNotesState,
  (state) => {
    return state?.notes ?? [];
  }
);

// Select notes for a specific appointment
export const selectNotesByAppointmentId = (appointmentId: number) => createSelector(
  selectAllNotes,
  (notes) => notes.filter(note => note.appointmentId === appointmentId)
);

// Select a single note by ID
export const selectNoteById = (noteId: number) => createSelector(
  selectAllNotes,
  (notes) => notes.find(note => note.id === noteId) || null
);

// Select the currently selected note
export const selectSelectedNoteId = createSelector(
  selectNotesState,
  (state) => state?.selectedNoteId
);

export const selectSelectedNote = createSelector(
  selectAllNotes,
  selectSelectedNoteId,
  (notes, selectedId) => selectedId ? notes.find(note => note.id === selectedId) || null : null
);

// Utility selectors for UI components
export const selectHasNotes = createSelector(
  selectAllNotes,
  (notes) => notes.length > 0
);

export const selectMostRecentNote = createSelector(
  selectAllNotes,
  (notes) => {
    if (notes.length === 0) return null;
    return notes[notes.length - 1]; // Return the last note
  }
);

// Check if notes have been loaded for a specific appointment
export const selectNotesLoadedForAppointment = (appointmentId: number) => createSelector(
  selectNotesState,
  selectNotesByAppointmentId(appointmentId),
  (state, notes) => notes.length > 0
);