import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, catchError } from 'rxjs';
import { GenreDto, CreateGenreDto } from '../../../models/genre.dto';
import { ApiResponse } from '../../../models/api-response';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GenreService {
  private readonly apiUrl = `${environment.apiUrl}/Genres`;

  constructor(private http: HttpClient) {}

  private handleError = (error: HttpErrorResponse) => {
    const message = error.error?.message || error.message || 'Erro desconhecido';
    return throwError(() => ({ ...error, message }));
  }

  getAll(): Observable<ApiResponse<GenreDto[]>> {
    return this.http.get<ApiResponse<GenreDto[]>>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  getById(id: string): Observable<ApiResponse<GenreDto>> {
    return this.http.get<ApiResponse<GenreDto>>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  create(dto: CreateGenreDto): Observable<ApiResponse<GenreDto>> {
    return this.http.post<ApiResponse<GenreDto>>(this.apiUrl, dto)
      .pipe(catchError(this.handleError));
  }

  update(id: string, dto: CreateGenreDto): Observable<ApiResponse<GenreDto>> {
    return this.http.put<ApiResponse<GenreDto>>(`${this.apiUrl}/${id}`, dto)
      .pipe(catchError(this.handleError));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }
}
