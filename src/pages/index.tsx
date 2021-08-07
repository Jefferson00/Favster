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
  const { user } = useAuth();
  const { playList } = usePlayer();

  const [searchContent, setSearchContent] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [artists, setArtists] = useState<Data[]>([]);
  const [albums, setAlbums] = useState<Data[]>([]);
  const [tracks, setTracks] = useState<Data[]>([]);

  const API_KEY = process.env.NEXT_PUBLIC_NAPSTER_API_KEY;

  async function searchAll() {
    if (API_KEY && searchContent && searchContent.trim().length > 0) {
      try {
        const result = await api.get(`search?apikey=${API_KEY}&query=${searchContent}&per_type_limit=10`);
        console.log(result.data);

        const artistsReturned = await searchArtists(result);
        setArtists(artistsReturned);
        const albumsReturned = await searchAlbum(result);
        setAlbums(albumsReturned);
        const tracksReturned = await searchTracks(result);
        setTracks(tracksReturned);
      } catch (error) {
        alert('Não foi possível retornar o resultado da pesquisa, tente novamente.')
      }
    } else {
      setArtists([]);
    }
  }

  async function searchAlbum(res: AxiosResponse<any>) {
    const albumsArray: [] = res.data.search.data.albums;

    let albumsReturned: Data[] = [];

    try {
      const albumsMapPromises = albumsArray.map(async (album: any) => {
        let { data } = await api.get(`${album.links.images.href}?apikey=${API_KEY}`);
        let imageUrl = null;
        if (data.images.length > 0) {
          imageUrl = data.images[0].url
        }

        albumsReturned.push({
          id: album.id,
          image: imageUrl,
          link: album.href,
          name: album.name,
          type: album.type,
          subtitle: album.artistName,
        });
      });

      await Promise.all(albumsMapPromises);
    } catch (error) {
      console.log(error);
    }
    return albumsReturned;
  }

  async function searchArtists(res: AxiosResponse<any>) {
    const artistsArray: [] = res.data.search.data.artists;
    let artistsReturned: Data[] = [];

    try {
      const artistMapPromises = artistsArray.map(async (artist: any) => {
        let { data } = await api.get(`${artist.links.images.href}?apikey=${API_KEY}`);
        let imageURL = null;
        if (data.images.length > 0) {
          imageURL = data.images[0].url
        }

        artistsReturned.push({
          id: artist.id,
          image: imageURL,
          link: artist.href,
          name: artist.name,
          type: artist.type,
        });

      });
      await Promise.all(artistMapPromises);
    } catch (error) {
      console.log(error);
    }
    return artistsReturned;
  }

  async function searchTracks(res: AxiosResponse<any>) {
    const tracksArray: [] = res.data.search.data.tracks;
    let tracksReturned: Data[] = [];

    try {
      const tracksMapPromises = tracksArray.map(async (track: any) => {
        let albumsResponse = await api.get(`${track.links.albums.href}?apikey=${API_KEY}`);
        let albumImagesLink = albumsResponse.data.albums[0].links.images.href;
        let { data } = await api.get(`${albumImagesLink}?apikey=${API_KEY}`);
        let imageURL = null;
        if (data.images.length > 0) {
          imageURL = data.images[0].url
        }

        tracksReturned.push({
          id: track.id,
          image: imageURL,
          link: track.href,
          name: track.name,
          type: track.type,
          previewURL: track.previewURL,
          albumName: track.albumName,
          artistName: track.artistName,
          duration: track.playbackSeconds,
        });

      });
      await Promise.all(tracksMapPromises);
    } catch (error) {
      console.log(error);
    }
    return tracksReturned;
  }

  useEffect(() => {
    setSearchLoading(true);

    const timer = setTimeout(() => {
      searchAll().finally(() => {
        setSearchLoading(false)
      });
    }, 1000);
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
                (artists.length === 0 && albums.length === 0) ?
                  <>
                    <h3>Encontre seus artistas, álbuns e genêros preferidos </h3>
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
