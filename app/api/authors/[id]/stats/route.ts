import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Obtener estadísticas completas de un autor
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Verificar que el autor existe y obtener sus libros
    const author = await prisma.author.findUnique({
      where: { id },
      include: {
        books: {
          orderBy: {
            publishedYear: 'asc'
          }
        }
      }
    })

    if (!author) {
      return NextResponse.json(
        { error: 'Autor no encontrado' },
        { status: 404 }
      )
    }

    const books = author.books

    // Si el autor no tiene libros, devolver estadísticas vacías
    if (books.length === 0) {
      return NextResponse.json({
        authorId: author.id,
        authorName: author.name,
        totalBooks: 0,
        firstBook: null,
        latestBook: null,
        averagePages: 0,
        genres: [],
        longestBook: null,
        shortestBook: null
      })
    }

    // Calcular total de libros
    const totalBooks = books.length

    // Obtener primer libro (menor año de publicación)
    const booksWithYear = books.filter(book => book.publishedYear !== null)
    const firstBookByYear = booksWithYear.length > 0
      ? booksWithYear.reduce((prev, current) => 
          (prev.publishedYear! < current.publishedYear!) ? prev : current
        )
      : books[0]
    
    const firstBook = {
      title: firstBookByYear.title,
      year: firstBookByYear.publishedYear
    }

    // Obtener último libro (mayor año de publicación)
    const latestBookByYear = booksWithYear.length > 0
      ? booksWithYear.reduce((prev, current) => 
          (prev.publishedYear! > current.publishedYear!) ? prev : current
        )
      : books[books.length - 1]
    
    const latestBook = {
      title: latestBookByYear.title,
      year: latestBookByYear.publishedYear
    }

    // Calcular promedio de páginas
    const booksWithPages = books.filter(book => book.pages !== null)
    const averagePages = booksWithPages.length > 0
      ? Math.round(
          booksWithPages.reduce((sum, book) => sum + (book.pages || 0), 0) / booksWithPages.length
        )
      : 0

    // Obtener géneros únicos
    const genres = [...new Set(
      books
        .filter(book => book.genre !== null)
        .map(book => book.genre!)
    )]

    // Libro con más páginas
    const longestBookData = booksWithPages.length > 0
      ? booksWithPages.reduce((prev, current) => 
          (prev.pages! > current.pages!) ? prev : current
        )
      : null
    
    const longestBook = longestBookData ? {
      title: longestBookData.title,
      pages: longestBookData.pages
    } : null

    // Libro con menos páginas
    const shortestBookData = booksWithPages.length > 0
      ? booksWithPages.reduce((prev, current) => 
          (prev.pages! < current.pages!) ? prev : current
        )
      : null
    
    const shortestBook = shortestBookData ? {
      title: shortestBookData.title,
      pages: shortestBookData.pages
    } : null

    return NextResponse.json({
      authorId: author.id,
      authorName: author.name,
      totalBooks,
      firstBook,
      latestBook,
      averagePages,
      genres,
      longestBook,
      shortestBook
    })
  } catch (error) {
    console.error('Error al obtener estadísticas del autor:', error)
    return NextResponse.json(
      { error: 'Error al obtener estadísticas del autor' },
      { status: 500 }
    )
  }
}
