export interface Doctor {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    specialty: string;
  }
  
  export interface DoctorList {
    doctors: Doctor[];
    loading: boolean;
    error: any;
  }
  