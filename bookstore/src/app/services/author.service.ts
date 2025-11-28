import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, catchError } from 'rxjs';
import { AuthorDto, CreateAuthorDto } from '../models/author.dto';
import { ApiResponse } from '../models/api-response';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthorService {
  private readonly apiUrl = `${environment.apiUrl}/Authors`;

  constructor(private http: HttpClient) {}

  private handleError = (error: HttpErrorResponse) => {
    let errorMessage = 'Ocorreu um erro desconhecido';
    
    // Verifica se está no browser (ErrorEvent só existe no browser, não no SSR)
    const isBrowser = typeof window !== 'undefined';
    const isClientError = isBrowser && error.error instanceof ErrorEvent;
    
    if (isClientError) {
      // Erro do lado do cliente (browser)
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      // Erro do lado do servidor ou SSR
      if (error.status === 0) {
        errorMessage = 'Não foi possível conectar à API. Verifique se o servidor está rodando e se há problemas de CORS.';
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.message) {
        errorMessage = `Erro ${error.status}: ${error.message}`;
      } else {
        errorMessage = `Erro ${error.status}: Erro desconhecido`;
      }
    }
    
    return throwError(() => ({ ...error, message: errorMessage }));
  }

  getAll(): Observable<ApiResponse<AuthorDto[]>> {
    return this.http.get<ApiResponse<AuthorDto[]>>(this.apiUrl, {
      headers: {
        'Accept': 'application/json'
      }
    }).pipe(
      catchError(this.handleError)
    );
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

