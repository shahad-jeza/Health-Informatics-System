import { ApplicationConfig, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch,withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';

import { appointmentReducer } from './store/appointment/appointments.reducer';
import { doctorReducer } from './store/doctor/doctor.reducer';
import { notesReducer } from './store/note/notes.reducer';
import { patientReducer } from './store/patient/patient.reducer'; 

import { AppointmentEffects } from './store/appointment/appointments.effects';
import { DoctorEffects } from './store/doctor/doctor.effects';
import { NoteEffects } from './store/note/notes.effects';
import { PatientEffects } from './store/patient/patient.effects';
import { addAppointmentReducer } from './store/add-appointment/add-appointment.reducer';
import { summaryReducer } from './store/summery/summary.reducer';
import { statisticsReducer } from './store/statistics/statistics.reducer';
import { addAppointmentEffects } from './store/add-appointment/add-appointment.effects';
import { SummaryEffects } from './store/summery/summary.effects';
import { StatisticsEffects } from './store/statistics/statistics.effects';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { jwtInterceptor } from './interceptors/jwt.interceptor';
import { doctorGuard } from './guards/doctor.guard';
import { patientGuard } from './guards/patient.guard';
import { adminGuard } from './guards/admin.guard';


export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes),
    provideHttpClient(
      withFetch(), // Enable Fetch API
      withInterceptors([jwtInterceptor]) // Add JWT interceptor
    ),
    provideClientHydration(withEventReplay()),
    provideCharts(withDefaultRegisterables()),
    { provide: doctorGuard, useValue: doctorGuard },
    { provide: patientGuard, useValue: patientGuard },
    { provide: adminGuard, useValue: adminGuard },


    
    // Register NgRx store
    provideStore({
      appointments: appointmentReducer,
      doctor: doctorReducer,
      notes: notesReducer,
      patients: patientReducer,
      appointment: addAppointmentReducer,
      summary: summaryReducer,
      statistics: statisticsReducer
    }),
    
    // Register effects
    provideEffects([
      AppointmentEffects,
      DoctorEffects,
      NoteEffects,
      PatientEffects,
      addAppointmentEffects,
      SummaryEffects,
      StatisticsEffects,

    
    ]),
    
    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode(),
      autoPause: true,
      trace: false,
      traceLimit: 75,
    }), provideCharts(withDefaultRegisterables())
  ]
};