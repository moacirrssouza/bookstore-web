export interface BookDto {
  id: string;
  name: string;
  author: string;
  genre: string;
  description?: string;
}

export interface CreateBookDto {
  name: string;
  authorId: string;
  genreId: string;
  description: string;
}
