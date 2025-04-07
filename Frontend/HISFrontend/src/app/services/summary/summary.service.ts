import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdminSummaryDto } from '../../models/summary.model';

@Injectable({
  providedIn: 'root'
})
export class SummaryService {
  private apiUrl = 'http://localhost:5219/api/Admin/summary'; // 

  constructor(private http: HttpClient) { }
  // Fetches the summary data from the API
  getSummary(): Observable<AdminSummaryDto> {
    return this.http.get<AdminSummaryDto>(this.apiUrl);
  }
}