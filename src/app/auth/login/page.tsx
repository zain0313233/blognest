'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Mail,
  Lock,
  LogIn,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Sparkles,
  Shield,
  Eye,
  EyeOff,
  BookOpen,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import Layout from '@/components/Layout'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [authError, setAuthError] = useState('')
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const handleEmailLogin = async (data: LoginForm) => {
    setIsLoading(true)
    setAuthError('')
    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        setAuthError('Invalid email or password. Please try again.')
      } else {
        router.push('/')
        router.refresh()
      }
    } catch {
      setAuthError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left panel */}
            <div className="hidden lg:block space-y-8">
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl">
                    <BookOpen className="h-8 w-8 text-white" />
                  </div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    BlogNest
                  </h1>
                </div>
                <h2 className="text-5xl font-bold text-gray-900 leading-tight">
                  Welcome back to your
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> creative space</span>
                </h2>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Join writers sharing their stories, ideas, and expertise with the world.
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <span className="text-lg text-gray-700">Connect with fellow writers</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <Sparkles className="h-6 w-6 text-green-600" />
                  </div>
                  <span className="text-lg text-gray-700">Share your unique perspective</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <Shield className="h-6 w-6 text-purple-600" />
                  </div>
                  <span className="text-lg text-gray-700">Secure and private platform</span>
                </div>
              </div>
            </div>

            {/* Right panel — form */}
            <div className="w-full max-w-md mx-auto lg:mx-0">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 md:p-10">
                <div className="space-y-8">
                  <div className="text-center space-y-3">
                    <div className="flex justify-center lg:hidden mb-4">
                      <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl">
                        <BookOpen className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
                    <p className="text-gray-600">Sign in to continue your writing journey</p>
                  </div>

                  {authError && (
                    <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                      <AlertCircle className="h-5 w-5 flex-shrink-0" />
                      <p className="text-sm font-medium">{authError}</p>
                    </div>
                  )}

                  <div className="space-y-6">
                    {/* Email */}
                    <div className="space-y-2">
                      <label htmlFor="email" className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                        <Mail className="h-4 w-4" />
                        <span>Email Address</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        {...register('email')}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 text-gray-900"
                        placeholder="Enter your email"
                      />
                      {errors.email && (
                        <div className="flex items-center space-x-2 text-red-600">
                          <AlertCircle className="h-4 w-4" />
                          <p className="text-sm">{errors.email.message}</p>
                        </div>
                      )}
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                      <label htmlFor="password" className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                        <Lock className="h-4 w-4" />
                        <span>Password</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          id="password"
                          {...register('password')}
                          className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 text-gray-900"
                          placeholder="Enter your password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      {errors.password && (
                        <div className="flex items-center space-x-2 text-red-600">
                          <AlertCircle className="h-4 w-4" />
                          <p className="text-sm">{errors.password.message}</p>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={handleSubmit(handleEmailLogin)}
                      disabled={isLoading}
                      className="w-full inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>Signing in...</span>
                        </>
                      ) : (
                        <>
                          <LogIn className="h-5 w-5" />
                          <span>Sign In</span>
                        </>
                      )}
                    </button>

                    <div className="text-center pt-4 border-t border-gray-100">
                      <p className="text-gray-600">
                        Don&apos;t have an account?{' '}
                        <a
                          href="/auth/signup"
                          className="text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-200"
                        >
                          Sign up for free
                        </a>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Back link */}
                <div className="mt-6 text-center">
                  <Link
                    href="/"
                    className="inline-flex items-center space-x-2 text-gray-500 hover:text-blue-600 text-sm transition-colors duration-200"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to home</span>
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </Layout>
  )
}
