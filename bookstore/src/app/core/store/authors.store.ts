import { Injectable, signal } from '@angular/core';
import { AuthorService } from '../services/api/author.service';
import { AuthorDto, CreateAuthorDto } from '../../models/author.dto';
import { ApiResponse } from '../../models/api-response';
import { Observable, catchError, tap, throwError, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthorsStore {
  authors = signal<AuthorDto[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(private authorService: AuthorService) {}

  loadAll(): Observable<ApiResponse<AuthorDto[]>> {
    this.loading.set(true);
    this.error.set(null);
    if (typeof window === 'undefined') {
      this.loading.set(false);
      this.authors.set([]);
      return of({ data: [] } as ApiResponse<AuthorDto[]>);
    }
    return this.authorService.getAll().pipe(
      tap((response) => {
        let data: AuthorDto[] = [];
        if (response && typeof response === 'object') {
          if ('data' in response && response.data !== null && response.data !== undefined) {
            if (Array.isArray(response.data)) {
              data = response.data;
            } else if (typeof response.data === 'object') {
              data = [response.data as AuthorDto];
            }
          } else if (Array.isArray(response as any)) {
            data = response as any;
          }
        }
        this.authors.set(data);
        this.loading.set(false);
      }),
      catchError((err) => {
        this.loading.set(false);
        let message = 'Erro ao carregar autores.';
        if (err.error?.message) {
          message = err.error.message;
        } else if (err.message) {
          message = err.message;
        }
        this.error.set(message);
        return throwError(() => err);
      })
    );
  }

  create(dto: CreateAuthorDto): Observable<ApiResponse<AuthorDto>> {
    this.loading.set(true);
    this.error.set(null);
    if (typeof window === 'undefined') {
      this.loading.set(false);
      return of({} as ApiResponse<AuthorDto>);
    }
    return this.authorService.create(dto).pipe(
      tap(() => {
        this.loading.set(false);
        this.loadAll().subscribe();
      }),
      catchError((err) => {
        this.loading.set(false);
        let message = 'Erro ao salvar autor.';
        if (err.error?.message) {
          message = err.error.message;
        } else if (err.message) {
          message = err.message;
        }
        this.error.set(message);
        return throwError(() => err);
      })
    );
  }

  update(id: string, dto: CreateAuthorDto): Observable<ApiResponse<AuthorDto>> {
    this.loading.set(true);
    this.error.set(null);
    if (typeof window === 'undefined') {
      this.loading.set(false);
      return of({} as ApiResponse<AuthorDto>);
    }
    return this.authorService.update(id, dto).pipe(
      tap(() => {
        this.loading.set(false);
        this.loadAll().subscribe();
      }),
      catchError((err) => {
        this.loading.set(false);
        let message = 'Erro ao salvar autor.';
        if (err.error?.message) {
          message = err.error.message;
        } else if (err.message) {
          message = err.message;
        }
        this.error.set(message);
        return throwError(() => err);
      })
    );
  }

  delete(id: string): Observable<void> {
    this.loading.set(true);
    this.error.set(null);
    if (typeof window === 'undefined') {
      this.loading.set(false);
      return of(void 0);
    }
    return this.authorService.delete(id).pipe(
      tap(() => {
        this.loading.set(false);
        this.loadAll().subscribe();
      }),
      catchError((err) => {
        this.loading.set(false);
        let message = 'Erro ao excluir autor.';
        if (err.error?.message) {
          message = err.error.message;
        } else if (err.message) {
          message = err.message;
        }
        this.error.set(message);
        return throwError(() => err);
      })
    );
  }
}
