import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { DoctorDashboardComponent } from './components/dashboards/doctor-dashboard/doctor-dashboard.component';
import { PatientDashboardComponent } from './components/dashboards/patient-dashboard/patient-dashboard.component';
import { AdminDashboardComponent } from './components/dashboards/admin-dashboard/admin-dashboard.component';
import { adminGuard } from './guards/admin.guard';
import { patientGuard } from './guards/patient.guard';
import { doctorGuard } from './guards/doctor.guard';


export const routes: Routes = [
  { path: '', component: HomeComponent },      // Default route
  { path: 'login', component: LoginComponent },      
  {path: 'doctor',
  component: DoctorDashboardComponent,
  canActivate: [doctorGuard], 
},

{ 
  path: 'patient', 
  component: PatientDashboardComponent,
  canActivate: [patientGuard] 
},
  { 
    path: 'admin', 
    loadComponent: () => AdminDashboardComponent,
    canActivate: [adminGuard] 
  },

  { path: '**', redirectTo: '' }, // catch-all route
];
