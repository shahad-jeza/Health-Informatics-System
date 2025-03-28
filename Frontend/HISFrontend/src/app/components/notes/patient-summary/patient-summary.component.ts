import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { Note } from '../../../models/note.model';
import { NoteService } from '../../../services/notes/note.service';
import { UserService } from '../../../services/users/user.service';
import { HttpClient } from '@angular/common/http';

interface MedicalRecord {
  id: number;
  historyID: string;
  diagnosis: string;
  allergies: string;
  medicines: string;
  patientId: number;
}

@Component({
  selector: 'app-patient-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './patient-summary.component.html',
  styleUrl: './patient-summary.component.css'
})
export class PatientSummaryComponent implements OnInit {
  patientId = 1; // mockup
  
  notes$ = new BehaviorSubject<any[]>([]);
  medicalHistory$ = new BehaviorSubject<MedicalRecord[]>([]);
  loading$ = new BehaviorSubject<boolean>(true);
  error$ = new BehaviorSubject<string | null>(null);
  
  doctorNames: Map<number, string> = new Map();
  
  private apiUrl = 'http://localhost:5066/api';
  
  constructor(
    private noteService: NoteService,
    private userService: UserService,
    private http: HttpClient
  ) {}
  
  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading$.next(true);
    this.error$.next(null);
    
    // load doctors 
    this.userService.getUsersByRole('doctor').pipe(
      catchError(err => {
        console.error('Error loading doctors:', err);
        return of([]);
      })
    ).subscribe(doctors => {
      // Create map of doctor IDs to names
      doctors.forEach(doctor => {
        this.doctorNames.set(doctor.id, doctor.name);
      });
      
      // Load medical history
      this.http.get<MedicalRecord[]>(`${this.apiUrl}/medical-records/patient/${this.patientId}`).pipe(
        catchError(err => {
          console.error('Error loading medical history:', err);
          return of([]);
        })
      ).subscribe(history => {
        this.medicalHistory$.next(history);
        
        // Load all notes for the patient
        this.noteService.getNotesByPatientId(this.patientId).pipe(
          catchError(err => {
            console.error('Error loading patient notes:', err);
            return of([]);
          }),
          finalize(() => this.loading$.next(false))
        ).subscribe(notes => {
          this.notes$.next(notes);
        });
      });
    });
  }
  
  getDoctorName(doctorId: number): string {
    return this.doctorNames.get(doctorId) || 'Unknown Doctor';
  }
  
  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }
}