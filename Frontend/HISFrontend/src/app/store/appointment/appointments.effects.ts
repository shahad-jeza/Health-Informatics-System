import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError, switchMap } from 'rxjs/operators';
import { AppointmentService } from '../../services/appointments/appointment.service';
import * as AppointmentActions from './appointments.actions';
import { AppointmentStatus, Appointment } from '../../models/appointment.model';

@Injectable()
export class AppointmentEffects {

  // Update appointment status 
  updateAppointmentStatus$ = createEffect(() => this.actions$.pipe(
    ofType(AppointmentActions.updateAppointmentStatus),
    switchMap(({ appointmentId, status }) => {
      const updateData = { status };
     
      return this.appointmentService.updateAppointment(appointmentId, updateData).pipe(
        map(appointment => {
          
          if (!appointment) {
            console.warn('Service returned undefined appointment, creating replacement');
            const replacementAppointment: Appointment = {
              id: appointmentId,             
              appointmentId: appointmentId,
              doctorUserId: '',
              patientUserId: '',
              date: '',
              time: '',                      
              status: status
            };
            return AppointmentActions.updateAppointmentStatusSuccess({ appointment: replacementAppointment });
          }
          
          return AppointmentActions.updateAppointmentStatusSuccess({ appointment });
        }),
        catchError(error => {
          console.error('Error updating appointment status:', error);
          return of(AppointmentActions.updateAppointmentStatusFailure({
            error: error.message || 'Failed to update appointment status'
          }));
        })
      );
    })
  ));
  
  loadDoctorAppointments$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(AppointmentActions.loadDoctorAppointments),
      switchMap(action => {
        // Always use the doctorId as a string (which should be a GUID)
        const doctorGuid = String(action.doctorId);
        console.log(`Loading appointments for doctor GUID: ${doctorGuid}`);
        
        return this.appointmentService.getDoctorAppointments(doctorGuid)
          .pipe(
            map(appointments => AppointmentActions.loadDoctorAppointmentsSuccess({ appointments })),
            catchError(error => of(AppointmentActions.loadDoctorAppointmentsFailure({ error: error.message })))
          );
      })
    );
  });
  // Get appointments by patient 
  getAppointmentsByPatient$ = createEffect(() => this.actions$.pipe(
    ofType(AppointmentActions.getAppointmentsByPatient),
    mergeMap(({ patientId }) => {
      return this.appointmentService.getAppointmentsByPatient(patientId).pipe(
        map(appointments => AppointmentActions.getAppointmentsByPatientSuccess({ appointments })),
        catchError(error => of(AppointmentActions.getAppointmentsByPatientFailure({ 
          error: error.message || 'Failed to load patient appointments' 
        })))
      );
    })
  ));

  // Create appointment 
  createAppointment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AppointmentActions.createAppointment),
      mergeMap(({ appointment }) =>
        this.appointmentService.createAppointment(appointment).pipe(
          map(createdAppointment => {
            return AppointmentActions.createAppointmentSuccess({ appointment: createdAppointment });
          }),
          catchError(error => {
            console.error("Error creating appointment in effects:", error);
            return of(AppointmentActions.createAppointmentFailure({ error: error.message }));
          })
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private appointmentService: AppointmentService
  ) {}
}