// statistics.selectors.ts
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { StatisticsState } from './statistics.reducer';

//  Create a feature selector
export const selectStatisticsState = createFeatureSelector<StatisticsState>('statistics');


//// Selector to get the entire statistics
export const selectStatistics = createSelector(
  selectStatisticsState,
  (state: StatisticsState) => state.data
);

// Selector to check if the statistics data is currently loaded

export const selectLoading = createSelector(
  selectStatisticsState,
  (state: StatisticsState) => state.loading
);

// Selector to get the error message if loading statistics fails

export const selectError = createSelector(
  selectStatisticsState,
  (state: StatisticsState) => state.error
);

// Selector to get the total number of doctors
export const selectTotalDoctors = createSelector(
  selectStatistics,
  (stats) => stats?.totalDoctors || 0
);

// Selector to get the total number of patients
export const selectTotalPatients = createSelector(
  selectStatistics,
  (stats) => stats?.totalPatients || 0
);

// Selector to get the total number of appointments today
export const selectTodayAppointments = createSelector(
  selectStatistics,
  (stats) => stats?.todayAppointments || 0
);

// Selector to get the total number of appointments this week
export const selectWeeklyAppointments = createSelector(
  selectStatistics,
  (stats) => stats?.weeklyAppointments || 0
);

// Selector to get the appointment status statistics
export const selectAppointmentStatusStats = createSelector(
  selectStatistics,
  (stats) => stats?.appointmentStatusStats || []
);

export const selectPopularSpecialties = createSelector(
  selectStatistics,
  (stats) => stats?.popularSpecialties || []
);