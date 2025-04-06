export interface AdminStatistics {
    totalDoctors: number;
    totalPatients: number;
    todayAppointments: number;
    weeklyAppointments: number;
    appointmentStatusStats: StatusStatDto[];
    popularSpecialties: SpecialtyStatDto[];
    loading: boolean;
    error: string | null;
  }

  export interface StatusStatDto {
    status: string;  // The appointment status 
    count: number;   // The count of appointments with this status
  }

  
  export interface SpecialtyStatDto {
    specialty: string;
    doctorCount: number; 
  }

  