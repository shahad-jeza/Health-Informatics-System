import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError } from 'rxjs/operators';
import { DoctorService } from '../../services/doctor/doctor.service';
import * as DoctorActions from './doctor.actions';

@Injectable()
export class DoctorEffects {

  loadDoctors$ = createEffect(() => this.actions$.pipe(
    ofType(DoctorActions.loadDoctors),
    mergeMap(() => this.doctorService.getAllDoctors()
      .pipe(
        map(doctors => DoctorActions.loadDoctorsSuccess({ doctors })),
        catchError(error => of(DoctorActions.loadDoctorsFailure({ error })))
      )
    )
  ));

  constructor(
    private actions$: Actions,
    private doctorService: DoctorService
  ) {}
}