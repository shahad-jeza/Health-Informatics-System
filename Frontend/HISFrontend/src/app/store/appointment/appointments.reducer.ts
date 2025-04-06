import { createReducer, on } from '@ngrx/store';
import * as AppointmentActions from './appointments.actions';
import { AppointmentState, initialAppointmentState } from './appointments.state';

export const appointmentReducer = createReducer(
  initialAppointmentState,
  
  // Get appointments by patient 
  on(AppointmentActions.getAppointmentsByPatient, state => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(AppointmentActions.getAppointmentsByPatientSuccess, (state, { appointments }) => ({
    ...state,
    appointments,
    loading: false,
    error: null
  })),
  
  on(AppointmentActions.getAppointmentsByPatientFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Create appointment 
  on(AppointmentActions.createAppointment, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(AppointmentActions.createAppointmentSuccess, (state, { appointment }) => ({
    ...state,
    appointments: [...state.appointments, appointment],
    loading: false,
    error: null
  })),
  
  on(AppointmentActions.createAppointmentFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Cancel appointment handlers 
  on(AppointmentActions.updateAppointmentStatus, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(AppointmentActions.updateAppointmentStatusSuccess, (state, { appointment }) => {
    if (!appointment) {
      return { ...state, loading: false };
    }

    const updatedAppointments = state.appointments.map(app => 
      app.appointmentId === appointment.appointmentId ? appointment : app
    );
    
    return {
      ...state,
      appointments: updatedAppointments,
      loading: false
    };
  }),
  
  on(AppointmentActions.updateAppointmentStatusFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
);