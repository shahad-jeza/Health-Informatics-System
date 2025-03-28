import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AppointmentState } from './appointments.state';

function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
}

export const selectAppointmentState = createFeatureSelector<AppointmentState>('appointments');

export const selectUpcomingAppointments = createSelector(
  selectAppointmentState,
  (state) => state.upcoming
);

export const selectPastAppointments = createSelector(
  selectAppointmentState,
  (state) => state.past
);

export const selectAppointmentsByType = (appointmentType: 'upcoming' | 'past') => createSelector(
  selectAppointmentState,
  (state) => appointmentType === 'upcoming' ? state.upcoming : state.past
);

export const selectAppointmentsLoading = createSelector(
  selectAppointmentState,
  (state) => state.loading
);

export const selectAppointmentsError = createSelector(
  selectAppointmentState,
  (state) => state.error
);

export const selectSelectedAppointmentId = createSelector(
  selectAppointmentState,
  (state) => state.selectedAppointmentId
);

export const selectSelectedAppointment = createSelector(
  selectAppointmentState,
  selectSelectedAppointmentId,
  (state, selectedId) => {
    if (!selectedId) return null;
    
    // Look in both past and upcoming appointments
    return [...state.past, ...state.upcoming].find(app => app.id === selectedId) || null;
  }
);

export const selectAvailableSlots = createSelector(
  selectAppointmentState,
  (state) => state.availableSlots
);

export const selectBookingInProgress = createSelector(
  selectAppointmentState,
  (state) => state.bookingInProgress
);

export const selectBookingSuccess = createSelector(
  selectAppointmentState,
  (state) => state.bookingSuccess
);



export const selectAvailableSlotsFormatted = createSelector(
  selectAvailableSlots,
  (slots) => slots.map(slot => ({
    value: `${slot.id}`,
    label: `${slot.doctorId || 'Doctor'} - ${formatDate(slot.date)} at ${slot.time}`
  }))
);
