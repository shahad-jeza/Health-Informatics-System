import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import * as DoctorActions from './doctor.actions';

@Injectable()
export class DoctorEffects {
  private apiUrl = 'http://localhost:5223/api';

  loadDoctors$ = createEffect(() => this.actions$.pipe(
    ofType(DoctorActions.loadDoctors),
    mergeMap(() => this.http.get<any[]>(`${this.apiUrl}/doctor/all`)
      .pipe(
        map(doctors => DoctorActions.loadDoctorsSuccess({ doctors })),
        catchError(error => of(DoctorActions.loadDoctorsFailure({ error })))
      )
    )
  ));

  constructor(private actions$: Actions, private http: HttpClient) {}
}