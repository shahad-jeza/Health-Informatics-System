import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoginComponent } from "./components/login/login.component";
import { PatientDashboardComponent } from './components/dashboards/patient-dashboard/patient-dashboard.component';
import { HeaderComponent } from './components/header/header.component';
import { DoctorDashboardComponent } from './components/dashboards/doctor-dashboard/doctor-dashboard.component';
import { AdminDashboardComponent } from "./components/dashboards/admin-dashboard/admin-dashboard.component";
import { HomeComponent } from './components/home/home.component';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [AdminDashboardComponent, HeaderComponent, DoctorDashboardComponent, PatientDashboardComponent, LoginComponent, HomeComponent,RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'HISFrontend';
}