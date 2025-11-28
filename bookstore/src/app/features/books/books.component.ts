import { Component, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BooksStore } from '../../core/store/books.store';
import { BookDto, CreateBookDto } from '../../models/book.dto';
import { AuthorsStore } from '../../core/store/authors.store';
import { GenresStore } from '../../core/store/genres.store';
import { AuthorDto } from '../../models/author.dto';
import { GenreDto } from '../../models/genre.dto';

@Component({
  selector: 'app-books',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './books.component.html',
  styleUrl: './books.component.scss'
})
export class BooksComponent implements OnInit {
  Math = Math;
  books = signal<BookDto[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  showForm = signal(false);
  editingBook = signal<BookDto | null>(null);
  showDeleteConfirm = signal(false);
  bookToDelete = signal<{id: string, name: string} | null>(null);
  currentPage = signal(1);
  itemsPerPage = signal(10);
  totalItems = signal(0);
  bookForm: FormGroup;
  authors = signal<AuthorDto[]>([]);
  genres = signal<GenreDto[]>([]);

  constructor(
    private booksStore: BooksStore,
    private fb: FormBuilder,
    private authorsStore: AuthorsStore,
    private genresStore: GenresStore
  ) {
    this.bookForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      authorId: ['', [Validators.required]],
      genreId: ['', [Validators.required]],
      description: ['']
    });
    effect(() => {
      this.books.set(this.booksStore.books());
      this.loading.set(this.booksStore.loading());
      this.error.set(this.booksStore.error());
      this.authors.set(this.authorsStore.authors());
      this.genres.set(this.genresStore.genres());
    });
  }

  ngOnInit(): void {
    this.loadBooks();
    this.authorsStore.loadAll().subscribe();
    this.genresStore.loadAll().subscribe();
  }

  loadBooks(): void {
    console.log('Iniciando carregamento de livros...');
    this.loading.set(true);
    this.error.set(null);
    
    this.booksStore.loadAll().subscribe({
      next: (response) => {
        try {
          console.log('Resposta completa da API:', response);
          console.log('Tipo da resposta:', typeof response);
          console.log('É array?', Array.isArray(response));
          
          let booksData: BookDto[] = [];
          
          if (response && typeof response === 'object') {
            if ('data' in response && response.data !== null && response.data !== undefined) {
              console.log('response.data encontrado:', response.data);
              if (Array.isArray(response.data)) {
                booksData = response.data;
                console.log(`Array de livros extraído: ${booksData.length} itens`);
              } else if (typeof response.data === 'object') {
                booksData = [response.data as BookDto];
                console.log('Objeto único convertido para array');
              }
            } else if (Array.isArray(response)) {
              booksData = response;
              console.log(`Response é array direto: ${booksData.length} itens`);
            } else {
              console.warn('Formato de resposta não reconhecido. Keys:', Object.keys(response));
            }
          } else {
            console.warn('Resposta inválida ou vazia:', response);
          }
          
          console.log(`Total de livros processados: ${booksData.length}`);
          this.totalItems.set(this.booksStore.books().length);
          this.loading.set(false);
          
          if (booksData.length === 0) {
            console.log('ℹ️ Nenhum livro encontrado - exibindo empty state');
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
        let errorMessage = 'Erro ao carregar livros.';
        
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

  get paginatedBooks(): BookDto[] {
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    const end = start + this.itemsPerPage();
    return this.books().slice(start, end);
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
    } else {
      pages.push(1);
      
      if (current > 3) {
        pages.push(-1); // Ellipsis
      }
      
      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (current < total - 2) {
        pages.push(-1); // Ellipsis
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
    this.editingBook.set(null);
    this.bookForm.reset();
    this.showForm.set(true);
  }

  openEditForm(book: BookDto): void {
    this.editingBook.set(book);
    const foundAuthor = this.authors().find(a => a.name === book.author);
    const foundGenre = this.genres().find(g => g.name === book.genre);
    this.bookForm.patchValue({
      name: book.name,
      authorId: foundAuthor ? foundAuthor.id : '',
      genreId: foundGenre ? foundGenre.id : '',
      description: book.description || ''
    });
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingBook.set(null);
    this.bookForm.reset();
  }

  saveBook(): void {
    if (this.bookForm.invalid) {
      return;
    }

    const dto: CreateBookDto = this.bookForm.value;
    this.loading.set(true);
    this.error.set(null);

    const editing = this.editingBook();
    const operation = editing
      ? this.booksStore.update(editing.id, dto)
      : this.booksStore.create(dto);

    operation.subscribe({
      next: (response) => {
        console.log('Livro salvo com sucesso:', response);
        this.closeForm();

        setTimeout(() => {
          this.loading.set(false);
          this.loadBooks();
        }, 100);
      },
      error: (err) => {
        this.loading.set(false);
        let errorMessage = 'Erro ao salvar livro.';
        
        if (err.status === 400 && err.error?.message) {
          errorMessage = err.error.message;
        } else if (err.status === 0) {
          errorMessage = 'Não foi possível conectar à API. Verifique se o servidor está rodando.';
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        this.error.set(errorMessage);
        console.error('Error saving book:', err);
      }
    });
  }

  deleteBook(id: string, name: string): void {
    console.log('deleteBook chamado - ID:', id, 'Nome:', name);
    this.bookToDelete.set({id, name});
    this.showDeleteConfirm.set(true);
    console.log('Modal de confirmação aberto:', this.showDeleteConfirm());
    console.log('Livro para deletar:', this.bookToDelete());
  }

  cancelDelete(): void {
    this.showDeleteConfirm.set(false);
    this.bookToDelete.set(null);
  }

  confirmDelete(): void {
    const book = this.bookToDelete();
    
    console.log('confirmDelete chamado');
    console.log('Book to delete:', book);
    
    if (!book) {
      console.error('Nenhum livro selecionado para exclusão');
      return;
    }

    console.log(`Iniciando exclusão do livro ID: ${book.id}, Nome: ${book.name}`);
    
    this.loading.set(true);
    this.error.set(null);

    this.booksStore.delete(book.id).subscribe({
      next: () => {
        console.log('Livro excluído com sucesso!');
        this.cancelDelete();
        this.loadBooks();
      },
      error: (err) => {
        console.error('ERRO ao excluir livro:', err);
        console.error('Status:', err.status);
        console.error('Mensagem:', err.message);
        console.error('URL:', err.url);
        
        this.loading.set(false);
        let errorMessage = 'Erro ao excluir livro.';
        
        if (err.status === 404) {
          errorMessage = 'Livro não encontrado.';
        } else if (err.status === 400) {
          errorMessage = err.error?.message || 'Não é possível excluir este livro.';
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
