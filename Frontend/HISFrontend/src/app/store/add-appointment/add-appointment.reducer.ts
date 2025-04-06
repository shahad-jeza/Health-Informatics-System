import { createReducer, on } from '@ngrx/store';
import { AddAppointmentState } from '../../models/addAppointment.model';
import * as AppointmentActions from './add-appointment.actions';

export const initialState: AddAppointmentState = {
  creating: false,
  created: false,
  error: null
};

export const addAppointmentReducer = createReducer(
  initialState,

  // Handle the creation of an appointment
  on(AppointmentActions.createAppointment, state => ({
    ...state,
    creating: true,
    created: false,
    error: null
  })),

  // Handle the success of appointment creation
  on(AppointmentActions.createAppointmentSuccess, state => ({
    ...state,
    creating: false,
    created: true
  })),

  // Handle the failure of appointment creation
  on(AppointmentActions.createAppointmentFailure, (state, { error }) => ({
    ...state,
    creating: false,
    error
  })),
  // Reset the appointment state
  on(AppointmentActions.resetAppointmentState, () => initialState)
);