import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable , of } from 'rxjs';
import { environment } from '../environments/environment';

export interface UploadResponse {
  path: string;
}

export interface UploadMultipleResponse {
  paths: string[];
}

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  private uploadUrl = `${environment.apiUrl}/uploads`;

  constructor(private http: HttpClient) { }

  uploadMainImage(file: File, productName: string): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('productName', productName);
    return this.http.post<UploadResponse>(`${this.uploadUrl}/product/main-image`, formData);
  }

  uploadGallery(files: File[], productName: string): Observable<UploadMultipleResponse> {
    if (!files.length) return of({ paths: [] });
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append('productName', productName);
    return this.http.post<UploadMultipleResponse>(`${this.uploadUrl}/product/gallery`, formData);
  }

  uploadAchievements(files: File[], productName: string): Observable<UploadMultipleResponse> {
    if (!files.length) return of({ paths: [] });
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append('productName', productName);
    return this.http.post<UploadMultipleResponse>(`${this.uploadUrl}/product/achievements`, formData);
  }
}
