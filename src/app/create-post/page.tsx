'use client'
import { useState } from 'react'
import { useMutation } from '@apollo/client'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CREATE_POST, GET_POSTS } from '@/lib/graphql/queries'
import { useAuth } from '@/contexts/AuthContext'
import Layout from '@/components/Layout'
import ProtectedRoute from '@/components/ProtectedRoute'

const createPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  body: z.string().min(10, 'Post body must be at least 10 characters'),
})

type CreatePostForm = z.infer<typeof createPostSchema>

export default function CreatePostPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [createPost] = useMutation(CREATE_POST, {
    refetchQueries: [{ query: GET_POSTS, variables: { limit: 5, offset: 0 } }]
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<CreatePostForm>({
    resolver: zodResolver(createPostSchema)
  })

  const onSubmit = async (data: CreatePostForm) => {
    if (!user) return

    setIsSubmitting(true)
    try {
      const result = await createPost({
        variables: {
          title: data.title,
          body: data.body,
          author_id: user.id
        }
      })

      const newPostId = result.data?.insertIntopostsCollection?.records[0]?.id
      if (newPostId) {
        router.push(`/posts/${newPostId}`)
      } else {
        router.push('/')
      }
    } catch (error) {
      console.error('Error creating post:', error)
      alert('Failed to create post. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              Create New Post
            </h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  {...register('title')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your post title..."
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-2">
                  Content
                </label>
                <textarea
                  id="body"
                  rows={12}
                  {...register('body')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Write your post content here..."
                />
                {errors.body && (
                  <p className="mt-1 text-sm text-red-600">{errors.body.message}</p>
                )}
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Publishing...' : 'Publish Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  )
}