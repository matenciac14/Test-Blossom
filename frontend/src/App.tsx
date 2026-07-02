import { ApolloProvider } from '@apollo/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { apolloClient } from './lib/apollo'
import { CharactersPage } from './pages/CharactersPage'

export function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <BrowserRouter>
        <Routes>
          {/* List view */}
          <Route path="/" element={<CharactersPage />} />
          {/* Detail view — URL reflects selected character (React Router DOM) */}
          <Route path="/character/:id" element={<CharactersPage />} />
        </Routes>
      </BrowserRouter>
    </ApolloProvider>
  )
}
