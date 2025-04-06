import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { Doctor } from '../../../store/doctor/doctor.state';
import { Appointment, AppointmentStatus } from '../../../models/appointment.model';
import { AppointmentService } from '../../../services/appointments/appointment.service';

import * as DoctorActions from '../../../store/doctor/doctor.actions';
import * as DoctorSelectors from '../../../store/doctor/doctor.selectors';

@Component({
  selector: 'app-book-appointment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './book-appointment.component.html',
  styleUrls: ['./book-appointment.component.css']
})
export class BookAppointmentComponent implements OnInit, OnDestroy {
  // Form fields
  selectedDoctorId: string = '';
  appointmentDate: string = '';
  appointmentTime: string = '';
  selectedAppointmentId: string = '';
  
  // Data
  availableAppointments: Appointment[] = [];
  
  // State observables
  doctors$: Observable<Doctor[]>;
  doctorsLoading$: Observable<boolean>;
  doctorsError$: Observable<string | null>;
  
  // UI state
  loading = false;
  error: string | null = null;
  success: string | null = null;
  
  // Subscription management
  private subscriptions: Subscription[] = [];

  constructor(
    private store: Store,
    private appointmentService: AppointmentService
  ) {
    this.doctors$ = this.store.select(DoctorSelectors.selectAllDoctors);
    this.doctorsLoading$ = this.store.select(DoctorSelectors.selectDoctorsLoading);
    this.doctorsError$ = this.store.select(DoctorSelectors.selectDoctorsError);
    

  }
  
  ngOnInit(): void {
    // Load doctors from store
    this.store.dispatch(DoctorActions.loadDoctors()); 
    
    // Fetch available appointments
    this.loadAvailableAppointments();
    
    // Handle doctor loading errors
    const errorSub = this.doctorsError$.subscribe(error => {
      if (error) {
        this.error = `Failed to load doctors: ${error}`;
      } else {
        this.error = null;
      }
    });
    
    this.subscriptions.push(errorSub);
  }
  
  ngOnDestroy(): void {
    // Clean up subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  
  // Load all available appointments
  loadAvailableAppointments(): void {
    this.loading = true;
    this.error = null;
  
    this.appointmentService.getAllAppointments().subscribe({
      next: (appointments) => {
        // Filter for available appointments (with null patientUserId)
        const availableAppointments = appointments.filter(a => !a.patientUserId);
        
        this.availableAppointments = availableAppointments;
        this.loading = false;
        
        if (availableAppointments.length === 0) {
          this.error = 'No available appointments found. Please check with your administrator.';
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Failed to load available appointments';
      }
    });
  }

  // Format appointment text for display
  getFormattedAppointmentText(apt: Appointment): string {
    if (!apt) return 'Invalid appointment';
    
    // Extract doctor name using doctorUserId
    let doctorName = 'Unknown Doctor';
    
    // Format date from the ISO string
    let dateStr = 'TBD';
    let timeStr = 'TBD';
    
    if (apt.date) {
      const dateObj = new Date(apt.date);
      dateStr = dateObj.toLocaleDateString();
      
      // Extract time from the ISO date string 
      if (apt.time) {
        timeStr = apt.time;
      } else {
        timeStr = dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      }
    }
    
    // Find doctor name from the store
    const doctorId = apt.doctorUserId;
    if (doctorId) {
      this.doctors$.pipe(
        take(1) // Take just once to avoid memory leaks
      ).subscribe(doctors => {
        const doctor = doctors.find(d => d.userId === doctorId);
        if (doctor) {
          doctorName = `Dr. ${doctor.firstName} ${doctor.lastName}`;
        }
      });
    }
    
    return `${doctorName} - ${dateStr} at ${timeStr}`;
  }
    
  // Book the selected appointment
  bookAppointment(): void {
    if (!this.selectedAppointmentId) {
      this.error = 'Please select an appointment';
      return;
    }
    
    this.loading = true;
    this.error = null;
    this.success = null;
    
    // Patient user ID (mock)
    const patientUserId = "33333333-3333-3333-3333-333333333333";
    
    // Payload with the required fields
    const payload = {
      PatientUserId: patientUserId,
      Status: 1
    };
    
    this.appointmentService.updateAppointment(this.selectedAppointmentId, payload)
      .subscribe({
        next: (result) => {
          this.loading = false;
          this.success = 'Appointment booked successfully!';
          
          // Remove the booked appointment from the list
          this.availableAppointments = this.availableAppointments.filter(
            apt => apt.appointmentId !== this.selectedAppointmentId
          );
          this.selectedAppointmentId = '';
        },
        error: (err) => {
          // Error message handling
          let errorMsg = 'Unknown error';
          if (err.error && typeof err.error === 'string') {
            errorMsg = err.error;
          } else if (err.message) {
            errorMsg = err.message;
          }
          
          this.loading = false;
          this.error = `Failed to book appointment: ${errorMsg}`;
        }
      });
  }
}