'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight, ChevronLeft, ChevronRight, Loader2,
  AlertCircle, BookOpen, Calendar, PenTool, Clock, TrendingUp,
  Cpu, Globe, Leaf, DollarSign, Heart, Flame,
  Search, Sparkles, X, UserCheck
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import Layout from '@/components/Layout'
import NewsletterForm from '@/components/NewsletterForm'

interface Author { id: string; name: string | null; email: string }
interface Post {
  id: string; title: string; excerpt: string | null; publishedDate: string
  coverImage?: string | null; category: string; tags: string[]
  author: Author
}
interface PostsResponse {
  posts: Post[]; total: number; hasNextPage: boolean
  hasPreviousPage: boolean; currentPage: number
}

const CATEGORY_CONFIG: Record<string, { color: string; bg: string; border: string; icon: React.ElementType; chart: string }> = {
  Technology: { color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', icon: Cpu, chart: '#3B82F6' },
  Politics:   { color: 'text-red-700',  bg: 'bg-red-50',  border: 'border-red-200',  icon: Globe, chart: '#EF4444' },
  Science:    { color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200', icon: TrendingUp, chart: '#8B5CF6' },
  Climate:    { color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200', icon: Leaf, chart: '#10B981' },
  Economy:    { color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200', icon: DollarSign, chart: '#F59E0B' },
  Health:     { color: 'text-pink-700', bg: 'bg-pink-50', border: 'border-pink-200', icon: Heart, chart: '#EC4899' },
  General:    { color: 'text-gray-700', bg: 'bg-gray-50', border: 'border-gray-200', icon: BookOpen, chart: '#6B7280' },
}

function CategoryBadge({ category, size = 'sm' }: { category: string; size?: 'xs' | 'sm' }) {
  const cfg = CATEGORY_CONFIG[category] ?? CATEGORY_CONFIG.General
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-semibold border ${cfg.bg} ${cfg.color} ${cfg.border} ${size === 'xs' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1'}`}>
      <Icon className="h-3 w-3" />
      {category}
    </span>
  )
}

const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
const readingTime = (text: string) => Math.max(1, Math.ceil(text.split(' ').length / 200))

const POSTS_PER_PAGE = 8
const ALL_CATEGORIES = ['All', 'Technology', 'Politics', 'Science', 'Climate', 'Economy', 'Health']

export default function HomePage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [activeCategory, setActiveCategory] = useState('All')
  const [data, setData] = useState<PostsResponse | null>(null)
  const [allPosts, setAllPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // AI Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchResults, setSearchResults] = useState<Post[]>([])
  const [searchMode, setSearchMode] = useState(false)
  const [searchError, setSearchError] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)

  // Personalized feed state
  const [preferredCategories, setPreferredCategories] = useState<string[]>([])
  const [forYouPosts, setForYouPosts] = useState<Post[]>([])

  const fetchPosts = useCallback(async (page: number, category: string) => {
    setLoading(true)
    setError(null)
    try {
      const catParam = category !== 'All' ? `&category=${encodeURIComponent(category)}` : ''
      const res = await fetch(`/api/posts?page=${page}&limit=${POSTS_PER_PAGE}${catParam}`)
      if (!res.ok) throw new Error('Failed to load posts')
      const json: PostsResponse = await res.json()
      setData(json)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch all posts for sidebar stats + personalized feed
  useEffect(() => {
    fetch('/api/posts?page=1&limit=100')
      .then(r => r.json())
      .then(d => {
        const posts: Post[] = d.posts ?? []
        setAllPosts(posts)

        // Build personalized feed from localStorage reading history
        try {
          const readCats: Record<string, number> = JSON.parse(localStorage.getItem('readCategories') ?? '{}')
          const sorted = Object.entries(readCats).sort((a, b) => b[1] - a[1]).map(([cat]) => cat)
          if (sorted.length > 0) {
            setPreferredCategories(sorted.slice(0, 3))
            const recommended = posts.filter(p => sorted.slice(0, 3).includes(p.category)).slice(0, 6)
            setForYouPosts(recommended)
          }
        } catch { /* ignore */ }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetchPosts(currentPage, activeCategory)
  }, [currentPage, activeCategory, fetchPosts])

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat)
    setCurrentPage(1)
    exitSearch()
  }

  // AI Search handler
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim() || allPosts.length === 0) return
    setSearchLoading(true)
    setSearchError('')
    setSearchMode(true)
    try {
      const payload = {
        query: searchQuery,
        posts: allPosts.map(p => ({ id: p.id, title: p.title, excerpt: p.excerpt, category: p.category, tags: p.tags })),
      }
      const res = await fetch('/api/ai/search', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Search failed')
      const resultIds: string[] = data.results ?? []
      const ordered = resultIds.map(id => allPosts.find(p => p.id === id)).filter(Boolean) as Post[]
      setSearchResults(ordered)
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'Search failed')
    } finally {
      setSearchLoading(false)
    }
  }

  const exitSearch = () => {
    setSearchMode(false)
    setSearchQuery('')
    setSearchResults([])
    setSearchError('')
  }

  // Category stats for recharts
  const categoryStats = ALL_CATEGORIES.filter(c => c !== 'All').map(cat => ({
    name: cat,
    count: allPosts.filter(p => p.category === cat).length,
    fill: CATEGORY_CONFIG[cat]?.chart ?? '#6B7280',
  }))

  const posts = data?.posts ?? []
  const heroPost = posts[0]
  const gridPosts = posts.slice(1)

  if (loading && !data) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-96">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
            <p className="text-gray-500 font-medium">Loading latest stories...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-96">
          <div className="flex flex-col items-center gap-3 text-center">
            <AlertCircle className="h-10 w-10 text-red-400" />
            <h3 className="font-semibold text-gray-900">Something went wrong</h3>
            <p className="text-red-500 text-sm max-w-sm">{error}</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      {/* === HERO FEATURED POST === */}
      {heroPost && activeCategory === 'All' && currentPage === 1 && (
        <section className="relative bg-gray-900 overflow-hidden">
          {heroPost.coverImage && (
            <Image
              src={heroPost.coverImage}
              alt={heroPost.title}
              fill
              className="object-cover opacity-40"
              priority
              sizes="100vw"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/80 to-transparent" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
            <div className="max-w-2xl space-y-5">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-xs font-bold text-orange-400 uppercase tracking-widest">
                  <Flame className="h-3.5 w-3.5" /> Featured Story
                </span>
                <CategoryBadge category={heroPost.category} />
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
                {heroPost.title}
              </h1>
              {heroPost.excerpt && (
                <p className="text-gray-300 text-lg leading-relaxed line-clamp-3">{heroPost.excerpt}</p>
              )}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1.5">
                  <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                    {(heroPost.author.name || heroPost.author.email)[0].toUpperCase()}
                  </div>
                  {heroPost.author.name || heroPost.author.email}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(heroPost.publishedDate)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {readingTime(heroPost.excerpt ?? heroPost.title)} min read
                </span>
              </div>
              <Link
                href={`/posts/${heroPost.id}`}
                className="inline-flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl"
              >
                Read Full Story <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* === MAIN CONTENT === */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* ── AI Search Bar ── */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
            <div className={`flex items-center gap-3 bg-white border-2 rounded-2xl px-4 py-3 shadow-sm transition-all ${searchMode ? 'border-violet-400 shadow-violet-100' : 'border-gray-200 hover:border-gray-300'}`}>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Sparkles className="h-4 w-4 text-violet-500" />
                <span className="text-xs font-bold text-violet-600 hidden sm:block">AI Search</span>
              </div>
              <input
                ref={searchRef}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search with natural language… e.g. 'articles about climate in Asia'"
                className="flex-1 text-sm text-gray-800 placeholder-gray-400 outline-none bg-transparent"
              />
              {searchMode && (
                <button type="button" onClick={exitSearch} className="text-gray-400 hover:text-gray-700 flex-shrink-0">
                  <X className="h-4 w-4" />
                </button>
              )}
              <button
                type="submit"
                disabled={!searchQuery.trim() || searchLoading}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-xl text-xs font-bold hover:from-violet-700 hover:to-blue-700 disabled:opacity-50 transition-all flex-shrink-0"
              >
                {searchLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
                {searchLoading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>
        </div>

        {/* ── Search Results ── */}
        {searchMode && (
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-5">
              <Sparkles className="h-5 w-5 text-violet-600" />
              <div>
                <h2 className="font-bold text-gray-900">AI Search Results</h2>
                <p className="text-sm text-gray-500">
                  {searchError ? searchError : searchLoading ? 'Finding relevant articles...' : `${searchResults.length} articles matched "${searchQuery}"`}
                </p>
              </div>
              <button onClick={exitSearch} className="ml-auto flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 font-medium">
                <X className="h-4 w-4" /> Clear
              </button>
            </div>
            {searchLoading ? (
              <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 text-violet-600 animate-spin" /></div>
            ) : searchResults.length === 0 && !searchError ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                <Search className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No relevant articles found. Try a different query.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {searchResults.map(post => <PostCard key={post.id} post={post} />)}
              </div>
            )}
            <div className="mt-6 border-t border-gray-100 pt-4 text-center">
              <button onClick={exitSearch} className="text-sm text-gray-500 hover:text-blue-600 font-medium transition-colors">
                ← Back to all articles
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-10">

          {/* ---- LEFT: Post Feed ---- */}
          <div className="flex-1 min-w-0">

            {/* Category tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-8 no-scrollbar">
              {ALL_CATEGORIES.map((cat) => {
                const cfg = cat === 'All' ? null : CATEGORY_CONFIG[cat]
                const Icon = cfg?.icon
                return (
                  <button
                    key={cat}
                    onClick={() => handleCategoryChange(cat)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                      activeCategory === cat
                        ? 'bg-gray-900 text-white shadow-md'
                        : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {Icon && <Icon className={`h-3.5 w-3.5 ${activeCategory === cat ? 'text-white' : cfg?.color}`} />}
                    {cat}
                  </button>
                )
              })}
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                <BookOpen className="h-14 w-14 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No articles yet</h3>
                <p className="text-gray-500 mb-6">Be the first to write in this category.</p>
                <Link href="/create-post" className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-all text-sm">
                  <PenTool className="h-4 w-4" /> Write an Article
                </Link>
              </div>
            ) : (
              <>
                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {(activeCategory === 'All' && currentPage === 1 ? gridPosts : posts).map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>

                {/* Pagination */}
                {(data?.hasPreviousPage || data?.hasNextPage) && (
                  <div className="flex justify-center items-center gap-4 pt-10">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={!data?.hasPreviousPage}
                      className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                    >
                      <ChevronLeft className="h-4 w-4" /> Previous
                    </button>
                    <span className="px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold">
                      Page {currentPage}
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => p + 1)}
                      disabled={!data?.hasNextPage}
                      className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                    >
                      Next <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* ---- RIGHT: Sidebar ---- */}
          <aside className="w-full lg:w-80 flex-shrink-0 space-y-6">

            {/* For You - Personalized Feed */}
            {forYouPosts.length > 0 && (
              <div className="bg-gradient-to-br from-blue-50 to-violet-50 rounded-2xl border border-violet-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-violet-100 flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-violet-600" />
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">For You</h3>
                    <p className="text-xs text-gray-500">Based on your reading history</p>
                  </div>
                  <Sparkles className="h-3.5 w-3.5 text-violet-400 ml-auto" />
                </div>
                <div className="divide-y divide-violet-100/50">
                  {forYouPosts.slice(0, 4).map(post => (
                    <Link key={post.id} href={`/posts/${post.id}`} className="flex items-start gap-3 px-5 py-3.5 hover:bg-white/60 transition-colors group">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-800 leading-snug line-clamp-2 group-hover:text-blue-700 transition-colors">{post.title}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <CategoryBadge category={post.category} size="xs" />
                        </div>
                      </div>
                      {post.coverImage && (
                        <div className="relative h-12 w-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                          <Image src={post.coverImage} alt={post.title} fill className="object-cover" sizes="64px" />
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
                <div className="px-5 py-3 bg-white/40 border-t border-violet-100">
                  <p className="text-xs text-gray-400 text-center">
                    Top picks from: {preferredCategories.join(', ')}
                  </p>
                </div>
              </div>
            )}

            {/* Trending */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-orange-500" />
                <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide">Trending Now</h3>
              </div>
              <div className="divide-y divide-gray-50">
                {allPosts.slice(0, 6).map((post, i) => (
                  <Link key={post.id} href={`/posts/${post.id}`} className="flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors group">
                    <span className={`text-2xl font-black leading-none mt-0.5 ${i < 3 ? 'text-blue-600' : 'text-gray-200'}`}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 leading-snug line-clamp-2 group-hover:text-blue-700 transition-colors">{post.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <CategoryBadge category={post.category} size="xs" />
                        <span className="text-xs text-gray-400">{formatDate(post.publishedDate)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Coverage Chart */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-4">Coverage by Topic</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={categoryStats} layout="vertical" margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" width={72} tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: '#F9FAFB' }}
                    content={({ active, payload }) =>
                      active && payload?.length ? (
                        <div className="bg-white border border-gray-100 rounded-lg shadow-lg px-3 py-2 text-xs">
                          <p className="font-semibold text-gray-900">{payload[0].payload.name}</p>
                          <p className="text-gray-500">{payload[0].value} articles</p>
                        </div>
                      ) : null
                    }
                  />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={18}>
                    {categoryStats.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Topics quick links */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-3">Browse Topics</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(CATEGORY_CONFIG).filter(([k]) => k !== 'General').map(([cat, cfg]) => {
                  const Icon = cfg.icon
                  return (
                    <button
                      key={cat}
                      onClick={() => { handleCategoryChange(cat); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all hover:shadow-sm ${cfg.bg} ${cfg.color} ${cfg.border}`}
                    >
                      <Icon className="h-3 w-3" /> {cat}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Newsletter widget */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl p-6 text-white">
              <BookOpen className="h-8 w-8 mb-3 text-blue-200" />
              <h3 className="font-bold text-lg mb-1">Stay Informed</h3>
              <p className="text-sm text-blue-100 mb-4">Weekly digest of the most important stories, delivered to your inbox.</p>
              <NewsletterForm variant="sidebar" source="home-sidebar" />
            </div>

            {/* Write CTA */}
            <div className="bg-gray-900 rounded-2xl p-6 text-white text-center">
              <PenTool className="h-8 w-8 mb-3 text-yellow-400 mx-auto" />
              <h3 className="font-bold mb-1">Share Your Story</h3>
              <p className="text-sm text-gray-400 mb-4">Join thousands of writers publishing on BlogNest.</p>
              <Link
                href="/create-post"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:from-blue-600 hover:to-purple-700 transition-all"
              >
                Start Writing <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </aside>
        </div>
      </div>

      {/* === NEWSLETTER SECTION === */}
      <section className="bg-gradient-to-r from-gray-900 via-blue-950 to-gray-900 py-16 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <span className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 text-xs font-bold px-3 py-1 rounded-full border border-blue-500/30 uppercase tracking-widest">
            <BookOpen className="h-3 w-3" /> Free Newsletter
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            The world explained,<br />in your inbox.
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Join 50,000+ readers getting clear, context-rich analysis of the stories that matter — every Monday and Thursday.
          </p>
          <NewsletterForm variant="hero" source="home-hero" />
          <p className="text-gray-500 text-xs">No spam. Unsubscribe anytime. 50,000+ readers trust us.</p>
        </div>
      </section>
    </Layout>
  )
}

// ─── Post Card Component ───────────────────────────────────────────
function PostCard({ post }: { post: Post }) {
  const rt = readingTime(post.excerpt ?? post.title)
  return (
    <Link href={`/posts/${post.id}`} className="group flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 overflow-hidden">
      {/* Cover image */}
      <div className="aspect-video relative bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        {post.coverImage ? (
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, 400px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <BookOpen className="h-10 w-10 text-gray-300" />
          </div>
        )}
        <div className="absolute top-3 left-3">
          <CategoryBadge category={post.category} />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        <h2 className="font-bold text-gray-900 leading-snug line-clamp-2 text-base group-hover:text-blue-700 transition-colors mb-2">
          {post.title}
        </h2>
        {post.excerpt && (
          <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-3 flex-1">{post.excerpt}</p>
        )}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {(post.author.name || post.author.email)[0].toUpperCase()}
            </div>
            <span className="text-xs font-medium text-gray-600 truncate max-w-[80px]">{post.author.name || post.author.email.split('@')[0]}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="flex items-center gap-0.5"><Clock className="h-3 w-3" /> {rt} min</span>
            <span>·</span>
            <span>{formatDate(post.publishedDate)}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
