🚀 BlogNest

A complete blog posting and reading web app built with Next.js and Supabase

📌 Features

🔐 User authentication (Signup/Login with Supabase Auth)

📝 Create and manage blog posts

📖 Read blogs posted by others

👤 User profiles

🛡️ Protected routes (only logged-in users can create posts)

⚙️ Tech Stack

Next.js 14

Supabase (Auth + Database)

TypeScript

TailwindCSS

🛠️ Setup Instructions
1. Clone the repo
git clone https://github.com/zain0313233/blognest.git
cd blognest

2. Install dependencies
npm install

3. Create a Supabase project

Go to Supabase and create a new project.

Get your project API URL and Anon key from:

Project Settings → API → Project URL & Anon Key

4. Set up environment variables

Create a .env.local file in the root:

NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

🔗 Linking Supabase
1. Database schema

Run this SQL in your Supabase SQL editor to create the profiles table:

CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

2. Row Level Security (RLS)

Enable RLS on the profiles table and add policies:

-- Allow logged in users to view their own profile
create policy "Users can view own profile" 
on profiles for select 
using ( auth.uid() = id );

-- Allow logged in users to update their own profile
create policy "Users can update own profile" 
on profiles for update 
using ( auth.uid() = id );

🔑 How Authentication Works

Users sign up/login with email + password.

Supabase Auth manages sessions.

On login/signup, a new row is automatically created in profiles.

Protected routes use a custom wrapper (ProtectedRoute.tsx) to redirect unauthorized users.

▶️ Run the app locally
npm run dev


App will be available at: http://localhost:3000

🌟 Bonus Feature (Optional)

✅ GraphQL Support – Apollo Client is integrated for querying posts.
✅ Protected Routes – Only authenticated users can access /create-post.

📂 Folder Structure
src/
 ├── app/
 │   ├── auth/ (login, signup, callback)
 │   ├── create-post/ (new post form)
 │   ├── posts/[id]/ (single post page)
 │   └── middleware.ts (protected routes)
 ├── components/ (UI components)
 ├── contexts/ (Auth context)
 └── lib/ (supabase + apollo configs)

👤 Author

Zain Aown
GitHub: @zain0313233