import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { MockedProvider } from '@apollo/client/testing'
import { FavoriteButton } from '../components/FavoriteButton'
import { TOGGLE_FAVORITE } from '../graphql/mutations/favorite.mutation'
import { GET_CHARACTERS } from '../graphql/queries/characters.query'

const buildMocks = (currentFavorite: boolean) => [
  {
    request: { query: TOGGLE_FAVORITE, variables: { id: 5 } },
    result: {
      data: {
        toggleFavorite: { __typename: 'Character', id: 5, isFavorite: !currentFavorite },
      },
    },
  },
  {
    request: { query: GET_CHARACTERS, variables: {} },
    result: { data: { characters: [] } },
  },
]

describe('FavoriteButton', () => {
  it('renders outline heart when not favorite', () => {
    render(
      <MockedProvider mocks={buildMocks(false)}>
        <FavoriteButton characterId={5} isFavorite={false} />
      </MockedProvider>,
    )
    expect(screen.getByTestId('heart-outline')).toBeInTheDocument()
  })

  it('renders filled heart when favorite', () => {
    render(
      <MockedProvider mocks={buildMocks(true)}>
        <FavoriteButton characterId={5} isFavorite={true} />
      </MockedProvider>,
    )
    expect(screen.getByTestId('heart-filled')).toBeInTheDocument()
  })

  it('calls toggleFavorite mutation on click', async () => {
    render(
      <MockedProvider mocks={buildMocks(false)}>
        <FavoriteButton characterId={5} isFavorite={false} />
      </MockedProvider>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Add to favorites' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Add to favorites' })).toBeInTheDocument()
    })
  })

  it('stops click event propagation', () => {
    const parentClick = vi.fn()
    render(
      <MockedProvider mocks={buildMocks(false)}>
        <div onClick={parentClick}>
          <FavoriteButton characterId={5} isFavorite={false} />
        </div>
      </MockedProvider>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Add to favorites' }))
    expect(parentClick).not.toHaveBeenCalled()
  })
})
