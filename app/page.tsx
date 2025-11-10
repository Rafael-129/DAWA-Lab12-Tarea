'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuthors } from './hooks/useAuthors'
import Button from './components/ui/Button'
import Card from './components/ui/Card'
import Input from './components/ui/Input'
import TextArea from './components/ui/TextArea'
import Modal from './components/ui/Modal'
import LoadingSpinner from './components/ui/LoadingSpinner'
import type { AuthorFormData } from '@/lib/types'

export default function Home() {
  const { authors, loading, error, createAuthor, updateAuthor, deleteAuthor } = useAuthors()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAuthor, setEditingAuthor] = useState<any>(null)
  const [formData, setFormData] = useState<AuthorFormData>({
    name: '',
    email: '',
    bio: '',
    nationality: '',
    birthYear: ''
  })
  const [formErrors, setFormErrors] = useState<Partial<AuthorFormData>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      bio: '',
      nationality: '',
      birthYear: ''
    })
    setFormErrors({})
    setEditingAuthor(null)
  }

  const openCreateModal = () => {
    resetForm()
    setIsModalOpen(true)
  }

  const openEditModal = (author: any) => {
    setEditingAuthor(author)
    setFormData({
      name: author.name,
      email: author.email,
      bio: author.bio || '',
      nationality: author.nationality || '',
      birthYear: author.birthYear || ''
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    resetForm()
  }

  const validateForm = (): boolean => {
    const errors: Partial<AuthorFormData> = {}
    
    if (!formData.name.trim()) {
      errors.name = 'El nombre es requerido'
    }
    
    if (!formData.email.trim()) {
      errors.email = 'El email es requerido'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Email inválido'
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
        birthYear: formData.birthYear ? parseInt(formData.birthYear.toString()) : undefined
      }

      if (editingAuthor) {
        await updateAuthor(editingAuthor.id, dataToSend)
      } else {
        await createAuthor(dataToSend)
      }
      
      closeModal()
    } catch (err) {
      console.error('Error al guardar autor:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`¿Estás seguro de eliminar al autor "${name}"? Esto eliminará también todos sus libros.`)) {
      try {
        await deleteAuthor(id)
      } catch (err) {
        console.error('Error al eliminar autor:', err)
      }
    }
  }

  if (loading && authors.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Cargando autores..." />
      </div>
    )
  }

  const totalBooks = authors.reduce((sum, author) => sum + (author._count?.books || 0), 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Dashboard - Sistema de Biblioteca
          </h1>
          <p className="text-gray-600">Gestiona autores y libros de manera eficiente</p>
        </div>

      {/* Estadísticas Generales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-400 to-blue-600 border-none shadow-lg hover:shadow-xl transition-shadow">
          <div className="text-center">
            <p className="text-5xl font-bold text-white mb-2">{authors.length}</p>
            <p className="text-blue-50 font-medium text-lg">Autores Registrados</p>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-green-400 to-green-600 border-none shadow-lg hover:shadow-xl transition-shadow">
          <div className="text-center">
            <p className="text-5xl font-bold text-white mb-2">{totalBooks}</p>
            <p className="text-green-50 font-medium text-lg">Libros Totales</p>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-purple-400 to-purple-600 border-none shadow-lg hover:shadow-xl transition-shadow">
          <div className="text-center">
            <p className="text-5xl font-bold text-white mb-2">
              {authors.length > 0 ? (totalBooks / authors.length).toFixed(1) : 0}
            </p>
            <p className="text-purple-50 font-medium text-lg">Libros por Autor</p>
          </div>
        </Card>
      </div>

      {/* Acciones */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Autores
        </h2>
        <Button onClick={openCreateModal} className="shadow-lg hover:shadow-xl">
          + Crear Autor
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Lista de Autores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {authors.map((author) => (
          <Card key={author.id} className="hover:shadow-xl transition-shadow border-2 border-gray-100 hover:border-blue-300">
            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{author.name}</h3>
                <p className="text-sm text-gray-600">{author.email}</p>
              </div>
              
              {author.nationality && (
                <p className="text-sm text-gray-700">
                  <span className="font-medium">País:</span> {author.nationality}
                </p>
              )}
              
              {author.birthYear && (
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Nacimiento:</span> {author.birthYear}
                </p>
              )}
              
              {author.bio && (
                <p className="text-sm text-gray-600 line-clamp-2">{author.bio}</p>
              )}
              
              <div className="pt-2 border-t border-gray-200">
                <p className="text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  📚 {author._count?.books || 0} libro(s)
                </p>
              </div>
              
              <div className="flex flex-wrap gap-2 pt-2">
                <Link href={`/authors/${author.id}`}>
                  <Button size="sm" variant="primary" className="shadow-md hover:shadow-lg">
                    Ver Detalles
                  </Button>
                </Link>
                <Button 
                  size="sm" 
                  variant="secondary"
                  onClick={() => openEditModal(author)}
                  className="shadow-md hover:shadow-lg"
                >
                  Editar
                </Button>
                <Button 
                  size="sm" 
                  variant="danger"
                  onClick={() => handleDelete(author.id, author.name)}
                  className="shadow-md hover:shadow-lg"
                >
                  Eliminar
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {authors.length === 0 && !loading && (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">No hay autores registrados</p>
            <Button onClick={openCreateModal}>Crear primer autor</Button>
          </div>
        </Card>
      )}

      {/* Modal de Crear/Editar */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingAuthor ? 'Editar Autor' : 'Crear Nuevo Autor'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={formErrors.name}
            placeholder="Gabriel García Márquez"
          />
          
          <Input
            label="Email *"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={formErrors.email}
            placeholder="autor@example.com"
          />
          
          <Input
            label="Nacionalidad"
            value={formData.nationality}
            onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
            placeholder="Colombia"
          />
          
          <Input
            label="Año de Nacimiento"
            type="number"
            value={formData.birthYear}
            onChange={(e) => setFormData({ ...formData, birthYear: e.target.value })}
            placeholder="1927"
          />
          
          <TextArea
            label="Biografía"
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            placeholder="Breve biografía del autor..."
            rows={4}
          />
          
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {editingAuthor ? 'Actualizar' : 'Crear'} Autor
            </Button>
          </div>
        </form>
      </Modal>
      </div>
    </div>
  )
}
