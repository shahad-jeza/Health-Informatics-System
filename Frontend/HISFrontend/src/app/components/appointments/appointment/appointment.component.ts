import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Appointment, AppointmentStatus } from '../../../models/appointment.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subscription} from 'rxjs';
import { AppointmentService } from '../../../services/appointments/appointment.service';
import * as NoteActions from '../../../store/note/notes.actions';
import * as NoteSelectors from '../../../store/note/notes.selectors';
import * as AppointmentActions from '../../../store/appointment/appointments.actions';
import * as AppointmentSelectors from '../../../store/appointment/appointments.selectors';
import { Note } from '../../../store/note/notes.state';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-appointments',
  templateUrl: './appointment.component.html',
  styleUrls: ['./appointment.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class AppointmentComponent implements OnInit, OnDestroy {
  AppointmentStatus = AppointmentStatus;
  @Input() title?: string;
  
  // Data to display
  appointments: Appointment[] = [];
  private _allAppointments: Appointment[] = [];
  appointments$: Observable<Appointment[]>;
  appointmentsLoading$: Observable<boolean>;
  appointmentsError$: Observable<string | null>;
  loading = true;  
  error: string | null = null;
  
  // UI state variables
  successMessage: string | null = null;
  errorMessage: string | null = null;
  
  // Modal state variables
  selectedAppointment: Appointment | null = null;
  
  // Notes modal state
  modalNotes: Note[] = [];
  modalNotesLoading = false;
  modalNotesError: string | null = null;
  newNoteText: string = '';
  showNotesModal = false;
  
  // Subscriptions
  private subscriptions: Subscription[] = [];
  
  // Cancellation modal state
  showCancelModal = false;
  appointmentToCancel: Appointment | null = null;

  // Input property with getter/setter
  @Input() set appointmentsType(value: 'upcoming' | 'past') {
    const oldValue = this._appointmentsType;
    this._appointmentsType = value;
    
    if (this._allAppointments.length > 0 && oldValue !== value) {
      this.filterAppointments();
    }
  }
  
  get appointmentsType(): 'upcoming' | 'past' {
    return this._appointmentsType;
  }
  
  private _appointmentsType: 'upcoming' | 'past' = 'upcoming';

  constructor(
    private store: Store,
    private appointmentService: AppointmentService,
    private authService:AuthService
  ) {
    this.appointments$ = this.store.select(AppointmentSelectors.selectAllAppointments);
    this.appointmentsLoading$ = this.store.select(AppointmentSelectors.selectAppointmentsLoading);
    this.appointmentsError$ = this.store.select(AppointmentSelectors.selectAppointmentsError);

  }
  private patientUserId: string = '';

  ngOnInit(): void {
    this.patientUserId = this.authService.getCurrentUserId() || '';
  
    if (!this.patientUserId) {
      this.error = 'No patient ID available';
      return;
    }
    
    setTimeout(() => {
      this.store.dispatch(AppointmentActions.getAppointmentsByPatient({ 
        patientId: this.patientUserId 
      }));
    }, 500);
    
    // Subscribe to appointments
    const appointmentsSub = this.appointments$.subscribe(appointments => {
      if (!appointments) {
        this._allAppointments = [];
        this.appointments = [];
        return;
      }
      
      this._allAppointments = appointments;
      this.filterAppointments();
    });
    this.subscriptions.push(appointmentsSub);
    
    // Subscribe to loading state
    const loadingSub = this.appointmentsLoading$.subscribe(loading => {
      this.loading = loading;
    });
    this.subscriptions.push(loadingSub);
    
    // Subscribe to error state
    const errorSub = this.appointmentsError$.subscribe(error => {
      this.error = error;
    });
    this.subscriptions.push(errorSub);
  }
  
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  
  // Filter appointments based on the appointmentsType
  private filterAppointments(): void {
    const currentDate = new Date();
    
    if (this.appointmentsType === 'upcoming') {
      // For upcoming, include appointments today or in the future
      this.appointments = this._allAppointments.filter(appointment => {
        try {
          const appointmentDate = new Date(appointment.date);
          return appointmentDate >= currentDate;
        } catch (e) {
          return false;
        }
      });
    } else {
      // For past, include appointments before today
      this.appointments = this._allAppointments.filter(appointment => {
        try {
          const appointmentDate = new Date(appointment.date);
          return appointmentDate < currentDate;
        } catch (e) {
          return false;
        }
      });
    }
  }
  
  // Open the cancellation confirmation modal
  openCancelModal(appointment: Appointment): void {
    this.appointmentToCancel = appointment;
    this.showCancelModal = true;
    // Prevent background scrolling
    document.body.classList.add('modal-open');
  }

  // Process the actual cancellation
  confirmCancelAppointment(): void {
    if (!this.appointmentToCancel) return;
    
    const appointmentId = this.appointmentToCancel.appointmentId;
    this.loading = true;
    this.error = null;
    this.successMessage = null;
    
    this.appointmentService.updateAppointment(appointmentId, {
      patientUserId: null,
      status: 2
    }).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Appointment cancelled successfully';
        this.appointments = this.appointments.filter(app => app.appointmentId !== appointmentId);
        this._allAppointments = this._allAppointments.filter(app => app.appointmentId !== appointmentId);
        this.closeCancelModal();
      },
      error: (err) => {
        this.loading = false;
        this.error = `Failed to cancel appointment: ${err.error || err.message || 'Unknown error'}`;
        this.closeCancelModal();
      }
    });
  }

  // Close the cancellation modal
  closeCancelModal(): void {
    this.showCancelModal = false;
    this.appointmentToCancel = null;
    document.body.classList.remove('modal-open');
  }
    
  // View notes for an appointment
  viewNotes(appointment: Appointment): void {
    this.selectedAppointment = appointment;
    
    // Reset notes state
    this.modalNotes = [];
    this.modalNotesLoading = true;
    this.modalNotesError = null;
    
    // Show the custom modal
    this.showNotesModal = true;
    
    // body class to prevent scrolling
    document.body.classList.add('modal-open');
    this.store.dispatch(NoteActions.loadNotesByPatient({ 
      patientUserId: this.patientUserId 
    }));
    
    // Subscribe to notes from the store
    const notesSub = this.store.select(NoteSelectors.selectAllNotes)
      .subscribe(notes => {
        // Filter notes for this specific appointment
        if (notes && Array.isArray(notes)) {
          const appointmentIdStr = String(appointment.appointmentId);
          
          this.modalNotes = notes.filter(note => {
            const noteAppointmentId = note.appointmentId ? String(note.appointmentId) : '';
            return noteAppointmentId === appointmentIdStr;
          });
        } else {
          this.modalNotes = [];
        }
        
        this.modalNotesLoading = false;
      });
    
    // Add subscriptions to be cleaned up
    this.subscriptions.push(notesSub);
  }

  // Close the notes modal
  closeNotesModal(): void {
    this.showNotesModal = false;
    document.body.classList.remove('modal-open');
  }

  // Format date for display
  formatDate(dateStr: string | undefined): string {
    if (!dateStr) return 'N/A';
    
    try {
      const date = new Date(dateStr);
      return date.toLocaleString();
    } catch (error) {
      return 'Invalid date';
    }
  }
  
  // Get doctor name from appointment
  getDoctorName(appointment: Appointment | string): string {
    if (typeof appointment === 'string') {
      return `Doctor ${appointment.substring(0, 8)}`;
    }
    
    if (appointment && appointment.doctorName) {
      return appointment.doctorName;
    }
    
    if (appointment && appointment.doctorUserId) {
      return `Doctor ${String(appointment.doctorUserId).substring(0, 8)}`;
    }
    
    return 'Unknown Doctor';
  }
}