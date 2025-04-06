import { createReducer, on } from '@ngrx/store';
import * as PatientActions from './patient.actions';
import { initialPatientState } from './patient.state';

export const patientReducer = createReducer(
  initialPatientState,
  
  // Handle loading patients action
  on(PatientActions.loadPatients, state => ({
    ...state,
    loading: true,
    error: null
  })),
  
  // Handle success action when patients are loaded successfully
  on(PatientActions.loadPatientsSuccess, (state, { patients }) => ({
    ...state,
    patients,
    loading: false,
    error: null
  })),
  
  // Handle failure action when loading patients fails
  on(PatientActions.loadPatientsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  }))
);