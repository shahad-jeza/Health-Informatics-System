import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { AdminStatistics } from '../../models/statistics.model';
@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  private apiUrl = 'https://health-informatics-system.onrender.com/api/Admin/statistics'; 

  constructor(private http: HttpClient) { }

  // Fetches the statistics data from the API
  getStatistics(): Observable<AdminStatistics> {
    return this.http.get<AdminStatistics>(this.apiUrl).pipe(
      tap((data) => console.log('Statistics Data:', data)) // debuggg
    );
  }
}
