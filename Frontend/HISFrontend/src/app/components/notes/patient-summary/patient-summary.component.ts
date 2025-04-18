import { Component, OnInit, OnDestroy, Input, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable, Subscription, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Note } from '../../../store/note/notes.state';
import { Appointment, AppointmentStatus } from '../../../models/appointment.model';
import { AppointmentService } from '../../../services/appointments/appointment.service';
import { MedicalHistoryService } from '../../../services/medicalHistory/medical-history.service';
import * as NoteActions from '../../../store/note/notes.actions';
import * as NoteSelectors from '../../../store/note/notes.selectors';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-patient-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './patient-summary.component.html',
  styleUrl: './patient-summary.component.css'
})
export class PatientSummaryComponent implements OnInit, OnDestroy {
  // Constants
  AppointmentStatus = AppointmentStatus;
  
  @Input() patientUserId = '';
  @Input() refreshTimestamp?: number;
  
  // Store observables
  notes$: Observable<Note[]>;
  notesLoading$: Observable<boolean>;
  notesError$: Observable<string | null>;
  
  // Local state
  appointments: Appointment[] = [];
  medicalHistory: any[] = []; 
  loading = true;
  error: string | null = null;
  medicalHistoryLoading = false;
  appointmentsLoading = false;
  
  // Caches for performance
  appointmentMap = new Map<string, Appointment>();
  
  // Subscriptions management
  private subscriptions: Subscription[] = [];

  constructor(
    private store: Store,
    private medicalHistoryService: MedicalHistoryService,
    private appointmentService: AppointmentService,
    private authService :AuthService
  ) {
    // Initialize store observables
    this.notes$ = this.store.select(NoteSelectors.selectAllNotes);
    this.notesLoading$ = this.store.select(NoteSelectors.selectNotesLoading);
    this.notesError$ = this.store.select(NoteSelectors.selectNotesError);
  }
  
  // Lifecycle Hooks
  
  ngOnInit(): void {
    this.loadData();
    if (!this.patientUserId) {
      // If not provided, try to get it from the auth service
      this.patientUserId = this.authService.getCurrentUserId() || '';
    }
    
    // Only proceed if we have a valid patientUserId
    if (this.patientUserId) {
      this.loadData();
    } else {
      this.error = 'No patient ID available';
      this.loading = false;
    }
  }
  
  ngOnDestroy(): void {
    // Clean up subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Check if patientUserId changed or if refreshTimestamp changed
    if (
      (changes['patientUserId'] && !changes['patientUserId'].firstChange) || 
      (changes['refreshTimestamp'] && !changes['refreshTimestamp'].firstChange)
    ) {
      // Reload the patient data
      this.loadPatientData();
    }
  }
  
  // Data Loading Methods

  // Reload patient data
  loadPatientData(): void {
    if (!this.patientUserId) return;
    
    this.loadMedicalHistory();
    this.loadPatientAppointments();
  }
  
  loadData(): void {
    if (!this.patientUserId) return;
    
    // Load notes for patient
    this.store.dispatch(NoteActions.loadNotesByPatient({ 
      patientUserId: this.patientUserId 
    }));
  
    // Load patient data
    this.loadMedicalHistory();
    this.loadPatientAppointments();
    
    // Subscribe to errors
    const noteErrorSub = this.notesError$.subscribe(error => {
      if (error) {
        this.error = `Failed to load notes: ${error}`;
      }
    });
    this.subscriptions.push(noteErrorSub);
  }
  
  // Load appointments for the patient
  loadPatientAppointments(): void {
    this.appointmentsLoading = true;
    
    const appointmentsSub = this.appointmentService.getAppointmentsByPatient(this.patientUserId)
      .pipe(
        catchError(err => {
          this.error = `Failed to load appointments: ${err.message || 'Unknown error'}`;
          this.appointmentsLoading = false;
          this.loading = false;
          return of([]);
        })
      )
      .subscribe(appointments => {
        this.appointments = appointments;
        
        // Store appointments in map for easy lookup
        appointments.forEach(appt => {
          this.appointmentMap.set(appt.appointmentId, appt);
        });
        
        this.appointmentsLoading = false;
        this.checkLoadingComplete();
      });
    
    this.subscriptions.push(appointmentsSub);
  }
  
  // Load medical history 
  loadMedicalHistory(): void {
    this.medicalHistoryLoading = true;
    
    const medHistorySub = this.medicalHistoryService.getPatientHistory(this.patientUserId)
      .pipe(
        catchError(err => {
          this.error = `Failed to load medical history: ${err.message || 'Unknown error'}`;
          this.medicalHistoryLoading = false;
          this.loading = false;
          return of([]);
        })
      )
      .subscribe(data => {
        // Store the data 
        this.medicalHistory = Array.isArray(data) ? data : [data];
        this.medicalHistoryLoading = false;
        this.checkLoadingComplete();
      });
    
    this.subscriptions.push(medHistorySub);
  }
  
  // Helper Methods
  
  // Check if all data is loaded
  checkLoadingComplete(): void {
    if (!this.medicalHistoryLoading && !this.appointmentsLoading) {
      this.loading = false;
    }
  }
  
  // Format Methods
  
  // Format dates
  formatDate(dateStr: string | undefined): string {
    if (!dateStr) return 'N/A';
    
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return dateStr;
    }
  }
  
  // Format date with time
  formatDateTime(dateStr: string | undefined): string {
    if (!dateStr) return 'N/A';
    
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateStr;
    }
  }
}