import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Store } from '@ngrx/store';

import * as AppointmentActions from '../../../store/appointment/appointments.actions';
import * as AppointmentSelectors from '../../../store/appointment/appointments.selectors';

@Component({
  selector: 'app-book-appointment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './book-appointment.component.html',
  styleUrls: ['./book-appointment.component.css']
})
export class BookAppointmentComponent implements OnInit, OnDestroy {
  selectedAppointmentId: string = '';
  appointmentOptions: any[] = [];
  loading: boolean = false;
  error: boolean = false;
  
  private destroy$ = new Subject<void>();
  
  constructor(private store: Store) {}
  
  ngOnInit(): void {
    // Load available slots
    this.store.dispatch(AppointmentActions.loadAvailableSlots());
    
    // Subscribe to available slots
    this.store.select(AppointmentSelectors.selectAvailableSlotsFormatted)
      .pipe(takeUntil(this.destroy$))
      .subscribe(options => {
        this.appointmentOptions = options;
      });
      
    // Subscribe to loading state
    this.store.select(AppointmentSelectors.selectAppointmentsLoading)
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => {
        this.loading = loading;
      });
      
    // Subscribe to error state
    this.store.select(AppointmentSelectors.selectAppointmentsError)
      .pipe(takeUntil(this.destroy$))
      .subscribe(error => {
        this.error = !!error;
      });
      
    // Handle booking success
    this.store.select(AppointmentSelectors.selectBookingSuccess)
      .pipe(takeUntil(this.destroy$))
      .subscribe(success => {
        if (success) {
          alert('Appointment booked successfully!');
          this.selectedAppointmentId = '';
          this.store.dispatch(AppointmentActions.resetBookingState());
          // Refresh available slots
          this.store.dispatch(AppointmentActions.loadAvailableSlots());
        }
      });
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  bookAppointment() {
    if (!this.selectedAppointmentId) {
      alert('Please select an appointment first');
      return;
    }
    
    this.store.dispatch(AppointmentActions.bookAppointment({
      appointmentId: parseInt(this.selectedAppointmentId),
      patientId: 1 // mockup
    }));
  }
}