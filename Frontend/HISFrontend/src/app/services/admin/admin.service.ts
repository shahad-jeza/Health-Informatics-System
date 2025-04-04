// Core imports
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfigService } from '../api-config/api-config.service';

// Data models
export interface DoctorDto {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialty: string;
}

export interface PatientDto {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface AdminSummaryDto {
  doctors: DoctorDto[];
  patients: PatientDto[];
}

/**
 * Service for admin-related operations
 */
@Injectable({
  providedIn: 'root'
})
export class AdminService {
  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService
  ) {}

  /**
   * Fetches summary of system data including doctors and patients
   */
  getSummary(): Observable<AdminSummaryDto> {
    return this.http.get<AdminSummaryDto>(
      this.apiConfig.getEndpoint('Admin/summary'),
      this.apiConfig.httpOptions
    );
  }
}