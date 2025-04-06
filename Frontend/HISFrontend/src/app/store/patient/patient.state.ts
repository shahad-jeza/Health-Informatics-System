import { Patient } from '../../models/patient.model'; 

export interface PatientState {
  patients: Patient[];
  loading: boolean;
  error: string | null;
}

export const initialPatientState: PatientState = {
  patients: [],
  loading: false,
  error: null
};