import { createFeatureSelector, createSelector } from '@ngrx/store';
import { PatientState } from './patient.state';


/// Selectors for the Patient feature state
/// These selectors are used to select specific pieces of state from the store.
export const selectPatientState = createFeatureSelector<PatientState>('patients');

/// - selectAllPatients: Selects all patients from the state
export const selectAllPatients = createSelector(
  selectPatientState,
  (state) => state?.patients || [] 
);

/// - selectPatientsLoading: Selects the loading state for patients
export const selectPatientsLoading = createSelector(
  selectPatientState,
  (state) => state?.loading || false
);

/// - selectPatientsError: Selects any error that occurred during the loading of patients
export const selectPatientsError = createSelector(
  selectPatientState,
  (state) => state?.error || null
);

/// - selectPatientById: Selects a specific patient by their ID
export const selectPatientById = (patientId: string) => createSelector(
  selectAllPatients,
  (patients) => patients.find(patient => patient.userId === patientId) || null
);