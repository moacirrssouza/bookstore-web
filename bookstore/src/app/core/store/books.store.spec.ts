import { of, throwError } from 'rxjs';
import { BooksStore } from './books.store';
import { BookService } from '../services/api/book.service';
import { ApiResponse } from '../../models/api-response';
import { BookDto, CreateBookDto } from '../../models/book.dto';
import { HttpErrorResponse } from '@angular/common/http';

describe('BooksStore', () => {
  let serviceSpy: jasmine.SpyObj<BookService>;
  let store: BooksStore;

  beforeEach(() => {
    serviceSpy = jasmine.createSpyObj('BookService', ['getAll', 'create', 'update', 'delete']);
    store = new BooksStore(serviceSpy as any);
  });

  it('deve carregar livros e atualizar sinais', (done) => {
    const response: ApiResponse<BookDto[]> = {
      data: [{ id: '1', name: 'Livro', author: 'Autor', genre: 'Gênero' }]
    };
    serviceSpy.getAll.and.returnValue(of(response));

    store.loadAll().subscribe(() => {
      expect(store.loading()).toBeFalse();
      expect(store.error()).toBeNull();
      expect(store.books().length).toBe(1);
      done();
    });
  });

  it('deve tratar erro ao carregar livros', (done) => {
    const httpError = new HttpErrorResponse({ status: 500, statusText: 'Server Error', error: { message: 'Falha' } });
    serviceSpy.getAll.and.returnValue(throwError(() => httpError));

    store.loadAll().subscribe({
      next: () => {
        fail('deveria falhar');
      },
      error: () => {
        expect(store.loading()).toBeFalse();
        expect(store.error()).toBe('Falha');
        done();
      }
    });
  });

  it('deve criar e recarregar lista', (done) => {
    const payload: CreateBookDto = { name: 'Novo', authorId: 'a1', genreId: 'g1', description: 'desc' };
    const createResponse: ApiResponse<BookDto> = {
      data: { id: '10', name: 'Novo', author: 'Autor', genre: 'Gênero', description: 'desc' }
    };
    const loadResponse: ApiResponse<BookDto[]> = {
      data: [{ id: '10', name: 'Novo', author: 'Autor', genre: 'Gênero', description: 'desc' }]
    };
    serviceSpy.create.and.returnValue(of(createResponse));
    serviceSpy.getAll.and.returnValue(of(loadResponse));

    store.create(payload).subscribe(() => {
      expect(store.loading()).toBeFalse();
      expect(store.error()).toBeNull();
      expect(store.books().length).toBe(1);
      done();
    });
  });
});
