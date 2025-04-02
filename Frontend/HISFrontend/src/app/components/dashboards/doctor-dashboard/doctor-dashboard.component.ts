import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { DoctorAppointmentsComponent } from '../../appointments/doctor-appointments/doctor-appointments.component';
import { PatientSummaryComponent } from '../../notes/patient-summary/patient-summary.component';
import { AppointmentService } from '../../../services/appointments/appointment.service';
import { NoteService } from '../../../services/notes/note.service';
import { Subscription } from 'rxjs';
import { Appointment } from '../../../models/appointment.model';
import { CreateNoteDto } from '../../../services/notes/note.service';
import { MedicalHistoryService } from '../../../services/medicalHistory/medical-history.service';

// Define interfaces for better type safety
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
  // ========== PROPERTIES ==========
  
  // Doctor information
  doctorId = '11111111-1111-1111-1111-111111111111';
  refreshTimestamp = Date.now();
  
  // Patient options for summary
  patientOptions: PatientOption[] = [];
  selectedPatientId: string | null = null;
  
  // Appointment options for notes
  appointmentOptions: AppointmentOption[] = [];
  selectedAppointmentId: string | null = null;
  selectedAppointment: AppointmentOption | null = null;
  
  // Notes creation
  noteText: string = '';
  
  // UI state
  loading: boolean = false;
  error: string | null = null;
  successMessage: string | null = null;
  
  // Subscription management
  private subscriptions: Subscription[] = [];
  
  // ========== LIFECYCLE METHODS ==========
  
  constructor(
    private appointmentService: AppointmentService,
    private noteService: NoteService,
    private medicalHistoryService: MedicalHistoryService
  ) {}
  
  ngOnInit(): void {
    this.loadData();
  }
  
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  
  // ========== DATA LOADING METHODS ==========
  
  // Load all necessary data
  loadData(): void {
    this.loadPatientOptions();
    this.loadAppointmentOptions();
  }
  
  // Force refresh of all data
  forceRefresh(): void {
    this.refreshTimestamp = Date.now();
    this.loadData();
  }
  
  // Load patient options from doctor's appointments
  loadPatientOptions(): void {
    this.loading = true;
    
    const appointmentsSub = this.appointmentService.getDoctorAppointments(this.doctorId)
      .subscribe({
        next: (appointments) => {
          console.log(`Loaded ${appointments.length} appointments for doctor ${this.doctorId}`);
          
          // Extract unique patient IDs and create options
          const patientMap = new Map<string, PatientOption>();
          
          appointments.forEach(appointment => {
            if (appointment.patientUserId) {
              // Add to map if not already present
              if (!patientMap.has(appointment.patientUserId)) {
                // Generate display name from patient ID since we don't have names
                const patientName = `Patient ${appointment.patientUserId.substring(0, 8)}`;
                
                patientMap.set(appointment.patientUserId, {
                  userId: appointment.patientUserId,
                  name: patientName
                });
              }
            }
          });
          
          // Convert map to array for the dropdown
          this.patientOptions = Array.from(patientMap.values());
          console.log(`Extracted ${this.patientOptions.length} unique patients`);
          
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

  // Load appointment options for the notes
  loadAppointmentOptions(): void {
    this.loading = true;
    
    const appointmentsSub = this.appointmentService.getDoctorAppointments(this.doctorId)
      .subscribe({
        next: (appointments) => {
          // Format appointments for display
          this.appointmentOptions = appointments.map(appointment => {
            // Use the patient ID to create a display name
            const patientName = appointment.patientUserId ? 
              `Patient ${appointment.patientUserId.substring(0, 8)}` : 
              'No patient assigned';
            
            return {
              appointmentId: appointment.appointmentId,
              patientUserId: appointment.patientUserId,
              patientName: patientName,
              date: appointment.date,
              status: appointment.status,
              // Reference to the original appointment for later use
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
  }
  
  // ========== EVENT HANDLERS ==========
  
  // When patient is selected in the summary section
  onPatientSelected(): void {
    console.log(`Selected patient: ${this.selectedPatientId}`);
  }
  
  // When appointment is selected in the notes section
  onAppointmentSelected(): void {
    console.log(`Selected appointment: ${this.selectedAppointmentId}`);
    
    // Find the selected appointment
    this.selectedAppointment = this.appointmentOptions.find(
      a => a.appointmentId === this.selectedAppointmentId
    ) || null;
    
    // Clear any previous input
    this.noteText = '';
    this.error = null;
    this.successMessage = null;
    
    // Auto-select the associated patient in the summary section
    if (this.selectedAppointment && this.selectedAppointment.patientUserId) {
      this.selectedPatientId = this.selectedAppointment.patientUserId;
    }
  }
  
  // ========== NOTE OPERATIONS ==========
  
  // Save a new note
  saveNote(): void {
    if (!this.selectedAppointmentId || !this.noteText) {
      this.error = 'Please select an appointment and enter note text';
      return;
    }
    
    // Find the selected appointment to get the patient ID
    const appointment = this.appointmentOptions.find(a => a.appointmentId === this.selectedAppointmentId);
    if (!appointment || !appointment.patientUserId) {
      this.error = 'Invalid appointment selection';
      return;
    }

    this.loading = true;
    this.error = null;
    this.successMessage = null;
    
    // Get the medical history for this patient using the existing service
    this.medicalHistoryService.getPatientHistory(appointment.patientUserId)
      .subscribe({
        next: (medicalRecord) => {
          console.log('Retrieved medical record:', medicalRecord);
          
          // Access the historyID property directly since we know it exists based on the model
          const medicalHistoryId = medicalRecord.historyID;
          
          console.log('Using medical history ID:', medicalHistoryId);
          
          // Create the note with the medical history ID
          const noteDto: CreateNoteDto = {
            appointmentId: this.selectedAppointmentId as string,
            noteText: this.noteText,
            medicalHistoryId: medicalHistoryId
          };
          
          console.log('Creating note with payload:', noteDto);
          
          // Send the note to the API
          this.noteService.createNote(noteDto).subscribe({
            next: (response) => {
              console.log('Note created successfully:', response);
              this.loading = false;
              this.successMessage = 'Note saved successfully';
              this.noteText = '';
              this.selectedAppointmentId = null;
              this.forceRefresh();
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

  // ========== UTILITY METHODS ==========
  
  // Format date for display
  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
  }
  
  logout() {
    console.log('User logged out');
  }
}