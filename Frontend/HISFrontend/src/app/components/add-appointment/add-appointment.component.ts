import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { delay, filter } from 'rxjs/operators';
import { Doctor } from '../../store/doctor/doctor.state';

import { AppointmentCreate } from '../../models/addAppointment.model';
import * as DoctorActions from '../../store/doctor/doctor.actions';
import * as AppointmentActions from '../../store/add-appointment/add-appointment.actions';
import { selectAllDoctors, selectDoctorsLoading } from '../../store/doctor/doctor.selectors';
import { selectAppointmentCreating, selectAppointmentCreated, selectAppointmentError } from '../../store/add-appointment/add-appointment.selectors';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-appointment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-appointment.component.html',
  styleUrls: ['./add-appointment.component.scss']
})
export class AddAppointmentComponent implements OnInit, OnDestroy {
  // Reactive form to handle appointment creation
  appointmentForm: FormGroup;
  //Observables for all the states
  doctors$: Observable<Doctor[]>;
  loadingDoctors$: Observable<boolean>;
  creating$: Observable<boolean>;
  created$: Observable<boolean>;
  error$: Observable<any>;

   // Subscription to manage observable subscriptions
  private subscriptions = new Subscription();

  constructor(private fb: FormBuilder, private store: Store) {
    // Initialize form with validators
    this.appointmentForm = this.fb.group({
      doctorUserId: ['', Validators.required],
      date: ['', Validators.required]
    });

     // Select state from the store
    this.doctors$ = this.store.select(selectAllDoctors);
    this.loadingDoctors$ = this.store.select(selectDoctorsLoading);
    this.creating$ = this.store.select(selectAppointmentCreating);
    this.created$ = this.store.select(selectAppointmentCreated);
    this.error$ = this.store.select(selectAppointmentError);
  }

  ngOnInit(): void {
   // Dispatch action to load doctors when the component initializes
    this.store.dispatch(DoctorActions.loadDoctors());
    // Dispatch action to reset the appointment state
    this.store.dispatch(AppointmentActions.resetAppointmentState());

    //  Reset form when appointment is created
    const sub = this.created$
      .pipe(filter(created => created),
      delay(2000) // Delay reset for 2s 
    )
      .subscribe(() => {
        this.appointmentForm.reset();
        this.store.dispatch(AppointmentActions.resetAppointmentState());
      });
   // Add subscription to manage it in OnDestroy
    this.subscriptions.add(sub);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  // Handles form submission
  onSubmit(): void {
    if (this.appointmentForm.valid) {
      const appointment: AppointmentCreate = {
        doctorUserId: this.appointmentForm.value.doctorUserId,
        date: this.appointmentForm.value.date
      };
      // Dispatch action to create appointment
      this.store.dispatch(AppointmentActions.createAppointment({ appointment }));
    }
  }
 // Getters for form controls
  get doctorUserId() {
    return this.appointmentForm.get('doctorUserId');
  }

  get date() {
    return this.appointmentForm.get('date');
  }
}
