import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable, Subscription, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Note } from '../../../store/note/notes.state';
import { Doctor } from '../../../store/doctor/doctor.state';
import { Appointment, AppointmentStatus } from '../../../models/appointment.model';
import { AppointmentService } from '../../../services/appointments/appointment.service';
import { MedicalHistoryService } from '../../../services/medicalHistory/medical-history.service';
import * as DoctorActions from '../../../store/doctor/doctor.actions';
import * as DoctorSelectors from '../../../store/doctor/doctor.selectors';
import * as NoteActions from '../../../store/note/notes.actions';
import * as NoteSelectors from '../../../store/note/notes.selectors';

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
  
  // Mock patient ID 
  patientUserId = '33333333-3333-3333-3333-333333333333'; 
  
  // Store observables
  notes$: Observable<Note[]>;
  doctors$: Observable<Doctor[]>;
  notesLoading$: Observable<boolean>;
  notesError$: Observable<string | null>;
  doctorsLoading$: Observable<boolean>;
  doctorsError$: Observable<string | null>;
  
  // Local state
  appointments: Appointment[] = [];
  medicalHistory: any[] = []; 
  loading = true;
  error: string | null = null;
  medicalHistoryLoading = false;
  appointmentsLoading = false;
  
  // Caches for performance
  doctorMap = new Map<string, Doctor>();
  appointmentMap = new Map<string, Appointment>();
  
  // Subscriptions management
  private subscriptions: Subscription[] = [];

  constructor(
    private store: Store,
    private medicalHistoryService: MedicalHistoryService,
    private appointmentService: AppointmentService
  ) {
    // Initialize store observables
    this.notes$ = this.store.select(NoteSelectors.selectAllNotes);
    this.notesLoading$ = this.store.select(NoteSelectors.selectNotesLoading);
    this.notesError$ = this.store.select(NoteSelectors.selectNotesError);
    
    this.doctors$ = this.store.select(DoctorSelectors.selectAllDoctors);
    this.doctorsLoading$ = this.store.select(DoctorSelectors.selectDoctorsLoading);
    this.doctorsError$ = this.store.select(DoctorSelectors.selectDoctorsError);
  }
  
  // Lifecycle Hooks
  
  ngOnInit(): void {
    this.loadData();
  }
  
  ngOnDestroy(): void {
    // Clean up subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // Data Loading Methods
  
  loadData(): void {
    // Load doctors from store
    this.store.dispatch(DoctorActions.loadDoctors());
    
    // Load notes for patient
    this.store.dispatch(NoteActions.loadNotesByPatient({ patientUserId: this.patientUserId }));
    
    // Subscribe to doctors to build the doctor map
    const doctorsSub = this.doctors$.subscribe(doctors => {
      // Build doctor map for efficient lookups
      this.doctorMap.clear();
      doctors.forEach(doctor => {
        this.doctorMap.set(doctor.userId, doctor);
      });
    });
    this.subscriptions.push(doctorsSub);
  
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
    
    const doctorErrorSub = this.doctorsError$.subscribe(error => {
      if (error) {
        this.error = `Failed to load doctors: ${error}`;
      }
    });
    this.subscriptions.push(doctorErrorSub);
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
    const patientGuid = this.patientUserId; 
    
    const medHistorySub = this.medicalHistoryService.getPatientHistory(patientGuid)
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
  
  // Get doctor name from ID
  getDoctorName(doctorId: string | undefined | null): string {
    if (!doctorId) return 'Unknown Doctor';
    
    const doctorIdStr = String(doctorId);
    const doctor = this.doctorMap.get(doctorIdStr);
    
    if (!doctor) {
      return 'Unknown Doctor';
    }
    
    if (doctor.firstName && doctor.lastName) {
      return `Dr. ${doctor.firstName} ${doctor.lastName}`;
    } else if (doctor.name) {
      return doctor.name;
    }
    
    return `Doctor (ID: ${doctorIdStr})`;
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