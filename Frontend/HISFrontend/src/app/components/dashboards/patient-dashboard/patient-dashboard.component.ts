import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentComponent } from '../../appointments/appointment/appointment.component';
import { BookAppointmentComponent } from '../../appointments/book-appointment/book-appointment.component';
import { PatientSummaryComponent } from '../../notes/patient-summary/patient-summary.component';

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [CommonModule, AppointmentComponent, BookAppointmentComponent, PatientSummaryComponent],
  templateUrl: './patient-dashboard.component.html',
  styleUrls: ['./patient-dashboard.component.css'],
})
export class PatientDashboardComponent {

}