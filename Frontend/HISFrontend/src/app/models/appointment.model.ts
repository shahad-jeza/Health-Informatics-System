export enum AppointmentStatus {
  Created = 'Created',
  Confirmed = 'Confirmed',
  Cancelled = 'Cancelled'
}

export interface Appointment {
  id: string;  
  appointmentId: string;     
  doctorUserId: string;      
  patientUserId: string;
  date: string; 
  time: string; 
  status: AppointmentStatus;
  doctorName?: string;
}