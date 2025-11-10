'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import TextArea from '../../components/ui/TextArea'
import Select from '../../components/ui/Select'
import Modal from '../../components/ui/Modal'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import type { Author, AuthorStats, Book, BookFormData } from '@/lib/types'

export default function AuthorDetailPage() {
  const params = useParams()
  const router = useRouter()
  const authorId = params.id as string

  const [author, setAuthor] = useState<Author | null>(null)
  const [stats, setStats] = useState<AuthorStats | null>(null)
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Estados para edición de autor
  const [isEditingAuthor, setIsEditingAuthor] = useState(false)
  const [authorFormData, setAuthorFormData] = useState({
    name: '',
    email: '',
    bio: '',
    nationality: '',
    birthYear: ''
  })

  // Estados para modal de libro
  const [isBookModalOpen, setIsBookModalOpen] = useState(false)
  const [bookFormData, setBookFormData] = useState<BookFormData>({
    title: '',
    description: '',
    isbn: '',
    publishedYear: '',
    genre: '',
    pages: '',
    authorId: authorId
  })
  const [bookFormErrors, setBookFormErrors] = useState<Partial<BookFormData>>({})
  const [isSubmittingBook, setIsSubmittingBook] = useState(false)

  const genres = ['Novela', 'Cuento', 'Poesía', 'Ensayo', 'Teatro', 'Biografía', 'Historia', 'Ciencia', 'Fantasía', 'Romance', 'Misterio', 'Terror']

  // Cargar datos del autor
  useEffect(() => {
    fetchAuthorData()
  }, [authorId])

  const fetchAuthorData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [authorRes, statsRes, booksRes] = await Promise.all([
        fetch(`/api/authors/${authorId}`),
        fetch(`/api/authors/${authorId}/stats`),
        fetch(`/api/authors/${authorId}/books`)
      ])

      if (!authorRes.ok) throw new Error('Error al cargar autor')
      if (!statsRes.ok) throw new Error('Error al cargar estadísticas')
      if (!booksRes.ok) throw new Error('Error al cargar libros')

      const authorData = await authorRes.json()
      const statsData = await statsRes.json()
      const booksData = await booksRes.json()

      setAuthor(authorData)
      setStats(statsData)
      setBooks(booksData.books || [])

      setAuthorFormData({
        name: authorData.name,
        email: authorData.email,
        bio: authorData.bio || '',
        nationality: authorData.nationality || '',
        birthYear: authorData.birthYear || ''
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateAuthor = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch(`/api/authors/${authorId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...authorFormData,
          birthYear: authorFormData.birthYear ? parseInt(authorFormData.birthYear.toString()) : undefined
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al actualizar autor')
      }

      const updatedAuthor = await response.json()
      setAuthor(updatedAuthor)
      setIsEditingAuthor(false)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al actualizar autor')
    }
  }

  const validateBookForm = (): boolean => {
    const errors: Partial<BookFormData> = {}
    
    if (!bookFormData.title.trim()) {
      errors.title = 'El título es requerido'
    } else if (bookFormData.title.length < 3) {
      errors.title = 'El título debe tener al menos 3 caracteres'
    }
    
    if (bookFormData.pages && parseInt(bookFormData.pages.toString()) < 1) {
      errors.pages = 'El número de páginas debe ser mayor a 0'
    }
    
    setBookFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleCreateBook = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateBookForm()) return
    
    setIsSubmittingBook(true)
    try {
      const response = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...bookFormData,
          authorId: authorId,
          publishedYear: bookFormData.publishedYear ? parseInt(bookFormData.publishedYear.toString()) : undefined,
          pages: bookFormData.pages ? parseInt(bookFormData.pages.toString()) : undefined
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al crear libro')
      }

      setIsBookModalOpen(false)
      setBookFormData({
        title: '',
        description: '',
        isbn: '',
        publishedYear: '',
        genre: '',
        pages: '',
        authorId: authorId
      })
      fetchAuthorData() // Recargar datos
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al crear libro')
    } finally {
      setIsSubmittingBook(false)
    }
  }

  const handleDeleteBook = async (bookId: string, title: string) => {
    if (!window.confirm(`¿Eliminar el libro "${title}"?`)) return

    try {
      const response = await fetch(`/api/books/${bookId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Error al eliminar libro')

      fetchAuthorData() // Recargar datos
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar libro')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Cargando información del autor..." />
      </div>
    )
  }

  if (error || !author) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <div className="text-center py-12">
            <p className="text-red-600 text-lg mb-4">{error || 'Autor no encontrado'}</p>
            <Link href="/">
              <Button>Volver al inicio</Button>
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link href="/" className="text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors">
            ← Volver al inicio
          </Link>
        </div>

      {/* Información del Autor */}
      <Card className="mb-8 border-2 border-purple-200 shadow-lg">
        {!isEditingAuthor ? (
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                  {author.name}
                </h1>
                <p className="text-gray-600">{author.email}</p>
              </div>
              <Button onClick={() => setIsEditingAuthor(true)} variant="secondary" className="shadow-md hover:shadow-lg">
                ✏️ Editar Información
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              {author.nationality && (
                <div>
                  <p className="text-sm text-gray-500">Nacionalidad</p>
                  <p className="font-bold text-gray-900">{author.nationality}</p>
                </div>
              )}
              {author.birthYear && (
                <div>
                  <p className="text-sm text-gray-500">Año de Nacimiento</p>
                  <p className="font-bold text-gray-900">{author.birthYear}</p>
                </div>
              )}
            </div>
            
            {author.bio && (
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-2">Biografía</p>
                <p className="text-gray-700">{author.bio}</p>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleUpdateAuthor} className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Editar Información del Autor</h2>
            
            <Input
              label="Nombre"
              value={authorFormData.name}
              onChange={(e) => setAuthorFormData({ ...authorFormData, name: e.target.value })}
              required
            />
            
            <Input
              label="Email"
              type="email"
              value={authorFormData.email}
              onChange={(e) => setAuthorFormData({ ...authorFormData, email: e.target.value })}
              required
            />
            
            <Input
              label="Nacionalidad"
              value={authorFormData.nationality}
              onChange={(e) => setAuthorFormData({ ...authorFormData, nationality: e.target.value })}
            />
            
            <Input
              label="Año de Nacimiento"
              type="number"
              value={authorFormData.birthYear}
              onChange={(e) => setAuthorFormData({ ...authorFormData, birthYear: e.target.value })}
            />
            
            <TextArea
              label="Biografía"
              value={authorFormData.bio}
              onChange={(e) => setAuthorFormData({ ...authorFormData, bio: e.target.value })}
              rows={4}
            />
            
            <div className="flex gap-3 pt-4">
              <Button type="submit">Guardar Cambios</Button>
              <Button type="button" variant="outline" onClick={() => setIsEditingAuthor(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        )}
      </Card>

      {/* Estadísticas del Autor */}
      {stats && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            📊 Estadísticas
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gradient-to-br from-blue-400 to-blue-600 border-none shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-center">
                <p className="text-4xl font-bold text-white">{stats.totalBooks}</p>
                <p className="text-sm text-blue-50 mt-1">Total de Libros</p>
              </div>
            </Card>
            
            <Card className="bg-gradient-to-br from-green-400 to-green-600 border-none shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-center">
                <p className="text-4xl font-bold text-white">{stats.averagePages}</p>
                <p className="text-sm text-green-50 mt-1">Páginas Promedio</p>
              </div>
            </Card>
            
            <Card className="bg-gradient-to-br from-purple-400 to-purple-600 border-none shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-center">
                <p className="text-4xl font-bold text-white">{stats.genres.length}</p>
                <p className="text-sm text-purple-50 mt-1">Géneros</p>
              </div>
            </Card>
            
            <Card className="bg-gradient-to-br from-orange-400 to-orange-600 border-none shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-center">
                <p className="text-4xl font-bold text-white">
                  {stats.firstBook?.year || '-'}
                </p>
                <p className="text-sm text-orange-50 mt-1">Primer Libro</p>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.firstBook && (
              <Card>
                <h3 className="font-semibold text-gray-900 mb-2">Primer Libro</h3>
                <p className="text-gray-700">{stats.firstBook.title}</p>
                <p className="text-sm text-gray-500">{stats.firstBook.year}</p>
              </Card>
            )}
            
            {stats.latestBook && (
              <Card>
                <h3 className="font-semibold text-gray-900 mb-2">Último Libro</h3>
                <p className="text-gray-700">{stats.latestBook.title}</p>
                <p className="text-sm text-gray-500">{stats.latestBook.year}</p>
              </Card>
            )}
            
            {stats.longestBook && (
              <Card>
                <h3 className="font-semibold text-gray-900 mb-2">Libro Más Largo</h3>
                <p className="text-gray-700">{stats.longestBook.title}</p>
                <p className="text-sm text-gray-500">{stats.longestBook.pages} páginas</p>
              </Card>
            )}
          </div>

          {stats.genres.length > 0 && (
            <Card className="mt-4">
              <h3 className="font-semibold text-gray-900 mb-3">Géneros que Escribe</h3>
              <div className="flex flex-wrap gap-2">
                {stats.genres.map((genre) => (
                  <span
                    key={genre}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Lista de Libros */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            📚 Libros del Autor
          </h2>
          <Button onClick={() => setIsBookModalOpen(true)} className="shadow-lg hover:shadow-xl">
            + Agregar Libro
          </Button>
        </div>

        {books.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book) => (
              <Card key={book.id} className="hover:shadow-xl transition-shadow border-2 border-gray-100 hover:border-purple-300">
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {book.title}
                  </h3>
                  
                  {book.description && (
                    <p className="text-sm text-gray-600 line-clamp-3">{book.description}</p>
                  )}
                  
                  <div className="space-y-1 text-sm text-gray-700">
                    {book.genre && <p><span className="font-medium">Género:</span> {book.genre}</p>}
                    {book.publishedYear && <p><span className="font-medium">Año:</span> {book.publishedYear}</p>}
                    {book.pages && <p><span className="font-medium">Páginas:</span> {book.pages}</p>}
                  </div>
                  
                  <div className="pt-2 border-t border-gray-200">
                    <Button 
                      size="sm" 
                      variant="danger"
                      onClick={() => handleDeleteBook(book.id, book.title)}
                      className="w-full"
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">Este autor aún no tiene libros registrados</p>
              <Button onClick={() => setIsBookModalOpen(true)}>
                Agregar Primer Libro
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Modal para Agregar Libro */}
      <Modal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        title="Agregar Nuevo Libro"
        size="lg"
      >
        <form onSubmit={handleCreateBook} className="space-y-4">
          <Input
            label="Título *"
            value={bookFormData.title}
            onChange={(e) => setBookFormData({ ...bookFormData, title: e.target.value })}
            error={bookFormErrors.title}
            placeholder="Título del libro"
          />
          
          <TextArea
            label="Descripción"
            value={bookFormData.description}
            onChange={(e) => setBookFormData({ ...bookFormData, description: e.target.value })}
            placeholder="Descripción breve..."
            rows={3}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="ISBN"
              value={bookFormData.isbn}
              onChange={(e) => setBookFormData({ ...bookFormData, isbn: e.target.value })}
              placeholder="978-0307474728"
            />
            
            <Select
              label="Género"
              value={bookFormData.genre}
              onChange={(e) => setBookFormData({ ...bookFormData, genre: e.target.value })}
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
              value={bookFormData.publishedYear}
              onChange={(e) => setBookFormData({ ...bookFormData, publishedYear: e.target.value })}
              placeholder="2023"
            />
            
            <Input
              label="Páginas"
              type="number"
              value={bookFormData.pages}
              onChange={(e) => setBookFormData({ ...bookFormData, pages: e.target.value })}
              error={bookFormErrors.pages?.toString()}
              placeholder="300"
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsBookModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isSubmittingBook}>
              Crear Libro
            </Button>
          </div>
        </form>
      </Modal>
      </div>
    </div>
  )
}
