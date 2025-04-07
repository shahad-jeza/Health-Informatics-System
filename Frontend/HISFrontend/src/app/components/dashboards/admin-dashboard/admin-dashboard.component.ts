import { Component } from '@angular/core';
import { StatisticsComponent } from "../../statistics/statistics.component";
import { ChartsComponent } from "../../charts/charts.component";
import { AddAppointmentComponent } from "../../add-appointment/add-appointment.component";
import { DoctorSummaryComponent } from "../../doctor-summary/doctor-summary.component";

@Component({
  selector: 'app-admin-dashboard',
  imports: [StatisticsComponent, DoctorSummaryComponent, AddAppointmentComponent, ChartsComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent {

}
