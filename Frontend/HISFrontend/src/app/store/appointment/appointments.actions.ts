import { createAction, props } from '@ngrx/store';
import { Appointment, AppointmentStatus } from '../../models/appointment.model';

// Create Appointment Actions
export const createAppointment = createAction(
  '[Appointments] Create Appointment',
  props<{ appointment: Partial<Appointment> }>()
);

export const createAppointmentSuccess = createAction(
  '[Appointments] Create Appointment Success',
  props<{ appointment: Appointment }>()
);

export const createAppointmentFailure = createAction(
  '[Appointments] Create Appointment Failure',
  props<{ error: string }>()
);

// Update Appointment Status Actions
export const updateAppointmentStatus = createAction(
  '[Appointment] Update Appointment Status',
  props<{ appointmentId: string; status: AppointmentStatus }>()
);

export const updateAppointmentStatusSuccess = createAction(
  '[Appointments] Update Appointment Status Success',
  props<{ appointment: Appointment }>()
);

export const updateAppointmentStatusFailure = createAction(
  '[Appointments] Update Appointment Status Failure',
  props<{ error: string }>()
);

// Load Doctor Appointments Actions
export const loadDoctorAppointments = createAction(
  '[Appointments] Load Doctor Appointments',
  props<{ doctorId: string | number }>()
);

export const loadDoctorAppointmentsSuccess = createAction(
  '[Appointments] Load Doctor Appointments Success',
  props<{ appointments: Appointment[] }>()
);

export const loadDoctorAppointmentsFailure = createAction(
  '[Appointments] Load Doctor Appointments Failure',
  props<{ error: string }>()
);

// Get Patient Appointments Actions
export const getAppointmentsByPatient = createAction(
  '[Appointments] Get Appointments By Patient',
  props<{ patientId: string }>()
);

export const getAppointmentsByPatientSuccess = createAction(
  '[Appointments] Get Appointments By Patient Success',
  props<{ appointments: Appointment[] }>()
);

export const getAppointmentsByPatientFailure = createAction(
  '[Appointments] Get Appointments By Patient Failure',
  props<{ error: string }>()
);

// Get Doctor Details Actions
export const getDoctorById = createAction(
  '[Appointments] Get Doctor By Id',
  props<{ doctorId: string }>()
);

export const getDoctorByIdSuccess = createAction(
  '[Appointments] Get Doctor By Id Success',
  props<{ doctor: any, doctorId: string }>()
);

export const getDoctorByIdFailure = createAction(
  '[Appointments] Get Doctor By Id Failure',
  props<{ error: string, doctorId: string }>()
);