import { useState, useCallback } from 'react'
import type { Book, PaginatedResponse, BookSearchParams } from '@/lib/types'

export function useBooks() {
  const [books, setBooks] = useState<Book[]>([])
  const [pagination, setPagination] = useState<PaginatedResponse<Book>['pagination'] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchBooks = useCallback(async (params: BookSearchParams = {}) => {
    setLoading(true)
    setError(null)
    try {
      const queryParams = new URLSearchParams()
      
      if (params.search) queryParams.set('search', params.search)
      if (params.genre) queryParams.set('genre', params.genre)
      if (params.authorName) queryParams.set('authorName', params.authorName)
      if (params.page) queryParams.set('page', params.page.toString())
      if (params.limit) queryParams.set('limit', params.limit.toString())
      if (params.sortBy) queryParams.set('sortBy', params.sortBy)
      if (params.order) queryParams.set('order', params.order)

      const response = await fetch(`/api/books/search?${queryParams.toString()}`)
      if (!response.ok) throw new Error('Error al buscar libros')
      
      const data: PaginatedResponse<Book> = await response.json()
      setBooks(data.data)
      setPagination(data.pagination)
      return data
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const createBook = async (bookData: Partial<Book>) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookData)
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al crear libro')
      }
      const newBook = await response.json()
      return newBook
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateBook = async (id: string, bookData: Partial<Book>) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/books/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookData)
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al actualizar libro')
      }
      const updatedBook = await response.json()
      setBooks(prev => prev.map(b => b.id === id ? updatedBook : b))
      return updatedBook
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteBook = async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/books/${id}`, {
        method: 'DELETE'
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al eliminar libro')
      }
      setBooks(prev => prev.filter(b => b.id !== id))
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    books,
    pagination,
    loading,
    error,
    searchBooks,
    createBook,
    updateBook,
    deleteBook
  }
}
