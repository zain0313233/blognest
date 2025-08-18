'use client'
import { useState } from 'react'
import { useMutation } from '@apollo/client'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  PenTool, 
  ArrowLeft, 
  Save, 
  Send, 
  AlertCircle, 
  FileText, 
  Type,
  Eye,
  Edit3,
  Loader2,
  CheckCircle,
  BookOpen,
  User
} from 'lucide-react'
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
  const [previewMode, setPreviewMode] = useState(false)

  const [createPost] = useMutation(CREATE_POST, {
    refetchQueries: [{ query: GET_POSTS, variables: { limit: 5, offset: 0 } }]
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset
  } = useForm<CreatePostForm>({
    resolver: zodResolver(createPostSchema)
  })

  const watchedTitle = watch('title')
  const watchedBody = watch('body')

  // Calculate word count and reading time
  const wordCount = watchedBody ? watchedBody.split(' ').filter(word => word.length > 0).length : 0
  const readingTime = Math.ceil(wordCount / 200) || 1

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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
          
          <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-16 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => router.back()}
                    className="inline-flex items-center space-x-2 text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back</span>
                  </button>
                  
                  <div className="h-6 w-px bg-gray-300"></div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                      <PenTool className="h-5 w-5 text-white" />
                    </div>
                    <h1 className="text-xl font-bold text-gray-900">Create New Post</h1>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                 
                  <button
                    type="button"
                    onClick={() => setPreviewMode(!previewMode)}
                    className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      previewMode 
                        ? 'bg-green-50 text-green-600 hover:bg-green-100' 
                        : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                    }`}
                  >
                    {previewMode ? <Edit3 className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span>{previewMode ? 'Edit' : 'Preview'}</span>
                  </button>

                  
                  <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                    <FileText className="h-4 w-4" />
                    <span>{wordCount} words • {readingTime} min read</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              
              <div className="lg:col-span-3">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                  {!previewMode ? (
                   
                    <div className="space-y-0">
                      
                      <div className="p-8 border-b border-gray-100">
                        <div className="flex items-center space-x-3 mb-4">
                          <Type className="h-5 w-5 text-blue-500" />
                          <label htmlFor="title" className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                            Post Title
                          </label>
                        </div>
                        <input
                          type="text"
                          id="title"
                          {...register('title')}
                          className="w-full text-4xl font-bold text-gray-900 placeholder-gray-400 border-none focus:outline-none focus:ring-0 bg-transparent resize-none"
                          placeholder="Enter your compelling title..."
                          style={{ lineHeight: '1.2' }}
                        />
                        {errors.title && (
                          <div className="flex items-center space-x-2 mt-3 text-red-600">
                            <AlertCircle className="h-4 w-4" />
                            <p className="text-sm">{errors.title.message}</p>
                          </div>
                        )}
                      </div>

                     
                      <div className="p-8">
                        <div className="flex items-center space-x-3 mb-4">
                          <BookOpen className="h-5 w-5 text-green-500" />
                          <label htmlFor="body" className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                            Your Story
                          </label>
                        </div>
                        <textarea
                          id="body"
                          rows={20}
                          {...register('body')}
                          className="w-full text-lg text-gray-800 placeholder-gray-400 border-none focus:outline-none focus:ring-0 bg-transparent resize-none leading-relaxed"
                          placeholder="Tell your story... Write something amazing that will captivate your readers."
                          style={{ minHeight: '500px' }}
                        />
                        {errors.body && (
                          <div className="flex items-center space-x-2 mt-3 text-red-600">
                            <AlertCircle className="h-4 w-4" />
                            <p className="text-sm">{errors.body.message}</p>
                          </div>
                        )}
                      </div>

                     
                      <div className="p-8 bg-gray-50 border-t border-gray-100">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                          <div className="flex items-center space-x-3 text-sm text-gray-600">
                            <User className="h-4 w-4" />
                            <span>Publishing as <strong>{user?.email}</strong></span>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <button
                              type="button"
                              onClick={() => router.back()}
                              className="inline-flex items-center space-x-2 px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-medium transition-all duration-200"
                            >
                              <ArrowLeft className="h-4 w-4" />
                              <span>Cancel</span>
                            </button>
                            
                            <button
                              type="button"
                              className="inline-flex items-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-all duration-200"
                            >
                              <Save className="h-4 w-4" />
                              <span>Save Draft</span>
                            </button>
                            
                            <button
                              type="button"
                              onClick={handleSubmit(onSubmit)}
                              disabled={isSubmitting || !watchedTitle || !watchedBody}
                              className="inline-flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                            >
                              {isSubmitting ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  <span>Publishing...</span>
                                </>
                              ) : (
                                <>
                                  <Send className="h-4 w-4" />
                                  <span>Publish Post</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Preview Mode */
                    <div className="p-8">
                      <div className="space-y-6">
                        <div className="flex items-center space-x-3 text-green-600 mb-6">
                          <Eye className="h-5 w-5" />
                          <span className="font-semibold">Preview Mode</span>
                        </div>
                        
                        <header className="border-b border-gray-200 pb-6">
                          <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            {watchedTitle || 'Your Post Title'}
                          </h1>
                          <div className="flex items-center space-x-4 text-gray-600">
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4" />
                              <span>{user?.email}</span>
                            </div>
                            <span>•</span>
                            <span>{readingTime} min read</span>
                            <span>•</span>
                            <span>{new Date().toLocaleDateString()}</span>
                          </div>
                        </header>
                        
                        <div className="prose prose-lg max-w-none">
                          {watchedBody ? (
                            watchedBody.split('\n').map((paragraph: string, index: number) => {
                              if (!paragraph.trim()) return <br key={index} />
                              return (
                                <p key={index} className="mb-4 leading-relaxed text-gray-800">
                                  {paragraph}
                                </p>
                              )
                            })
                          ) : (
                            <p className="text-gray-400 italic">Start writing to see your preview...</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              
              <div className="lg:col-span-1 space-y-6">
               
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <PenTool className="h-5 w-5 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Writing Tips</h3>
                  </div>
                  <ul className="space-y-3 text-sm text-gray-600">
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Write a compelling title that grabs attention</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Start with a strong opening paragraph</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Use short paragraphs for better readability</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>End with a clear conclusion or call-to-action</span>
                    </li>
                  </ul>
                </div>

                
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Post Statistics</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Words</span>
                      <span className="font-semibold text-gray-900">{wordCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Reading time</span>
                      <span className="font-semibold text-gray-900">{readingTime} min</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Characters</span>
                      <span className="font-semibold text-gray-900">{watchedBody?.length || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  )
}