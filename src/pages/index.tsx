import { GetServerSideProps } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Head from 'next/head';
import { Header } from '../components/Header';
import { Player } from '../components/Player';


import api from '../services/api';
import { auth } from '../services/firebase';

import styles from './home.module.scss';
import { usePlayer } from '../contexts/PlayerContext';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { parseCookies } from 'nookies';

type Artists = {
  id: string;
  name: string;
  image: string | null;
  link: string;
};
type Albums = Object;

type Genders = {

}

type HomeProps = {
  artists: Artists[],
  albums: Albums[],
  genders: Genders[],
}

//TODO responsividade, PWA, dark theme, Eletron

export default function Home({ }: HomeProps) {
  const { user } = useAuth();
  const { playList } = usePlayer();
  const [searchContent, setSearchContent] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [artists, setArtists] = useState<Artists[]>([]);
  const API_KEY = process.env.NEXT_PUBLIC_NAPSTER_API_KEY;

  async function searchThings() {
    if (API_KEY && searchContent && searchContent.trim().length > 0) {
      const result = await api.get(`search?apikey=${API_KEY}&query=${searchContent}&per_type_limit=10`);

      const artistsArray: [] = result.data.search.data.artists;
      let art: Artists[] = [];

      const mapPromises = artistsArray.map(async (artist: any) => {
        let { data } = await api.get(`${artist.links.images.href}?apikey=${API_KEY}`);
        let imageURL = null;
        if (data.images.length > 0) {
          imageURL = data.images[0].url
        }

        art.push({
          id: artist.id,
          image: imageURL,
          link: artist.href,
          name: artist.name,
        });
      });

      await Promise.all(mapPromises);

      setArtists(art);

      console.log(result.data.search.data);
    } else {
      setArtists([]);
    }
  }

  useEffect(() => {
    setSearchLoading(true);

    const timer = setTimeout(() => {
      searchThings().finally(() => setSearchLoading(false));
    }, 2000);

    return () => clearTimeout(timer);
  }, [searchContent]);

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
                  onChange={(e) => setSearchContent(e.target.value)}
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
                artists.length > 0 ?
                  <div className={styles.resultContainer}>
                    <h3>Artistas</h3>
                    <div className={styles.list}>
                      {artists.map(artist => {
                        return (
                          <div key={artist.id} className={styles.listItem}>
                            {artist.image ?
                              <img src={artist.image} alt={artist.name} />
                              :
                              <img src="default.png" alt={artist.name} />
                            }
                            <p>{artist.name}</p>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  :
                  <>
                    <h3>Encontre seus artistas, álbuns e genêros preferidos </h3>
                    <img src="illustration-home.svg" alt="home" />
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

  const { data } = await api.get('artists/Art.28463069/similar?apikey=YTkxZTRhNzAtODdlNy00ZjMzLTg0MWItOTc0NmZmNjU4Yzk4')

  /*const episodes = data.map(episode =>{
    return {
      id: episode.id,
      title: episode.title,
      thumbnail: episode.thumbnail,
      members: episode.members,
      publishedAt: format(parseISO(episode.published_at), 'd MMM yy', { 
        locale: ptBR
      }),
      duration: Number(episode.file.duration),
      durationAsString: convertDurationToTimeString(Number(episode.file.duration)),
      description: episode.description,
      url: episode.file.url,
    }
  })*/


  return {
    props: {
      artists: data
    },
  }
}
