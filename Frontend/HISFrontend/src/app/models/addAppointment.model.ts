export interface AppointmentCreate {
    doctorUserId: string;
    date: Date;
  }
  
  export interface AddAppointment {
    appointmentId: string;
    doctorUserId: string;
    status: string;
    date: Date;
  }
  
  export interface AddAppointmentState {
    creating: boolean;
    created: boolean;
    error: any;
  }