import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, catchError } from 'rxjs';
import { BookDto, CreateBookDto } from '../../../models/book.dto';
import { ApiResponse } from '../../../models/api-response';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private readonly apiUrl = `${environment.apiUrl}/Books`;

  constructor(private http: HttpClient) {}

  private handleError = (error: HttpErrorResponse): Observable<never> => {
    const message = error.error?.message || error.message || 'Erro desconhecido';
    return throwError(() => ({ ...error, message }));
  }

  getAll(): Observable<ApiResponse<BookDto[]>> {
    return this.http.get<ApiResponse<BookDto[]>>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  getById(id: string): Observable<ApiResponse<BookDto>> {
    return this.http.get<ApiResponse<BookDto>>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  create(dto: CreateBookDto): Observable<ApiResponse<BookDto>> {
    return this.http.post<ApiResponse<BookDto>>(this.apiUrl, dto)
      .pipe(catchError(this.handleError));
  }

  update(id: string, dto: CreateBookDto): Observable<ApiResponse<BookDto>> {
    return this.http.put<ApiResponse<BookDto>>(`${this.apiUrl}/${id}`, dto)
      .pipe(catchError(this.handleError));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }
}
