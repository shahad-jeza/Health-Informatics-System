import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { PatientService } from '../../services/patient/patient.service';
import * as PatientActions from './patient.actions';

@Injectable()
export class PatientEffects {
  // Effect to load all patients using the service's getAllPatients method
  loadPatients$ = createEffect(() => this.actions$.pipe(
    ofType(PatientActions.loadPatients),
    switchMap(() => this.patientService.getAllPatients().pipe(
      map(patients => PatientActions.loadPatientsSuccess({ patients })),
      catchError(error => of(PatientActions.loadPatientsFailure({ 
        error: error.message || 'Failed to load patients' 
      })))
    ))
  ));

  constructor(
    private actions$: Actions,
    private patientService: PatientService
  ) {}
}