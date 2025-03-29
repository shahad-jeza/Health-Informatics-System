import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError, switchMap, concatMap } from 'rxjs/operators';
import { AppointmentService } from '../../services/appointments/appointment.service';
import { DoctorService } from '../../services/doctor/doctor.service';
import * as AppointmentActions from './appointments.actions';
import { Appointment } from '../../models/appointment.model';
import { User } from '../../models/user.model';
import { Store } from '@ngrx/store';
@Injectable()
export class AppointmentEffects {
  // Load appointments by type
  loadAppointments$ = createEffect(() => this.actions$.pipe(
    ofType(AppointmentActions.loadAppointments),
    mergeMap(({ appointmentType }) => {
      const patientId = 1;
      
      return this.appointmentService.getAppointmentsByPatient(patientId).pipe(
        map((appointments: Appointment[]) => {
          // Filter appointments based on type (past or upcoming)
          let filteredAppointments: Appointment[];
          
          if (appointmentType === 'upcoming') {
            filteredAppointments = this.filterUpcomingAppointments(appointments);
          } else {
            filteredAppointments = this.filterPastAppointments(appointments);
          }
          
          return AppointmentActions.loadAppointmentsSuccess({
            appointmentType,
            appointments: filteredAppointments
          });
        }),
        catchError(error => of(AppointmentActions.loadAppointmentsFailure({ 
          error: error.message || 'Failed to load appointments' 
        })))
      );
    })
  ));

  // Cancel an appointment
  cancelAppointment$ = createEffect(() => this.actions$.pipe(
    ofType(AppointmentActions.cancelAppointment),
    switchMap(({ appointmentId }) =>
      this.appointmentService.cancelAppointment(appointmentId).pipe(
        concatMap((appointment: Appointment) => {
          console.log('Appointment canceled successfully in effect:', appointment);
          return [
            AppointmentActions.cancelAppointmentSuccess({ appointmentId }),
            AppointmentActions.loadAvailableAppointments()
          ];
        }),
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

  loadAvailableSlots$ = createEffect(() => this.actions$.pipe(
    ofType(AppointmentActions.loadAvailableSlots),
    mergeMap(() => this.doctorService.getAllDoctors().pipe(
      map(doctors => {
        return AppointmentActions.loadAvailableSlotsSuccess({ doctors });
      }),
      catchError(error => of(AppointmentActions.loadAvailableSlotsFailure({
        error: error.message || 'Failed to load available doctors'
      })))
    ))
  ));

  loadAvailableAppointments$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(AppointmentActions.loadAvailableAppointments),
      switchMap(() => {
        return this.appointmentService.getAvailableAppointments().pipe(
          map(appointments => AppointmentActions.loadAvailableAppointmentsSuccess({ appointments })),
          catchError(error => of(AppointmentActions.loadAvailableAppointmentsFailure({ error })))
        );
      })
    );
  });

createAppointment$ = createEffect(() => this.actions$.pipe(
  ofType(AppointmentActions.createAppointment),
  switchMap(({ appointment }) => 
    this.appointmentService.createAppointment(appointment).pipe(
      map(createdAppointment => AppointmentActions.bookAppointmentSuccess({ 
        appointment: createdAppointment 
      })),
      catchError(error => of(AppointmentActions.bookAppointmentFailure({
        error: error.message || 'Failed to create appointment'
      })))
    )
  )
));

  // Book an appointment
  bookAppointment$ = createEffect(() => this.actions$.pipe(
    ofType(AppointmentActions.bookAppointment),
    switchMap(({ appointmentId, patientId }) => {
      const newAppointment: Appointment = {
        id: 0, 
        appointmentId: `AP-${Date.now()}`, 
        doctorId: appointmentId, 
        patientId: patientId,
        date: new Date().toISOString().split('T')[0], 
        time: '09:00', 
        status: 'scheduled'
      };
      
      return this.appointmentService.createAppointment(newAppointment).pipe(
        map((appointment: Appointment) => AppointmentActions.bookAppointmentSuccess({ appointment })),
        catchError(error => of(AppointmentActions.bookAppointmentFailure({
          error: error.message || 'Failed to book appointment'
        })))
      );
    })
  ));

  // Helper methods for filtering appointments
  private filterUpcomingAppointments(appointments: Appointment[]): Appointment[] {
    const today = new Date();
    return appointments.filter(appointment => {
      if (appointment.status === 'canceled') {
        return false;
      }
      
      const appointmentDate = new Date(appointment.date);
      return appointmentDate > today || 
        (appointmentDate.setHours(0,0,0,0) === today.setHours(0,0,0,0) && 
         this.isTimeAfterNow(appointment.time));
    });
  }

  private filterPastAppointments(appointments: Appointment[]): Appointment[] {
    const today = new Date();
    return appointments.filter(appointment => {
      if (appointment.status === 'canceled') {
        return true;
      }
      const appointmentDate = new Date(appointment.date);
      return appointmentDate < today || 
        (appointmentDate.setHours(0,0,0,0) === today.setHours(0,0,0,0) && 
         !this.isTimeAfterNow(appointment.time));
    });
  }

  private isTimeAfterNow(timeString: string): boolean {
    const now = new Date();
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours > now.getHours() || (hours === now.getHours() && minutes > now.getMinutes());
  }

  constructor(
    private actions$: Actions,
    private appointmentService: AppointmentService,
    private doctorService: DoctorService,
    private store: Store 
  ) {}
}