import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { GenresComponent } from './genres.component';
import { GenresStore } from '../../core/store/genres.store';
import { of } from 'rxjs';

describe('GenresComponent', () => {
  let storeSpy: any;

  beforeEach(async () => {
    storeSpy = {
      genres: jasmine.createSpy('genres').and.returnValue([]),
      loading: jasmine.createSpy('loading').and.returnValue(false),
      error: jasmine.createSpy('error').and.returnValue(null),
      loadAll: jasmine.createSpy('loadAll').and.returnValue(of({ data: [] })),
      create: jasmine.createSpy('create').and.returnValue(of({})),
      update: jasmine.createSpy('update').and.returnValue(of({})),
      delete: jasmine.createSpy('delete').and.returnValue(of(void 0))
    };

    await TestBed.configureTestingModule({
      imports: [GenresComponent],
      providers: [{ provide: GenresStore, useValue: storeSpy }, provideZonelessChangeDetection()]
    }).compileComponents();
  });

  it('deve chamar loadAll no init', () => {
    const fixture = TestBed.createComponent(GenresComponent);
    fixture.detectChanges();
    expect(storeSpy.loadAll).toHaveBeenCalled();
  });

  it('deve abrir o formulário de criação', () => {
    const fixture = TestBed.createComponent(GenresComponent);
    const component = fixture.componentInstance;
    component.openCreateForm();
    expect(component.showForm()).toBeTrue();
  });

  it('deve criar gênero quando formulário válido', () => {
    const fixture = TestBed.createComponent(GenresComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    component.openCreateForm();
    component.genreForm.setValue({ name: 'Aventura' });
    component.saveGenre();
    expect(storeSpy.create).toHaveBeenCalled();
  });

  it('deve atualizar gênero quando editando', () => {
    const fixture = TestBed.createComponent(GenresComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    component.editingGenre.set({ id: '1', name: 'Fantasia' });
    component.genreForm.setValue({ name: 'Fantasia Épica' });
    component.saveGenre();
    expect(storeSpy.update).toHaveBeenCalledWith('1', { name: 'Fantasia Épica' });
  });

  it('deve abrir modal de exclusão e confirmar', () => {
    const fixture = TestBed.createComponent(GenresComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    component.deleteGenre('1', 'Fantasia');
    expect(component.showDeleteConfirm()).toBeTrue();
    component.confirmDelete();
    expect(storeSpy.delete).toHaveBeenCalledWith('1');
  });
});
