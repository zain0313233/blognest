'use client'
import { useQuery } from '@apollo/client'
import { useParams } from 'next/navigation'
import { format } from 'date-fns'
import { GET_POST_BY_ID } from '@/lib/graphql/queries'
import Layout from '@/components/Layout'

export default function PostPage() {
  const params = useParams()
  const { data, loading, error } = useQuery(GET_POST_BY_ID, {
    variables: { id: params.id }
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
          Error loading post: {error.message}
        </div>
      </Layout>
    )
  }

  const post = data?.postsCollection?.edges[0]?.node

  if (!post) {
    return (
      <Layout>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h1>
          <p className="text-gray-600">The post you're looking for doesn't exist.</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <article className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {post.title}
            </h1>
            
            <div className="flex items-center text-gray-600 space-x-4">
              <span>
                By {post.profiles?.display_name || post.profiles?.email}
              </span>
              <span>•</span>
              <time>
                {format(new Date(post.published_date), 'MMMM dd, yyyy')}
              </time>
            </div>
          </header>
          
          <div className="prose prose-lg max-w-none">
            {post.body.split('\n').map((paragraph: string, index: number) => (
              <p key={index} className="mb-4 leading-relaxed text-gray-800">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </article>
    </Layout>
  )
}