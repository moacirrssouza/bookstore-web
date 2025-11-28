import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GenreService } from '../../services/genre.service';
import { GenreDto, CreateGenreDto } from '../../models/genre.dto';

@Component({
  selector: 'app-genres',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './genres.component.html',
  styleUrl: './genres.component.scss'
})

export class GenresComponent implements OnInit {
  Math = Math;
  genres = signal<GenreDto[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  showForm = signal(false);
  editingGenre = signal<GenreDto | null>(null);
  showDeleteConfirm = signal(false);
  genreToDelete = signal<{id: string, name: string} | null>(null);
  currentPage = signal(1);
  itemsPerPage = signal(10);
  totalItems = signal(0);
  genreForm: FormGroup;

  constructor(
    private genreService: GenreService,
    private fb: FormBuilder
  ) {
    this.genreForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  ngOnInit(): void {
    this.loadGenres();
  }

  loadGenres(): void {
    console.log('Iniciando carregamento de gêneros...');
    this.loading.set(true);
    this.error.set(null);
    
    this.genreService.getAll().subscribe({
      next: (response) => {
        try {
          console.log('Resposta completa da API:', response);
          console.log('Tipo da resposta:', typeof response);
          console.log('É array?', Array.isArray(response));
          
          let genresData: GenreDto[] = [];
          
          if (response && typeof response === 'object') {
            if ('data' in response && response.data !== null && response.data !== undefined) {
              console.log('response.data encontrado:', response.data);
              if (Array.isArray(response.data)) {
                genresData = response.data;
                console.log(`Array de gêneros extraído: ${genresData.length} itens`);
              } else if (typeof response.data === 'object') {
                genresData = [response.data as GenreDto];
                console.log('Objeto único convertido para array');
              }
            } else if (Array.isArray(response)) {
              genresData = response;
              console.log(`Response é array direto: ${genresData.length} itens`);
            } else {
              console.warn('Formato de resposta não reconhecido. Keys:', Object.keys(response));
            }
          } else {
            console.warn('Resposta inválida ou vazia:', response);
          }
          
          console.log(`Total de gêneros processados: ${genresData.length}`);
          this.totalItems.set(genresData.length);
          this.genres.set(genresData);
          this.loading.set(false);
          
          if (genresData.length === 0) {
            console.log('ℹNenhum gênero encontrado - exibindo empty state');
          }
        } catch (error) {
          console.error('Erro ao processar resposta:', error);
          this.error.set('Erro ao processar dados da API.');
          this.loading.set(false);
        }
      },
      error: (err) => {
        console.error('ERRO NA REQUISIÇÃO');
        console.error('Status:', err.status);
        console.error('Status Text:', err.statusText);
        console.error('URL tentada:', err.url);
        console.error('Mensagem:', err.message);
        console.error('Error completo:', err);
        console.error('Error body:', err.error);
        
        this.loading.set(false);
        let errorMessage = 'Erro ao carregar gêneros.';
        
        if (err.status === 0) {
          errorMessage = 'Não foi possível conectar à API. Verifique se o servidor está rodando e se o CORS está configurado corretamente.';
          console.error('DICA: Verifique se a API está rodando em: https://localhost:7192');
        } else if (err.status === 404) {
          errorMessage = `Endpoint não encontrado (404). Verifique se a rota está correta: ${err.url}`;
          console.error('DICA: Verifique se a rota da API está correta no service');
        } else if (err.status === 500) {
          errorMessage = 'Erro interno no servidor (500). Verifique os logs do backend.';
          console.error('DICA: Olhe os logs do seu backend .NET para ver o erro específico');
          if (err.error) {
            console.error('Detalhes do erro do backend:', err.error);
            if (typeof err.error === 'string') {
              errorMessage += ` Detalhes: ${err.error.substring(0, 100)}`;
            } else if (err.error.message) {
              errorMessage += ` Detalhes: ${err.error.message}`;
            }
          }
        } else if (err.status >= 500) {
          errorMessage = `Erro no servidor (${err.status}). Tente novamente mais tarde.`;
        } else if (err.error?.message) {
          errorMessage = err.error.message;
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        this.error.set(errorMessage);
        console.error('Mensagem de erro definida:', errorMessage);
      }
    });
  }

  get paginatedGenres(): GenreDto[] {
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    const end = start + this.itemsPerPage();
    return this.genres().slice(start, end);
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems() / this.itemsPerPage());
  }

  get visiblePages(): number[] {
    const total = this.totalPages;
    const current = this.currentPage();
    const pages: number[] = [];
    
    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } 
    else {
      pages.push(1);
      
      if (current > 3) {
        pages.push(-1); 
      }
      
      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (current < total - 2) {
        pages.push(-1); 
      }
      
      pages.push(total);
    }
    
    return pages;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage.set(page);
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages) {
      this.currentPage.update(page => page + 1);
    }
  }

  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(page => page - 1);
    }
  }

  changeItemsPerPage(items: number): void {
    this.itemsPerPage.set(items);
    this.currentPage.set(1); 
  }

  openCreateForm(): void {
    this.editingGenre.set(null);
    this.genreForm.reset();
    this.showForm.set(true);
  }

  openEditForm(genre: GenreDto): void {
    this.editingGenre.set(genre);
    this.genreForm.patchValue({ name: genre.name });
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingGenre.set(null);
    this.genreForm.reset();
  }

  saveGenre(): void {
    if (this.genreForm.invalid) {
      return;
    }

    const dto: CreateGenreDto = this.genreForm.value;
    this.loading.set(true);
    this.error.set(null);

    const editing = this.editingGenre();
    const operation = editing
      ? this.genreService.update(editing.id, dto)
      : this.genreService.create(dto);

    operation.subscribe({
      next: (response) => {
        console.log('Gênero salvo com sucesso:', response);
        this.closeForm();

        setTimeout(() => {
          this.loading.set(false);
          this.loadGenres();
        }, 100);
      },
      error: (err) => {
        this.loading.set(false);
        let errorMessage = 'Erro ao salvar gênero.';
        
        if (err.status === 400 && err.error?.message) {
          errorMessage = err.error.message;
        } else if (err.status === 0) {
          errorMessage = 'Não foi possível conectar à API. Verifique se o servidor está rodando.';
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        this.error.set(errorMessage);
        console.error('Error saving genre:', err);
      }
    });
  }

  deleteGenre(id: string, name: string): void {
    console.log('deleteGenre chamado - ID:', id, 'Nome:', name);
    this.genreToDelete.set({id, name});
    this.showDeleteConfirm.set(true);
    console.log('Modal de confirmação aberto:', this.showDeleteConfirm());
    console.log('Gênero para deletar:', this.genreToDelete());
  }

  cancelDelete(): void {
    this.showDeleteConfirm.set(false);
    this.genreToDelete.set(null);
  }

  confirmDelete(): void {
    const genre = this.genreToDelete();
    
    console.log('confirmDelete chamado');
    console.log('Genre to delete:', genre);
    
    if (!genre) {
      console.error('Nenhum gênero selecionado para exclusão');
      return;
    }

    console.log(`Iniciando exclusão do gênero ID: ${genre.id}, Nome: ${genre.name}`);
    
    this.loading.set(true);
    this.error.set(null);

    this.genreService.delete(genre.id).subscribe({
      next: () => {
        console.log('Gênero excluído com sucesso!');
        this.cancelDelete();
        this.loadGenres();
      },
      error: (err) => {
        console.error('ERRO ao excluir gênero:', err);
        console.error('Status:', err.status);
        console.error('Mensagem:', err.message);
        console.error('URL:', err.url);
        
        this.loading.set(false);
        let errorMessage = 'Erro ao excluir gênero.';
        
        if (err.status === 404) {
          errorMessage = 'Gênero não encontrado.';
        } else if (err.status === 400) {
          errorMessage = err.error?.message || 'Não é possível excluir gênero com livros associados.';
        } else if (err.status === 0) {
          errorMessage = 'Não foi possível conectar à API. Verifique se o servidor está rodando.';
        } else if (err.error?.message) {
          errorMessage = err.error.message;
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        this.error.set(errorMessage);
        this.cancelDelete();
      }
    });
  }
}