'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  PenTool, ArrowLeft, Send, AlertCircle, Type, Eye, Edit3,
  Loader2, BookOpen, User, Clock, FileText, CheckCircle,
  Tag, Image as ImageIcon, X, Cpu, Globe, TrendingUp,
  Leaf, DollarSign, Heart, Sparkles, Wand2, RefreshCw,
  BarChart3, Zap, ChevronDown, Check,
  Copy, FileEdit, Star
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import Layout from '@/components/Layout'
import ProtectedRoute from '@/components/ProtectedRoute'

const CATEGORIES = [
  { name: 'Technology', icon: Cpu,       color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { name: 'Politics',   icon: Globe,     color: 'text-red-600 bg-red-50 border-red-200' },
  { name: 'Science',    icon: TrendingUp,color: 'text-purple-600 bg-purple-50 border-purple-200' },
  { name: 'Climate',    icon: Leaf,      color: 'text-green-600 bg-green-50 border-green-200' },
  { name: 'Economy',    icon: DollarSign,color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
  { name: 'Health',     icon: Heart,     color: 'text-pink-600 bg-pink-50 border-pink-200' },
  { name: 'General',    icon: BookOpen,  color: 'text-gray-600 bg-gray-50 border-gray-200' },
]

const TONES = ['professional', 'casual', 'academic', 'persuasive', 'simple', 'bold']
const LENGTHS = [
  { key: 'short',  label: 'Short',  desc: '300–400 words' },
  { key: 'medium', label: 'Medium', desc: '600–800 words' },
  { key: 'long',   label: 'Long',   desc: '1000–1200 words' },
]

type AiLoading = 'summarize' | 'excerpt' | 'titles' | 'check' | 'generate' | 'tags' | 'continue' | 'rewrite' | 'seo' | null
type Modal = 'generate' | 'titles' | 'tags' | 'check' | 'seo' | 'rewrite' | null

interface CheckResult { overallScore: number; tone: string; readability: string; issues: { type: string; text: string; suggestion: string }[]; strengths: string[]; summary: string }
interface SeoResult { score: number; grade: string; suggestions: { priority: string; category: string; message: string }[]; keywords: string[]; positives: string[] }

export default function CreatePostPage() {
  const { user } = useAuth()
  const router = useRouter()

  // Form state
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [category, setCategory] = useState('General')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [formError, setFormError] = useState('')
  const tagRef = useRef<HTMLInputElement>(null)

  // AI state
  const [aiLoading, setAiLoading] = useState<AiLoading>(null)
  const [openModal, setOpenModal] = useState<Modal>(null)
  const [suggestedTitles, setSuggestedTitles] = useState<string[]>([])
  const [suggestedTags, setSuggestedTags] = useState<string[]>([])
  const [checkResult, setCheckResult] = useState<CheckResult | null>(null)
  const [seoResult, setSeoResult] = useState<SeoResult | null>(null)
  const [rewriteResult, setRewriteResult] = useState('')
  const [rewriteTone, setRewriteTone] = useState('professional')
  // Generate modal state
  const [genTopic, setGenTopic] = useState('')
  const [genTone, setGenTone] = useState('professional')
  const [genLength, setGenLength] = useState('medium')
  const [aiError, setAiError] = useState('')

  const wordCount = body.split(' ').filter(Boolean).length
  const readingTime = Math.max(1, Math.ceil(wordCount / 200))

  const addTag = (t?: string) => {
    const tag = (t ?? tagInput).trim().replace(/^#/, '')
    if (tag && !tags.includes(tag) && tags.length < 8) {
      setTags(prev => [...prev, tag])
      setTagInput('')
    }
  }
  const removeTag = (tag: string) => setTags(tags.filter(t => t !== tag))

  const onSubmit = async () => {
    if (!title.trim()) { setFormError('Title is required'); return }
    if (!body.trim() || body.trim().length < 10) { setFormError('Body must be at least 10 characters'); return }
    setFormError('')
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body, excerpt, category, tags, coverImage: coverImage || null }),
      })
      const json = await res.json()
      if (!res.ok) { setFormError(json.error || 'Failed to publish'); return }
      router.push(`/posts/${json.post.id}`)
    } catch {
      setFormError('Failed to publish. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── AI Helpers ──────────────────────────────────────────────────
  const aiCall = async <T,>(feature: AiLoading, endpoint: string, payload: object, onSuccess: (data: T) => void) => {
    setAiLoading(feature)
    setAiError('')
    try {
      const res = await fetch(`/api/ai/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data: T = await res.json()
      if (!res.ok) throw new Error((data as { error?: string }).error ?? 'AI request failed')
      onSuccess(data)
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'AI request failed')
    } finally {
      setAiLoading(null)
    }
  }

  const handleGenerate = () => aiCall<{ title: string; body: string; excerpt: string; tags: string[] }>(
    'generate', 'generate', { topic: genTopic, category, tone: genTone, length: genLength },
    (data) => {
      if (data.title) setTitle(data.title)
      if (data.body) setBody(data.body)
      if (data.excerpt) setExcerpt(data.excerpt)
      if (data.tags?.length) setTags(data.tags.slice(0, 8))
      setOpenModal(null)
    }
  )

  const handleExcerpt = () => aiCall<{ excerpt: string }>(
    'excerpt', 'excerpt', { title, body },
    (data) => { if (data.excerpt) setExcerpt(data.excerpt) }
  )

  const handleTitles = () => aiCall<{ titles: string[] }>(
    'titles', 'titles', { body, category, currentTitle: title },
    (data) => { setSuggestedTitles(data.titles ?? []); setOpenModal('titles') }
  )

  const handleTags = () => aiCall<{ tags: string[] }>(
    'tags', 'tags', { title, body, category },
    (data) => { setSuggestedTags(data.tags ?? []); setOpenModal('tags') }
  )

  const handleContinue = () => aiCall<{ continuation: string }>(
    'continue', 'continue', { body, title },
    (data) => { if (data.continuation) setBody(prev => prev + '\n\n' + data.continuation) }
  )

  const handleCheck = () => aiCall<CheckResult>(
    'check', 'check', { body },
    (data) => { setCheckResult(data); setOpenModal('check') }
  )

  const handleRewrite = () => aiCall<{ rewritten: string }>(
    'rewrite', 'rewrite', { text: body, tone: rewriteTone },
    (data) => { setRewriteResult(data.rewritten ?? ''); setOpenModal('rewrite') }
  )

  const handleSeo = () => aiCall<SeoResult>(
    'seo', 'seo', { title, body, tags, category },
    (data) => { setSeoResult(data); setOpenModal('seo') }
  )

  const scoreColor = (s: number) => s >= 80 ? 'text-green-600' : s >= 60 ? 'text-yellow-600' : 'text-red-600'
  const scoreBg   = (s: number) => s >= 80 ? 'bg-green-50 border-green-200' : s >= 60 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'
  const priorityColor = (p: string) => p === 'high' ? 'text-red-600 bg-red-50' : p === 'medium' ? 'text-yellow-600 bg-yellow-50' : 'text-blue-600 bg-blue-50'

  return (
    <ProtectedRoute>
      <Layout>
        <div className="min-h-screen bg-gray-50">

          {/* Sticky sub-nav */}
          <div className="sticky top-16 z-40 bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={() => router.back()} className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all">
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <div className="h-5 w-px bg-gray-200" />
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-gradient-to-br from-blue-600 to-purple-700 rounded-lg">
                    <PenTool className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-bold text-gray-900 text-sm">New Article</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg">
                  <FileText className="h-3.5 w-3.5" />
                  {wordCount} words · {readingTime} min read
                </div>
                <button
                  onClick={() => setPreviewMode(!previewMode)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${previewMode ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {previewMode ? <Edit3 className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  {previewMode ? 'Edit' : 'Preview'}
                </button>
                <button
                  onClick={onSubmit}
                  disabled={isSubmitting || !title || !body}
                  className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-blue-600 to-purple-700 text-white rounded-lg text-sm font-bold hover:from-blue-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                  {isSubmitting ? 'Publishing...' : 'Publish'}
                </button>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col lg:flex-row gap-8">

              {/* ── Main Editor ── */}
              <div className="flex-1 min-w-0">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  {!previewMode ? (
                    <div>
                      {/* Title */}
                      <div className="p-8 pb-4 border-b border-gray-50">
                        <input
                          value={title}
                          onChange={e => setTitle(e.target.value)}
                          placeholder="Your article headline..."
                          className="w-full text-3xl sm:text-4xl font-extrabold text-gray-900 placeholder-gray-300 border-none outline-none bg-transparent leading-tight"
                        />
                        {formError && formError.includes('Title') && (
                          <div className="flex items-center gap-1.5 mt-2 text-red-500 text-sm">
                            <AlertCircle className="h-4 w-4" />{formError}
                          </div>
                        )}
                      </div>

                      {/* Excerpt */}
                      <div className="px-8 pt-5 pb-2 border-b border-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                            <FileText className="h-3.5 w-3.5" /> Excerpt (optional)
                          </label>
                          <button
                            type="button"
                            onClick={handleExcerpt}
                            disabled={!body || aiLoading === 'excerpt'}
                            className="flex items-center gap-1 text-xs font-semibold text-purple-600 hover:text-purple-800 disabled:opacity-40 transition-all"
                          >
                            {aiLoading === 'excerpt' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wand2 className="h-3 w-3" />}
                            AI Generate
                          </button>
                        </div>
                        <textarea
                          value={excerpt}
                          onChange={e => setExcerpt(e.target.value)}
                          rows={2}
                          placeholder="Brief summary shown on the post card..."
                          className="w-full text-sm text-gray-700 placeholder-gray-300 border border-gray-200 rounded-xl px-3 py-2 resize-none outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          maxLength={300}
                        />
                        <p className="text-xs text-gray-400 mt-1 text-right">{excerpt.length}/300</p>
                      </div>

                      {/* Body */}
                      <div className="p-8 pt-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            <BookOpen className="h-3.5 w-3.5" /> Your Story
                          </div>
                          <button
                            type="button"
                            onClick={handleContinue}
                            disabled={!body || aiLoading === 'continue'}
                            className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 disabled:opacity-40 transition-all"
                          >
                            {aiLoading === 'continue' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Zap className="h-3 w-3" />}
                            Continue Writing
                          </button>
                        </div>
                        <textarea
                          value={body}
                          onChange={e => setBody(e.target.value)}
                          rows={24}
                          placeholder="Tell your story with depth, nuance, and clarity. Use new lines to separate paragraphs..."
                          className="w-full text-lg text-gray-800 placeholder-gray-300 border-none outline-none bg-transparent resize-none leading-[1.9]"
                          style={{ minHeight: '560px' }}
                        />
                        {formError && formError.includes('Body') && (
                          <div className="flex items-center gap-1.5 mt-2 text-red-500 text-sm">
                            <AlertCircle className="h-4 w-4" />{formError}
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="px-8 py-5 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-700 flex items-center justify-center text-white text-xs font-bold">
                            {(user?.name || user?.email || 'U')[0].toUpperCase()}
                          </div>
                          Publishing as <strong className="text-gray-700">{user?.name || user?.email}</strong>
                        </div>
                        <div className="flex items-center gap-3">
                          <button onClick={() => router.back()} type="button" className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all">
                            Cancel
                          </button>
                          <button
                            onClick={onSubmit}
                            disabled={isSubmitting || !title || !body}
                            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-700 text-white rounded-lg text-sm font-bold hover:from-blue-700 hover:to-purple-800 disabled:opacity-50 transition-all shadow-sm"
                          >
                            {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Publishing...</> : <><Send className="h-4 w-4" /> Publish Article</>}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Preview */
                    <div className="p-8 space-y-6">
                      <div className="flex items-center gap-2 text-green-600 text-sm font-semibold">
                        <Eye className="h-4 w-4" /> Preview Mode
                      </div>
                      {coverImage && (
                        <div className="aspect-video relative rounded-xl overflow-hidden bg-gray-100">
                          <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <header className="border-b border-gray-100 pb-6 space-y-4">
                        <h1 className="text-4xl font-extrabold text-gray-900 leading-tight">{title || 'Your Headline'}</h1>
                        {excerpt && <p className="text-xl text-gray-500 font-light">{excerpt}</p>}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1.5"><User className="h-4 w-4" />{user?.name || user?.email}</span>
                          <span>·</span>
                          <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{readingTime} min read</span>
                        </div>
                      </header>
                      <div className="prose prose-lg max-w-none">
                        {body ? body.split('\n').filter(Boolean).map((p, i) => (
                          <p key={i} className="mb-4 leading-relaxed text-gray-800">{p}</p>
                        )) : <p className="text-gray-400 italic">Start writing to see your preview...</p>}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Sidebar ── */}
              <aside className="w-full lg:w-72 flex-shrink-0 space-y-5">

                {/* AI Writing Assistant */}
                <div className="bg-gradient-to-br from-violet-50 to-blue-50 rounded-2xl border border-violet-200 shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-1.5 bg-gradient-to-br from-violet-600 to-blue-600 rounded-lg">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="font-bold text-sm text-gray-900">AI Writing Assistant</h3>
                    <span className="ml-auto text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-semibold">Groq</span>
                  </div>

                  {aiError && (
                    <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                      <AlertCircle className="h-3.5 w-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-red-600">{aiError}</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    {/* Generate Draft */}
                    <button
                      onClick={() => setOpenModal('generate')}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-xl text-xs font-bold hover:from-violet-700 hover:to-blue-700 transition-all shadow-sm"
                    >
                      <Wand2 className="h-3.5 w-3.5 flex-shrink-0" />
                      Generate Full Article Draft
                    </button>

                    {/* Suggest Titles */}
                    <button
                      onClick={handleTitles}
                      disabled={(!body && !title) || aiLoading === 'titles'}
                      className="w-full flex items-center gap-2.5 px-3 py-2 bg-white text-gray-700 border border-gray-200 rounded-xl text-xs font-semibold hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 disabled:opacity-40 transition-all"
                    >
                      {aiLoading === 'titles' ? <Loader2 className="h-3.5 w-3.5 animate-spin flex-shrink-0" /> : <Star className="h-3.5 w-3.5 flex-shrink-0" />}
                      Suggest Title Ideas
                    </button>

                    {/* Auto Tags */}
                    <button
                      onClick={handleTags}
                      disabled={(!body && !title) || aiLoading === 'tags'}
                      className="w-full flex items-center gap-2.5 px-3 py-2 bg-white text-gray-700 border border-gray-200 rounded-xl text-xs font-semibold hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 disabled:opacity-40 transition-all"
                    >
                      {aiLoading === 'tags' ? <Loader2 className="h-3.5 w-3.5 animate-spin flex-shrink-0" /> : <Tag className="h-3.5 w-3.5 flex-shrink-0" />}
                      Auto-Suggest Tags
                    </button>

                    {/* Check Writing */}
                    <button
                      onClick={handleCheck}
                      disabled={!body || body.length < 50 || aiLoading === 'check'}
                      className="w-full flex items-center gap-2.5 px-3 py-2 bg-white text-gray-700 border border-gray-200 rounded-xl text-xs font-semibold hover:bg-green-50 hover:text-green-700 hover:border-green-200 disabled:opacity-40 transition-all"
                    >
                      {aiLoading === 'check' ? <Loader2 className="h-3.5 w-3.5 animate-spin flex-shrink-0" /> : <CheckCircle className="h-3.5 w-3.5 flex-shrink-0" />}
                      Grammar & Tone Check
                    </button>

                    {/* Rewrite Tone */}
                    <div className="flex gap-1.5">
                      <select
                        value={rewriteTone}
                        onChange={e => setRewriteTone(e.target.value)}
                        className="flex-1 px-2 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      >
                        {TONES.map(t => <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                      </select>
                      <button
                        onClick={handleRewrite}
                        disabled={!body || body.length < 50 || aiLoading === 'rewrite'}
                        title="Rewrite in selected tone"
                        className="flex items-center gap-1 px-2.5 py-2 bg-white text-gray-700 border border-gray-200 rounded-xl text-xs font-semibold hover:bg-orange-50 hover:text-orange-700 hover:border-orange-200 disabled:opacity-40 transition-all"
                      >
                        {aiLoading === 'rewrite' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                        Rewrite
                      </button>
                    </div>

                    {/* SEO Analysis */}
                    <button
                      onClick={handleSeo}
                      disabled={!body || !title || aiLoading === 'seo'}
                      className="w-full flex items-center gap-2.5 px-3 py-2 bg-white text-gray-700 border border-gray-200 rounded-xl text-xs font-semibold hover:bg-yellow-50 hover:text-yellow-700 hover:border-yellow-200 disabled:opacity-40 transition-all"
                    >
                      {aiLoading === 'seo' ? <Loader2 className="h-3.5 w-3.5 animate-spin flex-shrink-0" /> : <BarChart3 className="h-3.5 w-3.5 flex-shrink-0" />}
                      SEO Score Analysis
                    </button>
                  </div>

                  <p className="mt-3 text-xs text-gray-400 text-center">Powered by Groq · llama-3</p>
                </div>

                {/* Category */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Type className="h-4 w-4 text-gray-400" />
                    <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wide">Category</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {CATEGORIES.map(cat => {
                      const Icon = cat.icon
                      return (
                        <button
                          key={cat.name}
                          onClick={() => setCategory(cat.name)}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                            category === cat.name
                              ? `${cat.color} shadow-sm ring-2 ring-current ring-offset-1`
                              : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          <Icon className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{cat.name}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Tags */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="h-4 w-4 text-gray-400" />
                    <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wide">Tags</h3>
                    <span className="ml-auto text-xs text-gray-400">{tags.length}/8</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {tags.map(tag => (
                      <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-semibold">
                        #{tag}
                        <button onClick={() => removeTag(tag)} className="text-blue-400 hover:text-blue-700 ml-0.5">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  {tags.length < 8 && (
                    <div className="flex gap-1.5">
                      <input
                        ref={tagRef}
                        value={tagInput}
                        onChange={e => setTagInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
                        placeholder="Add a tag..."
                        className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                      />
                      <button onClick={() => addTag()} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-all">+</button>
                    </div>
                  )}
                </div>

                {/* Cover Image */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <ImageIcon className="h-4 w-4 text-gray-400" />
                    <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wide">Cover Image</h3>
                  </div>
                  <input
                    value={coverImage}
                    onChange={e => setCoverImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                  {coverImage && (
                    <div className="mt-2 aspect-video rounded-lg overflow-hidden bg-gray-100">
                      <img src={coverImage} alt="Preview" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    </div>
                  )}
                </div>
              </aside>
            </div>
          </div>
        </div>

        {/* ── MODALS ── */}

        {/* Generate Article Modal */}
        {openModal === 'generate' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-gradient-to-br from-violet-600 to-blue-600 rounded-xl">
                  <Wand2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">AI Article Generator</h2>
                  <p className="text-xs text-gray-500">Describe your topic and let AI write the draft</p>
                </div>
                <button onClick={() => setOpenModal(null)} className="ml-auto text-gray-400 hover:text-gray-700">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Topic *</label>
                  <input
                    value={genTopic}
                    onChange={e => setGenTopic(e.target.value)}
                    placeholder="e.g. The impact of AI on healthcare in 2026"
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Tone</label>
                    <select value={genTone} onChange={e => setGenTone(e.target.value)} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500 capitalize">
                      {TONES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Length</label>
                    <select value={genLength} onChange={e => setGenLength(e.target.value)} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500">
                      {LENGTHS.map(l => <option key={l.key} value={l.key}>{l.label} ({l.desc})</option>)}
                    </select>
                  </div>
                </div>
                <div className="p-3 bg-violet-50 rounded-xl border border-violet-100 text-xs text-violet-700">
                  <strong>Category:</strong> {category} · AI will match this category&apos;s style and tone.
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setOpenModal(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all">
                  Cancel
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={!genTopic.trim() || aiLoading === 'generate'}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-xl text-sm font-bold hover:from-violet-700 hover:to-blue-700 disabled:opacity-50 transition-all"
                >
                  {aiLoading === 'generate' ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</> : <><Sparkles className="h-4 w-4" /> Generate Article</>}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Title Suggestions Modal */}
        {openModal === 'titles' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-yellow-100 rounded-xl"><Star className="h-5 w-5 text-yellow-600" /></div>
                <div>
                  <h2 className="font-bold text-gray-900">Title Suggestions</h2>
                  <p className="text-xs text-gray-500">Click a title to use it</p>
                </div>
                <button onClick={() => setOpenModal(null)} className="ml-auto text-gray-400 hover:text-gray-700"><X className="h-5 w-5" /></button>
              </div>
              <div className="space-y-2">
                {suggestedTitles.map((t, i) => (
                  <button
                    key={i}
                    onClick={() => { setTitle(t); setOpenModal(null) }}
                    className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-blue-50 hover:text-blue-800 border border-gray-200 hover:border-blue-200 rounded-xl text-sm font-medium text-gray-800 transition-all group"
                  >
                    <span className="text-gray-400 font-bold mr-2 group-hover:text-blue-400">{i + 1}.</span>
                    {t}
                  </button>
                ))}
              </div>
              <button onClick={() => { handleTitles(); }} className="mt-4 w-full flex items-center justify-center gap-2 py-2 text-sm font-semibold text-gray-500 hover:text-blue-600 transition-all">
                <RefreshCw className="h-4 w-4" /> Generate More
              </button>
            </div>
          </div>
        )}

        {/* Tag Suggestions Modal */}
        {openModal === 'tags' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-blue-100 rounded-xl"><Tag className="h-5 w-5 text-blue-600" /></div>
                <div>
                  <h2 className="font-bold text-gray-900">Suggested Tags</h2>
                  <p className="text-xs text-gray-500">Click tags to add them</p>
                </div>
                <button onClick={() => setOpenModal(null)} className="ml-auto text-gray-400 hover:text-gray-700"><X className="h-5 w-5" /></button>
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestedTags.map(tag => {
                  const already = tags.includes(tag)
                  return (
                    <button
                      key={tag}
                      onClick={() => { if (!already) addTag(tag) }}
                      disabled={already || tags.length >= 8}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                        already ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200'
                      } disabled:cursor-not-allowed`}
                    >
                      {already ? <Check className="h-3 w-3" /> : null}
                      #{tag}
                    </button>
                  )
                })}
              </div>
              <button onClick={() => setOpenModal(null)} className="mt-5 w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all">Done</button>
            </div>
          </div>
        )}

        {/* Grammar Check Modal */}
        {openModal === 'check' && checkResult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-green-100 rounded-xl"><CheckCircle className="h-5 w-5 text-green-600" /></div>
                <div>
                  <h2 className="font-bold text-gray-900">Writing Analysis</h2>
                  <p className="text-xs text-gray-500">{checkResult.summary}</p>
                </div>
                <button onClick={() => setOpenModal(null)} className="ml-auto text-gray-400 hover:text-gray-700"><X className="h-5 w-5" /></button>
              </div>

              {/* Score */}
              <div className={`flex items-center justify-between p-4 rounded-xl border mb-4 ${scoreBg(checkResult.overallScore)}`}>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">Overall Score</p>
                  <p className={`text-3xl font-black ${scoreColor(checkResult.overallScore)}`}>{checkResult.overallScore}<span className="text-lg font-medium">/100</span></p>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-semibold px-3 py-1 rounded-full ${scoreBg(checkResult.overallScore)} ${scoreColor(checkResult.overallScore)} border`}>
                    {checkResult.tone}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">{checkResult.readability} reading level</p>
                </div>
              </div>

              {/* Strengths */}
              {checkResult.strengths?.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Strengths</p>
                  <div className="space-y-1">
                    {checkResult.strengths.map((s, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                        {s}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Issues */}
              {checkResult.issues?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Suggestions</p>
                  <div className="space-y-3">
                    {checkResult.issues.map((issue, i) => (
                      <div key={i} className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-gray-400 uppercase">{issue.type}</span>
                        </div>
                        {issue.text && <p className="text-xs text-gray-600 italic mb-1.5">&ldquo;{issue.text}&rdquo;</p>}
                        <p className="text-sm text-gray-800">{issue.suggestion}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button onClick={() => setOpenModal(null)} className="mt-5 w-full py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-all">Close</button>
            </div>
          </div>
        )}

        {/* SEO Modal */}
        {openModal === 'seo' && seoResult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-yellow-100 rounded-xl"><BarChart3 className="h-5 w-5 text-yellow-600" /></div>
                <div>
                  <h2 className="font-bold text-gray-900">SEO Analysis</h2>
                  <p className="text-xs text-gray-500">Optimize your article for search engines</p>
                </div>
                <button onClick={() => setOpenModal(null)} className="ml-auto text-gray-400 hover:text-gray-700"><X className="h-5 w-5" /></button>
              </div>

              {/* Score */}
              <div className={`flex items-center justify-between p-4 rounded-xl border mb-4 ${scoreBg(seoResult.score)}`}>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">SEO Score</p>
                  <p className={`text-3xl font-black ${scoreColor(seoResult.score)}`}>{seoResult.score}<span className="text-lg font-medium">/100</span></p>
                </div>
                <div className={`text-4xl font-black ${scoreColor(seoResult.score)}`}>
                  Grade {seoResult.grade}
                </div>
              </div>

              {/* Keywords detected */}
              {seoResult.keywords?.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Detected Keywords</p>
                  <div className="flex flex-wrap gap-1.5">
                    {seoResult.keywords.map(k => (
                      <span key={k} className="px-2.5 py-1 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-full text-xs font-medium">{k}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Positives */}
              {seoResult.positives?.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">What&apos;s Working</p>
                  {seoResult.positives.map((p, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-gray-700 mb-1">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />{p}
                    </div>
                  ))}
                </div>
              )}

              {/* Suggestions */}
              {seoResult.suggestions?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Recommendations</p>
                  <div className="space-y-2">
                    {seoResult.suggestions.map((s, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5 ${priorityColor(s.priority)}`}>{s.priority}</span>
                        <div>
                          <p className="text-xs font-bold text-gray-500 mb-0.5">{s.category}</p>
                          <p className="text-sm text-gray-800">{s.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button onClick={() => setOpenModal(null)} className="mt-5 w-full py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-all">Close</button>
            </div>
          </div>
        )}

        {/* Rewrite Modal */}
        {openModal === 'rewrite' && rewriteResult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 max-h-[85vh] flex flex-col">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-orange-100 rounded-xl"><RefreshCw className="h-5 w-5 text-orange-600" /></div>
                <div>
                  <h2 className="font-bold text-gray-900">Rewritten in {rewriteTone.charAt(0).toUpperCase() + rewriteTone.slice(1)} Tone</h2>
                  <p className="text-xs text-gray-500">Review and apply the rewritten version</p>
                </div>
                <button onClick={() => setOpenModal(null)} className="ml-auto text-gray-400 hover:text-gray-700"><X className="h-5 w-5" /></button>
              </div>
              <div className="flex-1 overflow-y-auto bg-gray-50 rounded-xl border border-gray-200 p-4 mb-4">
                <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{rewriteResult}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => { navigator.clipboard.writeText(rewriteResult) }}
                  className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all"
                >
                  <Copy className="h-4 w-4" /> Copy
                </button>
                <button
                  onClick={() => { setBody(rewriteResult); setOpenModal(null) }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl text-sm font-bold hover:from-orange-600 hover:to-red-600 transition-all"
                >
                  <FileEdit className="h-4 w-4" /> Replace Article Body
                </button>
                <button
                  onClick={() => { setBody(prev => prev + '\n\n' + rewriteResult); setOpenModal(null) }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-all"
                >
                  <ChevronDown className="h-4 w-4" /> Append
                </button>
              </div>
            </div>
          </div>
        )}

      </Layout>
    </ProtectedRoute>
  )
}
