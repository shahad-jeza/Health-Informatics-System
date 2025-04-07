import { createAction, props } from '@ngrx/store';
import { AppointmentCreate } from '../../models/addAppointment.model';

export const createAppointment = createAction(
  '[Appointment] Create Appointment',
  props<{ appointment: AppointmentCreate }>()
);
export const createAppointmentSuccess = createAction(
  '[Appointment] Create Appointment Success',
  props<{ appointment: any }>() 
);
export const createAppointmentFailure = createAction(
  '[Appointment] Create Appointment Failure',
  props<{ error: any }>()
);
export const resetAppointmentState = createAction('[Appointment] Reset State');