import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MedicalRecord } from '../../models/medical-record.model';
import { ApiConfigService } from '../api-config/api-config.service';

@Injectable({
  providedIn: 'root'
})
export class MedicalHistoryService {
  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService
  ) { }

  // Get patient medical history - GET /api/MedicalHistory/{patientUserId}
  getPatientHistory(patientUserId: string): Observable<MedicalRecord> {
    return this.http.get<MedicalRecord>(
      this.apiConfig.getEndpoint(`MedicalHistory/${patientUserId}`),
      this.apiConfig.httpOptions
    );
  }

  // Update patient medical history -  PUT /api/MedicalHistory/{patientUserId}
  updatePatientHistory(patientUserId: string, record: MedicalRecord): Observable<MedicalRecord> {
    return this.http.put<MedicalRecord>(
      this.apiConfig.getEndpoint(`MedicalHistory/${patientUserId}`),
      record,
      this.apiConfig.httpOptions
    );
  }
}