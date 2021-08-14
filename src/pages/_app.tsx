import '../styles/global.scss'
import { PlayerContextProvider } from '../contexts/PlayerContext'
import { AuthProvider } from '../contexts/AuthContext'
import { SearchContextProvider } from '../contexts/SearchContext'
import { AnimatePresence } from 'framer-motion'

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <SearchContextProvider>
        <PlayerContextProvider>
          <AnimatePresence exitBeforeEnter>
            <Component {...pageProps} />
          </AnimatePresence>
        </PlayerContextProvider>
      </SearchContextProvider>
    </AuthProvider>
  )
}

export default MyApp
