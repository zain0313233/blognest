'use client'
import { useState } from 'react'
import { useQuery } from '@apollo/client'
import Link from 'next/link'
import { format } from 'date-fns'
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
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center text-red-600">
          Error loading posts: {error.message}
        </div>
      </Layout>
    )
  }

  const posts = data?.postsCollection?.edges || []
  const hasNextPage = data?.postsCollection?.pageInfo?.hasNextPage || false
  const hasPreviousPage = currentPage > 1

  return (
    <Layout>
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to My Blog
          </h1>
          <p className="text-xl text-gray-600">
            Discover stories, thinking, and expertise from writers on any topic.
          </p>
        </div>

        <div className="space-y-6">
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No posts found.</p>
              <Link 
                href="/auth/login"
                className="text-blue-600 hover:text-blue-800 mt-2 inline-block"
              >
                Sign in to create the first post!
              </Link>
            </div>
          ) : (
            posts.map(({ node: post }: any) => (
              <article key={post.id} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="space-y-3">
                  <h2 className="text-2xl font-semibold text-gray-900">
                    <Link 
                      href={`/posts/${post.id}`}
                      className="hover:text-blue-600 transition-colors"
                    >
                      {post.title}
                    </Link>
                  </h2>
                  
                  <p className="text-gray-600 leading-relaxed">
                    {post.excerpt}...
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>
                      By {post.profiles?.display_name || post.profiles?.email}
                    </span>
                    <time>
                      {format(new Date(post.published_date), 'MMM dd, yyyy')}
                    </time>
                  </div>
                  
                  <Link 
                    href={`/posts/${post.id}`}
                    className="text-blue-600 hover:text-blue-800 font-medium inline-block"
                  >
                    Read more →
                  </Link>
                </div>
              </article>
            ))
          )}
        </div>

        {/* Pagination */}
        {(hasPreviousPage || hasNextPage) && (
          <div className="flex justify-center items-center space-x-4">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={!hasPreviousPage}
              className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <span className="text-sm text-gray-700">
              Page {currentPage}
            </span>
            
            <button
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={!hasNextPage}
              className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </Layout>
  )
}