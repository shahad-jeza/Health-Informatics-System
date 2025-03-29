import { Component, OnInit } from '@angular/core';
import { AppointmentService } from '../../../services/appointments/appointment.service';
import { DoctorService } from '../../../services/doctor/doctor.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { User } from '../../../models/user.model';
import { Appointment } from '../../../models/appointment.model';

@Component({
  selector: 'app-book-appointment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './book-appointment.component.html',
  styleUrls: ['./book-appointment.component.css']
})
export class BookAppointmentComponent implements OnInit {
  selectedAppointmentId: string = '';
  appointmentOptions: { value: string, label: string }[] = [];
  loading: boolean = false;
  error: boolean = false;
  
  constructor(
    private appointmentService: AppointmentService,
    private doctorService: DoctorService
  ) {}
  
  ngOnInit(): void {
    this.loadAvailableAppointments();
  }
  
  loadAvailableAppointments(): void {
    this.loading = true;
    this.error = false;
    
    // Use forkJoin to get both appointments and doctors in parallel
    forkJoin({
      appointments: this.appointmentService.getAvailableAppointments(),
      doctors: this.doctorService.getAllDoctors()
    }).subscribe({
      next: ({ appointments, doctors }) => {

        const doctorMap = new Map();
        doctors.forEach(doctor => {
          doctorMap.set(doctor.id, doctor);
        });
        
        this.appointmentOptions = appointments.map(appointment => {
          const value = `${appointment.id}`;
          
          // Get doctor from map
          const doctor = doctorMap.get(appointment.doctorId);
          
          let doctorName = 'Unknown Doctor';
          if (doctor) {
            if (doctor.firstName && doctor.lastName) {
              doctorName = `Dr. ${doctor.firstName} ${doctor.lastName}`;
            } else if (doctor.name) {
              const nameParts = doctor.name.replace(/^Dr\.\s+/, '').split(' ');
              if (nameParts.length >= 2) {
                doctorName = `Dr. ${nameParts[0]} ${nameParts.slice(1).join(' ')}`;
              } else {
                doctorName = doctor.name; 
              }
            } else {
              doctorName = `Doctor (ID: ${doctor.id})`;
            }

            if (doctor.specialization) {
              doctorName += ` (${doctor.specialization})`;
            }
          }
          
          const label = `${doctorName} - ${appointment.date} at ${appointment.time}`;
          
          return { value, label };
        });
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading data:', error);
        this.error = true;
        this.loading = false;
      }
    });
  }
  
  bookAppointment(): void {
    if (!this.selectedAppointmentId) {
      alert('Please select an appointment slot');
      return;
    }
    
    const appointmentId = parseInt(this.selectedAppointmentId);
    console.log('Booking appointment ID:', appointmentId);
    

    this.appointmentService.bookAppointment(appointmentId, 1) // 1 is mock patient ID
      .subscribe({
        next: (result) => {
          console.log('Appointment booked successfully:', result);
          alert('Appointment booked successfully!');
          this.selectedAppointmentId = '';
          // Reload available appointments
          this.loadAvailableAppointments();
        },
        error: (error) => {
          console.error('Error booking appointment:', error);
          console.error('Error details:', error.error);
          
          let errorMsg = 'Failed to book appointment. ';
          
          if (error.status === 404) {
            errorMsg += 'The appointment was not found.';
          } else if (error.status === 400) {
            errorMsg += `Invalid appointment data: ${JSON.stringify(error.error)}`;
          } else if (error.status === 403) {
            errorMsg += 'You do not have permission to book this appointment.';
          } else if (error.status === 409) {
            errorMsg += 'This appointment has already been booked.';
          } else {
            errorMsg += 'Please try again later.';
          }
          
          alert(errorMsg);
        }
      });
  }
}