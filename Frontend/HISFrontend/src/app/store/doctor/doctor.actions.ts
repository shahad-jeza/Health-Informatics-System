import { createAction, props } from '@ngrx/store';
import { Doctor } from './doctor.state';

export const loadDoctors = createAction(
  '[Doctor] Load Doctors'
);

export const loadDoctorsSuccess = createAction(
  '[Doctor] Load Doctors Success',
  props<{ doctors: Doctor[] }>()
);

export const loadDoctorsFailure = createAction(
  '[Doctor] Load Doctors Failure',
  props<{ error: any }>()
);

export const selectDoctor = createAction(
  '[Doctor] Select Doctor',
  props<{ id: number }>()
);