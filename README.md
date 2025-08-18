# Next.js Blog with Supabase & Authentication

A modern, full-stack blog application built with Next.js, Supabase, and GraphQL. Features multiple authentication methods, paginated posts, and a clean, responsive design.

## 🚀 Features

- **📝 Blog Management**: Create, read, and display blog posts with pagination
- **🔐 Multiple Authentication Methods**:
  - Email/Password authentication
  - Google OAuth integration
  - **🎉 Bonus**: Email OTP (Magic Link) passwordless authentication
- **📱 Responsive Design**: Built with Tailwind CSS for all screen sizes
- **⚡ Real-time Data**: GraphQL integration with Supabase
- **🛡️ Secure**: Row Level Security (RLS) policies
- **🎨 Modern UI**: Clean, intuitive user interface
- **📊 Pagination**: Efficient pagination for large datasets (5 posts per page)

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Authentication, GraphQL)
- **GraphQL Client**: Apollo Client
- **Forms**: React Hook Form with Zod validation
- **Date Handling**: date-fns
- **Icons**: Heroicons

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** 18.x or later
- **npm** or **yarn** package manager
- A **Supabase** account (free tier available)
- A **Google Cloud Console** account (for OAuth, optional)

## ⚙️ Setup Instructions

### 1. Clone and Install

```bash
# Clone the repository (or create new Next.js app)
git clone https://github.com/zain0313233/blognest.git

npx create-next-app@latest blognest --typescript --tailwind --eslint --app
cd blognest

# Install dependencies
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs @supabase/auth-helpers-react
npm install @apollo/client graphql
npm install @headlessui/react @heroicons/react
npm install react-hook-form @hookform/resolvers zod
npm install date-fns
```

### 2. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new account
2. Click "New Project"
3. Fill in your project details:
   - **Name**: `blog-app` (or your preferred name)
   - **Database Password**: Choose a secure password
   - **Region**: Select closest to your users
4. Wait for the project to be created (2-3 minutes)

### 3. Configure Environment Variables

Create a `.env.local` file in your project root:

```env
# Get these from your Supabase project settings
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**To find these values:**
1. Go to your Supabase project dashboard
2. Click **Settings** → **API**
3. Copy the **Project URL** and **anon/public key**
4. Copy the **service_role secret** (keep this secure!)

### 4. Set Up Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New Query** and paste this schema:

```sql
-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create posts table
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  excerpt TEXT GENERATED ALWAYS AS (LEFT(body, 200)) STORED,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  published_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Posts policies
CREATE POLICY "Posts are viewable by everyone" ON posts
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create posts" ON posts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = author_id);

CREATE POLICY "Authors can update their own posts" ON posts
  FOR UPDATE USING (auth.uid() = author_id);

-- Function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

3. Click **Run** to execute the schema

### 5. Enable GraphQL API

1. In your Supabase dashboard, go to **Settings** → **API**
2. Scroll down to **GraphQL API**
3. Click **Enable GraphQL API**
4. Note the GraphQL endpoint URL (you'll use this in Apollo Client)

### 6. Configure Authentication Providers

#### Email Authentication (Default - Already Enabled)
Email/password authentication works out of the box.

#### Google OAuth Setup

1. **In Supabase Dashboard:**
   - Go to **Authentication** → **Providers**
   - Find **Google** and toggle it **ON**
   - You'll need a Google Client ID and Secret

2. **In Google Cloud Console:**
   - Go to [console.cloud.google.com](https://console.cloud.google.com)
   - Create a new project or select existing one
   - Enable **Google+ API**
   - Go to **Credentials** → **Create Credentials** → **OAuth client ID**
   - Choose **Web application**
   - Add authorized redirect URIs:
     ```
     https://your-project-id.supabase.co/auth/v1/callback
     http://localhost:3000/auth/callback (for development)
     ```
   - Copy **Client ID** and **Client Secret**

3. **Back in Supabase:**
   - Paste the Google **Client ID** and **Client Secret**
   - Save configuration

#### 🎉 Bonus: Email OTP (Magic Link) Setup

This passwordless authentication is already implemented! It works by:

1. User enters their email address
2. Supabase sends a magic link to their email
3. Clicking the link logs them in automatically
4. No password required!

**Configuration:**
- Go to **Authentication** → **Settings** in Supabase
- Ensure **Enable email confirmations** is checked
- Customize email templates if desired

## 🚀 Running the Application Locally

### 1. Development Server

```bash
# Start the development server
npm run dev

# Open your browser to
http://localhost:3000
```

### 2. Build for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

### 3. Development Workflow

```bash
# Run with different commands
npm run dev          # Development mode with hot reload
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript checking
```

## 🔐 Authentication Configuration Explained

### How Authentication Works

The application uses **Supabase Auth** with multiple providers and a React Context for state management:

#### 1. **Authentication Context** (`contexts/AuthContext.tsx`)
- Manages user session state across the application
- Provides `user`, `session`, `loading` states
- Handles auth state changes automatically
- Exposes `signOut` function

#### 2. **Multiple Authentication Methods**

**Email/Password:**
```typescript
const { error } = await supabase.auth.signInWithPassword({
  email: data.email,
  password: data.password,
})
```

**Google OAuth:**
```typescript
const { error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/auth/callback`
  }
})
```

**🎉 Bonus - Email OTP (Magic Link):**
```typescript
const { error } = await supabase.auth.signInWithOtp({
  email: email,
  options: {
    shouldCreateUser: true,
  }
})
```

#### 3. **Route Protection**
Protected routes use the `ProtectedRoute` component:
- Automatically redirects unauthenticated users to login
- Shows loading state during auth checks
- Prevents flash of unauthorized content

#### 4. **Row Level Security (RLS)**
Database security is handled at the PostgreSQL level:
- **Profiles**: Users can only modify their own profile
- **Posts**: Anyone can read, only authenticated users can create
- **Authors**: Can only edit their own posts

### Session Management

- **Client-side**: React Context manages auth state
- **Server-side**: Middleware protects routes
- **Database**: RLS policies enforce access control
- **Automatic**: Sessions persist across browser refreshes

## 🎉 Bonus Features Implemented

### 1. Email OTP (Passwordless Authentication)

**What it is:**
A modern authentication method where users receive a "magic link" in their email instead of using passwords.

**How it works:**
1. User enters their email address
2. Supabase sends an email with a secure login link
3. User clicks the link and gets automatically logged in
4. No password required!

**Benefits:**
- **Enhanced Security**: No passwords to steal or forget
- **Better UX**: Faster login process
- **Reduced Support**: No password reset requests

**Implementation Details:**
```typescript
// Send magic link
await supabase.auth.signInWithOtp({
  email: email,
  options: {
    shouldCreateUser: true, // Create account if doesn't exist
  }
})
```

**Configuration:**
- Enabled in Supabase Auth settings
- Uses Supabase's built-in email templates
- Works with custom email providers
- Supports email customization

### 2. Advanced Pagination System

**Features:**
- **Efficient**: Only loads 5 posts at a time
- **GraphQL Optimized**: Uses cursor-based pagination
- **User Friendly**: Previous/Next navigation
- **Performance**: Minimal data transfer

**Implementation:**
```typescript
const { data } = useQuery(GET_POSTS, {
  variables: {
    limit: POSTS_PER_PAGE, // 5 posts
    offset: (currentPage - 1) * POSTS_PER_PAGE
  }
})
```

### 3. Automatic Profile Creation

**Smart User Management:**
- Profiles created automatically on signup
- Uses trigger function in PostgreSQL
- Extracts display name from OAuth data
- Falls back to email if no name provided

### 4. Enhanced Security Features

**Multiple Security Layers:**
- Row Level Security (RLS) policies
- JWT token validation
- Server-side route protection
- Client-side auth guards

## 🧪 Testing the Application

### 1. **Authentication Flow Testing**

**Email/Password:**
```bash
# Test signup
1. Go to /auth/signup
2. Fill in display name, email, password
3. Check email for confirmation
4. Click confirmation link
5. Sign in with credentials

# Test login
1. Go to /auth/login
2. Enter credentials
3. Should redirect to homepage
```

**Google OAuth:**
```bash
# Test OAuth
1. Go to /auth/login
2. Click "Continue with Google"
3. Complete Google sign-in flow
4. Should redirect to homepage with user logged in
```

**🎉 Email OTP (Bonus):**
```bash
# Test Magic Link
1. Go to /auth/login
2. Enter email address
3. Click "Send Magic Link"
4. Check email for login link
5. Click link - should auto-login
```

### 2. **Blog Functionality Testing**

```bash
# Test post creation
1. Ensure you're logged in
2. Click "Create Post" button
3. Fill in title and content
4. Click "Publish Post"
5. Should redirect to new post page

# Test pagination
1. Create 6+ posts
2. Go to homepage
3. Should see 5 posts max per page
4. Test "Next" and "Previous" buttons

# Test post viewing
1. Click any post title on homepage
2. Should show full post content
3. Display author and publish date
```

### 3. **Security Testing**

```bash
# Test route protection
1. Sign out of application
2. Try to access /create-post directly
3. Should redirect to login page

# Test RLS policies
1. Sign in as User A, create posts
2. Sign in as User B
3. User B should see User A's posts but not edit them
```

## 🚀 Deployment

### Vercel Deployment (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel

# Or connect GitHub repo to Vercel dashboard
```

**Environment Variables in Vercel:**
1. Go to Vercel dashboard → Project → Settings → Environment Variables
2. Add all variables from `.env.local`
3. Redeploy the application

### Other Platforms

**Netlify:**
- Connect GitHub repository
- Set build command: `npm run build`
- Set publish directory: `.next`
- Add environment variables

**Railway/Render:**
- Similar process to Vercel
- Configure build settings
- Add environment variables

## 🔧 Troubleshooting

### Common Issues

**1. "Invalid API Key" Error:**
```bash
# Check your .env.local file
# Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are correct
# Restart development server after changing env vars
```

**2. GraphQL Not Working:**
```bash
# Ensure GraphQL is enabled in Supabase
# Check Apollo Client configuration
# Verify authentication headers are being sent
```

**3. OAuth Redirect Issues:**
```bash
# Check redirect URLs in Google Console
# Ensure callback route exists: /auth/callback/route.ts
# Verify Supabase OAuth configuration
```

**4. Database Permission Errors:**
```bash
# Check RLS policies are correctly set up
# Ensure user profiles are being created
# Verify foreign key relationships
```

### Getting Help

- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **Apollo Client**: [apollographql.com/docs](https://apollographql.com/docs)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a Pull Request

## 📄 License

This project is licensed under the MIT License.

---

## 🎊 Success!

If you've followed this guide, you now have a fully functional blog application with:

✅ Multiple authentication methods (including bonus Email OTP)  
✅ Secure database with RLS policies  
✅ Paginated blog posts  
✅ Modern, responsive UI  
✅ GraphQL integration  
✅ Production-ready deployment  

**Happy coding!** 🚀