import { createAction, props } from '@ngrx/store';
import { Appointment } from '../../models/appointment.model';

// Load appointments
export const loadAppointments = createAction(
  '[Appointments] Load Appointments',
  props<{ appointmentType: 'past' | 'upcoming' }>()
);

export const loadAppointmentsSuccess = createAction(
  '[Appointments] Load Appointments Success',
  props<{ appointmentType: 'past' | 'upcoming'; appointments: Appointment[] }>()
);

export const loadAppointmentsFailure = createAction(
  '[Appointments] Load Appointments Failure',
  props<{ error: string }>()
);

// Cancel appointment
export const cancelAppointment = createAction(
  '[Appointments] Cancel Appointment',
  props<{ appointmentId: number }>()
);

export const cancelAppointmentSuccess = createAction(
  '[Appointments] Cancel Appointment Success',
  props<{ appointmentId: number }>()
);

export const cancelAppointmentFailure = createAction(
  '[Appointments] Cancel Appointment Failure',
  props<{ error: string }>()
);

// Reschedule appointment
export const rescheduleAppointment = createAction(
  '[Appointments] Reschedule Appointment',
  props<{ appointmentId: number; date: string; time: string }>()
);

export const rescheduleAppointmentSuccess = createAction(
  '[Appointments] Reschedule Appointment Success',
  props<{ appointment: Appointment }>()
);

export const rescheduleAppointmentFailure = createAction(
  '[Appointments] Reschedule Appointment Failure',
  props<{ error: string }>()
);

// Load available appointment slots
export const loadAvailableSlots = createAction(
  '[Appointments] Load Available Slots'
);

export const loadAvailableSlotsSuccess = createAction(
  '[Appointments] Load Available Slots Success',
  props<{ appointments: Appointment[] }>()
);

export const loadAvailableSlotsFailure = createAction(
  '[Appointments] Load Available Slots Failure',
  props<{ error: string }>()
);

// Book appointment
export const bookAppointment = createAction(
  '[Appointments] Book Appointment',
  props<{ appointmentId: number; patientId: number }>()
);

export const bookAppointmentSuccess = createAction(
  '[Appointments] Book Appointment Success',
  props<{ appointment: Appointment }>()
);

export const bookAppointmentFailure = createAction(
  '[Appointments] Book Appointment Failure',
  props<{ error: string }>()
);

// Select appointment
export const selectAppointment = createAction(
  '[Appointments] Select Appointment',
  props<{ appointmentId: number }>()
);

// Clear booking state
export const resetBookingState = createAction(
  '[Appointments] Reset Booking State'
);