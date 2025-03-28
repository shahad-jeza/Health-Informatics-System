import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PatientDashboardComponent } from './components/dashboards/patient-dashboard/patient-dashboard.component';
import { HeaderComponent } from './components/header/header.component';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, PatientDashboardComponent, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'dashboardDemo';
}