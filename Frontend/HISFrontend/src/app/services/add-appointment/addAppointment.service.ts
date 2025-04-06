import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppointmentCreate } from '../../models/addAppointment.model';

@Injectable({
  providedIn: 'root'
})
export class AddAppointmentService {
  private apiUrl = `https://localhost:44313/api/Appointment`; //todo

  constructor(private http: HttpClient) { }
  //post request to create an appointment
  createAppointment(appointment: AppointmentCreate): Observable<any> {
    return this.http.post<any>(this.apiUrl, appointment);
  }
}