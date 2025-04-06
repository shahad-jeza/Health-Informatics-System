import { createAction, props } from '@ngrx/store';
import { Note } from './notes.state';

// GET /api/Note/patient/{patientUserId}
export const loadNotesByPatient = createAction(
  '[Note] Load Notes By Patient',
  props<{ patientUserId: string }>() 
);

export const loadNotesByPatientSuccess = createAction(
  '[Note] Load Notes By Patient Success',
  props<{ notes: Note[] }>()
);

export const loadNotesByPatientFailure = createAction(
  '[Note] Load Notes By Patient Failure',
  props<{ error: any }>()
);

// Utility action for clearing errors
export const clearNoteErrors = createAction(
  '[Note] Clear Errors'
);