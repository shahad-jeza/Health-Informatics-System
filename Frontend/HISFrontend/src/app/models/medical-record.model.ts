export interface MedicalRecord {
  id: number;
  historyID: string; 
  diagnosis: string;
  allergies: string;
  medicines: string;
  patientId: number;
  notes: string; 
}