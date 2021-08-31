import '../styles/global.scss'
import { AnimatePresence } from 'framer-motion'
import { AppProvider } from '../contexts'
import { ThemeProvider } from 'next-themes'
import { Header } from '../components/Header'
import { Player } from '../components/Player'

import styles from '../styles/app.module.scss'

function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider enableSystem={false}>
      <AppProvider>
        <AnimatePresence exitBeforeEnter>
          <div className={styles.wrapper}>
            <main>
              <Header />
              <Component {...pageProps} />
            </main>
            <Player />
          </div>
        </AnimatePresence>
      </AppProvider>
    </ThemeProvider>
  )
}

export default MyApp
