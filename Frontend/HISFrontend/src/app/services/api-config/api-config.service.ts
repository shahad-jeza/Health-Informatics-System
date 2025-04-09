import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiConfigService {
  private _apiUrl: string;

  constructor() {
    // Set the API URL from environment
    this._apiUrl = environment.apiUrl || 'https://health-informatics-system.onrender.com/api';
  }

  get apiUrl(): string {
    return this._apiUrl;
  }

  get httpOptions() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
  }

  getEndpoint(path: string): string {
    // Ensure there's no double slash between base URL and path
    if (this._apiUrl.endsWith('/') && path.startsWith('/')) {
      path = path.substring(1);
    } else if (!this._apiUrl.endsWith('/') && !path.startsWith('/')) {
      path = '/' + path;
    }
    
    return `${this._apiUrl}${path}`;
  }
}