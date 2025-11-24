import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GoLink } from '../models/golink.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GoLinkService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/golinks';

  goLinks = signal<GoLink[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);

  loadAll(): void {
    this.isLoading.set(true);
    this.error.set(null);
    
    this.http.get<GoLink[]>(this.baseUrl).subscribe({
      next: (links) => {
        this.goLinks.set(links);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load GoLinks');
        this.isLoading.set(false);
        console.error('Error loading GoLinks:', err);
      }
    });
  }

  getById(id: string): Observable<GoLink> {
    return this.http.get<GoLink>(`${this.baseUrl}/${id}`);
  }

  create(goLink: Partial<GoLink>): Observable<GoLink> {
    return this.http.post<GoLink>(this.baseUrl, goLink);
  }

  update(id: string, goLink: Partial<GoLink>, etag: string): Observable<GoLink> {
    return this.http.put<GoLink>(`${this.baseUrl}/${id}`, goLink, {
      headers: { 'If-Match': etag }
    });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

