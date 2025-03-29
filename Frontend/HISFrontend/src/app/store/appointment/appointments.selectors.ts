import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AppointmentState } from './appointments.state';

function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
}

export const selectAppointmentState = createFeatureSelector<AppointmentState>('appointments');

export const selectUpcomingAppointments = createSelector(
  selectAppointmentState,
  (state) => state.upcoming
);

export const selectPastAppointments = createSelector(
  selectAppointmentState,
  (state) => state.past
);

export const selectAvailableDoctors = createSelector(
  selectAppointmentState,
  (state) => state.availableDoctors
);

export const selectAvailableSlots = selectAvailableDoctors;

export const selectAppointmentsByType = (appointmentType: 'upcoming' | 'past') => createSelector(
  selectAppointmentState,
  (state) => appointmentType === 'upcoming' ? state.upcoming : state.past
);

// UI state selectors
export const selectAppointmentsLoading = createSelector(
  selectAppointmentState,
  (state) => state.loading
);

export const selectAppointmentsError = createSelector(
  selectAppointmentState,
  (state) => state.error
);

export const selectBookingInProgress = createSelector(
  selectAppointmentState,
  (state) => state.bookingInProgress
);

export const selectBookingSuccess = createSelector(
  selectAppointmentState,
  (state) => state.bookingSuccess
);

// Selected appointment selectors
export const selectSelectedAppointmentId = createSelector(
  selectAppointmentState,
  (state) => state.selectedAppointmentId
);

export const selectSelectedAppointment = createSelector(
  selectAppointmentState,
  selectSelectedAppointmentId,
  (state, selectedId) => {
    if (!selectedId) return null;
    
    // Check upcoming appointments first
    const upcomingAppointment = state.upcoming.find(app => app.id === selectedId);
    if (upcomingAppointment) return upcomingAppointment;
    
    // Then check past appointments
    const pastAppointment = state.past.find(app => app.id === selectedId);
    if (pastAppointment) return pastAppointment;
    
    // Finally check available doctors
    const doctor = state.availableDoctors.find(doc => doc.id === selectedId);
    if (doctor) {
      return {
        id: doctor.id,
        appointmentId: `TEMP-${doctor.id}`,
        patientId: null,
        doctorId: doctor.id,
        date: new Date().toISOString().split('T')[0], 
        time: '09:00',
        status: 'available' 
      };
    }
    
    return null;
  }
);

export const selectAvailableSlotsFormatted = createSelector(
  selectAvailableDoctors,
  (doctors) => doctors.map(doctor => ({
    value: `${doctor.id}`,
    label: `Dr. ${doctor.firstName} ${doctor.lastName} - ${doctor.specialization || 'General'}`
  }))
);

export const selectUpcomingAppointmentsCalendarEvents = createSelector(
  selectUpcomingAppointments,
  (appointments) => appointments.map(app => ({
    id: app.id,
    title: `Appointment with Dr. ${app.doctorId || 'Unknown'}`,
    start: new Date(`${app.date}T${app.time}`),
    end: new Date(new Date(`${app.date}T${app.time}`).getTime() + 30 * 60000), // 30 minutes duration
    color: '#4285F4'
  }))
);



// Filtered selectors 
export const selectAppointmentsByDoctor = (doctorId: number) => createSelector(
  selectUpcomingAppointments,
  selectPastAppointments,
  (upcoming, past) => {
    const upcomingFiltered = upcoming.filter(app => app.doctorId === doctorId);
    const pastFiltered = past.filter(app => app.doctorId === doctorId);
    return { upcoming: upcomingFiltered, past: pastFiltered };
  }
);

// Search selector
export const selectAppointmentsBySearchTerm = (searchTerm: string) => createSelector(
  selectUpcomingAppointments,
  selectPastAppointments,
  (upcoming, past) => {
    const term = searchTerm.toLowerCase();
    const upcomingFiltered = upcoming.filter(app => 
      app.date.toLowerCase().includes(term) ||
      app.time.toLowerCase().includes(term) ||
      `${app.doctorId}`.includes(term)
    );
    const pastFiltered = past.filter(app => 
      app.date.toLowerCase().includes(term) ||
      app.time.toLowerCase().includes(term) ||
      `${app.doctorId}`.includes(term)
    );
    return { upcoming: upcomingFiltered, past: pastFiltered };
  }
);


export const selectDoctorsFormatted = createSelector(
  selectAvailableDoctors,
  (doctors) => doctors.map(doctor => ({
    id: doctor.id,
    name: `${doctor.firstName} ${doctor.lastName}`,
    specialization: doctor.specialization || 'General',
    email: doctor.email || '',
    phoneNumber: doctor.phoneNumber || ''
  }))
);