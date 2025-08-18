import { gql } from '@apollo/client'

export const GET_POSTS = gql`
  query GetPosts($limit: Int!, $offset: Int!) {
    postsCollection(
      first: $limit
      offset: $offset
      orderBy: { published_date: DescNullsLast }
    ) {
      edges {
        node {
          id
          title
          excerpt
          published_date
          profiles {
            display_name
            email
          }
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
    }
  }
`

export const GET_POST_BY_ID = gql`
  query GetPostById($id: UUID!) {
    postsCollection(filter: { id: { eq: $id } }) {
      edges {
        node {
          id
          title
          body
          published_date
          profiles {
            display_name
            email
          }
        }
      }
    }
  }
`

export const CREATE_POST = gql`
  mutation CreatePost($title: String!, $body: String!, $author_id: UUID!) {
    insertIntopostsCollection(
      objects: [{
        title: $title
        body: $body
        author_id: $author_id
      }]
    ) {
      records {
        id
        title
        body
        published_date
        profiles {
          display_name
        }
      }
    }
  }
`