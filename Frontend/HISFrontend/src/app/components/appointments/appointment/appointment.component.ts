import { Component, Input, OnInit } from '@angular/core';
import { AppointmentService } from '../../../services/appointments/appointment.service';
import { DoctorService } from '../../../services/doctor/doctor.service';
import { Appointment } from '../../../models/appointment.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Note } from '../../../models/note.model';
import { NoteService } from '../../../services/notes/note.service';
import { Store } from '@ngrx/store';
import * as NoteActions from '../../../store/note/notes.actions';
import * as NoteSelectors from '../../../store/note/notes.selectors';
import * as DoctorActions from '../../../store/doctor/doctor.actions';
import * as DoctorSelectors from '../../../store/doctor/doctor.selectors';
import * as AppointmentActions from '../../../store/appointment/appointments.actions'
import { Observable } from 'rxjs';
import { tap, switchMap, filter } from 'rxjs/operators';
import { BehaviorSubject, catchError, finalize, of } from 'rxjs';


@Component({
  selector: 'app-appointments',
  templateUrl: './appointment.component.html',
  styleUrls: ['./appointment.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class AppointmentComponent implements OnInit {
  @Input() appointmentsType: 'upcoming' | 'past' = 'upcoming';
  @Input() title?: string;
  appointments: Appointment[] = [];
  doctors: Map<number, string> = new Map();
  loading = true;
  error: string | null = null;
  successMessage: string | null = null;
  
  
  // Get notes 
  appointmentNotes$ = new BehaviorSubject<Note[]>([]);
  loadingNotes$ = new BehaviorSubject<boolean>(false);
  notesError$ = new BehaviorSubject<string | null>(null);
  
  

  // Modal state variables
  selectedAppointmentId: number | null = null;
  selectedAppointmentDoctor: string = '';
  selectedAppointmentDate: string = '';
  selectedAppointmentTime: string = '';
  selectedAppointmentNotes: string = '';
  
  // Reschedule form values
  newAppointmentDate: string = '';
  newAppointmentTime: string = '';
  availableTimes: string[] = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];
  rescheduleError: string | null = null;
  rescheduleSuccess: boolean = false;
  errorMessage: string | null = null;

  constructor(
    private appointmentService: AppointmentService,
    private doctorService: DoctorService,
    private noteService: NoteService,
    private store: Store,
    
    
    
  ) {

  }

  ngOnInit(): void {
    // Load doctors from the store
    this.store.dispatch(DoctorActions.loadDoctors());
    
    // Subscribe to doctors from the store
    this.store.select(DoctorSelectors.selectAllDoctors).subscribe(doctors => {
      // Update doctors map 
      doctors.forEach((doctor) => {
        if (doctor.firstName && doctor.lastName) {
          this.doctors.set(doctor.id, `Dr. ${doctor.firstName} ${doctor.lastName}`);
        } else if (doctor.name) {
          // Handle case where doctor only has name property
          const nameParts = doctor.name.replace(/^Dr\.\s+/, '').split(' ');
          if (nameParts.length >= 2) {
            const firstName = nameParts[0];
            const lastName = nameParts.slice(1).join(' ');
            this.doctors.set(doctor.id, `Dr. ${firstName} ${lastName}`);
          } else {
            this.doctors.set(doctor.id, doctor.name);
          }
        } else {
          this.doctors.set(doctor.id, `Doctor (ID: ${doctor.id})`);
        }
      });
      
      // Once doctors are loaded, fetch appointments
      this.fetchData();
    });
    
  }

  fetchData(): void {
    this.loading = true;

    const patientId = 1;
    
    this.appointmentService.getAppointmentsByPatient(patientId).subscribe({
      next: (appointments) => {
        if (this.appointmentsType === 'upcoming') {
          this.appointments = this.filterUpcomingAppointments(appointments);
        } else {
          this.appointments = this.filterPastAppointments(appointments);
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching appointments:', err);
        this.error = 'Failed to load appointments. Please try again later.';
        this.loading = false;
      },
    });
  }

  // Filter upcoming appointments 
  private filterUpcomingAppointments(appointments: Appointment[]): Appointment[] {
    const today = new Date();
    return appointments.filter(appointment => {
      if (appointment.status === 'canceled') {
        return false;
      }
      
      const appointmentDate = new Date(appointment.date);
      return appointmentDate > today || 
        (appointmentDate.setHours(0,0,0,0) === today.setHours(0,0,0,0) && 
         this.isTimeAfterNow(appointment.time));
    });
  }

  // Filter past appointments 
  private filterPastAppointments(appointments: Appointment[]): Appointment[] {
    const today = new Date();
    return appointments.filter(appointment => {
      if (appointment.status === 'canceled') {
        return true;
      }
      const appointmentDate = new Date(appointment.date);
      return appointmentDate < today || 
        (appointmentDate.setHours(0,0,0,0) === today.setHours(0,0,0,0) && 
         !this.isTimeAfterNow(appointment.time));
    });
  }

  // Check if a time string is after the current time
  private isTimeAfterNow(timeString: string): boolean {
    const now = new Date();
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours > now.getHours() || (hours === now.getHours() && minutes > now.getMinutes());
  }

  getDoctorName(doctorId: number): string {
    const doctorName = this.doctors.get(doctorId);
    
    if (doctorName) {
      return doctorName;
    }
    let result = 'Unknown Doctor';
    
    // Get all doctors from store 
    this.store.select(DoctorSelectors.selectAllDoctors).pipe(
      tap(doctors => {
        const doctor = doctors.find(d => d.id === doctorId);
        if (doctor) {
          // Found doctor, create name string
          if (doctor.firstName && doctor.lastName) {
            result = `Dr. ${doctor.firstName} ${doctor.lastName}`;
            // Update the map for future use
            this.doctors.set(doctorId, result);
          } else if (doctor.name) {
            result = doctor.name;
            // Update the map for future use
            this.doctors.set(doctorId, result);
          }
        }
      })
    ).subscribe();
    
    return result;
  }

cancelAppointment(appointmentId: number): void {
  console.log(`Starting cancellation for appointment ${appointmentId}`);
  this.loading = true;
  this.errorMessage = null;
  
  this.appointmentService.cancelAppointment(appointmentId).subscribe({
    next: (response) => {
      console.log('Appointment canceled successfully, API response:', response);
      this.loading = false;

      this.fetchData();

      this.loadAvailableAppointments(); 
      // Show success message
      this.successMessage = 'Appointment canceled successfully. The time slot is now available.';
      console.log('Success message shown, will clear after 3 seconds');

      setTimeout(() => {
        this.successMessage = null;
        console.log('Success message cleared');
      }, 3000);
    },
    error: (error) => {
      console.error('Error canceling appointment:', error);
      this.loading = false;
      this.errorMessage = error.message || 'Failed to cancel appointment. Please try again.';
      console.log(`Error message shown to user: ${this.errorMessage}`);
    }
  });
}
viewNotes(appointmentId: number): void {
  console.log('View notes clicked for appointment:', appointmentId);
  
  // Find appointment
  const appointment = this.appointments.find(app => app.id === appointmentId);
  if (!appointment) {
    console.error(`Appointment with ID ${appointmentId} not found`);
    return;
  }
  
  // Set appointment details
  this.selectedAppointmentId = appointmentId;
  this.selectedAppointmentDoctor = this.getDoctorName(appointment.doctorId);
  this.selectedAppointmentDate = appointment.date;
  this.selectedAppointmentTime = appointment.time;
  
  // Reset states 
  this.modalNotes = [];
  this.modalNotesLoading = true;
  this.modalNotesError = null;
  
  // Show modal 
  this.openNotesModal();
  
  // load the notes
  this.noteService.getNotesByAppointmentId(appointmentId).subscribe({
    next: (notes) => {
      console.log(`Modal: Got ${notes.length} notes for appointment ${appointmentId}:`, notes);
      this.modalNotes = notes; 
      this.modalNotesLoading = false;
    },
    error: (error) => {
      console.error('Modal notes error:', error);
      this.modalNotesError = 'Failed to load notes: ' + error.message;
      this.modalNotesLoading = false;
    }
  });
}

private openNotesModal(): void {
  console.log('Opening notes modal');
  const modalElement = document.getElementById('notesModal');
  if (modalElement) {
    // Create a new Bootstrap modal instance
    const modal = new (window as any).bootstrap.Modal(modalElement);
    modal.show();
  } else {
    console.error('Notes modal element not found in DOM');
  }
}

modalNotes: Note[] = [];
modalNotesLoading: boolean = false;
modalNotesError: string | null = null;

closeModal(modalId: string): void {
  const modalElement = document.getElementById(modalId);
  if (modalElement) {
    const bsModal = (window as any).bootstrap.Modal.getInstance(modalElement);
    if (bsModal) {
      bsModal.hide();
    }
  }
}

  loadAvailableAppointments(): void {
    console.log('Dispatching action to load available appointments');
    this.store.dispatch(AppointmentActions.loadAvailableAppointments());
  }
  rescheduleAppointment(appointmentId: number): void {
    const appointment = this.appointments.find(app => app.id === appointmentId);
    if (appointment) {
      this.selectedAppointmentId = appointmentId;
      this.selectedAppointmentDoctor = this.getDoctorName(appointment.doctorId);
      this.selectedAppointmentDate = appointment.date;
      this.selectedAppointmentTime = appointment.time;
      
 
      const today = new Date();
      this.newAppointmentDate = today.toISOString().split('T')[0]; // Today's date as default
      this.newAppointmentTime = this.availableTimes[0]; // First available time
      
      // Reset status flags
      this.rescheduleError = null;
      this.rescheduleSuccess = false;
      
      // Open the modal using Bootstrap's modal API
      const rescheduleModal = document.getElementById('rescheduleModal');
      if (rescheduleModal) {
        // @ts-ignore - Using Bootstrap's modal API
        const bsModal = new bootstrap.Modal(rescheduleModal);
        bsModal.show();
      }
    }
  }

  submitReschedule(): void {
    if (!this.selectedAppointmentId || !this.newAppointmentDate || !this.newAppointmentTime) {
      this.rescheduleError = 'Please select both date and time.';
      return;
    }
    
    this.rescheduleError = null;
    
    this.appointmentService.rescheduleAppointment(
      this.selectedAppointmentId, 
      this.newAppointmentDate, 
      this.newAppointmentTime
    ).subscribe({
      next: (updatedAppointment) => {
        const index = this.appointments.findIndex(app => app.id === this.selectedAppointmentId);
        if (index !== -1) {
          this.appointments[index].date = updatedAppointment.date;
          this.appointments[index].time = updatedAppointment.time;
        }
        
        this.rescheduleSuccess = true;
        
        setTimeout(() => {
          const rescheduleModal = document.getElementById('rescheduleModal');
          if (rescheduleModal) {
            // @ts-ignore - Using Bootstrap's modal API
            const bsModal = bootstrap.Modal.getInstance(rescheduleModal);
            bsModal?.hide();
          }
        }, 2000);
      },
      error: (err) => {
        console.error('Error rescheduling appointment:', err);
        this.rescheduleError = 'Failed to reschedule appointment. Please try again.';
      }
    });
  }
}