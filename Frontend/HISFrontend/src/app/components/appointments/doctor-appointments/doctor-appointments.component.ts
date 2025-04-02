import { Component, Input, OnInit, OnChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { Appointment, AppointmentStatus } from '../../../models/appointment.model';
import { Doctor } from '../../../store/doctor/doctor.state';
import * as DoctorActions from '../../../store/doctor/doctor.actions';
import * as DoctorSelectors from '../../../store/doctor/doctor.selectors';
import * as AppointmentActions from '../../../store/appointment/appointments.actions';
import * as AppointmentSelectors from '../../../store/appointment/appointments.selectors';
import { AppointmentService } from '../../../services/appointments/appointment.service';
import { User, getFullName } from '../../../models/user.model';

@Component({
  selector: 'app-doctor-appointments',
  templateUrl: './doctor-appointments.component.html',
  styleUrls: ['./doctor-appointments.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class DoctorAppointmentsComponent implements OnInit, OnChanges, OnDestroy {
  // Component inputs
  @Input() title: string = 'Appointments';
  @Input() appointmentType: 'upcoming' | 'past' = 'upcoming';
  @Input() doctorId: string = '11111111-1111-1111-1111-111111111111';
  @Input() refreshTimestamp: number = 0;

  // Make enum available to template
  AppointmentStatus = AppointmentStatus;
  
  // Data properties
  appointments: Appointment[] = [];
  filteredAppointments: Appointment[] = [];
  loading: boolean = true;
  error: string | null = null;
  successMessage: string | null = null;
  
  // Observables
  appointments$: Observable<Appointment[]>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  doctors$: Observable<Doctor[]>;
  
  // Cache for lookup data
  doctorMap: Map<string, Doctor> = new Map();
  private patientMap = new Map<string, string>();
  
  // Track subscriptions for cleanup
  private subscriptions: Subscription[] = [];
  
  constructor(private store: Store, private appointmentService: AppointmentService) {
    // Initialize store selectors
    this.appointments$ = this.store.select(AppointmentSelectors.selectAllAppointments);
    this.loading$ = this.store.select(AppointmentSelectors.selectAppointmentsLoading);
    this.error$ = this.store.select(AppointmentSelectors.selectAppointmentsError);
    this.doctors$ = this.store.select(DoctorSelectors.selectAllDoctors);
    
  }
  
  // LIFECYCLE METHODS
  
  ngOnInit(): void {
    this.loading = true;
    this.appointments = [];
    this.filteredAppointments = [];
    
    // Load doctors first
    this.store.dispatch(DoctorActions.loadDoctors());
    
    // Load appointments for the doctor
    this.loadAppointmentsForDoctor();
    
    // Set up subscriptions
    this.setupSubscriptions();
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
  
  // INITIALIZATION METHODS
  
  private setupSubscriptions(): void {
    // Subscribe to doctors data
    this.subscriptions.push(
      this.doctors$.subscribe(doctors => {
        this.doctorMap.clear();
        doctors.forEach(doctor => {
          if (doctor.userId) this.doctorMap.set(doctor.userId, doctor);
          if (doctor.id) this.doctorMap.set(doctor.id.toString(), doctor);
        });
      })
    );
    
    // Add other store subscriptions
    this.subscriptions.push(
      this.appointments$.subscribe(),
      this.loading$.subscribe(),
      this.error$.subscribe(error => {
        if (error) console.error(`Store error: ${error}`);
      })
    );
  }
  
  // DATA OPERATIONS
  
  private loadAppointmentsForDoctor(): void {
    if (!this.doctorId) {
      this.error = 'No doctor ID provided';
      return;
    }
    
    // Update store 
    this.store.dispatch(AppointmentActions.loadDoctorAppointments({ 
      doctorId: this.doctorId 
    }));
    

    
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
          return appointmentDay.getTime() > today.getTime();
        });
      } else if (this.appointmentType === 'past') {
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
  
  // APPOINTMENT ACTIONS
  
  confirmAppointment(appointment: Appointment): void {
    this.updateAppointmentStatus(appointment, AppointmentStatus.Confirmed);
  }

  cancelAppointment(appointment: Appointment): void {
    this.updateAppointmentStatus(appointment, AppointmentStatus.Cancelled);
  }

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

  viewAppointmentDetails(appointment: Appointment): void {
    console.log(`Viewing details for appointment: ${appointment.appointmentId}`);
  }
  
  // FORMATTING & DISPLAY HELPERS
  
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
  
  formatTime(dateStr: string): string {
    if (!dateStr) return '';
    
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  }

  getDoctorNameFromAppointment(appointment: any): string {
    // Check if doctor name is included in appointment
    if (appointment.doctorName) return appointment.doctorName;
    
    // Otherwise try to find in doctor map
    const doctor = this.doctorMap.get(appointment.doctorUserId);
    return doctor ? `${doctor.firstName} ${doctor.lastName}` : 'Doctor';
  }
  
  getPatientName(patientId: string | null): string {
    if (!patientId) return 'No patient assigned';
    
    // Check cache first
    if (this.patientMap.has(patientId)) {
      return this.patientMap.get(patientId)!;
    }
    

    const patientMap: {[key: string]: string} = {
      '33333333-3333-3333-3333-333333333333': 'Alice Johnson',
      '44444444-4444-4444-4444-444444444444': 'Bob Smith',
    };
    
    const name = patientMap[patientId] || `Patient ID: ${patientId.substring(0, 8)}...`;
    this.patientMap.set(patientId, name);
    return name;
  }
  
  // STATUS HELPERS
  
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
        return {
          ...baseStyle,
          'background-color': '#edbd5a'
        };
      case 1: // Confirmed 
        return {
          ...baseStyle,
          'background-color': '#59A78E',
        };
      case 2: // Cancelled
        return {
          ...baseStyle,
          'background-color': '#DC3545'
        };
      default: // Unknown 
        return {
          ...baseStyle,
          'background-color': '#D3D3D3'
        };
    }
  }
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
  
  // DEBUG HELPERS
  
  checkAppointmentStatus(): void {
    if (!this.filteredAppointments || this.filteredAppointments.length === 0) return;
    
    this.filteredAppointments.slice(0, 3).forEach(appointment => {
      console.log(`Appointment ${appointment.appointmentId.substring(0, 8)}: status=${appointment.status}`);
    });
  }
}