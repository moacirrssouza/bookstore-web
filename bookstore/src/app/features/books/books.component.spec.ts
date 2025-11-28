import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { BooksComponent } from './books.component';
import { BooksStore } from '../../core/store/books.store';
import { AuthorsStore } from '../../core/store/authors.store';
import { GenresStore } from '../../core/store/genres.store';
import { of } from 'rxjs';

describe('BooksComponent', () => {
  let booksSpy: any;
  let authorsSpy: any;
  let genresSpy: any;

  beforeEach(async () => {
    booksSpy = {
      books: jasmine.createSpy('books').and.returnValue([]),
      loading: jasmine.createSpy('loading').and.returnValue(false),
      error: jasmine.createSpy('error').and.returnValue(null),
      loadAll: jasmine.createSpy('loadAll').and.returnValue(of({ data: [] })),
      create: jasmine.createSpy('create').and.returnValue(of({})),
      update: jasmine.createSpy('update').and.returnValue(of({})),
      delete: jasmine.createSpy('delete').and.returnValue(of(void 0))
    };
    authorsSpy = {
      authors: jasmine.createSpy('authors').and.returnValue([{ id: 'a1', name: 'Autor' }]),
      loading: jasmine.createSpy('loading').and.returnValue(false),
      error: jasmine.createSpy('error').and.returnValue(null),
      loadAll: jasmine.createSpy('loadAll').and.returnValue(of({ data: [] }))
    };
    genresSpy = {
      genres: jasmine.createSpy('genres').and.returnValue([{ id: 'g1', name: 'Gênero' }]),
      loading: jasmine.createSpy('loading').and.returnValue(false),
      error: jasmine.createSpy('error').and.returnValue(null),
      loadAll: jasmine.createSpy('loadAll').and.returnValue(of({ data: [] }))
    };

    await TestBed.configureTestingModule({
      imports: [BooksComponent],
      providers: [
        { provide: BooksStore, useValue: booksSpy },
        { provide: AuthorsStore, useValue: authorsSpy },
        { provide: GenresStore, useValue: genresSpy },
        provideZonelessChangeDetection()
      ]
    }).compileComponents();
  });

  it('deve chamar loadAll de livros, autores e gêneros no init', () => {
    const fixture = TestBed.createComponent(BooksComponent);
    fixture.detectChanges();
    expect(booksSpy.loadAll).toHaveBeenCalled();
    expect(authorsSpy.loadAll).toHaveBeenCalled();
    expect(genresSpy.loadAll).toHaveBeenCalled();
  });

  it('deve abrir o formulário de criação', () => {
    const fixture = TestBed.createComponent(BooksComponent);
    const component = fixture.componentInstance;
    component.openCreateForm();
    expect(component.showForm()).toBeTrue();
  });

  it('deve criar livro quando formulário válido', () => {
    const fixture = TestBed.createComponent(BooksComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    component.openCreateForm();
    component.bookForm.setValue({ name: 'Livro', authorId: 'a1', genreId: 'g1', description: 'd' });
    component.saveBook();
    expect(booksSpy.create).toHaveBeenCalled();
  });

  it('deve atualizar livro quando editando', () => {
    const fixture = TestBed.createComponent(BooksComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    const book = { id: 'b1', name: 'Livro', author: 'Autor', genre: 'Gênero', description: 'D' } as any;
    component.openEditForm(book);
    component.saveBook();
    expect(booksSpy.update).toHaveBeenCalledWith('b1', jasmine.objectContaining({ name: 'Livro' }));
  });

  it('deve abrir modal de exclusão e confirmar', () => {
    const fixture = TestBed.createComponent(BooksComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    component.deleteBook('1', 'Livro');
    expect(component.showDeleteConfirm()).toBeTrue();
    component.confirmDelete();
    expect(booksSpy.delete).toHaveBeenCalledWith('1');
  });
});
