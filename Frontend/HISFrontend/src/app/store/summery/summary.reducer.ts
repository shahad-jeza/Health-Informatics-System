import { createReducer, on } from '@ngrx/store';
import { loadSummary, loadSummarySuccess, loadSummaryFailure } from './summary.actions';
import { initialState } from './summary.state';

export const summaryReducer = createReducer(
  initialState,
  // Handle the loading of summary
  on(loadSummary, (state) => ({ ...state, loading: true, error: null })),

  // Handle the success of loading summary
  on(loadSummarySuccess, (state, { summary }) => ({
    ...state,
    summary,
    loading: false
  })),
  
  // Handle the failure of loading summary
  on(loadSummaryFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false
  }))
);