import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AppointmentState } from './appointments.state';

// Base selector for the appointment state
export const selectAppointmentState = createFeatureSelector<AppointmentState>('appointments');

// Main collection of appointments 
export const selectAllAppointments = createSelector(
  selectAppointmentState,
  (state) => state.appointments || []
);

// UI state selectors 
export const selectAppointmentsLoading = createSelector(
  selectAppointmentState,
  (state) => state.loading
);

export const selectAppointmentsError = createSelector(
  selectAppointmentState,
  (state) => state.error
);

// Booking-related selectors - used in appointment booking flow
export const selectBookingInProgress = createSelector(
  selectAppointmentState,
  (state) => state.bookingInProgress
);

export const selectBookingSuccess = createSelector(
  selectAppointmentState,
  (state) => state.bookingSuccess
);

// Available doctors selector - used during booking
export const selectAvailableDoctors = createSelector(
  selectAppointmentState,
  (state) => state.availableDoctors
);