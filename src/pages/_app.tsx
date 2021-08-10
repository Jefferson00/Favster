import '../styles/global.scss'
import { PlayerContextProvider } from '../contexts/PlayerContext'
import { AuthProvider } from '../contexts/AuthContext'
import { SearchContextProvider } from '../contexts/SearchContext'

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <SearchContextProvider>
        <PlayerContextProvider>
          <Component {...pageProps} />
        </PlayerContextProvider>
      </SearchContextProvider>
    </AuthProvider>
  )
}

export default MyApp
