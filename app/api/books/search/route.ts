import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Búsqueda avanzada de libros con paginación
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Obtener parámetros de búsqueda
    const search = searchParams.get('search') || ''
    const genre = searchParams.get('genre') || ''
    const authorName = searchParams.get('authorName') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50)
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const order = searchParams.get('order') || 'desc'

    // Validar parámetros
    if (page < 1) {
      return NextResponse.json(
        { error: 'El número de página debe ser mayor a 0' },
        { status: 400 }
      )
    }

    if (limit < 1) {
      return NextResponse.json(
        { error: 'El límite debe ser mayor a 0' },
        { status: 400 }
      )
    }

    if (!['title', 'publishedYear', 'createdAt'].includes(sortBy)) {
      return NextResponse.json(
        { error: 'El campo de ordenamiento no es válido' },
        { status: 400 }
      )
    }

    if (!['asc', 'desc'].includes(order)) {
      return NextResponse.json(
        { error: 'El orden debe ser asc o desc' },
        { status: 400 }
      )
    }

    // Construir filtros
    const where: any = {}

    // Búsqueda por título (case-insensitive, búsqueda parcial)
    if (search) {
      where.title = {
        contains: search,
        mode: 'insensitive'
      }
    }

    // Filtro por género exacto
    if (genre) {
      where.genre = genre
    }

    // Búsqueda por nombre de autor (case-insensitive, búsqueda parcial)
    if (authorName) {
      where.author = {
        name: {
          contains: authorName,
          mode: 'insensitive'
        }
      }
    }

    // Calcular skip y take para paginación
    const skip = (page - 1) * limit
    const take = limit

    // Construir objeto de ordenamiento
    const orderBy: any = {}
    orderBy[sortBy] = order

    // Ejecutar consultas en paralelo
    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              nationality: true
            }
          }
        },
        orderBy,
        skip,
        take
      }),
      prisma.book.count({ where })
    ])

    // Calcular metadata de paginación
    const totalPages = Math.ceil(total / limit)
    const hasNext = page < totalPages
    const hasPrev = page > 1

    return NextResponse.json({
      data: books,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev
      }
    })
  } catch (error) {
    console.error('Error en búsqueda de libros:', error)
    return NextResponse.json(
      { error: 'Error al buscar libros' },
      { status: 500 }
    )
  }
}
