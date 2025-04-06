import { createReducer, on } from '@ngrx/store';
import * as DoctorActions from './doctor.actions';
import { DoctorState } from './doctor.state';

export const initialDoctorState: DoctorState = {
  doctors: [], 
  loading: false,
  error: null,
};

export const doctorReducer = createReducer(
  initialDoctorState,
  
  on(DoctorActions.loadDoctors, state => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(DoctorActions.loadDoctorsSuccess, (state, { doctors }) => ({
    ...state,
    doctors,
    loading: false
  })),
  
  on(DoctorActions.loadDoctorsFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false
  }))
  

);