# Sistema de Biblioteca - Next.js + Prisma

Sistema completo de gestión de biblioteca con funcionalidades avanzadas de búsqueda, filtros y paginación.

## 🚀 Características Implementadas

### ✅ Endpoints API

#### 1. Búsqueda Avanzada de Libros (`/api/books/search`)
- **Método**: GET
- **Query Parameters**:
  - `search`: Búsqueda por título (case-insensitive, parcial)
  - `genre`: Filtro por género exacto
  - `authorName`: Búsqueda por nombre de autor (case-insensitive, parcial)
  - `page`: Número de página (default: 1)
  - `limit`: Resultados por página (default: 10, max: 50)
  - `sortBy`: Campo de ordenamiento (title, publishedYear, createdAt)
  - `order`: Orden (asc, desc)

**Ejemplo**:
```
GET /api/books/search?search=amor&genre=Novela&page=1&limit=10&sortBy=publishedYear&order=desc
```

**Respuesta**:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### 2. Estadísticas de Autor (`/api/authors/[id]/stats`)
- **Método**: GET
- **Retorna**:
  - Total de libros publicados
  - Año del primer libro
  - Año del último libro
  - Promedio de páginas
  - Lista de géneros únicos
  - Libro con más páginas
  - Libro con menos páginas

**Ejemplo**:
```
GET /api/authors/cmhqommy00000vapwbqit8d9r/stats
```

### ✅ Páginas Frontend

#### 1. Dashboard Principal (`/`)
- ✅ Estadísticas generales del sistema
- ✅ CRUD completo de autores
- ✅ Navegación a detalles de autores
- ✅ Diseño responsive con Tailwind CSS

#### 2. Búsqueda de Libros (`/books`)
- ✅ Búsqueda en tiempo real con debounce
- ✅ Filtros por género y autor
- ✅ Ordenamiento por múltiples campos
- ✅ Paginación funcional
- ✅ CRUD completo de libros
- ✅ Estados de carga
- ✅ Diseño responsive

#### 3. Detalle de Autor (`/authors/[id]`)
- ✅ Información completa del autor
- ✅ Estadísticas detalladas
- ✅ Lista de todos sus libros
- ✅ Formulario de edición inline
- ✅ Agregar nuevos libros al autor

## 🛠️ Tecnologías Utilizadas

- **Framework**: Next.js 16 (App Router)
- **Base de Datos**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Estilos**: Tailwind CSS 4
- **TypeScript**: Para type safety
- **React Hooks**: Custom hooks para lógica reutilizable

## 📁 Estructura del Proyecto

```
next-api-routes/
├── app/
│   ├── api/
│   │   ├── authors/
│   │   │   ├── route.ts                    # GET, POST autores
│   │   │   └── [id]/
│   │   │       ├── route.ts                # GET, PUT, DELETE autor
│   │   │       ├── books/
│   │   │       │   └── route.ts            # GET libros de autor
│   │   │       └── stats/
│   │   │           └── route.ts            # GET estadísticas
│   │   └── books/
│   │       ├── route.ts                    # GET, POST libros
│   │       ├── [id]/
│   │       │   └── route.ts                # GET, PUT, DELETE libro
│   │       └── search/
│   │           └── route.ts                # GET búsqueda avanzada
│   ├── authors/
│   │   └── [id]/
│   │       └── page.tsx                    # Página detalle autor
│   ├── books/
│   │   └── page.tsx                        # Página búsqueda libros
│   ├── components/
│   │   └── ui/
│   │       ├── Button.tsx                  # Componente botón
│   │       ├── Card.tsx                    # Componente tarjeta
│   │       ├── Input.tsx                   # Componente input
│   │       ├── TextArea.tsx                # Componente textarea
│   │       ├── Select.tsx                  # Componente select
│   │       ├── Modal.tsx                   # Componente modal
│   │       └── LoadingSpinner.tsx          # Componente spinner
│   ├── hooks/
│   │   ├── useAuthors.ts                   # Hook para autores
│   │   ├── useBooks.ts                     # Hook para libros
│   │   └── useDebounce.ts                  # Hook para debounce
│   ├── layout.tsx                          # Layout principal
│   ├── page.tsx                            # Dashboard principal
│   └── globals.css                         # Estilos globales
├── lib/
│   ├── prisma.ts                           # Cliente Prisma
│   └── types/
│       └── index.ts                        # Tipos TypeScript
└── prisma/
    └── schema.prisma                       # Schema de base de datos
```

## 🚀 Instalación y Configuración

1. **Clonar el repositorio**
```bash
git clone <url-repositorio>
cd next-api-routes
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
Crear archivo `.env` en la raíz:
```env
DATABASE_URL="postgresql://usuario:password@host:5432/database"
```

4. **Sincronizar base de datos**
```bash
npx prisma db push
npx prisma generate
```

5. **Iniciar servidor de desarrollo**
```bash
npm run dev
```

6. **Abrir en el navegador**
```
http://localhost:3000
```

## 📊 Modelos de Base de Datos

### Author
- `id`: String (cuid)
- `name`: String
- `email`: String (único)
- `bio`: String (opcional)
- `nationality`: String (opcional)
- `birthYear`: Int (opcional)
- `books`: Relación con Book[]
- `createdAt`: DateTime
- `updatedAt`: DateTime

### Book
- `id`: String (cuid)
- `title`: String
- `description`: String (opcional)
- `isbn`: String (único, opcional)
- `publishedYear`: Int (opcional)
- `genre`: String (opcional)
- `pages`: Int (opcional)
- `authorId`: String
- `author`: Relación con Author
- `createdAt`: DateTime
- `updatedAt`: DateTime

## 🎯 Funcionalidades Clave

### Búsqueda en Tiempo Real
- Implementada con `useDebounce` (500ms)
- Evita peticiones excesivas al servidor
- Actualización automática de resultados

### Paginación
- Control de página actual
- Límite configurable de resultados
- Navegación prev/next
- Información de total de páginas

### Validaciones
- Frontend: Validación de formularios antes de enviar
- Backend: Validación de datos en API routes
- Manejo de errores con mensajes claros

### Estados de Carga
- Spinners durante peticiones
- Deshabilitación de botones durante submit
- Feedback visual al usuario

## 📝 Ejemplos de Uso

### Crear un Autor
1. Ir a la página principal (`/`)
2. Clic en "Crear Autor"
3. Completar formulario
4. Submit

### Buscar Libros
1. Ir a `/books`
2. Usar la barra de búsqueda para filtrar por título
3. Seleccionar género del dropdown
4. Aplicar filtros de ordenamiento
5. Navegar entre páginas

### Ver Estadísticas de Autor
1. En el dashboard, clic en "Ver Detalles" de un autor
2. Ver estadísticas completas
3. Ver lista de libros
4. Editar información o agregar libros

## 🔧 Scripts Disponibles

```bash
npm run dev          # Inicia servidor de desarrollo
npm run build        # Crea build de producción
npm start            # Inicia servidor de producción
npm run lint         # Ejecuta ESLint
```

## 📚 Documentación API

Todas las rutas API siguen el estándar RESTful:
- `GET`: Obtener recursos
- `POST`: Crear recursos
- `PUT`: Actualizar recursos
- `DELETE`: Eliminar recursos

Respuestas de error siempre incluyen:
```json
{
  "error": "Mensaje descriptivo del error"
}
```

## ✨ Características Adicionales

- ✅ Diseño responsive (mobile-first)
- ✅ Dark mode ready
- ✅ Optimización de imágenes con Next.js
- ✅ TypeScript para type safety
- ✅ Componentes reutilizables
- ✅ Custom hooks para lógica compartida
- ✅ Validación en cliente y servidor
- ✅ Manejo de errores robusto

## 👨‍💻 Desarrollado con

- Next.js 16
- React 19
- TypeScript 5
- Prisma 6
- Tailwind CSS 4
- PostgreSQL

## 📄 Licencia

Este proyecto fue desarrollado como parte de una tarea académica.

---

**Desarrollado por**: [Tu Nombre]  
**Fecha**: Noviembre 2025  
**Curso**: Desarrollo de Aplicaciones Web Avanzadas
