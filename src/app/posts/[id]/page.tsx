'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  Loader2, AlertCircle, User, Calendar, ArrowLeft,
  BookOpen, Clock, Share2, Heart, MessageCircle,
  Bookmark, ArrowRight, Cpu, Globe, TrendingUp,
  Leaf, DollarSign, Sparkles, ChevronDown, ChevronUp,
  CheckCircle, Wand2
} from 'lucide-react'
import Layout from '@/components/Layout'
import NewsletterForm from '@/components/NewsletterForm'

interface Author { id: string; name: string | null; email: string }
interface Post {
  id: string; title: string; body: string; excerpt: string | null
  publishedDate: string; coverImage?: string | null
  category: string; tags: string[]; author: Author
}

const CATEGORY_CONFIG: Record<string, { color: string; bg: string; border: string; icon: React.ElementType }> = {
  Technology: { color: 'text-blue-700',   bg: 'bg-blue-50',   border: 'border-blue-200',   icon: Cpu },
  Politics:   { color: 'text-red-700',    bg: 'bg-red-50',    border: 'border-red-200',    icon: Globe },
  Science:    { color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200', icon: TrendingUp },
  Climate:    { color: 'text-green-700',  bg: 'bg-green-50',  border: 'border-green-200',  icon: Leaf },
  Economy:    { color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200', icon: DollarSign },
  Health:     { color: 'text-pink-700',   bg: 'bg-pink-50',   border: 'border-pink-200',   icon: Heart },
  General:    { color: 'text-gray-700',   bg: 'bg-gray-50',   border: 'border-gray-200',   icon: BookOpen },
}

function CategoryBadge({ category }: { category: string }) {
  const cfg = CATEGORY_CONFIG[category] ?? CATEGORY_CONFIG.General
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full text-xs font-bold px-3 py-1 border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
      <Icon className="h-3 w-3" /> {category}
    </span>
  )
}

const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
const readingTime = (text: string) => Math.max(1, Math.ceil(text.split(' ').length / 200))

export default function PostPage() {
  const params = useParams()
  const [post, setPost] = useState<Post | null>(null)
  const [related, setRelated] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [liked, setLiked] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)

  // AI Summarizer state
  const [summaryOpen, setSummaryOpen] = useState(false)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [summaryBullets, setSummaryBullets] = useState<string[]>([])
  const [summaryError, setSummaryError] = useState('')

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/posts/${params.id}`)
        if (res.status === 404) { setPost(null); setLoading(false); return }
        if (!res.ok) throw new Error('Failed to load post')
        const json = await res.json()
        setPost(json.post)
        setRelated(json.related ?? [])

        // Track category for personalized feed
        if (json.post?.category) {
          try {
            const prev = JSON.parse(localStorage.getItem('readCategories') ?? '{}')
            prev[json.post.category] = (prev[json.post.category] ?? 0) + 1
            localStorage.setItem('readCategories', JSON.stringify(prev))
          } catch { /* ignore localStorage errors */ }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }
    fetchPost()
  }, [params.id])

  const handleSummarize = async () => {
    if (!post) return
    if (summaryBullets.length > 0) { setSummaryOpen(o => !o); return }
    setSummaryOpen(true)
    setSummaryLoading(true)
    setSummaryError('')
    try {
      const res = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: post.body }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to summarize')
      setSummaryBullets(data.bullets ?? [])
    } catch (err) {
      setSummaryError(err instanceof Error ? err.message : 'Failed to summarize')
    } finally {
      setSummaryLoading(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-96">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
            <p className="text-gray-500">Loading article...</p>
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
            <h3 className="font-semibold text-gray-900">Error Loading Article</h3>
            <p className="text-red-500 text-sm">{error}</p>
            <Link href="/" className="mt-2 inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium text-sm">
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </Link>
          </div>
        </div>
      </Layout>
    )
  }

  if (!post) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-center space-y-4 max-w-md">
            <div className="p-6 bg-gray-100 rounded-full w-fit mx-auto">
              <BookOpen className="h-14 w-14 text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Article Not Found</h1>
            <p className="text-gray-500">This article doesn&apos;t exist or may have been removed.</p>
            <Link href="/" className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-all text-sm">
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </Link>
          </div>
        </div>
      </Layout>
    )
  }

  const rt = readingTime(post.body)
  const paragraphs = post.body.split('\n').filter(p => p.trim())

  return (
    <Layout>
      {/* Cover Image */}
      {post.coverImage && (
        <div className="relative h-64 sm:h-80 lg:h-[480px] bg-gray-900 overflow-hidden">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover opacity-85"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent" />
        </div>
      )}

      {/* Article container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-12">

          {/* ── Main article ── */}
          <article className="flex-1 min-w-0">
            <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-700 font-medium mb-6 group">
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" /> All Articles
            </Link>

            {/* Header */}
            <header className="mb-8 space-y-4">
              <CategoryBadge category={post.category} />
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight tracking-tight">
                {post.title}
              </h1>
              {post.excerpt && (
                <p className="text-xl text-gray-500 leading-relaxed font-light">{post.excerpt}</p>
              )}

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-700 flex items-center justify-center text-white font-bold">
                    {(post.author.name || post.author.email)[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{post.author.name || post.author.email.split('@')[0]}</p>
                    <p className="text-xs text-gray-400">Author</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" />{formatDate(post.publishedDate)}</span>
                  <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{rt} min read</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => setLiked(!liked)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${liked ? 'bg-red-100 text-red-600 border border-red-200' : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'}`}
                >
                  <Heart className={`h-4 w-4 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
                  {liked ? 'Liked' : 'Like'}
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold hover:bg-blue-50 hover:text-blue-600 transition-all">
                  <MessageCircle className="h-4 w-4" /> Comment
                </button>
                <button
                  onClick={() => setBookmarked(!bookmarked)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${bookmarked ? 'bg-purple-100 text-purple-600 border border-purple-200' : 'bg-gray-100 text-gray-600 hover:bg-purple-50 hover:text-purple-600'}`}
                >
                  <Bookmark className={`h-4 w-4 ${bookmarked ? 'fill-purple-500' : ''}`} />
                  {bookmarked ? 'Saved' : 'Save'}
                </button>
                <button
                  onClick={() => navigator.share?.({ title: post.title, url: window.location.href })}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold hover:bg-green-50 hover:text-green-700 transition-all"
                >
                  <Share2 className="h-4 w-4" /> Share
                </button>
              </div>
            </header>

            {/* ── AI TL;DR Summarizer ── */}
            <div className="mb-8 rounded-2xl border border-violet-200 overflow-hidden">
              <button
                onClick={handleSummarize}
                className="w-full flex items-center justify-between gap-3 px-5 py-4 bg-gradient-to-r from-violet-50 to-blue-50 hover:from-violet-100 hover:to-blue-100 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-gradient-to-br from-violet-600 to-blue-600 rounded-lg">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-gray-900 text-sm">AI Summary · TL;DR</p>
                    <p className="text-xs text-gray-500">Get the key points in 5 bullets — powered by Groq</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {summaryLoading && <Loader2 className="h-4 w-4 animate-spin text-violet-600" />}
                  {summaryOpen ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
                </div>
              </button>

              {summaryOpen && (
                <div className="px-5 py-4 bg-white border-t border-violet-100">
                  {summaryLoading ? (
                    <div className="flex items-center gap-3 py-2">
                      <Loader2 className="h-5 w-5 animate-spin text-violet-600" />
                      <span className="text-sm text-gray-500">Analyzing article...</span>
                    </div>
                  ) : summaryError ? (
                    <div className="flex items-center gap-2 text-red-500 text-sm">
                      <AlertCircle className="h-4 w-4" />{summaryError}
                    </div>
                  ) : (
                    <ul className="space-y-2.5">
                      {summaryBullets.map((bullet, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <div className="h-5 w-5 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                            {i + 1}
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">{bullet}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                  {!summaryLoading && summaryBullets.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
                      <Wand2 className="h-3 w-3 text-violet-500" />
                      <p className="text-xs text-gray-400">Generated by Groq · llama-3.1-8b-instant</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Body */}
            <div className="prose prose-lg prose-gray max-w-none">
              {paragraphs.map((paragraph, i) => (
                <p key={i} className={`leading-[1.9] text-gray-700 mb-5 ${i === 0 ? 'text-xl font-light text-gray-800 first-letter:text-5xl first-letter:font-bold first-letter:float-left first-letter:mr-2 first-letter:leading-none first-letter:text-blue-700' : ''}`}>
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-10 pt-6 border-t border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Filed Under</p>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map(tag => (
                    <span key={tag} className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 cursor-pointer transition-colors">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Author card */}
            <div className="mt-10 p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border border-blue-100">
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-700 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                  {(post.author.name || post.author.email)[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Written by</p>
                  <h3 className="text-lg font-bold text-gray-900">{post.author.name || post.author.email.split('@')[0]}</h3>
                  <p className="text-sm text-gray-500 mt-1">Staff writer at BlogNest covering {post.category.toLowerCase()} and related topics.</p>
                  <button className="mt-3 px-4 py-1.5 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-all">
                    Follow Author
                  </button>
                </div>
              </div>
            </div>
          </article>

          {/* ── Sticky Sidebar ── */}
          <aside className="w-full lg:w-72 flex-shrink-0">
            <div className="lg:sticky lg:top-24 space-y-6">

              {/* AI Quick Summary (sidebar widget) */}
              <div className="bg-gradient-to-br from-violet-50 to-blue-50 border border-violet-200 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-violet-600" />
                  <h3 className="font-bold text-sm text-gray-900">Quick AI Summary</h3>
                </div>
                {summaryBullets.length > 0 ? (
                  <ul className="space-y-2">
                    {summaryBullets.slice(0, 3).map((b, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                        <CheckCircle className="h-3.5 w-3.5 text-violet-500 flex-shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-gray-500 mb-3">Click the button in the article to generate an AI summary.</p>
                )}
                {summaryBullets.length === 0 && (
                  <button
                    onClick={handleSummarize}
                    disabled={summaryLoading}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-violet-600 text-white rounded-lg text-xs font-bold hover:bg-violet-700 disabled:opacity-50 transition-all"
                  >
                    {summaryLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                    {summaryLoading ? 'Summarizing...' : 'Generate Summary'}
                  </button>
                )}
              </div>

              {/* Share widget */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wide mb-3">Share Article</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Twitter/X', color: 'bg-black text-white hover:bg-gray-800' },
                    { label: 'LinkedIn', color: 'bg-blue-700 text-white hover:bg-blue-800' },
                    { label: 'Facebook', color: 'bg-blue-600 text-white hover:bg-blue-700' },
                    { label: 'Copy Link', color: 'bg-gray-100 text-gray-700 hover:bg-gray-200' },
                  ].map(({ label, color }) => (
                    <button key={label} className={`py-2 rounded-lg text-xs font-semibold transition-all ${color}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reading stats */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wide mb-3">Article Info</h3>
                <div className="space-y-2.5 text-sm">
                  {[
                    { label: 'Reading time', value: `${rt} minutes` },
                    { label: 'Word count', value: `${post.body.split(' ').length.toLocaleString()} words` },
                    { label: 'Published', value: formatDate(post.publishedDate) },
                    { label: 'Category', value: post.category },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-center">
                      <span className="text-gray-500">{label}</span>
                      <span className="font-semibold text-gray-900 text-right">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Newsletter */}
              <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl p-5 text-white">
                <BookOpen className="h-7 w-7 mb-3 text-blue-200" />
                <h3 className="font-bold mb-1">Enjoyed this article?</h3>
                <p className="text-sm text-blue-100 mb-3">Get stories like this in your inbox weekly.</p>
                <NewsletterForm variant="compact" source="post-sidebar" />
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Related Articles (Semantic Match) */}
      {related.length > 0 && (
        <section className="bg-gray-50 border-t border-gray-100 py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">More in {post.category}</h2>
                <div className="flex items-center gap-1.5 mt-1">
                  <Sparkles className="h-3.5 w-3.5 text-violet-500" />
                  <span className="text-xs text-gray-500">Semantically matched to this article</span>
                </div>
              </div>
              <Link href={`/?category=${post.category}`} className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map(rp => (
                <Link key={rp.id} href={`/posts/${rp.id}`} className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden">
                  <div className="aspect-video relative bg-gray-100">
                    {rp.coverImage ? (
                      <Image src={rp.coverImage} alt={rp.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="400px" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center"><BookOpen className="h-8 w-8 text-gray-300" /></div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-blue-700 transition-colors">{rp.title}</h3>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                      <User className="h-3 w-3" />
                      <span>{rp.author.name || rp.author.email.split('@')[0]}</span>
                      <span>·</span>
                      <span>{formatDate(rp.publishedDate)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </Layout>
  )
}
