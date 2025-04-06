import { createAction, props } from '@ngrx/store';
import { Patient } from '../../models/patient.model'; 

// Load all patients from the API
export const loadPatients = createAction('[Patient] Load Patients');

export const loadPatientsSuccess = createAction(
  '[Patient] Load Patients Success',
  props<{ patients: Patient[] }>()
);

export const loadPatientsFailure = createAction(
  '[Patient] Load Patients Failure',
  props<{ error: string }>()
);