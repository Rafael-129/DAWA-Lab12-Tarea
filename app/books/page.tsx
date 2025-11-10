'use client'

import { useState, useEffect } from 'react'
import { useBooks } from '../hooks/useBooks'
import { useAuthors } from '../hooks/useAuthors'
import { useDebounce } from '../hooks/useDebounce'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import TextArea from '../components/ui/TextArea'
import Select from '../components/ui/Select'
import Modal from '../components/ui/Modal'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import type { BookFormData, BookSearchParams } from '@/lib/types'

export default function BooksPage() {
  const { books, pagination, loading, searchBooks, createBook, updateBook, deleteBook } = useBooks()
  const { authors } = useAuthors()
  
  // Estado de búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('')
  const [selectedAuthor, setSelectedAuthor] = useState('')
  const [sortBy, setSortBy] = useState<'title' | 'publishedYear' | 'createdAt'>('createdAt')
  const [order, setOrder] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [limit] = useState(10)

  // Estados del modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBook, setEditingBook] = useState<any>(null)
  const [formData, setFormData] = useState<BookFormData>({
    title: '',
    description: '',
    isbn: '',
    publishedYear: '',
    genre: '',
    pages: '',
    authorId: ''
  })
  const [formErrors, setFormErrors] = useState<Partial<BookFormData>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Debounce del término de búsqueda
  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  // Géneros disponibles
  const genres = ['Novela', 'Cuento', 'Poesía', 'Ensayo', 'Teatro', 'Biografía', 'Historia', 'Ciencia', 'Fantasía', 'Romance', 'Misterio', 'Terror']

  // Efecto para realizar búsqueda
  useEffect(() => {
    const params: BookSearchParams = {
      search: debouncedSearchTerm,
      genre: selectedGenre,
      authorName: selectedAuthor,
      page: currentPage,
      limit,
      sortBy,
      order
    }
    searchBooks(params)
  }, [debouncedSearchTerm, selectedGenre, selectedAuthor, currentPage, sortBy, order, limit, searchBooks])

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      isbn: '',
      publishedYear: '',
      genre: '',
      pages: '',
      authorId: ''
    })
    setFormErrors({})
    setEditingBook(null)
  }

  const openCreateModal = () => {
    resetForm()
    setIsModalOpen(true)
  }

  const openEditModal = (book: any) => {
    setEditingBook(book)
    setFormData({
      title: book.title,
      description: book.description || '',
      isbn: book.isbn || '',
      publishedYear: book.publishedYear || '',
      genre: book.genre || '',
      pages: book.pages || '',
      authorId: book.authorId
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    resetForm()
  }

  const validateForm = (): boolean => {
    const errors: Partial<BookFormData> = {}
    
    if (!formData.title.trim()) {
      errors.title = 'El título es requerido'
    } else if (formData.title.length < 3) {
      errors.title = 'El título debe tener al menos 3 caracteres'
    }
    
    if (!formData.authorId) {
      errors.authorId = 'El autor es requerido'
    }
    
    if (formData.pages && parseInt(formData.pages.toString()) < 1) {
      errors.pages = 'El número de páginas debe ser mayor a 0'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsSubmitting(true)
    try {
      const dataToSend = {
        ...formData,
        publishedYear: formData.publishedYear ? parseInt(formData.publishedYear.toString()) : undefined,
        pages: formData.pages ? parseInt(formData.pages.toString()) : undefined
      }

      if (editingBook) {
        await updateBook(editingBook.id, dataToSend)
      } else {
        await createBook(dataToSend)
      }
      
      closeModal()
      // Refrescar búsqueda
      searchBooks({
        search: debouncedSearchTerm,
        genre: selectedGenre,
        authorName: selectedAuthor,
        page: currentPage,
        limit,
        sortBy,
        order
      })
    } catch (err) {
      console.error('Error al guardar libro:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`¿Estás seguro de eliminar el libro "${title}"?`)) {
      try {
        await deleteBook(id)
        // Refrescar búsqueda
        searchBooks({
          search: debouncedSearchTerm,
          genre: selectedGenre,
          authorName: selectedAuthor,
          page: currentPage,
          limit,
          sortBy,
          order
        })
      } catch (err) {
        console.error('Error al eliminar libro:', err)
      }
    }
  }

  const resetFilters = () => {
    setSearchTerm('')
    setSelectedGenre('')
    setSelectedAuthor('')
    setSortBy('createdAt')
    setOrder('desc')
    setCurrentPage(1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Búsqueda de Libros
          </h1>
          <p className="text-gray-600">Busca, filtra y gestiona la colección de libros</p>
        </div>

      {/* Filtros y búsqueda */}
      <Card className="mb-6">
        <div className="space-y-4">
          {/* Barra de búsqueda */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Buscar por título..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
            />
            <Button onClick={openCreateModal} className="md:ml-auto shadow-lg hover:shadow-xl">
              + Crear Libro
            </Button>
          </div>

          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Género"
              value={selectedGenre}
              onChange={(e) => {
                setSelectedGenre(e.target.value)
                setCurrentPage(1)
              }}
              options={[
                { value: '', label: 'Todos los géneros' },
                ...genres.map(g => ({ value: g, label: g }))
              ]}
            />
            
            <Input
              label="Autor"
              placeholder="Buscar por nombre de autor..."
              value={selectedAuthor}
              onChange={(e) => {
                setSelectedAuthor(e.target.value)
                setCurrentPage(1)
              }}
            />

            <Select
              label="Ordenar por"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              options={[
                { value: 'createdAt', label: 'Fecha de creación' },
                { value: 'title', label: 'Título' },
                { value: 'publishedYear', label: 'Año de publicación' }
              ]}
            />
          </div>

          {/* Orden y reset */}
          <div className="flex flex-wrap gap-3 items-center">
            <Select
              value={order}
              onChange={(e) => setOrder(e.target.value as 'asc' | 'desc')}
              options={[
                { value: 'desc', label: 'Descendente' },
                { value: 'asc', label: 'Ascendente' }
              ]}
              className="w-40"
            />
            <Button variant="outline" size="sm" onClick={resetFilters}>
              Limpiar Filtros
            </Button>
            {pagination && (
              <span className="text-sm text-gray-600 ml-auto">
                {pagination.total} resultado(s) encontrado(s)
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-12">
          <LoadingSpinner text="Buscando libros..." />
        </div>
      )}

      {/* Resultados */}
      {!loading && books.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {books.map((book) => (
              <Card key={book.id} className="hover:shadow-xl transition-shadow border-2 border-gray-100 hover:border-green-300">
                <div className="space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {book.title}
                    </h3>
                    <p className="text-sm bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent font-medium mt-1">
                      ✍️ {typeof book.author === 'object' ? book.author.name : 'Autor desconocido'}
                    </p>
                  </div>
                  
                  {book.description && (
                    <p className="text-sm text-gray-600 line-clamp-3">{book.description}</p>
                  )}
                  
                  <div className="space-y-1 text-sm text-gray-700">
                    {book.genre && <p><span className="font-medium">Género:</span> {book.genre}</p>}
                    {book.publishedYear && <p><span className="font-medium">Año:</span> {book.publishedYear}</p>}
                    {book.pages && <p><span className="font-medium">Páginas:</span> {book.pages}</p>}
                    {book.isbn && <p className="text-xs text-gray-500">ISBN: {book.isbn}</p>}
                  </div>
                  
                  <div className="flex gap-2 pt-2 border-t border-gray-200">
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={() => openEditModal(book)}
                      className="flex-1 shadow-md hover:shadow-lg"
                    >
                      ✏️ Editar
                    </Button>
                    <Button 
                      size="sm" 
                      variant="danger"
                      onClick={() => handleDelete(book.id, book.title)}
                      className="flex-1 shadow-md hover:shadow-lg"
                    >
                      🗑️ Eliminar
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Paginación */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(p => p - 1)}
                disabled={!pagination.hasPrev}
              >
                ← Anterior
              </Button>
              <span className="px-4 py-2 text-sm text-gray-700">
                Página {pagination.page} de {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(p => p + 1)}
                disabled={!pagination.hasNext}
              >
                Siguiente →
              </Button>
            </div>
          )}
        </>
      )}

      {/* Sin resultados */}
      {!loading && books.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">No se encontraron libros</p>
            <Button onClick={resetFilters} variant="outline">
              Limpiar filtros
            </Button>
          </div>
        </Card>
      )}

      {/* Modal de Crear/Editar */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingBook ? 'Editar Libro' : 'Crear Nuevo Libro'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Título *"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            error={formErrors.title}
            placeholder="Cien años de soledad"
          />
          
          <Select
            label="Autor *"
            value={formData.authorId}
            onChange={(e) => setFormData({ ...formData, authorId: e.target.value })}
            error={formErrors.authorId}
            options={[
              { value: '', label: 'Seleccionar autor' },
              ...authors.map(a => ({ value: a.id, label: a.name }))
            ]}
          />
          
          <TextArea
            label="Descripción"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Breve descripción del libro..."
            rows={3}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="ISBN"
              value={formData.isbn}
              onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
              placeholder="978-0307474728"
            />
            
            <Select
              label="Género"
              value={formData.genre}
              onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
              options={[
                { value: '', label: 'Sin género' },
                ...genres.map(g => ({ value: g, label: g }))
              ]}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Año de Publicación"
              type="number"
              value={formData.publishedYear}
              onChange={(e) => setFormData({ ...formData, publishedYear: e.target.value })}
              placeholder="1967"
            />
            
            <Input
              label="Páginas"
              type="number"
              value={formData.pages}
              onChange={(e) => setFormData({ ...formData, pages: e.target.value })}
              error={formErrors.pages?.toString()}
              placeholder="417"
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {editingBook ? 'Actualizar' : 'Crear'} Libro
            </Button>
          </div>
        </form>
      </Modal>
      </div>
    </div>
  )
}
