import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError, switchMap } from 'rxjs/operators';
import { AppointmentService } from '../../services/appointments/appointment.service';
import * as AppointmentActions from './appointments.actions';
import { Appointment } from '../../models/appointment.model';

@Injectable()
export class AppointmentEffects {
  // Load appointments by type
  loadAppointments$ = createEffect(() => this.actions$.pipe(
    ofType(AppointmentActions.loadAppointments),
    mergeMap(({ appointmentType }) =>
      this.appointmentService.getFilteredAppointments(appointmentType).pipe(
        map((appointments: Appointment[]) => AppointmentActions.loadAppointmentsSuccess({
          appointmentType,
          appointments
        })),
        catchError(error => of(AppointmentActions.loadAppointmentsFailure({ error: error.message })))
      )
    )
  ));

  // Cancel an appointment
  cancelAppointment$ = createEffect(() => this.actions$.pipe(
    ofType(AppointmentActions.cancelAppointment),
    switchMap(({ appointmentId }) =>
      this.appointmentService.cancelAppointment(appointmentId).pipe(
        map(() => AppointmentActions.cancelAppointmentSuccess({ appointmentId })),
        catchError(error => of(AppointmentActions.cancelAppointmentFailure({
          error: error.message || 'Failed to cancel appointment'
        })))
      )
    )
  ));

  // Reschedule an appointment
  rescheduleAppointment$ = createEffect(() => this.actions$.pipe(
    ofType(AppointmentActions.rescheduleAppointment),
    switchMap(({ appointmentId, date, time }) =>
      this.appointmentService.rescheduleAppointment(appointmentId, date, time).pipe(
        map((appointment: Appointment) => AppointmentActions.rescheduleAppointmentSuccess({ appointment })),
        catchError(error => of(AppointmentActions.rescheduleAppointmentFailure({
          error: error.message || 'Failed to reschedule appointment'
        })))
      )
    )
  ));

  // Load available appointment slots
  loadAvailableSlots$ = createEffect(() => this.actions$.pipe(
    ofType(AppointmentActions.loadAvailableSlots),
    mergeMap(() => this.appointmentService.getAvailableAppointmentSlots().pipe(
      map((appointments: Appointment[]) => AppointmentActions.loadAvailableSlotsSuccess({ appointments })),
      catchError(error => of(AppointmentActions.loadAvailableSlotsFailure({
        error: error.message || 'Failed to load available appointment slots'
      })))
    ))
  ));

  // Book an appointment
  bookAppointment$ = createEffect(() => this.actions$.pipe(
    ofType(AppointmentActions.bookAppointment),
    switchMap(({ appointmentId, patientId }) =>
      this.appointmentService.bookAppointment(appointmentId, patientId).pipe(
        map((appointment: Appointment) => AppointmentActions.bookAppointmentSuccess({ appointment })),
        catchError(error => of(AppointmentActions.bookAppointmentFailure({
          error: error.message || 'Failed to book appointment'
        })))
      )
    )
  ));

  constructor(
    private actions$: Actions,
    private appointmentService: AppointmentService
  ) {}
}