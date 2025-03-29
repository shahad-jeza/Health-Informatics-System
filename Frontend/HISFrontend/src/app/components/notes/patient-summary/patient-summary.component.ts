import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { Note } from '../../../models/note.model';
import { NoteService } from '../../../services/notes/note.service';
import { DoctorService } from '../../../services/doctor/doctor.service';
import { MedicalHistoryService, MedicalRecord } from '../../../services/medicalHistory/medical-history.service';
import { Appointment } from '../../../models/appointment.model';
import { AppointmentService } from '../../../services/appointments/appointment.service'; 

@Component({
  selector: 'app-patient-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './patient-summary.component.html',
  styleUrl: './patient-summary.component.css'
})
export class PatientSummaryComponent implements OnInit {
  patientId = 1; // mockup 
  
  notes$ = new BehaviorSubject<Note[]>([]);
  medicalHistory$ = new BehaviorSubject<MedicalRecord[]>([]);
  loading$ = new BehaviorSubject<boolean>(true);
  error$ = new BehaviorSubject<string | null>(null);
  
  doctorNames: Map<number, string> = new Map();
  
  constructor(
    private noteService: NoteService,
    private doctorService: DoctorService,
    private medicalHistoryService: MedicalHistoryService,
    private appointmentService: AppointmentService
  ) {}
  
  ngOnInit(): void {
    this.loadData();
  }
  appointments: Appointment[] = [];

  loadData(): void {
    this.loading$.next(true);
    this.error$.next(null);
    
    this.doctorService.getAllDoctors().subscribe(() => {
      this.appointmentService.getPatientAppointments(this.patientId).pipe(
        catchError(err => {
          console.error('Error loading appointments:', err);
          return of([]);
        })
      ).subscribe(appointments => {
        this.appointments = appointments; 
        console.log(`Loaded ${appointments.length} appointments for patient`);
        
        // load notes and medical history
        forkJoin({
          history: this.medicalHistoryService.getPatientHistory(this.patientId).pipe(
            catchError(err => {
              console.error('Error loading medical history:', err);
              this.error$.next('Failed to load medical history. Please try again.');
              return of([]);
            })
          ),
          notes: this.noteService.getNotesByPatientId(this.patientId).pipe(
            catchError(err => {
              console.error('Error loading patient notes:', err);
              this.error$.next('Failed to load patient notes. Please try again.');
              return of([]);
            })
          )
        }).pipe(
          finalize(() => this.loading$.next(false))
        ).subscribe(result => {
          this.medicalHistory$.next(result.history);
          this.notes$.next(result.notes);
        });
      });
    });
  }
  
  getDoctorName(doctorId: number | undefined): string {
    const doctorName = this.doctorService.getDoctorNameFromCache(doctorId);
    
    if (doctorName) {
      return doctorName;
    }
    
    // If not in cache, trigger an async load 
    this.doctorService.getDoctorNameById(doctorId).subscribe();
    return 'Loading...';
  }
  

getDoctorNameFromAppointmentId(appointmentId: number): string {
  // check if we have appointments loaded
  const appointments = this.appointments || [];
  
  // Find the appointment with the matching ID
  const appointment = appointments.find(a => a.id === appointmentId);
  
  if (!appointment) {
    console.log(`Appointment not found for ID: ${appointmentId}`);
    return 'Unknown Doctor';
  }

  return this.getDoctorName(appointment.doctorId);
}


formatAppointmentDate(appointmentId: number): string {
  const appointment = this.appointments.find(a => a.id === appointmentId);
  
  if (!appointment) {
    return 'Unknown Date';
  }
  
  // Format the date from the appointment
  return this.formatDate(appointment.date);
}

formatDate(dateStr: string): string {
  if (!dateStr) {
    return 'N/A';
  }
  
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateStr; 
  }
}
}