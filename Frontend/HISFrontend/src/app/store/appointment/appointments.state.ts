import { Appointment } from '../../models/appointment.model';

export interface AppointmentState {
  past: Appointment[];
  upcoming: Appointment[];
  availableSlots: Appointment[];
  loading: boolean;
  error: string | null;
  selectedAppointmentId: number | null;
  bookingSuccess: boolean;
  bookingInProgress: boolean;
}

export const initialAppointmentState: AppointmentState = {
  past: [],
  upcoming: [],
  availableSlots: [],
  loading: false,
  error: null,
  selectedAppointmentId: null,
  bookingSuccess: false,
  bookingInProgress: false
};