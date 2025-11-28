import { Injectable, signal } from '@angular/core';
import { BookService } from '../services/api/book.service';
import { BookDto, CreateBookDto } from '../../models/book.dto';
import { ApiResponse } from '../../models/api-response';
import { Observable, catchError, tap, throwError, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BooksStore {
  books = signal<BookDto[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(private bookService: BookService) {}

  loadAll(): Observable<ApiResponse<BookDto[]>> {
    this.loading.set(true);
    this.error.set(null);
    if (typeof window === 'undefined') {
      this.loading.set(false);
      this.books.set([]);
      return of({ data: [] } as ApiResponse<BookDto[]>);
    }
    return this.bookService.getAll().pipe(
      tap((response) => {
        let data: BookDto[] = [];
        if (response && typeof response === 'object') {
          if ('data' in response && response.data !== null && response.data !== undefined) {
            if (Array.isArray(response.data)) {
              data = response.data;
            } else if (typeof response.data === 'object') {
              data = [response.data as BookDto];
            }
          } else if (Array.isArray(response as any)) {
            data = response as any;
          }
        }
        this.books.set(data);
        this.loading.set(false);
      }),
      catchError((err) => {
        this.loading.set(false);
        let message = 'Erro ao carregar livros.';
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

  create(dto: CreateBookDto): Observable<ApiResponse<BookDto>> {
    this.loading.set(true);
    this.error.set(null);
    if (typeof window === 'undefined') {
      this.loading.set(false);
      return of({} as ApiResponse<BookDto>);
    }
    return this.bookService.create(dto).pipe(
      tap(() => {
        this.loading.set(false);
        this.loadAll().subscribe();
      }),
      catchError((err) => {
        this.loading.set(false);
        let message = 'Erro ao salvar livro.';
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

  update(id: string, dto: CreateBookDto): Observable<ApiResponse<BookDto>> {
    this.loading.set(true);
    this.error.set(null);
    if (typeof window === 'undefined') {
      this.loading.set(false);
      return of({} as ApiResponse<BookDto>);
    }
    return this.bookService.update(id, dto).pipe(
      tap(() => {
        this.loading.set(false);
        this.loadAll().subscribe();
      }),
      catchError((err) => {
        this.loading.set(false);
        let message = 'Erro ao salvar livro.';
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
    return this.bookService.delete(id).pipe(
      tap(() => {
        this.loading.set(false);
        this.loadAll().subscribe();
      }),
      catchError((err) => {
        this.loading.set(false);
        let message = 'Erro ao excluir livro.';
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
