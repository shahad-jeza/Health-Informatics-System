import { createFeatureSelector, createSelector } from '@ngrx/store';
import { DoctorState } from './doctor.state';

// Base selectors - used for accessing state
export const selectDoctorState = createFeatureSelector<DoctorState>('doctor');

// Select all doctors - used in appointment components to get doctor names
export const selectAllDoctors = createSelector(
  selectDoctorState,
  (state: DoctorState | null) => state?.doctors ?? []
);

// Loading state - used for UI indicators
export const selectDoctorsLoading = createSelector(
  selectDoctorState,
  (state: DoctorState | null) => state?.loading ?? false
);

// Error state - used for error handling
export const selectDoctorsError = createSelector(
  selectDoctorState,
  (state: DoctorState | null) => state?.error ?? null
);