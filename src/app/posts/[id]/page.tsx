'use client'
import { useQuery } from '@apollo/client'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  Loader2, 
  AlertCircle, 
  User, 
  Calendar, 
  ArrowLeft,
  BookOpen,
  Clock,
  Eye,
  Share2,
  Heart,
  MessageCircle,
  Bookmark
} from 'lucide-react'
import { GET_POST_BY_ID } from '@/lib/graphql/queries'
import Layout from '@/components/Layout'

// Custom date formatting function
const formatDate = (date: string | Date) => {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

// Calculate reading time
const calculateReadingTime = (text: string) => {
  const wordsPerMinute = 200
  const words = text.split(' ').length
  const minutes = Math.ceil(words / wordsPerMinute)
  return minutes
}

export default function PostPage() {
  const params = useParams()
  const { data, loading, error } = useQuery(GET_POST_BY_ID, {
    variables: { id: params.id }
  })

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
          <div className="flex justify-center items-center h-96">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
              <p className="text-gray-600 font-medium">Loading post...</p>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
          <div className="flex justify-center items-center h-96">
            <div className="flex flex-col items-center space-y-4 text-center max-w-md">
              <AlertCircle className="h-12 w-12 text-red-500" />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">Error Loading Post</h3>
                <p className="text-red-600">{error.message}</p>
                <Link 
                  href="/"
                  className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium mt-4"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Home</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  const post = data?.postsCollection?.edges[0]?.node

  if (!post) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
          <div className="flex justify-center items-center h-96">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="p-6 bg-gray-100 rounded-full">
                  <BookOpen className="h-16 w-16 text-gray-400" />
                </div>
              </div>
              <div className="space-y-4">
                <h1 className="text-3xl font-bold text-gray-900">Post Not Found</h1>
                <p className="text-gray-600 max-w-md mx-auto">
                  The post you're looking for doesn't exist or may have been removed.
                </p>
                <Link 
                  href="/"
                  className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Home</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  const readingTime = calculateReadingTime(post.body)

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Navigation Bar */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link 
              href="/"
              className="inline-flex items-center space-x-2 text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Posts</span>
            </Link>
          </div>
        </div>

        {/* Article Container */}
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Main Content Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Article Header */}
            <header className="p-8 md:p-12 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                  {post.title}
                </h1>
                
                {/* Author and Meta Info */}
                <div className="flex flex-wrap items-center gap-6 text-gray-600">
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-blue-500" />
                    <span className="font-semibold">
                      {post.profiles?.display_name || post.profiles?.email}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-green-500" />
                    <time className="font-medium">
                      {formatDate(post.published_date)}
                    </time>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-orange-500" />
                    <span className="font-medium">{readingTime} min read</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-4 pt-4">
                  <button className="inline-flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors duration-200">
                    <Heart className="h-4 w-4" />
                    <span className="font-medium">Like</span>
                  </button>
                  
                  <button className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors duration-200">
                    <MessageCircle className="h-4 w-4" />
                    <span className="font-medium">Comment</span>
                  </button>
                  
                  <button className="inline-flex items-center space-x-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors duration-200">
                    <Share2 className="h-4 w-4" />
                    <span className="font-medium">Share</span>
                  </button>
                  
                  <button className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors duration-200">
                    <Bookmark className="h-4 w-4" />
                    <span className="font-medium">Save</span>
                  </button>
                </div>
              </div>
            </header>
            
            {/* Article Body */}
            <div className="p-8 md:p-12">
              <div className="prose prose-lg prose-gray max-w-none">
                {post.body.split('\n').map((paragraph: string, index: number) => {
                  // Skip empty paragraphs
                  if (!paragraph.trim()) return null
                  
                  return (
                    <p 
                      key={index} 
                      className="mb-6 leading-relaxed text-gray-800 text-lg font-light"
                      style={{ lineHeight: '1.8' }}
                    >
                      {paragraph}
                    </p>
                  )
                })}
              </div>
            </div>

            {/* Article Footer */}
            <footer className="p-8 md:p-12 border-t border-gray-100 bg-gray-50">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Eye className="h-4 w-4" />
                    <span className="text-sm">Published on {formatDate(post.published_date)}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-500">Share this post:</span>
                  <div className="flex space-x-2">
                    <button title='button' className="p-2 bg-white rounded-lg border hover:bg-gray-50 transition-colors duration-200">
                      <Share2 className="h-4 w-4 text-gray-600" />
                    </button>
                    <button title='button' className="p-2 bg-white rounded-lg border hover:bg-gray-50 transition-colors duration-200">
                      <Bookmark className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            </footer>
          </div>

          {/* Navigation Footer */}
          <div className="mt-12 text-center">
            <Link 
              href="/"
              className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-semibold text-lg transition-colors duration-200"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Read More Stories</span>
            </Link>
          </div>
        </article>
      </div>
    </Layout>
  )
}