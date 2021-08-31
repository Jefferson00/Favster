import { GetServerSideProps } from 'next';
import Head from 'next/head';

import styles from './home.module.scss';

import { useSearch } from '../contexts/SearchContext';

import { Header } from '../components/Header';
import { Player } from '../components/Player';
import { Slider } from '../components/Slider';

import { parseCookies } from 'nookies';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Lottie from 'react-lottie';
import animationData from '../assets/animations/loading.json';
import { HomeAnimation } from '../assets/animations/Home';

export default function Home() {
  const {
    handleChangeSearchContent,
    albums,
    artists,
    tracks,
    searchLoading,
    searchContent,
  } = useSearch();

  return (
    <div className={styles.homeContainer}>
      <Head>
        <title>Home | Favster</title>
      </Head>

      <section className={styles.homeContent}>
        <header>
          <div className={styles.inputContainer}>
            <img src="search.svg" alt="procurar" />
            <input
              type="text"
              value={searchContent}
              onChange={(e) => handleChangeSearchContent(e.target.value)}
              name="search"
              id="search"
              placeholder="Procure por artista, música, album..."
            />
          </div>

          <Link href="/library">
            <a>
              Minha biblioteca
            </a>
          </Link>
        </header>

        <main>
          {searchLoading ?
            <div className={styles.loadingContainer}>
              <Lottie
                options={{
                  animationData,
                  autoplay: true,
                  loop: true,
                  rendererSettings: {
                    preserveAspectRatio: "xMidYMid slice"
                  },
                }}
                height={400}
                width={400}
                isClickToPauseDisabled
              />
            </div>
            :
            (artists.length === 0 && albums.length === 0 && tracks.length === 0) ?
              <>
                <motion.div
                  initial={{ x: 60, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <h3>Encontre seus artistas, álbuns e músicas preferidos </h3>
                </motion.div>
                <motion.div
                  initial={{ y: 60, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <HomeAnimation />
                </motion.div>
              </>
              :
              <>
                {artists.length > 0 && (
                  <Slider
                    data={artists}
                    loadingIndicator={searchLoading}
                  />
                )}
                {albums.length > 0 && (
                  <Slider
                    data={albums}
                    loadingIndicator={searchLoading}
                  />
                )}
                {tracks.length > 0 && (
                  <Slider
                    data={tracks}
                    loadingIndicator={searchLoading}
                  />
                )}
              </>
          }
        </main>
      </section>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { ['@Musifavs:token']: token } = parseCookies(context);

  if (!token) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      }
    }
  }

  return {
    props: {}
  }
}
