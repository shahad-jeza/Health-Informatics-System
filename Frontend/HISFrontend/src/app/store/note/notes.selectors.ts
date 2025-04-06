import { createFeatureSelector, createSelector } from '@ngrx/store';
import { NotesState } from './notes.state';

// Base selectors - used for accessing state
export const selectNotesState = createFeatureSelector<NotesState>('notes');

export const selectAllNotes = createSelector(
  selectNotesState,
  (state) => state?.notes ?? []
);

// UI state selectors
export const selectNotesLoading = createSelector(
  selectNotesState,
  (state) => state?.loading ?? false
);

export const selectNotesError = createSelector(
  selectNotesState,
  (state) => state?.error ?? null
);

// Utility selector to check if there are any notes
export const selectHasNotes = createSelector(
  selectAllNotes,
  (notes) => notes.length > 0
);

// Filter notes by appointmentId 
export const selectNotesByAppointmentId = (appointmentId: string) => createSelector(
  selectAllNotes,
  (notes) => notes.filter(note => note.appointmentId === appointmentId)
);