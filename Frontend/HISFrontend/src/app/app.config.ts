import { ApplicationConfig, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
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

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes),
    provideHttpClient(withFetch()),
    provideClientHydration(withEventReplay()),
    
    // Register NgRx store
    provideStore({
      appointments: appointmentReducer,
      doctor: doctorReducer,
      notes: notesReducer,
      patients: patientReducer
    }),
    
    // Register effects
    provideEffects([
      AppointmentEffects,
      DoctorEffects,
      NoteEffects,
      PatientEffects

    
    ]),
    
    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode(),
      autoPause: true,
      trace: false,
      traceLimit: 75,
    })
  ]
};