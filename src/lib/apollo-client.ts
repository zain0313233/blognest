import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { createClient } from '@/lib/supabase/client'

const httpLink = createHttpLink({
  uri: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/graphql/v1`,
})

const authLink = setContext(async (_, { headers }) => {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  return {
    headers: {
      ...headers,
      apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      authorization: session?.access_token ? `Bearer ${session.access_token}` : '',
    }
  }
})

export const apolloClient = new ApolloClient({
  link: from([authLink, httpLink]),
  cache: new InMemoryCache(),
})