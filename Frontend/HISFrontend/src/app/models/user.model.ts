export enum RoleType {
  Patient = 'Patient',
  Doctor = 'Doctor',
  Admin = 'Admin'
}

export enum SpecialtyType {
  Dentisity = 'Dentisity',
  General = 'General',
  Dermatolgy = 'Dermatolgy',
  Neurology = 'Neurology'
}

export interface User {
  id: number;
  userId: string; // Guid 
  email: string;
  passwordHash?: string; 
  firstName: string;
  lastName: string;
  phone?: string;
  role: RoleType;
  specialty?: SpecialtyType; // Only for doctors
  
 
  name?: string; // firstName + lastName
  specialization?: string; 
  phoneNumber?: string; 
}

// get full name
export function getFullName(user: User): string {
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  return user.name || 'Unknown';
}

//  get doctor title with name
export function getDoctorName(user: User): string {
  if (user.role === RoleType.Doctor) {
    return `Dr. ${getFullName(user)}`;
  }
  return getFullName(user);
}