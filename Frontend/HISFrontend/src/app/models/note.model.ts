export interface Note {
  id: number;
  appointmentId: number;
  content: string;
  createdBy: number; // doctorId
  createdAt: string;
  updatedAt?: string;
}