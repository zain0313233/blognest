'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  User, 
  Mail, 
  Lock, 
  UserPlus, 
  Loader2, 
  AlertCircle, 
  CheckCircle, 
  Eye, 
  EyeOff,
  BookOpen,
  Sparkles,
  Shield,
  Users,
  Star,
  ArrowRight,
  Check
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Layout from '@/components/Layout'

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  displayName: z.string().min(1, 'Display name is required'),
})

type SignupForm = z.infer<typeof signupSchema>

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema)
  })

  const watchedPassword = watch('password')

  // Password strength checker
  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: '', color: '' }
    
    let strength = 0
    if (password.length >= 6) strength += 1
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength += 1
    if (password.match(/[0-9]/)) strength += 1
    if (password.match(/[^a-zA-Z0-9]/)) strength += 1

    const labels = ['Weak', 'Fair', 'Good', 'Strong']
    const colors = ['text-red-500', 'text-orange-500', 'text-yellow-500', 'text-green-500']
    
    return {
      strength,
      label: labels[strength - 1] || '',
      color: colors[strength - 1] || ''
    }
  }

  const passwordStrength = getPasswordStrength(watchedPassword || '')

  const onSubmit = async (data: SignupForm) => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.displayName,
          }
        }
      })

      if (error) {
        alert(error.message)
      } else {
        alert('Check your email to confirm your account!')
        router.push('/auth/login')
      }
    } catch (error) {
      alert('An error occurred during signup')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div className="hidden lg:block space-y-8">
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl">
                    <BookOpen className="h-8 w-8 text-white" />
                  </div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    My Blog
                  </h1>
                </div>
                
                <h2 className="text-5xl font-bold text-gray-900 leading-tight">
                  Start your
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> writing journey</span>
                  today
                </h2>
                
                <p className="text-xl text-gray-600 leading-relaxed">
                  Join a community of passionate writers and share your unique stories with the world.
                </p>
              </div>

              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900">Why writers choose us:</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Sparkles className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Beautiful Writing Experience</h4>
                      <p className="text-gray-600">Clean, distraction-free editor for your best work</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <Users className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Engaged Community</h4>
                      <p className="text-gray-600">Connect with readers who value your voice</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-purple-50 rounded-lg">
                      <Shield className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Privacy First</h4>
                      <p className="text-gray-600">Your content, your control, always secure</p>
                    </div>
                  </div>
                </div>
              </div>

              
              <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full border-2 border-white flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Join 10,000+ writers</p>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                      <span className="text-sm text-gray-600 ml-2">4.9/5 rating</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

           
            <div className="w-full max-w-md mx-auto lg:mx-0">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 md:p-10">
                
                <div className="space-y-8">
                  
                  <div className="text-center space-y-3">
                    <div className="flex justify-center lg:hidden mb-4">
                      <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl">
                        <BookOpen className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">Create Your Account</h2>
                    <p className="text-gray-600">Start sharing your stories with the world</p>
                  </div>

                  
                  <div className="space-y-6">
                   
                    <div className="space-y-2">
                      <label htmlFor="displayName" className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                        <User className="h-4 w-4" />
                        <span>Display Name</span>
                      </label>
                      <input
                        type="text"
                        id="displayName"
                        {...register('displayName')}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 text-gray-900"
                        placeholder="How should we call you?"
                      />
                      {errors.displayName && (
                        <div className="flex items-center space-x-2 text-red-600">
                          <AlertCircle className="h-4 w-4" />
                          <p className="text-sm">{errors.displayName.message}</p>
                        </div>
                      )}
                    </div>

                  
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
                          placeholder="Create a strong password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      
                     
                      {watchedPassword && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Password strength:</span>
                            <span className={`text-xs font-medium ${passwordStrength.color}`}>
                              {passwordStrength.label}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                passwordStrength.strength === 1 ? 'bg-red-500 w-1/4' :
                                passwordStrength.strength === 2 ? 'bg-orange-500 w-2/4' :
                                passwordStrength.strength === 3 ? 'bg-yellow-500 w-3/4' :
                                passwordStrength.strength === 4 ? 'bg-green-500 w-full' : 'w-0'
                              }`}
                            />
                          </div>
                        </div>
                      )}
                      
                      {errors.password && (
                        <div className="flex items-center space-x-2 text-red-600">
                          <AlertCircle className="h-4 w-4" />
                          <p className="text-sm">{errors.password.message}</p>
                        </div>
                      )}
                    </div>

                   
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-start space-x-3">
                        <div className="p-1 bg-blue-100 rounded-full">
                          <Check className="h-3 w-3 text-blue-600" />
                        </div>
                        <div className="text-sm text-gray-600">
                          By creating an account, you agree to our{' '}
                          <a href="/terms" className="text-blue-600 hover:text-blue-800 font-medium">Terms of Service</a>{' '}
                          and{' '}
                          <a href="/privacy" className="text-blue-600 hover:text-blue-800 font-medium">Privacy Policy</a>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleSubmit(onSubmit)}
                      disabled={isLoading}
                      className="w-full inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>Creating your account...</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-5 w-5" />
                          <span>Create Account</span>
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </>
                      )}
                    </button>

                  
                    <div className="text-center pt-4 border-t border-gray-100">
                      <p className="text-gray-600">
                        Already have an account?{' '}
                        <a 
                          href="/auth/login" 
                          className="text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-200"
                        >
                          Sign in here
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              
              <div className="mt-8 text-center space-y-4 lg:hidden">
                <div className="flex justify-center items-center space-x-6 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span>Secure</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span>10k+ Writers</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>4.9/5 Rating</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}