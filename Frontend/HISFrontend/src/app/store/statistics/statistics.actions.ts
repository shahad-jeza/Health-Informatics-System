import { createAction, props } from '@ngrx/store';
import { AdminStatistics } from '../../models/statistics.model';

// Action to load statistics
export const loadStatistics = createAction('[Statistics] Load Statistics');


// Action dispatched when statistics are successfully loaded
export const loadStatisticsSuccess = createAction(
    '[Statistics] Load Statistics Success',
    props<{ data: AdminStatistics }>()
  );


  // Action dispatched when there is an error loading statistics
  export const loadStatisticsFailure = createAction(
    '[Statistics] Load Statistics Failure',
    props<{ error: string }>()
  );