import '../styles/global.scss'
import { PlayerContextProvider } from '../contexts/PlayerContext'
import { AuthProvider } from '../contexts/AuthContext'

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <PlayerContextProvider>
        <Component {...pageProps} />
      </PlayerContextProvider>
    </AuthProvider>
  )
}

export default MyApp
