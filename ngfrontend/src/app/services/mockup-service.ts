import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import {MockupProjectDTO, MockupProjectRequestDTO, ProductColorisDTO} from '../models/mockup';

@Injectable({ providedIn: 'root' })
export class MockupService {

  private baseUrl = `${environment.apiUrl}/mockup-projects`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<MockupProjectDTO[]> {
    return this.http.get<MockupProjectDTO[]>(this.baseUrl);
  }

  getById(id: number): Observable<MockupProjectDTO> {
    return this.http.get<MockupProjectDTO>(`${this.baseUrl}/${id}`);
  }

  getCurrent(): Observable<MockupProjectDTO> {
    return this.http.get<MockupProjectDTO>(`${this.baseUrl}/current`);
  }

  getColorisByProduct(productId: number): Observable<ProductColorisDTO[]> {
    return this.http.get<ProductColorisDTO[]>(`${environment.apiUrl}/products/${productId}/coloris`);
  }

  create(dto: MockupProjectRequestDTO): Observable<MockupProjectDTO> {
    return this.http.post<MockupProjectDTO>(this.baseUrl, dto);
  }

  update(id: number, dto: MockupProjectRequestDTO): Observable<MockupProjectDTO> {
    return this.http.put<MockupProjectDTO>(`${this.baseUrl}/${id}`, dto);
  }

  saveDraft(id: number, brouillonMaquette: string, nomProjet?: string): Observable<MockupProjectDTO> {
    return this.http.put<MockupProjectDTO>(`${this.baseUrl}/${id}/draft`, {
      brouillonMaquette,
      nomProjet
    });
  }

  duplicate(id: number): Observable<MockupProjectDTO> {
    return this.http.post<MockupProjectDTO>(`${this.baseUrl}/${id}/duplicate`, {});
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  uploadLogo(id: number, file: File): Observable<{ path: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ path: string }>(`${this.baseUrl}/${id}/logos`, formData);
  }

  uploadPdfLogo(id: number, pdfFile: File, previewImage: File): Observable<{ path: string }> {
    const formData = new FormData();
    formData.append('pdfFile', pdfFile);
    formData.append('previewImage', previewImage);
    return this.http.post<{ path: string }>(`${this.baseUrl}/${id}/logos/pdf`, formData);
  }

  deleteLogo(projectId: number, logoId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${projectId}/logos/${logoId}`);
  }
}
