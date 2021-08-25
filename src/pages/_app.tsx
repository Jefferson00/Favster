import '../styles/global.scss'
import { AnimatePresence } from 'framer-motion'
import { AppProvider } from '../contexts'

function MyApp({ Component, pageProps }) {
  return (
    <AppProvider>
      <AnimatePresence exitBeforeEnter>
        <Component {...pageProps} />
      </AnimatePresence>
    </AppProvider>
  )
}

export default MyApp
