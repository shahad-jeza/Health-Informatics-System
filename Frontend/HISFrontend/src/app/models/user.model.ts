export interface User {
  id: number;
  name: string;
  role: 'admin' | 'patient' | 'doctor';
  
  firstName?: string;
  lastName?: string;
  specialization?: string;
  email?: string;
  phoneNumber?: string;
}