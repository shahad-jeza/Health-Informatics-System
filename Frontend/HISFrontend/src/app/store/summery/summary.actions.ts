import { createAction, props } from '@ngrx/store';
import { AdminSummaryDto } from '../../models/summary.model';
// Action to load summary
export const loadSummary = createAction('[Summary] Load Summary');

// Action dispatched when summary is successfully loaded
export const loadSummarySuccess = createAction(
  '[Summary] Load Summary Success',
  props<{ summary: AdminSummaryDto }>()
);

// Action dispatched when there is an error loading summary
export const loadSummaryFailure = createAction(
  '[Summary] Load Summary Failure',
  props<{ error: any }>()
);