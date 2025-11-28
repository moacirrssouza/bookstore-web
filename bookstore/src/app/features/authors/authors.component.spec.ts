import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { AuthorsComponent } from './authors.component';
import { AuthorsStore } from '../../core/store/authors.store';
import { of } from 'rxjs';

describe('AuthorsComponent', () => {
  let storeSpy: any;

  beforeEach(async () => {
    storeSpy = {
      authors: jasmine.createSpy('authors').and.returnValue([]),
      loading: jasmine.createSpy('loading').and.returnValue(false),
      error: jasmine.createSpy('error').and.returnValue(null),
      loadAll: jasmine.createSpy('loadAll').and.returnValue(of({ data: [] })),
      create: jasmine.createSpy('create').and.returnValue(of({})),
      update: jasmine.createSpy('update').and.returnValue(of({})),
      delete: jasmine.createSpy('delete').and.returnValue(of(void 0))
    };

    await TestBed.configureTestingModule({
      imports: [AuthorsComponent],
      providers: [{ provide: AuthorsStore, useValue: storeSpy }, provideZonelessChangeDetection()]
    }).compileComponents();
  });

  it('deve chamar loadAll no init', () => {
    const fixture = TestBed.createComponent(AuthorsComponent);
    fixture.detectChanges();
    expect(storeSpy.loadAll).toHaveBeenCalled();
  });

  it('deve abrir o formulário de criação', () => {
    const fixture = TestBed.createComponent(AuthorsComponent);
    const component = fixture.componentInstance;
    component.openCreateForm();
    expect(component.showForm()).toBeTrue();
  });

  it('deve criar autor quando formulário válido', () => {
    const fixture = TestBed.createComponent(AuthorsComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    component.openCreateForm();
    component.authorForm.setValue({ name: 'Novo Autor' });
    component.saveAuthor();
    expect(storeSpy.create).toHaveBeenCalled();
  });

  it('deve atualizar autor quando editando', () => {
    const fixture = TestBed.createComponent(AuthorsComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    component.editingAuthor.set({ id: '1', name: 'Autor' });
    component.authorForm.setValue({ name: 'Editado' });
    component.saveAuthor();
    expect(storeSpy.update).toHaveBeenCalledWith('1', { name: 'Editado' });
  });

  it('deve abrir modal de exclusão e confirmar', () => {
    const fixture = TestBed.createComponent(AuthorsComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    component.deleteAuthor('1', 'Autor');
    expect(component.showDeleteConfirm()).toBeTrue();
    component.confirmDelete();
    expect(storeSpy.delete).toHaveBeenCalledWith('1');
  });
});

