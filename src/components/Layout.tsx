'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import {
  PenTool, Home, LogOut, LogIn, Menu, X, BookOpen,
  Search, ChevronDown, Rss, Twitter, Github, Linkedin,
  Mail, TrendingUp, Globe, Cpu, Leaf, DollarSign, Heart
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import NewsletterForm from '@/components/NewsletterForm'

const CATEGORIES = [
  { name: 'Technology', href: '/?category=Technology', icon: Cpu, color: 'text-blue-500' },
  { name: 'Politics', href: '/?category=Politics', icon: Globe, color: 'text-red-500' },
  { name: 'Science', href: '/?category=Science', icon: TrendingUp, color: 'text-purple-500' },
  { name: 'Climate', href: '/?category=Climate', icon: Leaf, color: 'text-green-500' },
  { name: 'Economy', href: '/?category=Economy', icon: DollarSign, color: 'text-yellow-600' },
  { name: 'Health', href: '/?category=Health', icon: Heart, color: 'text-pink-500' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top strip */}
      <div className="bg-gray-900 text-gray-300 text-xs py-1.5">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Rss className="h-3 w-3 text-blue-400" />
            <span>Independent journalism for the digital age</span>
          </span>
          <span className="hidden sm:block">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Main navbar */}
      <nav className={`sticky top-0 z-50 bg-white transition-all duration-200 ${scrolled ? 'shadow-md' : 'shadow-sm border-b border-gray-100'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
              <div className="p-1.5 bg-gradient-to-br from-blue-600 to-purple-700 rounded-lg group-hover:scale-105 transition-transform">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent tracking-tight">
                BlogNest
              </span>
            </Link>

            {/* Category nav – desktop */}
            <div className="hidden lg:flex items-center gap-0.5 ml-6">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.name}
                  href={cat.href}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all"
                >
                  <cat.icon className={`h-3.5 w-3.5 ${cat.color}`} />
                  {cat.name}
                </Link>
              ))}
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 text-gray-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all"
                title="Search"
              >
                <Search className="h-5 w-5" />
              </button>

              {user ? (
                <div className="hidden md:flex items-center gap-2">
                  <Link
                    href="/create-post"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-blue-700 hover:to-purple-800 transition-all shadow-sm hover:shadow-md"
                  >
                    <PenTool className="h-4 w-4" />
                    Write
                  </Link>
                  <div className="relative group">
                    <button className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-lg hover:bg-gray-100 transition-all text-sm">
                      <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                        {(user.name || user.email || 'U')[0].toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-700 max-w-[100px] truncate">{user.name || user.email}</span>
                      <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                    </button>
                    <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 py-1">
                      <div className="px-3 py-2 border-b border-gray-100">
                        <p className="text-xs text-gray-500">Signed in as</p>
                        <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                      </div>
                      <button
                        onClick={signOut}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-all"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Link
                    href="/auth/login"
                    className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-blue-700 hover:to-purple-800 transition-all shadow-sm"
                  >
                    <LogIn className="h-4 w-4" />
                    Get Started
                  </Link>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Search bar */}
          {searchOpen && (
            <div className="py-3 border-t border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="search"
                  autoFocus
                  placeholder="Search articles, topics, authors..."
                  className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  onKeyDown={(e) => { if (e.key === 'Escape') setSearchOpen(false) }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white">
            <div className="px-4 py-3 space-y-1">
              <Link href="/" className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>
                <Home className="h-4 w-4" /> Home
              </Link>
              {CATEGORIES.map((cat) => (
                <Link key={cat.name} href={cat.href} className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 text-sm" onClick={() => setMobileMenuOpen(false)}>
                  <cat.icon className={`h-4 w-4 ${cat.color}`} /> {cat.name}
                </Link>
              ))}
              <div className="border-t border-gray-100 pt-2 mt-2 space-y-1">
                {user ? (
                  <>
                    <Link href="/create-post" className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-700 text-white rounded-lg font-medium text-sm" onClick={() => setMobileMenuOpen(false)}>
                      <PenTool className="h-4 w-4" /> Write an Article
                    </Link>
                    <button onClick={() => { signOut(); setMobileMenuOpen(false) }} className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg w-full text-sm">
                      <LogOut className="h-4 w-4" /> Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/login" className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg text-sm" onClick={() => setMobileMenuOpen(false)}>
                      <LogIn className="h-4 w-4" /> Sign In
                    </Link>
                    <Link href="/auth/signup" className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-700 text-white rounded-lg text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                      Get Started Free
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Page content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            {/* Brand */}
            <div className="md:col-span-1 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">BlogNest</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                Independent journalism and analysis on technology, science, politics, and the forces shaping our world.
              </p>
              <div className="flex items-center gap-3">
                {[Twitter, Github, Linkedin, Mail].map((Icon, i) => (
                  <button key={i} className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                    <Icon className="h-4 w-4" />
                  </button>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div>
              <h4 className="text-white font-semibold mb-4">Topics</h4>
              <ul className="space-y-2.5">
                {CATEGORIES.map((cat) => (
                  <li key={cat.name}>
                    <Link href={cat.href} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                      <cat.icon className={`h-3.5 w-3.5 ${cat.color}`} />
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2.5 text-sm">
                {['About Us', 'Our Writers', 'Editorial Standards', 'Advertise', 'Careers', 'Contact'].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-gray-400 hover:text-white transition-colors">{item}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="text-white font-semibold mb-4">Newsletter</h4>
              <p className="text-sm text-gray-400 mb-4">Get the best stories delivered to your inbox weekly.</p>
              <NewsletterForm variant="footer" source="footer" />
            </div>
          </div>

          <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-500">
            <p>© 2026 BlogNest. All rights reserved.</p>
            <div className="flex gap-6">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item) => (
                <Link key={item} href="#" className="hover:text-white transition-colors">{item}</Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
