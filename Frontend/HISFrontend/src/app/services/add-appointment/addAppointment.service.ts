import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppointmentCreate } from '../../models/addAppointment.model';

@Injectable({
  providedIn: 'root'
})
export class AddAppointmentService {
  private apiUrl = `http://localhost:5219/api/Appointment`; 

  constructor(private http: HttpClient) { }
  //post request to create an appointment
  createAppointment(appointment: AppointmentCreate): Observable<any> {
    return this.http.post<any>(this.apiUrl, appointment);
  }
}