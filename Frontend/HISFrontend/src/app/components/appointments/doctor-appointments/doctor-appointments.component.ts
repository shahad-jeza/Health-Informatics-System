// Core Angular and RxJS imports
import { Component, Input, OnInit, OnChanges, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';

// NgRx Store imports
import { Store } from '@ngrx/store';
import * as DoctorSelectors from '../../../store/doctor/doctor.selectors';
import * as AppointmentActions from '../../../store/appointment/appointments.actions';
import * as AppointmentSelectors from '../../../store/appointment/appointments.selectors';
import * as PatientActions from '../../../store/patient/patient.actions';
import * as PatientSelectors from '../../../store/patient/patient.selectors';

// Models
import { Appointment, AppointmentStatus } from '../../../models/appointment.model';
import { Doctor } from '../../../store/doctor/doctor.state';
import { User, getFullName, RoleType } from '../../../models/user.model';
import { Patient } from '../../../models/patient.model';

// Services
import { AppointmentService } from '../../../services/appointments/appointment.service';
import { MedicalHistoryService } from '../../../services/medicalHistory/medical-history.service';
import { PatientService } from '../../../services/patient/patient.service';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-doctor-appointments',
  templateUrl: './doctor-appointments.component.html',
  styleUrls: ['./doctor-appointments.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class DoctorAppointmentsComponent implements OnInit, OnChanges, OnDestroy {
  // ===== INPUTS =====
  @Input() title: string = 'Appointments';
  @Input() appointmentType: 'upcoming' | 'past' = 'upcoming';
  @Input() doctorId?: string;
  @Input() refreshTimestamp: number = 0;
  
  // ===== UI STATE =====
  loading: boolean = true;
  error: string | null = null;
  successMessage: string | null = null;
  AppointmentStatus = AppointmentStatus; 
  
  // ===== DATA =====
  appointments: Appointment[] = [];
  filteredAppointments: Appointment[] = [];
  
  // ===== STORE SELECTORS =====
  appointments$: Observable<Appointment[]>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  doctors$: Observable<Doctor[]> = new Observable<Doctor[]>();
  patients$: Observable<Patient[]>;
  
  // ===== DATA CACHES =====
  private patients = new Map<string, Patient>();
  doctorMap: Map<string, Doctor> = new Map();
  private patientNameCache = new Map<string, string>();
  private patientDetails = new Map<string, User>();
  
  // ===== SUBSCRIPTIONS =====
  private subscriptions: Subscription[] = [];
  
  constructor(
    private store: Store, 
    private appointmentService: AppointmentService, 
    private medicalHistoryService: MedicalHistoryService,
    private patientService: PatientService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private authService:AuthService,
  ) {
    // Initialize store selectors
    this.appointments$ = this.store.select(AppointmentSelectors.selectAllAppointments);
    this.loading$ = this.store.select(AppointmentSelectors.selectAppointmentsLoading);
    this.error$ = this.store.select(AppointmentSelectors.selectAppointmentsError);
    this.patients$ = this.store.select(PatientSelectors.selectAllPatients);
    
  }

  
  // ===== LIFECYCLE HOOKS =====
  
  ngOnInit(): void {

  // Use passed ID or fallback to auth service
  this.doctorId = this.doctorId || this.authService.getCurrentUserId() || '';
  
  if (!this.doctorId) {
    this.error = 'No doctor ID available';
    return;
  }
    this.loading = true;
    this.appointments = [];
    this.filteredAppointments = [];
    
    // Load doctors from store
    
    // Load patients from store
    this.store.dispatch(PatientActions.loadPatients());
    
    // Load appointments for the doctor
    this.loadAppointmentsForDoctor();
    
    // Set up subscriptions
    this.setupSubscriptions();
    this.loadUserDataFromAppointments();
    this.loadPatients();
  }
  
  ngOnChanges(changes: any): void {
    if (changes.doctorId || changes.refreshTimestamp) {
      this.loadAppointmentsForDoctor();
    }
    
    if (changes.appointmentType && !changes.appointmentType.firstChange) {
      this.filterAppointmentsByType();
    }
  }
  
  ngOnDestroy(): void {
    // Clean up subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  
  // ===== DATA LOADING =====
  
  /**
   * Loads patient data from patient service for name display
   */
  private loadPatients(): void {
    // Subscribe to patients from store
    this.subscriptions.push(
      this.patients$.subscribe(patients => {
        // Clear existing cache
        this.patients.clear();
        
        // Update our local cache with the latest patient data
        patients.forEach(patient => {
          this.patients.set(patient.userId, patient);
          
          // Pre-populate name cache for performance
          const fullName = `${patient.firstName} ${patient.lastName}`;
          this.patientNameCache.set(patient.userId, fullName);
        });
        
        // Force refresh UI with updated patient names
        if (this.filteredAppointments.length > 0) {
          this.filteredAppointments = [...this.filteredAppointments];
        }
      })
    );
  }
  
  /**
   * Sets up subscription handlers for store data
   */
// In the setupSubscriptions method:
private setupSubscriptions(): void {
  // Remove the doctors$ subscription that's causing the 403 error
  this.subscriptions.push(
    // Instead of subscribing to doctors$, extract doctor info from appointments
    this.appointments$.subscribe(appointments => {
      appointments.forEach(appointment => {
        if (appointment.doctorUserId && appointment.doctorName) {
          const nameParts = appointment.doctorName.split(' ');
          const doctor: Doctor = {
            userId: appointment.doctorUserId,
            firstName: nameParts[0] || '',
            lastName: nameParts.length > 1 ? nameParts.slice(1).join(' ') : '',
            specialty: '', // Remove the property that doesn't exist on Appointment
            id: 0,
            email: '' // Add missing email property required by Doctor type
          };
          
          this.doctorMap.set(appointment.doctorUserId, doctor);
        }
      });
    }),
    
    // Keep other store subscriptions
    this.appointments$.subscribe(),
    this.loading$.subscribe(),
    this.error$.subscribe(error => {
      if (error) console.error(`Store error: ${error}`);
    })
  );
}
  
  /**
   * Loads appointments for the specified doctor
   */
  private loadAppointmentsForDoctor(): void {
    if (!this.doctorId) {
      this.error = 'No doctor ID provided';
      return;
    }
    
    // Update store 
    this.store.dispatch(AppointmentActions.loadDoctorAppointments({ 
      doctorId: this.doctorId 
    }));
    
    // Direct service call for immediate UI update
    this.appointmentService.getDoctorAppointments(this.doctorId).subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.appointments = [...data];
          this.loading = false;
          this.filterAppointmentsByType();
        } else {
          this.appointments = [];
          this.filteredAppointments = [];
          this.loading = false;
        }
      },
      error: (error) => {
        this.error = `Failed to load appointments: ${error.message}`;
        this.appointments = [];
        this.filteredAppointments = [];
        this.loading = false;
      }
    });
  }
  
  /**
   * Updates patient data cache from appointments
   */
  private loadUserDataFromAppointments(): void {
    this.subscriptions.push(
      this.appointments$.subscribe(appointments => {
        // Process each appointment to create User objects
        appointments.forEach(appointment => {
          if (appointment.patientUserId && !this.patientDetails.has(appointment.patientUserId)) {
            // Create a minimal User object - details will be fetched later
            const user: User = {
              id: 0,
              userId: appointment.patientUserId,
              email: '',
              firstName: '',
              lastName: '',
              role: RoleType.Patient,
              specialty: undefined,
              name: undefined
            };
            
            this.patientDetails.set(appointment.patientUserId, user);
            this.fetchPatientDetailsFromMedicalHistory(appointment.patientUserId);
          }
        });
      })
    );
  }
  
  /**
   * Fetches additional patient details from medical history
   */
  private fetchPatientDetailsFromMedicalHistory(patientId: string): void {
    // Only fetch if we don't already have good data for this patient
    if (this.patientDetails.has(patientId) && 
        this.patientDetails.get(patientId)!.firstName && 
        this.patientDetails.get(patientId)!.lastName) return;
    
    this.medicalHistoryService.getPatientHistory(patientId).subscribe({
      next: (medicalRecord) => {
        if (!medicalRecord) return;
        
        const user: User = {
          id: 0,
          userId: patientId,
          email: '',
          firstName: '',
          lastName: '',
          role: RoleType.Patient,
          specialty: undefined,
          name: undefined
        };
        
        // Try to extract patient info from medical record
        if (typeof medicalRecord === 'object' && 
            medicalRecord.notes && 
            typeof medicalRecord.notes === 'string') {
          const nameMatch = medicalRecord.notes.match(/name:?\s*([a-zA-Z]+(?:\s+[a-zA-Z]+)?)/i);
          if (nameMatch && nameMatch[1]) {
            const nameParts = nameMatch[1].trim().split(/\s+/);
            if (nameParts.length >= 2) {
              user.firstName = nameParts[0];
              user.lastName = nameParts.slice(1).join(' ');
            } else if (nameParts.length === 1) {
              user.firstName = nameParts[0];
            }
          }
        }
        
        this.patientDetails.set(patientId, user);
        
        // Update name cache if we found a name
        if (user.firstName || user.lastName) {
          const fullName = getFullName(user);
          if (fullName !== 'Unknown') {
            this.patientNameCache.set(patientId, fullName);
            this.filteredAppointments = [...this.filteredAppointments];
          }
        }
      },
      error: (err) => {
        console.error(`Error fetching medical history for patient ${patientId}:`, err);
      }
    });
  }
  
  // ===== DATA FILTERING =====
  
  /**
   * Filters appointments based on the selected type (upcoming/past)
   */
  public filterAppointmentsByType(): void {
    if (!this.appointments || this.appointments.length === 0) {
      this.filteredAppointments = [];
      return;
    }
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    try {
      if (this.appointmentType === 'upcoming') {
        this.filteredAppointments = this.appointments.filter(appointment => {
          const appointmentDate = new Date(appointment.date);
          const appointmentDay = new Date(
            appointmentDate.getFullYear(),
            appointmentDate.getMonth(),
            appointmentDate.getDate()
          );
          return appointmentDay.getTime() >= today.getTime();
        });
      } else {
        this.filteredAppointments = this.appointments.filter(appointment => {
          const appointmentDate = new Date(appointment.date);
          const appointmentDay = new Date(
            appointmentDate.getFullYear(),
            appointmentDate.getMonth(),
            appointmentDate.getDate()
          );
          return appointmentDay.getTime() < today.getTime();
        });
      }
      
      // Sort by date
      this.filteredAppointments.sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return this.appointmentType === 'past' ? dateB - dateA : dateA - dateB;
      });
      
    } catch (err) {
      this.error = 'Error filtering appointments';
      this.filteredAppointments = [...this.appointments];
    }
  }
  
  // ===== APPOINTMENT ACTIONS =====
  
  /**
   * Confirms an appointment
   */
  confirmAppointment(appointment: Appointment): void {
    this.updateAppointmentStatus(appointment, AppointmentStatus.Confirmed);
  }

  /**
   * Cancels an appointment
   */
  cancelAppointment(appointment: Appointment): void {
    this.updateAppointmentStatus(appointment, AppointmentStatus.Cancelled);
  }

  /**
   * Updates the status of an appointment
   */
  updateAppointmentStatus(appointment: Appointment, newStatus: AppointmentStatus): void {
    // Update in the store
    this.store.dispatch(AppointmentActions.updateAppointmentStatus({
      appointmentId: appointment.appointmentId,
      status: newStatus
    }));
    
    // Update locally for immediate UI feedback
    this.appointments = this.appointments.map(app => 
      app.appointmentId === appointment.appointmentId ? { ...app, status: newStatus } : app
    );
    
    // Show success message
    this.successMessage = `Appointment status updated to ${this.getStatusText(newStatus as any)}`;
    setTimeout(() => this.successMessage = null, 3000);
    
    this.filterAppointmentsByType();
  }

  /**
   * View appointment details - stub for future implementation
   */
  viewAppointmentDetails(appointment: Appointment): void {
    // Implementation placeholder
  }
  
  // ===== FORMATTING & DISPLAY HELPERS ===== 
  /**
   * Gets a patient name by ID using Patient service/store
   */
  getPatientName(patientId: string | null): string {
    if (!patientId) return 'No patient assigned';
    
    // Check cache first for performance
    if (this.patientNameCache.has(patientId)) {
      return this.patientNameCache.get(patientId)!;
    }
    
    // Set a temporary ID-based name first
    const tempName = `Patient ${patientId.substring(0, 8)}`;
    this.patientNameCache.set(patientId, tempName);
    
    // Schedule the async operation for the next VM turn to avoid detection errors
    setTimeout(() => {
      // Inside a timeout to defer execution after the current detection cycle
      this.patientService.getPatientName(patientId).subscribe(name => {
        this.patientNameCache.set(patientId, name);
        
        // Use detectChanges instead of markForCheck for explicit change detection
        this.ngZone.run(() => {
          // Update the filtered appointments array to trigger change detection
          if (this.filteredAppointments.length > 0) {
            this.filteredAppointments = [...this.filteredAppointments];
            this.cdr.detectChanges();
          }
        });
      });
    }, 0);
    
    // Always return the cached value for the initial render
    return tempName;
  }
  
  /**
   * Formats a date string to a user-friendly format
   */
  formatDate(dateStr: string): string {
    if (!dateStr) return 'N/A';
    
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  }
  
  /**
   * Formats a time string to a user-friendly format
   */
  formatTime(dateStr: string): string {
    if (!dateStr) return '';
    
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  }

  /**
   * Gets a doctor name from an appointment object
   */
  getDoctorNameFromAppointment(appointment: any): string {
    if (appointment.doctorName) return appointment.doctorName;
    
    const doctor = this.doctorMap.get(appointment.doctorUserId);
    return doctor ? `${doctor.firstName} ${doctor.lastName}` : 'Doctor';
  }
  
  // ===== STATUS HELPERS =====
  
  /**
   * Gets a Bootstrap class based on appointment status
   */
  getStatusClass(status: number | AppointmentStatus): string {
    const statusNum = typeof status === 'number' ? status : 
                    status === AppointmentStatus.Created ? 0 :
                    status === AppointmentStatus.Confirmed ? 1 :
                    status === AppointmentStatus.Cancelled ? 2 : 3;
  
    switch(statusNum) {
      case 0: return 'bg-warning text-dark';  // Created
      case 1: return 'bg-success text-white'; // Confirmed
      case 2: return 'bg-danger text-white';  // Cancelled
      default: return 'bg-secondary text-white'; // Unknown
    }
  }
  
  /**
   * Gets CSS style object for appointment status badge
   */
  getStatusStyle(status: number | AppointmentStatus): any {
    const statusNum = typeof status === 'number' ? status : 
                    status === AppointmentStatus.Created ? 0 :
                    status === AppointmentStatus.Confirmed ? 1 :
                    status === AppointmentStatus.Cancelled ? 2 : 3;
  
    // Base style 
    const baseStyle = {
      'width': '65px',            
      'height': '20px',            
      'gap': '8px',               
      'border-radius': '12px',     
      'padding': '4px 8px',       
      'font-weight': '600',    
      'font-size': '10px',         
      'line-height': '100%',       
      'letter-spacing': '0%',     
      'text-align': 'center',   
      'display': 'inline-flex',    
      'align-items': 'center',     
      'justify-content': 'center',
      'position': 'relative'       
    };
  
    switch(statusNum) {
      case 0: // Created 
        return { ...baseStyle, 'background-color': '#edbd5a' };
      case 1: // Confirmed 
        return { ...baseStyle, 'background-color': '#59A78E' };
      case 2: // Cancelled
        return { ...baseStyle, 'background-color': '#DC3545' };
      default: // Unknown 
        return { ...baseStyle, 'background-color': '#D3D3D3' };
    }
  }

  /**
   * Gets text representation of appointment status
   */
  getStatusText(status: number | AppointmentStatus): string {
    const statusNum = typeof status === 'number' ? status : 
                    status === AppointmentStatus.Created ? 0 :
                    status === AppointmentStatus.Confirmed ? 1 :
                    status === AppointmentStatus.Cancelled ? 2 : 3;
  
    switch(statusNum) {
      case 0: return 'Created';
      case 1: return 'Confirmed';
      case 2: return 'Cancelled';
      default: return 'Unknown';
    }
  }
}