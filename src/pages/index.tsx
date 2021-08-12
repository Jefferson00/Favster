import { GetServerSideProps } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Head from 'next/head';
import { Header } from '../components/Header';
import { Player } from '../components/Player';
import { AxiosResponse } from 'axios';


import api from '../services/api';

import styles from './home.module.scss';
import { usePlayer } from '../contexts/PlayerContext';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { parseCookies } from 'nookies';
import { Slider } from '../components/Slider';
import { useSearch } from '../contexts/SearchContext';

type Data = {
  id: string;
  name: string;
  image: string | null;
  link: string;
  type: string;
  subtitle?: string;
  previewURL?: string;
  duration?: number;
  albumName?: string;
  artistName?: string;
};

//TODO responsividade, PWA, dark theme, Eletron

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
    <div className={styles.wrapper}>
      <main>
        <Header />
        <div className={styles.homepage}>
          <Head>
            <title>Home | Musifavs</title>
          </Head>

          <section className={styles.main}>
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

              <button>
                Minha biblioteca
              </button>
            </header>

            <main>
              {searchLoading ?
                <p>Carregando...</p>
                :
                (artists.length === 0 && albums.length === 0) ?
                  <>
                    <h3>Encontre seus artistas, álbuns e músicas preferidos </h3>
                    <img src="illustration-home.svg" alt="home" />
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
      </main>
      <Player />
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
    props: {

    },
  }
}
