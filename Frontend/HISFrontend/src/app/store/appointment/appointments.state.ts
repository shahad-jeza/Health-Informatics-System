import { Appointment } from "../../models/appointment.model";
import { Doctor } from "../doctor/doctor.state";

export interface AppointmentState {
  upcoming: Appointment[];
  past: Appointment[];
  doctorAppointments: Appointment[];
  doctorAppointmentsLoading: boolean;
  availableDoctors: Doctor[];
  selectedAppointmentId: string | null;
  loading: boolean;
  error: string | null;
  bookingInProgress: boolean;
  bookingSuccess: boolean;
  appointments: Appointment[]; 
}


export const initialAppointmentState: AppointmentState = {
  upcoming: [],
  past: [],
  doctorAppointments: [],
  doctorAppointmentsLoading: false,
  availableDoctors: [],
  selectedAppointmentId: null,
  loading: false,
  error: null,
  bookingInProgress: false,
  bookingSuccess: false,
  appointments: []
};