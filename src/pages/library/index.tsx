import Head from 'next/head';
import { useEffect, useState } from 'react';
import { Albums } from '../../components/Albums';
import { Artists } from '../../components/Artists';
import { Header } from '../../components/Header';
import { Player } from '../../components/Player';
import { Tracks } from '../../components/Tracks';
import { useAuth } from '../../contexts/AuthContext';
import { database } from '../../services/firebase';

import styles from './library.module.scss';

type Artist = {
  id: string;
  name: string;
  type: string;
  image: string;
  rating: number;
}

type FirebaseArtist = Record<string, {
  id: string;
  name: string;
  type: string;
  image: string;
  bio: string;
  rating: number;
  userId: string;
}>

type FirebaseAlbum = Record<string, {
  id: string;
  name: string;
  artistName: string;
  image: string;
  rating: number;
  userId: string;
}>

type Album = {
  id: string;
  name: string;
  artistName: string;
  image: string;
  rating: number;
}

type FirebaseTrack = Record<string, {
  id: string;
  name: string;
  artistName: string;
  albumName: string;
  image: string;
  previewUrl: string;
  rating: number;
  userId: string;
}>

type Track = {
  id: string;
  title: string;
  artistName: string;
  albumName: string;
  image: string;
  url: string;
  duration: number;
  rating: number;
}

export default function Library() {
  const { user } = useAuth();

  const [artists, setArtists] = useState<Artist[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [typeSelected, setTypeSelected] = useState<'artist' | 'album' | 'track'>('artist');

  async function handleSelectAlbum() {
    setTypeSelected('album');

    if (user) {
      const albumsRef = database.ref(`libs/${user?.id}/albums`)

      albumsRef.on('value', album => {
        const databaseAlbum: FirebaseAlbum = album.val();

        const parsedAlbum = Object.entries(databaseAlbum).map(([key, value]) => {
          return {
            id: value.id,
            name: value.name,
            artistName: value.artistName,
            image: value.image,
            rating: value.rating,
          }
        });
        console.log(parsedAlbum)
        setAlbums(parsedAlbum);
      });
    }
  }

  async function handleSelectTracks() {
    setTypeSelected('track');

    if (user) {
      const tracksRef = database.ref(`libs/${user?.id}/tracks`);

      tracksRef.on('value', track => {
        const databaseTrack: FirebaseTrack = track.val();

        const parsedTrack = Object.entries(databaseTrack).map(([key, value]) => {
          return {
            id: value.id,
            title: value.name,
            artistName: value.artistName,
            albumName: value.albumName,
            url: value.previewUrl,
            image: value.image,
            duration: 30,
            rating: value.rating,
          }
        });
        setTracks(parsedTrack);
      });
    }
  }

  useEffect(() => {
    if (user) {
      const artistsRef = database.ref(`libs/${user?.id}/artists`);

      artistsRef.on('value', artist => {
        const databaseArtist: FirebaseArtist = artist.val();

        const parsedArtist = Object.entries(databaseArtist).map(([key, value]) => {
          return {
            id: value.id,
            name: value.name,
            type: value.type,
            image: value.image,
            rating: value.rating,
          }
        });
        setArtists(parsedArtist);
      });
    }
  }, [user?.id]);

  return (
    <div className={styles.wrapper}>
      <main>
        <Header />

        <div className={styles.container}>
          <Head>
            <title>Home | Musifavs</title>
          </Head>

          <section className={styles.content}>
            <header>
              <button
                style={{
                  color:
                    typeSelected === 'artist' ? '#FF6400' : '#808080'
                }}
                onClick={() => setTypeSelected('artist')}
              >
                Artistas
              </button>

              <button
                style={{
                  color:
                    typeSelected === 'album' ? '#FF6400' : '#808080'
                }}
                onClick={handleSelectAlbum}
              >
                Álbuns
              </button>

              <button
                style={{
                  color:
                    typeSelected === 'track' ? '#FF6400' : '#808080'
                }}
                onClick={handleSelectTracks}
              >
                Músicas
              </button>
            </header>

            <main>
              {typeSelected === 'artist' &&
                <Artists artistsList={artists} listType="favorites" />
              }
              {typeSelected === 'album' &&
                <Albums albumList={albums} listType="library" />
              }
              {typeSelected === 'track' &&
                <Tracks artistTracks={tracks} listType="library" />
              }
            </main>
          </section>
        </div>
      </main>
      <Player />
    </div>
  )
}