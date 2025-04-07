// Core Angular imports
import { Component, OnInit, OnDestroy ,inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { Subscription } from 'rxjs';

// Component imports
import { DoctorAppointmentsComponent } from '../../appointments/doctor-appointments/doctor-appointments.component';
import { PatientSummaryComponent } from '../../notes/patient-summary/patient-summary.component';

// Service imports
import { AppointmentService } from '../../../services/appointments/appointment.service';
import { NoteService } from '../../../services/notes/note.service';
import { MedicalHistoryService } from '../../../services/medicalHistory/medical-history.service';
import { PatientService } from '../../../services/patient/patient.service'; 
import { Patient } from '../../../models/patient.model'; 

// Model imports
import { Appointment } from '../../../models/appointment.model';
import { CreateNoteDto } from '../../../services/notes/note.service';
import { MedicalRecord } from '../../../models/medical-record.model';
import { AuthService } from '../../../services/auth/auth.service';
import { Router } from '@angular/router';

// Define interfaces for component use
interface PatientOption {
  userId: string;
  name: string;
}

interface AppointmentOption {
  appointmentId: string;
  patientUserId: string;
  patientName: string;
  date: string;
  status: any; 
  originalAppointment: Appointment;
}

@Component({
  selector: 'app-doctor-dashboard',
  templateUrl: './doctor-dashboard.component.html',
  styleUrls: ['./doctor-dashboard.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, DoctorAppointmentsComponent, PatientSummaryComponent]
})
export class DoctorDashboardComponent implements OnInit, OnDestroy {
  //===========================
  // PROPERTIES
  //===========================

  doctorId: string = '';
  

  
  // UI state management
  isEditModalOpen: boolean = false;
  loading: boolean = false;
  error: string | null = null;
  noteSuccessMessage: string | null = null;
  patientSuccessMessage: string | null = null;
  refreshTimestamp = Date.now();
  
  // Patient data
  patientOptions: PatientOption[] = [];
  selectedPatientId: string | null = null;
  private patients = new Map<string, Patient>();
  private patientNameCache = new Map<string, string>();
  
  // Appointment data
  appointmentOptions: AppointmentOption[] = [];
  selectedAppointmentId: string | null = null;
  selectedAppointment: AppointmentOption | null = null;
  private appointmentsWithNotes: Set<string> = new Set<string>();
  
  // Notes data
  noteText: string = '';
  
  // Medical record data
  editingMedicalRecord: MedicalRecord = {
    id: 0,
    historyID: '',
    diagnosis: '',
    allergies: '',
    medicines: '',
    patientId: 0,
    notes: ''
  };
  
  // Subscription management
  private subscriptions: Subscription[] = [];

  
  //===========================
  // LIFECYCLE HOOKS
  //===========================
  constructor(
    private appointmentService: AppointmentService,
    private noteService: NoteService,
    private medicalHistoryService: MedicalHistoryService,
    private patientService: PatientService,
    private authService :AuthService,
    private router :Router,
  ) {}
  
  ngOnInit(): void {
    const id = this.authService.getCurrentUserId();
    if (!id) {
      this.router.navigate(['/login']);
      return;
    }
    this.doctorId = id; // Now guaranteed to be string
    this.loadData();
  }
  
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  
  //===========================
  // DATA LOADING METHODS
  //===========================
  loadData(): void {
    this.loadPatientData();
    this.loadPatientOptions();
    this.loadAppointmentOptions();
  }
  
  private loadPatientData(): void {
    this.patientService.getAllPatients().subscribe({
      next: (patients) => {
        patients.forEach(patient => {
          this.patients.set(patient.userId, patient);
        });
        
        this.refreshPatientOptions();
        this.refreshAppointmentOptions();
      },
      error: (error) => {
        console.error('Error loading admin summary:', error);
      }
    });
  }
  
  loadPatientOptions(): void {
    this.loading = true;
    
    const appointmentsSub = this.appointmentService.getDoctorAppointments(this.doctorId)
      .subscribe({
        next: (appointments) => {
          const patientMap = new Map<string, PatientOption>();
          
          appointments.forEach(appointment => {
            if (appointment.patientUserId) {
              const patientId = appointment.patientUserId;
              const displayName = this.getPatientName(patientId);
              
              if (!patientMap.has(patientId)) {
                patientMap.set(patientId, {
                  userId: patientId,
                  name: displayName
                });
              }
            }
          });
          
          this.patientOptions = Array.from(patientMap.values());
          this.patientOptions.sort((a, b) => a.name.localeCompare(b.name));
          
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading doctor appointments:', err);
          this.error = 'Failed to load patient list';
          this.loading = false;
        }
      });
      
    this.subscriptions.push(appointmentsSub);
  }
  
  loadAppointmentOptions(): void {
    this.loading = true;
    
    this.loadAllPatientNotes().then(() => {
      const appointmentsSub = this.appointmentService.getDoctorAppointments(this.doctorId)
        .subscribe({
          next: (appointments) => {
            this.appointmentOptions = appointments
              .filter(appointment => 
                appointment.patientUserId && 
                !this.appointmentsWithNotes.has(appointment.appointmentId)
              )
              .map(appointment => {
                const patientName = this.getPatientName(appointment.patientUserId!);
                
                return {
                  appointmentId: appointment.appointmentId,
                  patientUserId: appointment.patientUserId!,
                  patientName: patientName,
                  date: appointment.date,
                  status: appointment.status,
                  originalAppointment: appointment
                };
              });
            
            this.loading = false;
          },
          error: (err) => {
            console.error('Error loading doctor appointments:', err);
            this.error = 'Failed to load appointment list';
            this.loading = false;
          }
        });
        
      this.subscriptions.push(appointmentsSub);
    });
  }
  
  //===========================
  // PATIENT DATA HELPERS
  //===========================
  getPatientName(patientId: string | null): string {
    if (!patientId) return 'No patient assigned';
    
    // Check cache first for performance
    if (this.patientNameCache.has(patientId)) {
      return this.patientNameCache.get(patientId)!;
    }
    
    // Try to get from our local patients map
    const patient = this.patients.get(patientId);
    if (patient) {
      const fullName = `${patient.firstName} ${patient.lastName}`;
      this.patientNameCache.set(patientId, fullName);
      return fullName;
    }
    
    // Use the service to get the name if not in our map (this is async)
    this.patientService.getPatientName(patientId).subscribe(name => {
      this.patientNameCache.set(patientId, name);
      // Force refresh to update UI with this name
      this.refreshPatientOptions();
      this.refreshAppointmentOptions();
    });
    
    // Return a temporary placeholder while async call completes
    const idBasedName = `Patient ${patientId.substring(0, 8)}`;
    this.patientNameCache.set(patientId, idBasedName);
    return idBasedName;
  }
  
  refreshPatientOptions(): void {
    this.patientOptions = this.patientOptions.map(option => {
      return {
        ...option,
        name: this.getPatientName(option.userId)
      };
    });
    
    this.patientOptions.sort((a, b) => a.name.localeCompare(b.name));
  }
  
  refreshAppointmentOptions(): void {
    this.appointmentOptions = this.appointmentOptions.map(option => {
      return {
        ...option,
        patientName: option.patientUserId ? this.getPatientName(option.patientUserId) : 'No patient assigned'
      };
    });
  }
  
  //===========================
  // NOTE OPERATIONS
  //===========================
  private async loadAllPatientNotes(): Promise<void> {
    this.appointmentsWithNotes.clear();
    
    const uniquePatientIds = new Set<string>();
    
    this.patientOptions.forEach(patient => {
      if (patient.userId) uniquePatientIds.add(patient.userId);
    });
    
    const promises = Array.from(uniquePatientIds).map(patientId => {
      return new Promise<void>((resolve) => {
        this.noteService.getNotesByPatientId(patientId).subscribe({
          next: (notes) => {
            notes.forEach(note => {
              if (note.appointmentId) {
                this.appointmentsWithNotes.add(note.appointmentId);
              }
            });
            resolve();
          },
          error: (err) => {
            console.error(`Error loading notes for patient ${patientId}:`, err);
            resolve();
          }
        });
      });
    });
    
    await Promise.all(promises);
  }
  
  saveNote(): void {
    if (!this.selectedAppointmentId || !this.noteText) {
      this.error = 'Please select an appointment and enter note text';
      return;
    }
    
    const appointment = this.appointmentOptions.find(a => a.appointmentId === this.selectedAppointmentId);
    if (!appointment || !appointment.patientUserId) {
      this.error = 'Invalid appointment selection';
      return;
    }

    this.loading = true;
    this.error = null;
    this.noteSuccessMessage = null;
    
    this.medicalHistoryService.getPatientHistory(appointment.patientUserId)
      .subscribe({
        next: (medicalRecord) => {
          const medicalHistoryId = medicalRecord.historyID;
          
          const noteDto: CreateNoteDto = {
            appointmentId: this.selectedAppointmentId as string,
            noteText: this.noteText,
            medicalHistoryId: medicalHistoryId
          };
          
          this.noteService.createNote(noteDto).subscribe({
            next: (response) => {
              this.loading = false;
              this.patientSuccessMessage = null;
              this.noteSuccessMessage = 'Note saved successfully';
              this.clearMessageAfterDelay('note');
              
              this.noteText = '';
              this.selectedAppointmentId = null;
              
              // Add the appointment ID to prevent duplicate notes
              this.appointmentsWithNotes.add(noteDto.appointmentId);
              
              // Just reload appointment options instead of full refresh
              this.loadAppointmentOptions();
            },
            error: (err) => {
              console.error('Error saving note:', err);
              console.error('Failed request details:', { 
                endpoint: 'Note',
                payload: noteDto
              });
              this.loading = false;
              this.error = 'Failed to save note';
            }
          });
        },
        error: (err) => {
          console.error('Error getting medical history:', err);
          this.loading = false;
          this.error = 'Failed to get medical history for this patient';
        }
      });
  }
  
  //===========================
  // MEDICAL HISTORY OPERATIONS
  //===========================
  editPatientMedicalHistory(): void {
    if (!this.selectedPatientId) {
      this.error = 'No patient selected';
      return;
    }
    
    this.loading = true;
    this.error = null;
    
    const patientId: string = this.selectedPatientId;
    
    this.medicalHistoryService.getPatientHistory(patientId)
      .subscribe({
        next: (medicalRecord) => {
          this.editingMedicalRecord = { ...medicalRecord };
          this.loading = false;
          this.isEditModalOpen = true;
        },
        error: (err) => {
          console.error('Error getting medical history:', err);
          this.loading = false;
          this.error = 'Failed to get medical history for this patient';
        }
      });
  }
  
  cancelEdit(): void {
    this.isEditModalOpen = false;
  }
  
  saveMedicalHistory(): void {
    if (!this.selectedPatientId) {
      this.error = 'No patient selected';
      return;
    }
    
    this.loading = true;
    
    const patientId: string = this.selectedPatientId;
    
    this.medicalHistoryService.updatePatientHistory(patientId, this.editingMedicalRecord)
      .subscribe({
        next: (response) => {
          this.loading = false;
          this.noteSuccessMessage = null;
          this.patientSuccessMessage = 'Medical history updated successfully';
          this.clearMessageAfterDelay('patient');
          
          this.isEditModalOpen = false;
          this.onPatientSelected();
        },
        error: (err) => {
          console.error('Error updating medical history:', err);
          this.loading = false;
          this.error = 'Failed to update medical history';
        }
      });
  }
  
  //===========================
  // EVENT HANDLERS
  //===========================
  onPatientSelected(): void {
    console.log(`Selected patient: ${this.selectedPatientId}`);
  }
  
  onAppointmentSelected(): void {
    this.selectedAppointment = this.appointmentOptions.find(
      a => a.appointmentId === this.selectedAppointmentId
    ) || null;
    
    this.noteText = '';
    this.error = null;
    this.noteSuccessMessage = null;
    
    if (this.selectedAppointment && this.selectedAppointment.patientUserId) {
      this.selectedPatientId = this.selectedAppointment.patientUserId;
    }
  }
  
  //===========================
  // UI HELPERS
  //===========================
  private clearMessageAfterDelay(messageType: 'patient' | 'note'): void {
    setTimeout(() => {
      if (messageType === 'patient') {
        this.patientSuccessMessage = null;
      } else {
        this.noteSuccessMessage = null;
      }
    }, 4000); // Clear after 4 seconds
  }

  clearAllMessages(): void {
    this.error = null;
    this.noteSuccessMessage = null;
    this.patientSuccessMessage = null;
  }
  
  forceRefresh(): void {
    this.refreshTimestamp = Date.now();
    this.error = null; // Only clear errors, preserve success messages
    this.loadData();
  }
  
  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
  }
  
}