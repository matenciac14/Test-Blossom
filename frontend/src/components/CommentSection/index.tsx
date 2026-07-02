import { useState } from 'react'
import { useMutation } from '@apollo/client'
import { Comment } from '../../types/character.types'
import { ADD_COMMENT } from '../../graphql/mutations/comment.mutation'
import { GET_CHARACTER } from '../../graphql/queries/characters.query'

interface Props {
  characterId: number
  comments: Comment[]
}

export function CommentSection({ characterId, comments }: Props) {
  const [content, setContent] = useState('')

  const [addComment, { loading }] = useMutation(ADD_COMMENT, {
    refetchQueries: [{ query: GET_CHARACTER, variables: { id: characterId } }],
    onCompleted: () => setContent(''),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    addComment({ variables: { characterId, content: content.trim() } })
  }

  return (
    <div className="mt-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Comments</h3>

      {/* Comment list */}
      <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
        {comments.length === 0 ? (
          <p className="text-xs text-gray-400 italic">No comments yet. Be the first!</p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="bg-gray-50 rounded-lg px-3 py-2">
              <p className="text-sm text-gray-700">{c.content}</p>
              <p className="text-[10px] text-gray-400 mt-1">
                {new Date(c.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Comment form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 text-sm bg-gray-100 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary-600"
          aria-label="Comment input"
        />
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
        >
          Post
        </button>
      </form>
    </div>
  )
}
