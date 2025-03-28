import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import * as DoctorActions from './doctor.actions';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class DoctorEffects {
  
  loadDoctors$ = createEffect(() => this.actions$.pipe(
    ofType(DoctorActions.loadDoctors),
    tap(() => console.log('Doctor Effects: loadDoctors action received')),
    mergeMap(() => this.http.get<any[]>('/api/doctors')
      .pipe(
        tap(response => console.log('Doctor API response:', response)),
        map(doctors => DoctorActions.loadDoctorsSuccess({ doctors })),
        catchError(error => {
          console.error('Error loading doctors:', error);
          return of(DoctorActions.loadDoctorsFailure({ error }));
        })
      ))
  ));
  
  constructor(
    private actions$: Actions,
    private http: HttpClient
  ) {}
}