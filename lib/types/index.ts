// Tipos para Author
export interface Author {
  id: string
  name: string
  email: string
  bio?: string | null
  nationality?: string | null
  birthYear?: number | null
  createdAt: string | Date
  updatedAt: string | Date
  books?: Book[]
  _count?: {
    books: number
  }
}

// Tipos para Book
export interface Book {
  id: string
  title: string
  description?: string | null
  isbn?: string | null
  publishedYear?: number | null
  genre?: string | null
  pages?: number | null
  authorId: string
  createdAt: string | Date
  updatedAt: string | Date
  author?: Author | AuthorBasic
}

// Tipo simplificado de Author para cuando viene en un Book
export interface AuthorBasic {
  id: string
  name: string
  email: string
  nationality?: string | null
}

// Tipos para paginación
export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: PaginationMeta
}

// Tipos para estadísticas de autor
export interface AuthorStats {
  authorId: string
  authorName: string
  totalBooks: number
  firstBook: {
    title: string
    year: number | null
  } | null
  latestBook: {
    title: string
    year: number | null
  } | null
  averagePages: number
  genres: string[]
  longestBook: {
    title: string
    pages: number | null
  } | null
  shortestBook: {
    title: string
    pages: number | null
  } | null
}

// Tipos para formularios
export interface AuthorFormData {
  name: string
  email: string
  bio?: string
  nationality?: string
  birthYear?: number | string
}

export interface BookFormData {
  title: string
  description?: string
  isbn?: string
  publishedYear?: number | string
  genre?: string
  pages?: number | string
  authorId: string
}

// Tipos para filtros de búsqueda
export interface BookSearchParams {
  search?: string
  genre?: string
  authorName?: string
  page?: number
  limit?: number
  sortBy?: 'title' | 'publishedYear' | 'createdAt'
  order?: 'asc' | 'desc'
}

// Tipo para errores de API
export interface ApiError {
  error: string
  status?: number
}

// Tipo para respuestas de éxito simples
export interface SuccessResponse {
  message: string
}
