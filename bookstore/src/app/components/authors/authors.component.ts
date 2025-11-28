import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthorService } from '../../services/author.service';
import { AuthorDto, CreateAuthorDto } from '../../models/author.dto';

@Component({
  selector: 'app-authors',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './authors.component.html',
  styleUrl: './authors.component.scss'
})
export class AuthorsComponent implements OnInit {
  // Expor Math para o template
  Math = Math;
  
  authors = signal<AuthorDto[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  showForm = signal(false);
  editingAuthor = signal<AuthorDto | null>(null);
  
  // Signals para o modal de exclusão
  showDeleteConfirm = signal(false);
  authorToDelete = signal<{id: string, name: string} | null>(null);
  
  // Signals para paginação
  currentPage = signal(1);
  itemsPerPage = signal(10);
  totalItems = signal(0);
  
  authorForm: FormGroup;

  constructor(
    private authorService: AuthorService,
    private fb: FormBuilder
  ) {
    this.authorForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  ngOnInit(): void {
    this.loadAuthors();
  }

  loadAuthors(): void {
    console.log('Iniciando carregamento de autores...');
    this.loading.set(true);
    this.error.set(null);
    
    this.authorService.getAll().subscribe({
      next: (response) => {
        try {
          console.log('✅ Resposta completa da API:', response);
          console.log('✅ Tipo da resposta:', typeof response);
          console.log('✅ É array?', Array.isArray(response));
          
          let authorsData: AuthorDto[] = [];
          
          if (response && typeof response === 'object') {
            if ('data' in response && response.data !== null && response.data !== undefined) {
              console.log('📦 response.data encontrado:', response.data);
              if (Array.isArray(response.data)) {
                authorsData = response.data;
                console.log(`📊 Array de autores extraído: ${authorsData.length} itens`);
              } else if (typeof response.data === 'object') {
                authorsData = [response.data as AuthorDto];
                console.log('📄 Objeto único convertido para array');
              }
            } else if (Array.isArray(response)) {
              authorsData = response;
              console.log(`📊 Response é array direto: ${authorsData.length} itens`);
            } else {
              console.warn('⚠️ Formato de resposta não reconhecido. Keys:', Object.keys(response));
            }
          } else {
            console.warn('⚠️ Resposta inválida ou vazia:', response);
          }
          
          console.log(`✅ Total de autores processados: ${authorsData.length}`);
          
          // Atualiza o total de itens para paginação
          this.totalItems.set(authorsData.length);
          
          this.authors.set(authorsData);
          this.loading.set(false);
          
          if (authorsData.length === 0) {
            console.log('ℹ️ Nenhum autor encontrado - exibindo empty state');
          }
        } catch (error) {
          console.error('❌ Erro ao processar resposta:', error);
          this.error.set('Erro ao processar dados da API.');
          this.loading.set(false);
        }
      },
      error: (err) => {
        console.error('❌❌❌ ERRO NA REQUISIÇÃO ❌❌❌');
        console.error('Status:', err.status);
        console.error('Status Text:', err.statusText);
        console.error('URL tentada:', err.url);
        console.error('Mensagem:', err.message);
        console.error('Error completo:', err);
        console.error('Error body:', err.error);
        
        this.loading.set(false);
        
        let errorMessage = 'Erro ao carregar autores.';
        
        if (err.status === 0) {
          errorMessage = 'Não foi possível conectar à API. Verifique se o servidor está rodando e se o CORS está configurado corretamente.';
          console.error('💡 DICA: Verifique se a API está rodando em: https://localhost:7192');
        } else if (err.status === 404) {
          errorMessage = `Endpoint não encontrado (404). Verifique se a rota está correta: ${err.url}`;
          console.error('💡 DICA: Verifique se a rota da API está correta no service');
        } else if (err.status === 500) {
          errorMessage = 'Erro interno no servidor (500). Verifique os logs do backend.';
          console.error('💡 DICA: Olhe os logs do seu backend .NET para ver o erro específico');
          if (err.error) {
            console.error('💡 Detalhes do erro do backend:', err.error);
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
        console.error('🔴 Mensagem de erro definida:', errorMessage);
      }
    });
  }

  // Computed para autores paginados
  get paginatedAuthors(): AuthorDto[] {
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    const end = start + this.itemsPerPage();
    return this.authors().slice(start, end);
  }

  // Computed para total de páginas
  get totalPages(): number {
    return Math.ceil(this.totalItems() / this.itemsPerPage());
  }

  // Computed para array de páginas a serem exibidas
  get visiblePages(): number[] {
    const total = this.totalPages;
    const current = this.currentPage();
    const pages: number[] = [];
    
    if (total <= 7) {
      // Se tem 7 ou menos páginas, mostra todas
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      // Sempre mostra primeira página
      pages.push(1);
      
      if (current > 3) {
        pages.push(-1); // -1 representa "..."
      }
      
      // Páginas ao redor da atual
      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (current < total - 2) {
        pages.push(-1); // -1 representa "..."
      }
      
      // Sempre mostra última página
      pages.push(total);
    }
    
    return pages;
  }

  // Métodos de navegação
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
    this.currentPage.set(1); // Volta para primeira página
  }

  openCreateForm(): void {
    this.editingAuthor.set(null);
    this.authorForm.reset();
    this.showForm.set(true);
  }

  openEditForm(author: AuthorDto): void {
    this.editingAuthor.set(author);
    this.authorForm.patchValue({ name: author.name });
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingAuthor.set(null);
    this.authorForm.reset();
  }

  saveAuthor(): void {
    if (this.authorForm.invalid) {
      return;
    }

    const dto: CreateAuthorDto = this.authorForm.value;
    this.loading.set(true);
    this.error.set(null);

    const editing = this.editingAuthor();
    const operation = editing
      ? this.authorService.update(editing.id, dto)
      : this.authorService.create(dto);

    operation.subscribe({
      next: (response) => {
        console.log('Autor salvo com sucesso:', response);
        
        // Fecha o modal primeiro
        this.closeForm();
        
        // Pequeno delay para garantir que o modal fechou
        setTimeout(() => {
          this.loading.set(false);
          this.loadAuthors();
        }, 100);
      },
      error: (err) => {
        this.loading.set(false);
        let errorMessage = 'Erro ao salvar autor.';
        
        if (err.status === 400 && err.error?.message) {
          errorMessage = err.error.message;
        } else if (err.status === 0) {
          errorMessage = 'Não foi possível conectar à API. Verifique se o servidor está rodando.';
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        this.error.set(errorMessage);
        console.error('Error saving author:', err);
      }
    });
  }

  // Método para abrir o modal de confirmação
  deleteAuthor(id: string, name: string): void {
    console.log('deleteAuthor chamado - ID:', id, 'Nome:', name);
    this.authorToDelete.set({id, name});
    this.showDeleteConfirm.set(true);
    console.log('Modal de confirmação aberto:', this.showDeleteConfirm());
    console.log('Autor para deletar:', this.authorToDelete());
  }

  // Método para cancelar a exclusão
  cancelDelete(): void {
    this.showDeleteConfirm.set(false);
    this.authorToDelete.set(null);
  }

  // Método para confirmar e executar a exclusão
  confirmDelete(): void {
    const author = this.authorToDelete();
    
    console.log('confirmDelete chamado');
    console.log('Author to delete:', author);
    
    if (!author) {
      console.error('Nenhum autor selecionado para exclusão');
      return;
    }

    console.log(`Iniciando exclusão do autor ID: ${author.id}, Nome: ${author.name}`);
    
    this.loading.set(true);
    this.error.set(null);

    this.authorService.delete(author.id).subscribe({
      next: () => {
        console.log('Autor excluído com sucesso!');
        this.cancelDelete();
        this.loadAuthors();
      },
      error: (err) => {
        console.error('ERRO ao excluir autor:', err);
        console.error('Status:', err.status);
        console.error('Mensagem:', err.message);
        console.error('URL:', err.url);
        
        this.loading.set(false);
        let errorMessage = 'Erro ao excluir autor.';
        
        if (err.status === 404) {
          errorMessage = 'Autor não encontrado.';
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