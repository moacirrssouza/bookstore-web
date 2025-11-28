import { of, throwError } from 'rxjs';
import { GenresStore } from './genres.store';
import { GenreService } from '../services/api/genre.service';
import { ApiResponse } from '../../models/api-response';
import { GenreDto, CreateGenreDto } from '../../models/genre.dto';
import { HttpErrorResponse } from '@angular/common/http';

describe('GenresStore', () => {
  let serviceSpy: jasmine.SpyObj<GenreService>;
  let store: GenresStore;

  beforeEach(() => {
    serviceSpy = jasmine.createSpyObj('GenreService', ['getAll', 'create', 'update', 'delete']);
    store = new GenresStore(serviceSpy as any);
  });

  it('deve carregar gêneros e atualizar sinais', (done) => {
    const response: ApiResponse<GenreDto[]> = {
      data: [{ id: '1', name: 'Fantasia' }]
    };
    serviceSpy.getAll.and.returnValue(of(response));

    store.loadAll().subscribe(() => {
      expect(store.loading()).toBeFalse();
      expect(store.error()).toBeNull();
      expect(store.genres().length).toBe(1);
      done();
    });
  });

  it('deve tratar erro ao carregar gêneros', (done) => {
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
    const payload: CreateGenreDto = { name: 'Aventura' };
    const createResponse: ApiResponse<GenreDto> = {
      data: { id: '10', name: 'Aventura' }
    };
    const loadResponse: ApiResponse<GenreDto[]> = {
      data: [{ id: '10', name: 'Aventura' }]
    };
    serviceSpy.create.and.returnValue(of(createResponse));
    serviceSpy.getAll.and.returnValue(of(loadResponse));

    store.create(payload).subscribe(() => {
      expect(store.loading()).toBeFalse();
      expect(store.error()).toBeNull();
      expect(store.genres().length).toBe(1);
      done();
    });
  });

  it('deve atualizar e recarregar lista', (done) => {
    const payload: CreateGenreDto = { name: 'Fantasia Épica' };
    const updateResponse: ApiResponse<GenreDto> = {
      data: { id: '10', name: 'Fantasia Épica' }
    };
    const loadResponse: ApiResponse<GenreDto[]> = {
      data: [{ id: '10', name: 'Fantasia Épica' }]
    };
    serviceSpy.update.and.returnValue(of(updateResponse));
    serviceSpy.getAll.and.returnValue(of(loadResponse));

    store.update('10', payload).subscribe(() => {
      expect(store.loading()).toBeFalse();
      expect(store.error()).toBeNull();
      expect(store.genres().length).toBe(1);
      done();
    });
  });

  it('deve excluir e recarregar lista', (done) => {
    serviceSpy.delete.and.returnValue(of(void 0));
    const loadResponse: ApiResponse<GenreDto[]> = { data: [] };
    serviceSpy.getAll.and.returnValue(of(loadResponse));

    store.delete('10').subscribe(() => {
      expect(store.loading()).toBeFalse();
      expect(store.error()).toBeNull();
      expect(store.genres().length).toBe(0);
      done();
    });
  });
});
