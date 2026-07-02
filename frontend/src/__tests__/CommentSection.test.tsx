import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { MockedProvider } from '@apollo/client/testing'
import { CommentSection } from '../components/CommentSection'
import { ADD_COMMENT } from '../graphql/mutations/comment.mutation'
import { GET_CHARACTER } from '../graphql/queries/characters.query'
import type { Comment } from '../types/character.types'

const existingComment: Comment = {
  id: 'uuid-1',
  characterId: 1,
  content: 'Amazing character!',
  createdAt: '2024-01-01T00:00:00.000Z',
}

const addCommentMock = {
  request: { query: ADD_COMMENT, variables: { characterId: 1, content: 'New comment' } },
  result: {
    data: {
      addComment: { __typename: 'Comment', id: 'uuid-2', content: 'New comment', createdAt: new Date().toISOString() },
    },
  },
}

const refetchMock = {
  request: { query: GET_CHARACTER, variables: { id: 1 } },
  result: { data: { character: null } },
}

describe('CommentSection', () => {
  it('renders existing comments', () => {
    render(
      <MockedProvider mocks={[]}>
        <CommentSection characterId={1} comments={[existingComment]} />
      </MockedProvider>,
    )
    expect(screen.getByText('Amazing character!')).toBeInTheDocument()
  })

  it('shows empty state when no comments', () => {
    render(
      <MockedProvider mocks={[]}>
        <CommentSection characterId={1} comments={[]} />
      </MockedProvider>,
    )
    expect(screen.getByText(/no comments yet/i)).toBeInTheDocument()
  })

  it('renders comment input and Post button', () => {
    render(
      <MockedProvider mocks={[]}>
        <CommentSection characterId={1} comments={[]} />
      </MockedProvider>,
    )
    expect(screen.getByPlaceholderText('Add a comment...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /post/i })).toBeInTheDocument()
  })

  it('disables Post button when input is empty', () => {
    render(
      <MockedProvider mocks={[]}>
        <CommentSection characterId={1} comments={[]} />
      </MockedProvider>,
    )
    expect(screen.getByRole('button', { name: /post/i })).toBeDisabled()
  })

  it('enables Post button when input has content', () => {
    render(
      <MockedProvider mocks={[addCommentMock, refetchMock]}>
        <CommentSection characterId={1} comments={[]} />
      </MockedProvider>,
    )
    fireEvent.change(screen.getByPlaceholderText('Add a comment...'), {
      target: { value: 'New comment' },
    })
    expect(screen.getByRole('button', { name: /post/i })).not.toBeDisabled()
  })
})
