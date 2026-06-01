'use client'
import { useState, FormEvent } from 'react'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'

type Variant = 'hero' | 'sidebar' | 'footer' | 'compact'

interface NewsletterFormProps {
  variant?: Variant
  source?: string
  buttonLabel?: string
  placeholder?: string
}

export default function NewsletterForm({
  variant = 'hero',
  source = 'website',
  buttonLabel,
  placeholder,
}: NewsletterFormProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setMessage('')
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Subscription failed')
        return
      }

      setSuccess(true)
      setMessage(data.message)
      setEmail('')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const defaultButton =
    variant === 'compact' ? 'Subscribe →' :
    variant === 'sidebar' ? 'Subscribe Free →' :
    'Subscribe Free'

  const defaultPlaceholder =
    variant === 'footer' ? 'your@email.com' :
    variant === 'compact' ? 'Your email' :
    'Your email address'

  const feedback = (success || error || message) && (
    <p className={`text-xs mt-2 flex items-start gap-1.5 ${error ? 'text-red-300' : 'text-green-300'}`}>
      {error ? <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" /> : <CheckCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />}
      {error || message}
    </p>
  )

  if (variant === 'hero') {
    return (
      <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            required
            value={email}
            onChange={e => { setEmail(e.target.value); setError(''); setSuccess(false) }}
            placeholder={placeholder ?? defaultPlaceholder}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:bg-white/15 focus:border-blue-400 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg whitespace-nowrap disabled:opacity-60 flex items-center justify-center gap-2 min-w-[140px]"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (buttonLabel ?? defaultButton)}
          </button>
        </div>
        {feedback}
      </form>
    )
  }

  if (variant === 'sidebar') {
    return (
      <form onSubmit={handleSubmit} className="w-full">
        <input
          type="email"
          required
          value={email}
          onChange={e => { setEmail(e.target.value); setError(''); setSuccess(false) }}
          placeholder={placeholder ?? 'Enter your email'}
          disabled={loading}
          className="w-full px-3 py-2.5 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder-blue-200 focus:outline-none focus:bg-white/20 mb-2 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-white text-blue-700 rounded-xl text-sm font-bold hover:bg-blue-50 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (buttonLabel ?? defaultButton)}
        </button>
        {feedback}
      </form>
    )
  }

  if (variant === 'footer') {
    return (
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          type="email"
          required
          value={email}
          onChange={e => { setEmail(e.target.value); setError(''); setSuccess(false) }}
          placeholder={placeholder ?? defaultPlaceholder}
          disabled={loading}
          className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-purple-700 text-white text-sm font-semibold rounded-lg hover:from-blue-700 hover:to-purple-800 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (buttonLabel ?? defaultButton)}
        </button>
        {(error || message) && (
          <p className={`text-xs flex items-start gap-1 ${error ? 'text-red-400' : 'text-green-400'}`}>
            {error || message}
          </p>
        )}
      </form>
    )
  }

  // compact — post detail sidebar
  return (
    <form onSubmit={handleSubmit} className="w-full">
      <input
        type="email"
        required
        value={email}
        onChange={e => { setEmail(e.target.value); setError(''); setSuccess(false) }}
        placeholder={placeholder ?? defaultPlaceholder}
        disabled={loading}
        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder-blue-200 focus:outline-none focus:bg-white/20 mb-2 disabled:opacity-60"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 bg-white text-blue-700 rounded-lg text-sm font-bold hover:bg-blue-50 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (buttonLabel ?? defaultButton)}
      </button>
      {feedback}
    </form>
  )
}
