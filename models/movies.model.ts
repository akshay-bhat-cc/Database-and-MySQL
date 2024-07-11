export interface IMoviesBoolean {
  id?: boolean;
  title?: boolean;
  release_year?: boolean;
  director?: boolean;
  rating?: boolean;
  [key: string]: boolean | undefined;
}

export interface IMovies {
  title?: string;
  release_year?: string;
  director?: string;
  rating?: number;
  [key: string]: string | number | undefined;
}
