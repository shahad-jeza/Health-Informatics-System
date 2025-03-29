import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MedicalRecord {
  id: number;
  historyID: string;
  diagnosis: string;
  allergies: string;
  medicines: string;
  patientId: number;
}

@Injectable({
  providedIn: 'root'
})
export class MedicalHistoryService {
  private apiUrl = 'http://localhost:5223/api';

  constructor(private http: HttpClient) { }

  // Get patient medical history - matches GET /api/history/patient/{patientId}
  getPatientHistory(patientId: number): Observable<MedicalRecord[]> {
    return this.http.get<MedicalRecord[]>(`${this.apiUrl}/history/patient/${patientId}`);
  }

  // Update patient medical history - matches PUT /api/history/patient/{patientId}
  updatePatientHistory(patientId: number, record: MedicalRecord): Observable<MedicalRecord> {
    return this.http.put<MedicalRecord>(`${this.apiUrl}/history/patient/${patientId}`, record);
  }
}