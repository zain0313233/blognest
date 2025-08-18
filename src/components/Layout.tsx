'use client'
import Link from 'next/link'
import { useState } from 'react'
import { 
  PenTool, 
  Home, 
  User, 
  LogOut, 
  LogIn, 
  Menu, 
  X, 
  BookOpen,
  Search,
  Bell,
  Settings
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { user, signOut } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
     
      <nav className="bg-white/90 backdrop-blur-md shadow-lg border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
           
            <div className="flex items-center space-x-8">
              <Link 
                href="/" 
                className="flex items-center space-x-3 group"
              >
                <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg group-hover:scale-110 transition-transform duration-200">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  My Blog
                </span>
              </Link>

           
              <div className="hidden md:flex items-center space-x-6">
                <Link 
                  href="/" 
                  className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200 group"
                >
                  <Home className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                  <span>Home</span>
                </Link>
                
                {user && (
                  <>
                    <Link 
                      href="/dashboard" 
                      className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200 group"
                    >
                      <User className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                      <span>Dashboard</span>
                    </Link>
                    
                    <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200 group">
                      <Search className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                      <span>Search</span>
                    </button>
                  </>
                )}
              </div>
            </div>

           
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                 
                  <button title='abc' className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white"></span>
                  </button>

                
                  <Link
                    href="/create-post"
                    className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <PenTool className="h-4 w-4" />
                    <span>Create Post</span>
                  </Link>

                 
                  <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className="flex flex-col text-right">
                        <span className="text-sm font-semibold text-gray-900">
                          Welcome back!
                        </span>
                        <span className="text-xs text-gray-600">
                          {user.email}
                        </span>
                      </div>
                      
                      <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button title='abc' className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200">
                        <Settings className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={signOut}
                        className="inline-flex items-center space-x-2 text-gray-600 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg font-medium transition-all duration-200"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    href="/auth/register"
                    className="text-gray-600 hover:text-blue-600 font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition-all duration-200"
                  >
                    Sign Up
                  </Link>
                  <Link
                    href="/auth/login"
                    className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>Sign In</span>
                  </Link>
                </div>
              )}
            </div>

           
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

         
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 bg-white/95 backdrop-blur-sm">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <Link
                  href="/"
                  className="flex items-center space-x-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg font-medium transition-all duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Home className="h-5 w-5" />
                  <span>Home</span>
                </Link>

                {user ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="flex items-center space-x-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg font-medium transition-all duration-200"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User className="h-5 w-5" />
                      <span>Dashboard</span>
                    </Link>
                    
                    <Link
                      href="/create-post"
                      className="flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-2 rounded-lg font-medium transition-all duration-200"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <PenTool className="h-5 w-5" />
                      <span>Create Post</span>
                    </Link>

                    <div className="border-t border-gray-200 pt-3 mt-3">
                      <div className="px-3 py-2">
                        <p className="text-sm font-medium text-gray-900">Signed in as:</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                      
                      <button
                        onClick={() => {
                          signOut()
                          setMobileMenuOpen(false)
                        }}
                        className="flex items-center space-x-3 text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg font-medium w-full transition-all duration-200"
                      >
                        <LogOut className="h-5 w-5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-1">
                    <Link
                      href="/auth/register"
                      className="flex items-center space-x-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg font-medium transition-all duration-200"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User className="h-5 w-5" />
                      <span>Sign Up</span>
                    </Link>
                    <Link
                      href="/auth/login"
                      className="flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-2 rounded-lg font-medium transition-all duration-200"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <LogIn className="h-5 w-5" />
                      <span>Sign In</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

   
      <main>
        {children}
      </main>

      
      <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                My Blog
              </span>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <Link href="/about" className="hover:text-blue-600 transition-colors duration-200">
                About
              </Link>
              <Link href="/privacy" className="hover:text-blue-600 transition-colors duration-200">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-blue-600 transition-colors duration-200">
                Terms
              </Link>
              <Link href="/contact" className="hover:text-blue-600 transition-colors duration-200">
                Contact
              </Link>
            </div>
            
            <div className="text-sm text-gray-500">
              © 2025 My Blog. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}