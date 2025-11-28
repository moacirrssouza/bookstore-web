import { TestBed, inject } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { GenreService } from './genre.service';
import { environment } from '../../../../environments/environment';
import { GenreDto, CreateGenreDto } from '../../../models/genre.dto';
import { ApiResponse } from '../../../models/api-response';

describe('GenreService', () => {
  let service: GenreService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GenreService, provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(GenreService);
  });

  it('deve buscar todos os gêneros', inject([HttpTestingController], (httpMock: HttpTestingController) => {
    const mockResponse: ApiResponse<GenreDto[]> = {
      data: [{ id: '1', name: 'Fantasia' }]
    };

    service.getAll().subscribe((res) => {
      expect(res.data).toBeDefined();
      expect(Array.isArray(res.data)).toBeTrue();
      expect(res.data!.length).toBe(1);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/Genres`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  }));

  it('deve buscar gênero por id', inject([HttpTestingController], (httpMock: HttpTestingController) => {
    const id = '42';
    const mockResponse: ApiResponse<GenreDto> = {
      data: { id, name: 'Fantasia' }
    };

    service.getById(id).subscribe((res) => {
      expect(res.data).toBeDefined();
      expect(res.data!.id).toBe(id);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/Genres/${id}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  }));

  it('deve criar um gênero', inject([HttpTestingController], (httpMock: HttpTestingController) => {
    const payload: CreateGenreDto = { name: 'Aventura' };
    const mockResponse: ApiResponse<GenreDto> = {
      data: { id: '10', name: 'Aventura' }
    };

    service.create(payload).subscribe((res) => {
      expect(res.data).toBeDefined();
      expect(res.data!.id).toBe('10');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/Genres`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(mockResponse);
  }));

  it('deve atualizar um gênero', inject([HttpTestingController], (httpMock: HttpTestingController) => {
    const id = '10';
    const payload: CreateGenreDto = { name: 'Fantasia Épica' };
    const mockResponse: ApiResponse<GenreDto> = {
      data: { id, name: 'Fantasia Épica' }
    };

    service.update(id, payload).subscribe((res) => {
      expect(res.data).toBeDefined();
      expect(res.data!.id).toBe(id);
      expect(res.data!.name).toBe('Fantasia Épica');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/Genres/${id}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);
    req.flush(mockResponse);
  }));

  it('deve excluir um gênero', inject([HttpTestingController], (httpMock: HttpTestingController) => {
    const id = '10';

    service.delete(id).subscribe(() => {
      expect(true).toBeTrue();
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/Genres/${id}`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  }));
});

