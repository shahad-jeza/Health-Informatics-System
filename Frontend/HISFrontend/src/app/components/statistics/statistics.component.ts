import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectError, selectLoading, selectTodayAppointments, selectTotalDoctors, selectTotalPatients, selectWeeklyAppointments } from '../../store/statistics/statistics.selectors';
import * as StatisticsActions from '../../store/statistics/statistics.actions'
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-statistics',
  imports: [CommonModule],
  templateUrl: './statistics.component.html',
  styleUrl: './statistics.component.css'
})
export class StatisticsComponent implements OnInit {

  // Observable properties to hold statistics data
  totalDoctors$: Observable<number>;
  totalPatients$: Observable<number>;
  todayAppointments$: Observable<number>;
  weeklyAppointments$: Observable<number>;

  loading$: Observable<boolean>;
  error$: Observable<string | null>;

  constructor(private store: Store) {
   // Select data from NgRx store

  this.totalDoctors$ = this.store.select(selectTotalDoctors);
  this.totalPatients$ = this.store.select(selectTotalPatients);
  this.todayAppointments$ = this.store.select(selectTodayAppointments);
  this.weeklyAppointments$ = this.store.select(selectWeeklyAppointments);

 this.loading$ = this.store.select(selectLoading);
 this.error$ = this.store.select(selectError); 
  }

  ngOnInit(): void {
   // Dispatch an action to load statistics when the component initializes

    this.store.dispatch(StatisticsActions.loadStatistics());
  }
}
