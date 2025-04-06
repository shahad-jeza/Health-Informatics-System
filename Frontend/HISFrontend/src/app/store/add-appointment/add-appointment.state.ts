import { AddAppointment } from "../../models/addAppointment.model";
import { Doctor } from "../../store/doctor/doctor.state";

export interface AddAppointmentsState {
  doctors: Doctor[]; // list of doctors
  selectedDoctor: Doctor | null; // selected doctor
  selectedDate: string | null; // selected date
  appointment: AddAppointment | null; // created appointment
  loading: boolean;
  error: string | null;
}