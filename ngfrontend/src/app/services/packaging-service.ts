import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {environment} from '../environments/environment';
import {PackagingTemplateResponse, PackagingTemplateSummary} from '../models/Packaging';


@Injectable({ providedIn: 'root' })
export class PackagingService {

  private readonly adminBaseUrl = `${environment.apiUrl}/api/admin/packaging-templates`;
  private readonly baseUrl = `${environment.apiUrl}/api/packaging-templates`;

  constructor(private http: HttpClient) {}

  createTemplate(productId: number, name: string, svgFlat: File, svgPerspective?: File): Observable<PackagingTemplateResponse> {
    const form = new FormData();
    form.append('productId', String(productId));
    form.append('name', name);
    form.append('svgFlat', svgFlat);
    if (svgPerspective) form.append('svgPerspective', svgPerspective);
    return this.http.post<PackagingTemplateResponse>(this.adminBaseUrl, form);
  }

  listAllTemplates(): Observable<PackagingTemplateSummary[]> {
    return this.http.get<PackagingTemplateSummary[]>(this.adminBaseUrl);
  }

  saveLabels(templateId: number, colorGroupLabels: { id: number; label: string }[],
             logoZoneLabels: { id: number; label: string }[]): Observable<void> {
    return this.http.put<void>(`${this.adminBaseUrl}/${templateId}/labels`, {
      colorGroupLabels,
      logoZoneLabels
    });
  }

  replaceSvg(templateId: number, svgFlat: File, svgPerspective?: File): Observable<PackagingTemplateResponse> {
    const form = new FormData();
    form.append('svgFlat', svgFlat);
    if (svgPerspective) form.append('svgPerspective', svgPerspective);
    return this.http.put<PackagingTemplateResponse>(`${this.adminBaseUrl}/${templateId}/svg`, form);
  }

  deleteTemplate(templateId: number): Observable<void> {
    return this.http.delete<void>(`${this.adminBaseUrl}/${templateId}`);
  }

  listTemplatesForProduct(productId: number): Observable<PackagingTemplateSummary[]> {
    return this.http.get<PackagingTemplateSummary[]>(this.baseUrl, { params: { productId } });
  }

  getTemplate(id: number): Observable<PackagingTemplateResponse> {
    return this.http.get<PackagingTemplateResponse>(`${this.baseUrl}/${id}`);
  }
}
