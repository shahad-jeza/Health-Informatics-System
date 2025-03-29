import { createAction, props } from '@ngrx/store';
import { Note } from './notes.state';

export const loadNotesByPatient = createAction(
  '[Note] Load Notes By Patient',
  props<{ patientId: number }>()
);

export const loadNotesByPatientSuccess = createAction(
  '[Note] Load Notes By Patient Success',
  props<{ notes: Note[] }>()
);

export const loadNotesByPatientFailure = createAction(
  '[Note] Load Notes By Patient Failure',
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

export const loadNotesByAppointment = createAction(
  '[Notes] Load Notes By Appointment',
  props<{ appointmentId: number; patientId: number }>() 
);

export const loadNotesByAppointmentSuccess = createAction(
  '[Notes] Load Notes By Appointment Success',
  props<{ notes: Note[]; appointmentId: number }>() 
);

export const loadNotesByAppointmentFailure = createAction(
  '[Notes] Load Notes By Appointment Failure',
  props<{ error: any; appointmentId: number }>()
);

export const selectNote = createAction(
  '[Note] Select Note',
  props<{ noteId: number }>()
);

export const clearSelectedNote = createAction(
  '[Note] Clear Selected Note'
);

export const clearNoteErrors = createAction(
  '[Note] Clear Errors'
);