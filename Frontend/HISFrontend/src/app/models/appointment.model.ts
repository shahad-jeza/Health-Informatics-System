export interface Appointment {
  id: number;
  appointmentId: string;
  patientId: number | null;
  doctorId: number;
  date: string;
  time: string;
  status: string;
}
