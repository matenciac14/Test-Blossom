import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { MockedProvider } from '@apollo/client/testing'
import { CharacterListItem } from '../components/CharacterListItem'
import { TOGGLE_FAVORITE } from '../graphql/mutations/favorite.mutation'
import { GET_CHARACTERS } from '../graphql/queries/characters.query'
import type { Character } from '../types/character.types'

const mockCharacter: Character = {
  id: 1,
  name: 'Rick Sanchez',
  status: 'Alive',
  species: 'Human',
  type: '',
  gender: 'Male',
  origin: 'Earth (C-137)',
  image: 'https://rickandmortyapi.com/api/character/avatar/1.jpeg',
  isFavorite: false,
  deletedAt: null,
  comments: [],
}

const mocks = [
  {
    request: { query: TOGGLE_FAVORITE, variables: { id: 1 } },
    result: { data: { toggleFavorite: { __typename: 'Character', id: 1, isFavorite: true } } },
  },
  {
    request: { query: GET_CHARACTERS, variables: { filters: {} } },
    result: { data: { characters: [{ ...mockCharacter, isFavorite: true }] } },
  },
]

const renderItem = (character: Character = mockCharacter, onSelect = vi.fn()) =>
  render(
    <MockedProvider mocks={mocks}>
      <CharacterListItem character={character} isSelected={false} onSelect={onSelect} />
    </MockedProvider>,
  )

describe('CharacterListItem', () => {
  it('renders character name and species', () => {
    renderItem()
    expect(screen.getByText('Rick Sanchez')).toBeInTheDocument()
    expect(screen.getByText('Human')).toBeInTheDocument()
  })

  it('renders the character avatar', () => {
    renderItem()
    const img = screen.getByRole('img', { name: 'Rick Sanchez' })
    expect(img).toHaveAttribute('src', mockCharacter.image)
  })

  it('calls onSelect when clicked', () => {
    const onSelect = vi.fn()
    renderItem(mockCharacter, onSelect)
    fireEvent.click(screen.getByRole('button', { name: 'Rick Sanchez' }))
    expect(onSelect).toHaveBeenCalledWith(mockCharacter)
  })

  it('shows outline heart when not favorite', () => {
    renderItem()
    expect(screen.getByTestId('heart-outline')).toBeInTheDocument()
  })

  it('shows filled heart when character is favorite', () => {
    renderItem({ ...mockCharacter, isFavorite: true })
    expect(screen.getByTestId('heart-filled')).toBeInTheDocument()
  })

  it('applies selected styles when isSelected is true', () => {
    render(
      <MockedProvider mocks={mocks}>
        <CharacterListItem character={mockCharacter} isSelected={true} onSelect={vi.fn()} />
      </MockedProvider>,
    )
    const el = screen.getByRole('button', { name: 'Rick Sanchez' })
    expect(el.className).toContain('bg-primary-100')
  })
})
