import { createFeatureSelector, createSelector } from '@ngrx/store';
import { NoteState } from './notes.state';

export const selectNoteState = createFeatureSelector<NoteState>('note');

export const selectAllNotes = createSelector(
  selectNoteState,
  (state) => {
    return state?.notes ?? [];
  }
);

export const selectNotesLoading = createSelector(
  selectNoteState,
  (state) => state?.loading ?? false
);

export const selectNotesError = createSelector(
  selectNoteState,
  (state) => state?.error ?? null
);

export const selectNoteByAppointmentId = (appointmentId: number) => createSelector(
  selectAllNotes,
  (notes) => notes.find(note => note.appointmentId === appointmentId) || null
);