import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AddAppointmentState } from '../../models/addAppointment.model';

export const selectAppointmentState = createFeatureSelector<AddAppointmentState>('appointment');

export const selectAppointmentCreating = createSelector(
  selectAppointmentState,
  (state: AddAppointmentState) => state.creating
);

export const selectAppointmentCreated = createSelector(
  selectAppointmentState,
  (state: AddAppointmentState) => state.created
);

export const selectAppointmentError = createSelector(
  selectAppointmentState,
  (state: AddAppointmentState) => state.error
);