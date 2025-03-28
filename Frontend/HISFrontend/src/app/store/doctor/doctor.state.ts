export interface Doctor {
    id: number;
    firstName: string;
    lastName: string;
    specialization: string;
    email: string;
    phone: string;
    availability?: string[];
  }
  
  export interface DoctorState {
    doctors: Doctor[];
    loading: boolean;
    error: string | null;
    selectedDoctorId: number | null;
  }
  
  export const initialDoctorState: DoctorState = {
    doctors: [],
    loading: false,
    error: null,
    selectedDoctorId: null
  };