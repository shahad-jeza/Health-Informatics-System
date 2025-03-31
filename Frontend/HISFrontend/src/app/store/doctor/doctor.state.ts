export interface Doctor {
  userId: string;  
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  specialty?: string;
  id?: number;    
  name?: string;  
  specialization?: string; 
}
  
export interface DoctorState {
  doctors: Doctor[];
  loading: boolean;
  error: string | null;
}
  
export const initialDoctorState: DoctorState = {
  doctors: [],
  loading: false,
  error: null,
};