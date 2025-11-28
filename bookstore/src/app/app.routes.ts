import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { AuthorsComponent } from './components/authors/authors.component';
import { GenresComponent } from './components/genres/genres.component';

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
  }
];
