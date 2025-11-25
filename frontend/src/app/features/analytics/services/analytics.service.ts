import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GoLink } from '../../golink/models/golink.model';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/analytics';

  getStats(id: string, from?: string, to?: string): Observable<number> {
    let params = new HttpParams();
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);

    return this.http.get<number>(`${this.apiUrl}/stats/${id}`, { params });
  }

  getTopLinks(from?: string, to?: string, limit: number = 10): Observable<GoLink[]> {
    let params = new HttpParams().set('limit', limit);
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);

    return this.http.get<GoLink[]>(`${this.apiUrl}/top`, { params });
  }
}
