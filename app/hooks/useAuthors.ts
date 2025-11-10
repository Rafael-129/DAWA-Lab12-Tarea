import { useState, useEffect, useCallback } from 'react'
import type { Author } from '@/lib/types'

export function useAuthors() {
  const [authors, setAuthors] = useState<Author[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAuthors = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/authors')
      if (!response.ok) throw new Error('Error al cargar autores')
      const data = await response.json()
      setAuthors(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [])

  const createAuthor = async (authorData: Partial<Author>) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/authors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authorData)
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al crear autor')
      }
      const newAuthor = await response.json()
      setAuthors(prev => [newAuthor, ...prev])
      return newAuthor
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateAuthor = async (id: string, authorData: Partial<Author>) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/authors/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authorData)
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al actualizar autor')
      }
      const updatedAuthor = await response.json()
      setAuthors(prev => prev.map(a => a.id === id ? updatedAuthor : a))
      return updatedAuthor
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteAuthor = async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/authors/${id}`, {
        method: 'DELETE'
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al eliminar autor')
      }
      setAuthors(prev => prev.filter(a => a.id !== id))
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAuthors()
  }, [fetchAuthors])

  return {
    authors,
    loading,
    error,
    fetchAuthors,
    createAuthor,
    updateAuthor,
    deleteAuthor
  }
}
