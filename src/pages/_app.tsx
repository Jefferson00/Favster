import '../styles/global.scss'
import { AnimatePresence } from 'framer-motion'
import { AppProvider } from '../contexts'
import { ThemeProvider } from 'next-themes'

function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider enableSystem={false}>
      <AppProvider>
        <AnimatePresence exitBeforeEnter>
          <Component {...pageProps} />
        </AnimatePresence>
      </AppProvider>
    </ThemeProvider>
  )
}

export default MyApp
