import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, catchError } from 'rxjs';
import { AuthorDto, CreateAuthorDto } from '../../../models/author.dto';
import { ApiResponse } from '../../../models/api-response';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthorService {
  private readonly apiUrl = `${environment.apiUrl}/Authors`;

  constructor(private http: HttpClient) {}

  private handleError = (error: HttpErrorResponse) => {
    const message = error.error?.message || error.message || 'Erro desconhecido';
    return throwError(() => ({ ...error, message }));
  }

  getAll(): Observable<ApiResponse<AuthorDto[]>> {
    return this.http.get<ApiResponse<AuthorDto[]>>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  getById(id: string): Observable<ApiResponse<AuthorDto>> {
    return this.http.get<ApiResponse<AuthorDto>>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  create(dto: CreateAuthorDto): Observable<ApiResponse<AuthorDto>> {
    return this.http.post<ApiResponse<AuthorDto>>(this.apiUrl, dto)
      .pipe(catchError(this.handleError));
  }

  update(id: string, dto: CreateAuthorDto): Observable<ApiResponse<AuthorDto>> {
    return this.http.put<ApiResponse<AuthorDto>>(`${this.apiUrl}/${id}`, dto)
      .pipe(catchError(this.handleError));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }
}
