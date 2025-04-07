// statistics.effects.ts
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { StatisticsService } from '../../services/staistics/statistics.service';
import * as StatisticsActions from './statistics.actions';

@Injectable()
export class StatisticsEffects {
  // Effect to handle the loading of statistics
  loadStatistics$ = createEffect(() =>
    this.actions$.pipe(
      ofType(StatisticsActions.loadStatistics),
      mergeMap(() =>
        this.statisticsService.getStatistics().pipe(
          map((data) => StatisticsActions.loadStatisticsSuccess({ data })),
          catchError((error) => of(StatisticsActions.loadStatisticsFailure({ error: error.message })))
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private statisticsService: StatisticsService
  ) { }
}