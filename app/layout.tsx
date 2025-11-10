import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sistema de Biblioteca - Next.js",
  description: "Sistema de gestión de biblioteca con autores y libros",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50`}
      >
        <nav className="bg-white shadow-lg border-b-2 border-blue-200 backdrop-blur-sm bg-white/90 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <Link href="/" className="flex items-center group">
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform">
                    📚 Biblioteca
                  </span>
                </Link>
                <div className="hidden sm:ml-8 sm:flex sm:space-x-4">
                  <Link
                    href="/"
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                  >
                    🏠 Inicio
                  </Link>
                  <Link
                    href="/books"
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                  >
                    📖 Libros
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>
        <main className="min-h-screen">
          {children}
        </main>
        <footer className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 border-t-4 border-white mt-12">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <p className="text-center text-white text-sm font-medium">
              © 2025 Sistema de Biblioteca - Desarrollado con ❤️ usando Next.js y Prisma
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
