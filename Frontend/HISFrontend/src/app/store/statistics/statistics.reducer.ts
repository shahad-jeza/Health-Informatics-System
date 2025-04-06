import { createReducer, on } from '@ngrx/store';
import { AdminStatistics } from '../../models/statistics.model';
import * as StatisticsActions from './statistics.actions';


// Initial state for the statistics

export interface StatisticsState {
  data: AdminStatistics | null;
  loading: boolean;
  error: string | null;
}

export const initialState: StatisticsState = {
  data: null,
  loading: false,
  error: null
};

export const statisticsReducer = createReducer(
  initialState,
// Handle the loading of statistics
  on(StatisticsActions.loadStatistics, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
// Handle the success of loading statistics
  on(StatisticsActions.loadStatisticsSuccess, (state, { data }) => ({
    ...state,
    data,
    loading: false
  })),
// Handle the failure of loading statistics
  on(StatisticsActions.loadStatisticsFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false
  }))
);

