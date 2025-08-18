'use client'
import { useState } from 'react'
import { useQuery } from '@apollo/client'
import Link from 'next/link'

const formatDate = (date: string | Date) => {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
}
import { 
  Clock, 
  User, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  AlertCircle,
  BookOpen,
  Calendar,
  PenTool
} from 'lucide-react'
import { GET_POSTS } from '@/lib/graphql/queries'
import Layout from '@/components/Layout'

const POSTS_PER_PAGE = 5

export default function HomePage() {
  const [currentPage, setCurrentPage] = useState(1)
  const offset = (currentPage - 1) * POSTS_PER_PAGE

  const { data, loading, error } = useQuery(GET_POSTS, {
    variables: {
      limit: POSTS_PER_PAGE,
      offset: offset
    }
  })

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
          <div className="flex justify-center items-center h-96">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
              <p className="text-gray-600 font-medium">Loading posts...</p>
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
            <div className="flex flex-col items-center space-y-4 text-center">
              <AlertCircle className="h-12 w-12 text-red-500" />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">Error Loading Posts</h3>
                <p className="text-red-600 max-w-md">{error.message}</p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  const posts = data?.postsCollection?.edges || []
  const hasNextPage = data?.postsCollection?.pageInfo?.hasNextPage || false
  const hasPreviousPage = currentPage > 1

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-700 text-white">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center space-y-6">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-white/10 rounded-full backdrop-blur-sm">
                  <BookOpen className="h-12 w-12 text-white" />
                </div>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
                Welcome to My Blog
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
                Discover stories, insights, and expertise from writers on any topic. 
                Join our community of readers and thinkers.
              </p>
              <div className="flex justify-center pt-4">
                <Link 
                  href="/auth/login"
                  className="inline-flex items-center space-x-2 bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-blue-50 transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  <PenTool className="h-5 w-5" />
                  <span>Start Writing</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="space-y-12">
            {posts.length === 0 ? (
              <div className="text-center py-20">
                <div className="flex justify-center mb-6">
                  <div className="p-6 bg-gray-100 rounded-full">
                    <BookOpen className="h-16 w-16 text-gray-400" />
                  </div>
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">No posts yet</h3>
                <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                  Be the first to share your thoughts and stories with the community.
                </p>
                <Link 
                  href="/auth/login"
                  className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <PenTool className="h-5 w-5" />
                  <span>Create First Post</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="flex items-center space-x-3 mb-8">
                  <div className="h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex-1"></div>
                  <h2 className="text-2xl font-bold text-gray-900 whitespace-nowrap">Latest Stories</h2>
                  <div className="h-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex-1"></div>
                </div>

                {posts.map(({ node: post }: any) => (
                  <article 
                    key={post.id} 
                    className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="p-8">
                      <div className="space-y-6">
                        <div className="flex items-start justify-between">
                          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 leading-tight">
                            <Link 
                              href={`/posts/${post.id}`}
                              className="hover:underline"
                            >
                              {post.title}
                            </Link>
                          </h2>
                        </div>
                        
                        <p className="text-gray-700 text-lg leading-relaxed line-clamp-3">
                          {post.excerpt}...
                        </p>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex items-center space-x-6 text-sm text-gray-600">
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4 text-blue-500" />
                              <span className="font-medium">
                                {post.profiles?.display_name || post.profiles?.email}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-green-500" />
                              <time className="font-medium">
                                {formatDate(post.published_date)}
                              </time>
                            </div>
                          </div>
                          
                          <Link 
                            href={`/posts/${post.id}`}
                            className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-semibold group-hover:translate-x-1 transition-all duration-200"
                          >
                            <span>Read more</span>
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

          
            {(hasPreviousPage || hasNextPage) && (
              <div className="flex justify-center items-center space-x-6 pt-12">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={!hasPreviousPage}
                  className="inline-flex items-center space-x-2 px-6 py-3 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-200 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Previous</span>
                </button>
                
                <div className="flex items-center space-x-2 px-4 py-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-semibold text-blue-700">
                    Page {currentPage}
                  </span>
                </div>
                
                <button
                  onClick={() => setCurrentPage(p => p + 1)}
                  disabled={!hasNextPage}
                  className="inline-flex items-center space-x-2 px-6 py-3 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-200 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}