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
  on(AppointmentActions.cancelAppointmentSuccess, (state, { appointmentId }) => {
    // Find the appointment being canceled
    const appointment = state.upcoming.find(app => app.id === appointmentId);
    
    // Filter it out from upcoming appointments
    const updatedUpcoming = state.upcoming.filter(app => app.id !== appointmentId);
    
    return {
      ...state,
      upcoming: updatedUpcoming,
      loading: false
    };
  }),
  
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
  
  // Changed to handle doctors instead of appointments
  on(AppointmentActions.loadAvailableSlotsSuccess, (state, { doctors }) => ({
    ...state,
    availableDoctors: doctors, 
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
    
    return {
      ...state,
      upcoming: updatedUpcoming,
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