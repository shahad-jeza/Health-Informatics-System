import { createReducer, on } from '@ngrx/store';
import * as AppointmentActions from './appointments.actions';
import { AppointmentState, initialAppointmentState } from './appointments.state';

export const appointmentReducer = createReducer(
  initialAppointmentState,
  
  // Loading
  on(AppointmentActions.loadAppointments, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(AppointmentActions.loadAppointmentsSuccess, (state, { appointmentType, appointments }) => ({
    ...state,
    [appointmentType]: appointments,
    loading: false
  })),
  
  on(AppointmentActions.loadAppointmentsFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false
  })),
  
  // Cancellation
  on(AppointmentActions.cancelAppointment, (state) => ({
    ...state,
    loading: true
  })),
  
  on(AppointmentActions.cancelAppointmentSuccess, (state, { appointmentId }) => {
    const updatedUpcoming = state.upcoming.filter(app => app.id !== appointmentId);
    
    return {
      ...state,
      upcoming: updatedUpcoming,
      loading: false
    };
  }),
  
  on(AppointmentActions.cancelAppointmentFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false
  })),
  
  // Rescheduling
  on(AppointmentActions.rescheduleAppointment, (state) => ({
    ...state,
    loading: true
  })),
  
  on(AppointmentActions.rescheduleAppointmentSuccess, (state, { appointment }) => {
    const updatedUpcoming = state.upcoming.map(app => 
      app.id === appointment.id ? appointment : app
    );
    
    return {
      ...state,
      upcoming: updatedUpcoming,
      loading: false
    };
  }),
  
  on(AppointmentActions.rescheduleAppointmentFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false
  })),
  
  // Selection
  on(AppointmentActions.selectAppointment, (state, { appointmentId }) => ({
    ...state,
    selectedAppointmentId: appointmentId
  })),
  
  // Load available slots
  on(AppointmentActions.loadAvailableSlots, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(AppointmentActions.loadAvailableSlotsSuccess, (state, { appointments }) => ({
    ...state,
    availableSlots: appointments,
    loading: false
  })),
  
  on(AppointmentActions.loadAvailableSlotsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Book appointment
  on(AppointmentActions.bookAppointment, (state) => ({
    ...state,
    bookingInProgress: true,
    bookingSuccess: false,
    error: null
  })),
  
  on(AppointmentActions.bookAppointmentSuccess, (state, { appointment }) => {
    const updatedUpcoming = [...state.upcoming, appointment];
    
    const updatedAvailableSlots = state.availableSlots.filter(
      slot => slot.id !== appointment.id
    );
    
    return {
      ...state,
      upcoming: updatedUpcoming,
      availableSlots: updatedAvailableSlots,
      bookingInProgress: false,
      bookingSuccess: true
    };
  }),
  
  on(AppointmentActions.bookAppointmentFailure, (state, { error }) => ({
    ...state,
    bookingInProgress: false,
    error
  })),
  
  // Reset booking state
  on(AppointmentActions.resetBookingState, (state) => ({
    ...state,
    bookingSuccess: false,
    bookingInProgress: false,
    error: null
  }))
);