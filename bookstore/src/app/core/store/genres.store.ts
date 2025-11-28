import { Injectable, signal } from '@angular/core';
import { GenreService } from '../services/api/genre.service';
import { GenreDto, CreateGenreDto } from '../../models/genre.dto';
import { ApiResponse } from '../../models/api-response';
import { Observable, catchError, tap, throwError, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GenresStore {
  genres = signal<GenreDto[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(private genreService: GenreService) {}

  loadAll(): Observable<ApiResponse<GenreDto[]>> {
    this.loading.set(true);
    this.error.set(null);
    if (typeof window === 'undefined') {
      this.loading.set(false);
      this.genres.set([]);
      return of({ data: [] } as ApiResponse<GenreDto[]>);
    }
    return this.genreService.getAll().pipe(
      tap((response) => {
        let data: GenreDto[] = [];
        if (response && typeof response === 'object') {
          if ('data' in response && response.data !== null && response.data !== undefined) {
            if (Array.isArray(response.data)) {
              data = response.data;
            } else if (typeof response.data === 'object') {
              data = [response.data as GenreDto];
            }
          } else if (Array.isArray(response as any)) {
            data = response as any;
          }
        }
        this.genres.set(data);
        this.loading.set(false);
      }),
      catchError((err) => {
        this.loading.set(false);
        let message = 'Erro ao carregar gêneros.';
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

  create(dto: CreateGenreDto): Observable<ApiResponse<GenreDto>> {
    this.loading.set(true);
    this.error.set(null);
    if (typeof window === 'undefined') {
      this.loading.set(false);
      return of({} as ApiResponse<GenreDto>);
    }
    return this.genreService.create(dto).pipe(
      tap(() => {
        this.loading.set(false);
        this.loadAll().subscribe();
      }),
      catchError((err) => {
        this.loading.set(false);
        let message = 'Erro ao salvar gênero.';
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

  update(id: string, dto: CreateGenreDto): Observable<ApiResponse<GenreDto>> {
    this.loading.set(true);
    this.error.set(null);
    if (typeof window === 'undefined') {
      this.loading.set(false);
      return of({} as ApiResponse<GenreDto>);
    }
    return this.genreService.update(id, dto).pipe(
      tap(() => {
        this.loading.set(false);
        this.loadAll().subscribe();
      }),
      catchError((err) => {
        this.loading.set(false);
        let message = 'Erro ao salvar gênero.';
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
    return this.genreService.delete(id).pipe(
      tap(() => {
        this.loading.set(false);
        this.loadAll().subscribe();
      }),
      catchError((err) => {
        this.loading.set(false);
        let message = 'Erro ao excluir gênero.';
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
