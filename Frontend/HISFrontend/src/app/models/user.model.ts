export interface User {
    id: number;
    name: string;
    role: 'admin' | 'patient' | 'doctor';
  }