import { TestBed, inject } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { BookService } from './book.service';
import { environment } from '../../../../environments/environment';
import { BookDto, CreateBookDto } from '../../../models/book.dto';
import { ApiResponse } from '../../../models/api-response';

describe('BookService', () => {
  let service: BookService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BookService, provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(BookService);
  });

  afterEach(() => {});

  it('deve buscar todos os livros', inject([HttpTestingController], (httpMock: HttpTestingController) => {
    const mockResponse: ApiResponse<BookDto[]> = {
      data: [{ id: '1', name: 'Livro', author: 'Autor', genre: 'Gênero' }]
    };

    service.getAll().subscribe((res) => {
      expect(res.data).toBeDefined();
      expect(Array.isArray(res.data)).toBeTrue();
      expect(res.data!.length).toBe(1);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/Books`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  }));

  it('deve propagar mensagem de erro do backend', inject([HttpTestingController], (httpMock: HttpTestingController) => {
    service.getAll().subscribe({
      next: () => {
        fail('deveria falhar');
      },
      error: (err) => {
        expect(err.message).toBe('Falha');
      }
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/Books`);
    expect(req.request.method).toBe('GET');
    req.flush({ message: 'Falha' }, { status: 500, statusText: 'Server Error' });
  }));

  it('deve criar um livro', inject([HttpTestingController], (httpMock: HttpTestingController) => {
    const payload: CreateBookDto = { name: 'Novo', authorId: 'a1', genreId: 'g1', description: 'desc' };
    const mockResponse: ApiResponse<BookDto> = {
      data: { id: '10', name: 'Novo', author: 'Autor', genre: 'Gênero', description: 'desc' }
    };

    service.create(payload).subscribe((res) => {
      expect(res.data).toBeDefined();
      expect(res.data!.id).toBe('10');
      expect(res.data!.description).toBe('desc');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/Books`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(mockResponse);
  }));

  it('deve buscar livro por id', inject([HttpTestingController], (httpMock: HttpTestingController) => {
    const id = '42';
    const mockResponse: ApiResponse<BookDto> = {
      data: { id, name: 'Livro 42', author: 'Autor', genre: 'Gênero' }
    };

    service.getById(id).subscribe((res) => {
      expect(res.data).toBeDefined();
      expect(res.data!.id).toBe(id);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/Books/${id}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  }));

  it('deve atualizar um livro', inject([HttpTestingController], (httpMock: HttpTestingController) => {
    const id = '10';
    const payload: CreateBookDto = { name: 'Editado', authorId: 'a1', genreId: 'g1', description: 'd' };
    const mockResponse: ApiResponse<BookDto> = {
      data: { id, name: 'Editado', author: 'Autor', genre: 'Gênero', description: 'd' }
    };

    service.update(id, payload).subscribe((res) => {
      expect(res.data).toBeDefined();
      expect(res.data!.id).toBe(id);
      expect(res.data!.name).toBe('Editado');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/Books/${id}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);
    req.flush(mockResponse);
  }));

  it('deve excluir um livro', inject([HttpTestingController], (httpMock: HttpTestingController) => {
    const id = '10';

    service.delete(id).subscribe(() => {
      expect(true).toBeTrue();
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/Books/${id}`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  }));
});

