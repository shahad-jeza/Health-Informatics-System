import { createFeatureSelector, createSelector } from '@ngrx/store';
import { DoctorState } from './doctor.state';

// Create a feature selector to get the doctor slice of the state
export const selectDoctorState = createFeatureSelector<DoctorState>('doctor');

// Select all doctors with null safety
export const selectAllDoctors = createSelector(
  selectDoctorState,
  (state: DoctorState | null) => state?.doctors ?? []
);

export const selectDoctorById = (doctorId: number) => createSelector(
  selectAllDoctors,
  (doctors) => doctors.find(doctor => doctor.id === doctorId) || null
);

export const selectDoctorsLoading = createSelector(
  selectDoctorState,
  (state: DoctorState | null) => state?.loading ?? false
);

export const selectDoctorsError = createSelector(
  selectDoctorState,
  (state: DoctorState | null) => state?.error ?? null
);

export const selectSelectedDoctor = createSelector(
  selectDoctorState,
  selectAllDoctors,
  (state: DoctorState | null, doctors) => {
    const selectedId = state?.selectedDoctorId;
    if (selectedId == null) return null;
    return doctors.find(doctor => doctor.id === selectedId) || null;
  }
);