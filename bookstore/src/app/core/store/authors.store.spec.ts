import { of, throwError } from 'rxjs';
import { AuthorsStore } from './authors.store';
import { AuthorService } from '../services/api/author.service';
import { ApiResponse } from '../../models/api-response';
import { AuthorDto, CreateAuthorDto } from '../../models/author.dto';
import { HttpErrorResponse } from '@angular/common/http';

describe('AuthorsStore', () => {
  let serviceSpy: jasmine.SpyObj<AuthorService>;
  let store: AuthorsStore;

  beforeEach(() => {
    serviceSpy = jasmine.createSpyObj('AuthorService', ['getAll', 'create', 'update', 'delete']);
    store = new AuthorsStore(serviceSpy as any);
  });

  it('deve carregar autores e atualizar sinais', (done) => {
    const response: ApiResponse<AuthorDto[]> = {
      data: [{ id: '1', name: 'Autor 1' }]
    };
    serviceSpy.getAll.and.returnValue(of(response));

    store.loadAll().subscribe(() => {
      expect(store.loading()).toBeFalse();
      expect(store.error()).toBeNull();
      expect(store.authors().length).toBe(1);
      done();
    });
  });

  it('deve tratar erro ao carregar autores', (done) => {
    const httpError = new HttpErrorResponse({ status: 500, statusText: 'Server Error', error: { message: 'Falha' } });
    serviceSpy.getAll.and.returnValue(throwError(() => httpError));

    store.loadAll().subscribe({
      next: () => fail('deveria falhar'),
      error: () => {
        expect(store.loading()).toBeFalse();
        expect(store.error()).toBe('Falha');
        done();
      }
    });
  });

  it('deve criar e recarregar lista', (done) => {
    const payload: CreateAuthorDto = { name: 'Novo Autor' };
    const createResponse: ApiResponse<AuthorDto> = {
      data: { id: '10', name: 'Novo Autor' }
    };
    const loadResponse: ApiResponse<AuthorDto[]> = {
      data: [{ id: '10', name: 'Novo Autor' }]
    };
    serviceSpy.create.and.returnValue(of(createResponse));
    serviceSpy.getAll.and.returnValue(of(loadResponse));

    store.create(payload).subscribe(() => {
      expect(store.loading()).toBeFalse();
      expect(store.error()).toBeNull();
      expect(store.authors().length).toBe(1);
      done();
    });
  });

  it('deve atualizar e recarregar lista', (done) => {
    const payload: CreateAuthorDto = { name: 'Autor Editado' };
    const updateResponse: ApiResponse<AuthorDto> = {
      data: { id: '10', name: 'Autor Editado' }
    };
    const loadResponse: ApiResponse<AuthorDto[]> = {
      data: [{ id: '10', name: 'Autor Editado' }]
    };
    serviceSpy.update.and.returnValue(of(updateResponse));
    serviceSpy.getAll.and.returnValue(of(loadResponse));

    store.update('10', payload).subscribe(() => {
      expect(store.loading()).toBeFalse();
      expect(store.error()).toBeNull();
      expect(store.authors().length).toBe(1);
      done();
    });
  });

  it('deve excluir e recarregar lista', (done) => {
    serviceSpy.delete.and.returnValue(of(void 0));
    const loadResponse: ApiResponse<AuthorDto[]> = { data: [] };
    serviceSpy.getAll.and.returnValue(of(loadResponse));

    store.delete('10').subscribe(() => {
      expect(store.loading()).toBeFalse();
      expect(store.error()).toBeNull();
      expect(store.authors().length).toBe(0);
      done();
    });
  });
});
