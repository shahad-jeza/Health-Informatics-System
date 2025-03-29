import { Appointment } from '../../models/appointment.model';
import { User } from '../../models/user.model';

export interface AppointmentState {
  upcoming: Appointment[];
  past: Appointment[];
  availableDoctors: User[]; 
  selectedAppointmentId: number | null;
  loading: boolean;
  error: any;
  bookingInProgress: boolean;
  bookingSuccess: boolean;
}

export const initialAppointmentState: AppointmentState = {
  upcoming: [],
  past: [],
  availableDoctors: [], 
  selectedAppointmentId: null,
  loading: false,
  error: null,
  bookingInProgress: false,
  bookingSuccess: false
};