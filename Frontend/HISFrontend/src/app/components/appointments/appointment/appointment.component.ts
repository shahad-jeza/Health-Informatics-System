import { Component, Input, OnInit } from '@angular/core';
import { AppointmentService } from '../../../services/appointments/appointment.service';
import { DoctorService } from '../../../services/doctor/doctor.service';
import { Appointment } from '../../../models/appointment.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Note } from '../../../models/note.model';

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
  
  appointmentNotes: Note[] = [];
  loadingNotes: boolean = false;
  notesError: string | null = null;

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

  constructor(
    private appointmentService: AppointmentService,
    private doctorService: DoctorService
  ) {}

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData(): void {
    this.loading = true;

    this.appointmentService.getAppointmentsByType(this.appointmentsType).subscribe({
      next: (appointments) => {
        if (this.appointmentsType === 'upcoming') {
          this.appointments = this.filterUpcomingAppointments(appointments);
        } else {
          this.appointments = this.filterPastAppointments(appointments);
        }
        this.fetchDoctors();
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
      const appointmentDate = new Date(appointment.date);
      return appointmentDate >= today || 
        (appointmentDate.setHours(0,0,0,0) === today.setHours(0,0,0,0) && 
         this.isTimeAfterNow(appointment.time));
    });
  }

  // Filter past appointments 
  private filterPastAppointments(appointments: Appointment[]): Appointment[] {
    const today = new Date();
    return appointments.filter(appointment => {
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

  fetchDoctors(): void {
    this.doctorService.getDoctors().subscribe({
      next: (doctors) => {
        doctors.forEach((doctor) => {
          this.doctors.set(doctor.id, doctor.name);
        });
      },
      error: (err) => {
        console.error('Error fetching doctors:', err);
        this.error = 'Failed to load doctor data. Please try again later.';
      },
    });
  }

  getDoctorName(doctorId: number): string {
    return this.doctors.get(doctorId) || 'Unknown Doctor';
  }

  cancelAppointment(appointmentId: number): void {
    if (confirm('Are you sure you want to cancel this appointment?')) {
      this.appointmentService.cancelAppointment(appointmentId).subscribe({
        next: () => {
          this.appointments = this.appointments.filter(app => app.id !== appointmentId);
          alert('Appointment canceled successfully.');
        },
        error: (err) => {
          console.error('Error canceling appointment:', err);
          alert('Failed to cancel the appointment. Please try again.');
        }
      });
    }
  }

  // View notes for an appointment
viewNotes(appointmentId: number): void {
  console.log('View notes clicked for appointment:', appointmentId);
  
  const appointment = this.appointments.find(app => app.id === appointmentId);
  if (!appointment) {
    console.error('Appointment not found');
    return;
  }
  
  this.selectedAppointmentId = appointmentId;
  this.selectedAppointmentDoctor = this.getDoctorName(appointment.doctorId);
  this.selectedAppointmentDate = appointment.date;
  this.selectedAppointmentTime = appointment.time;
  
  // Reset notes state
  this.appointmentNotes = [];
  this.loadingNotes = true;
  this.notesError = null;
  
  // Get the modal element
  const modalEl = document.getElementById('notesModal');
  console.log('Modal element:', modalEl);
  
  if (!modalEl) {
    console.error('Modal element not found!');
    console.log('Trying querySelector:', document.querySelector('#notesModal'));
    return;
  }
  
  try {
    const modal = new (window as any).bootstrap.Modal(modalEl);
    modal.show();
    
    // Fetch appointment notes
    this.appointmentService.getAppointmentNotes(appointmentId).subscribe({
      next: (notes) => {
        console.log('Notes received:', notes);
        this.appointmentNotes = notes;
        this.loadingNotes = false;
      },
      error: (err) => {
        console.error('Error fetching appointment notes:', err);
        this.notesError = 'Failed to load notes. Please try again.';
        this.loadingNotes = false;
      }
    });
  } catch (err) {
    console.error('Error showing modal:', err);
  }
}

  rescheduleAppointment(appointmentId: number): void {
    const appointment = this.appointments.find(app => app.id === appointmentId);
    if (appointment) {
      this.selectedAppointmentId = appointmentId;
      this.selectedAppointmentDoctor = this.getDoctorName(appointment.doctorId);
      this.selectedAppointmentDate = appointment.date;
      this.selectedAppointmentTime = appointment.time;
      
      // Set default values for the reschedule form
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
prepareNotesData(appointmentId: number): void {
  console.log('Preparing notes data for appointment:', appointmentId);
  
  const appointment = this.appointments.find(app => app.id === appointmentId);
  if (!appointment) {
    console.error('Appointment not found for ID:', appointmentId);
    return;
  }
  
  this.selectedAppointmentId = appointmentId;
  this.selectedAppointmentDoctor = this.getDoctorName(appointment.doctorId);
  this.selectedAppointmentDate = appointment.date;
  this.selectedAppointmentTime = appointment.time;
  
  // Reset notes state
  this.appointmentNotes = [];
  this.loadingNotes = true;
  this.notesError = null;
  
  // Fetch appointment notes
  this.appointmentService.getAppointmentNotes(appointmentId).subscribe({
    next: (notes) => {
      console.log('Notes received:', notes);
      this.appointmentNotes = notes;
      this.loadingNotes = false;
    },
    error: (err) => {
      console.error('Error fetching appointment notes:', err);
      this.notesError = 'Failed to load notes. Please try again.';
      this.loadingNotes = false;
    }
  });
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
        // Update the appointment in the list
        const index = this.appointments.findIndex(app => app.id === this.selectedAppointmentId);
        if (index !== -1) {
          this.appointments[index].date = updatedAppointment.date;
          this.appointments[index].time = updatedAppointment.time;
        }
        
        this.rescheduleSuccess = true;
        
        // Close the modal after a delay to show success message
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