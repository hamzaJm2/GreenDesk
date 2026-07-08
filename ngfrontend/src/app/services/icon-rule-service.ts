import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface IconRule {
  id?: number;
  label: string;
  iconId: string;
  keywords: string[];
}

@Injectable({ providedIn: 'root' })
export class IconRuleService {
  private apiUrl = `${environment.apiUrl}/icon-rules`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<IconRule[]> {
    return this.http.get<IconRule[]>(this.apiUrl);
  }

  create(rule: IconRule): Observable<IconRule> {
    return this.http.post<IconRule>(this.apiUrl, rule);
  }

  update(id: number, rule: IconRule): Observable<IconRule> {
    return this.http.put<IconRule>(`${this.apiUrl}/${id}`, rule);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  resolve(text: string): Observable<{ iconId: string }> {
    return this.http.get<{ iconId: string }>(`${this.apiUrl}/resolve`, { params: { text } });
  }
}
