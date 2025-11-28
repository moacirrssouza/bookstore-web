import { TestBed, inject } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AuthorService } from './author.service';
import { environment } from '../../../../environments/environment';
import { AuthorDto, CreateAuthorDto } from '../../../models/author.dto';
import { ApiResponse } from '../../../models/api-response';

describe('AuthorService', () => {
  let service: AuthorService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthorService, provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(AuthorService);
  });

  it('deve buscar todos os autores', inject([HttpTestingController], (httpMock: HttpTestingController) => {
    const mockResponse: ApiResponse<AuthorDto[]> = {
      data: [{ id: '1', name: 'Autor 1' }]
    };

    service.getAll().subscribe((res) => {
      expect(res.data).toBeDefined();
      expect(Array.isArray(res.data)).toBeTrue();
      expect(res.data!.length).toBe(1);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/Authors`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  }));

  it('deve buscar autor por id', inject([HttpTestingController], (httpMock: HttpTestingController) => {
    const id = '42';
    const mockResponse: ApiResponse<AuthorDto> = {
      data: { id, name: 'Autor 42' }
    };

    service.getById(id).subscribe((res) => {
      expect(res.data).toBeDefined();
      expect(res.data!.id).toBe(id);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/Authors/${id}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  }));

  it('deve criar um autor', inject([HttpTestingController], (httpMock: HttpTestingController) => {
    const payload: CreateAuthorDto = { name: 'Novo Autor' };
    const mockResponse: ApiResponse<AuthorDto> = {
      data: { id: '10', name: 'Novo Autor' }
    };

    service.create(payload).subscribe((res) => {
      expect(res.data).toBeDefined();
      expect(res.data!.id).toBe('10');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/Authors`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(mockResponse);
  }));

  it('deve atualizar um autor', inject([HttpTestingController], (httpMock: HttpTestingController) => {
    const id = '10';
    const payload: CreateAuthorDto = { name: 'Editado' };
    const mockResponse: ApiResponse<AuthorDto> = {
      data: { id, name: 'Editado' }
    };

    service.update(id, payload).subscribe((res) => {
      expect(res.data).toBeDefined();
      expect(res.data!.id).toBe(id);
      expect(res.data!.name).toBe('Editado');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/Authors/${id}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);
    req.flush(mockResponse);
  }));

  it('deve excluir um autor', inject([HttpTestingController], (httpMock: HttpTestingController) => {
    const id = '10';

    service.delete(id).subscribe(() => {
      expect(true).toBeTrue();
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/Authors/${id}`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  }));
});

