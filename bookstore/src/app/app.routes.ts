import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { AuthorsComponent } from './features/authors/authors.component';
import { GenresComponent } from './features/genres/genres.component';
import { BooksComponent } from './features/books/books.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'authors',
    component: AuthorsComponent
  },
  {
    path: 'genres',
    component: GenresComponent
  },
  {
    path: 'books',
    component: BooksComponent
  }
];
