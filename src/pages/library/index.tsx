import Head from 'next/head';
import { useCallback, useEffect, useRef, useState } from 'react';
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
  const containerRef = useRef<HTMLDivElement>(null);

  const [artists, setArtists] = useState<Artist[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [typeSelected, setTypeSelected] = useState<'artist' | 'album' | 'track'>('artist');

  const [loading, setLoading] = useState(false);

  function onItemSelected() {
    setLoading(true);

    containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const handleSelectAlbum = useCallback(async () => {
    setTypeSelected('album');

    if (user) {
      const albumsRef = database.ref(`libs/${user?.id}/albums`).orderByChild('rating')
      let parsedAlbum: Album[] = [];
      await albumsRef.once('value', snapshot => {
        snapshot.forEach(album => {
          parsedAlbum = [...parsedAlbum, {
            artistName: album.val().artistName,
            id: album.val().id,
            image: album.val().image,
            name: album.val().name,
            rating: album.val().rating,
          }];
        });
      });

      parsedAlbum.reverse();

      setAlbums(parsedAlbum);
    }
  }, [user]);

  const handleSelectTracks = useCallback(async () => {
    setTypeSelected('track');

    if (user) {
      const tracksRef = database.ref(`libs/${user?.id}/tracks`).orderByChild('artistName');

      let parsedTracks: Track[] = [];

      tracksRef.on('value', snapshot => {
        snapshot.forEach(track => {
          parsedTracks = [...parsedTracks, {
            id: track.val().id,
            albumName: track.val().albumName,
            artistName: track.val().artistName,
            duration: 30,
            image: track.val().image,
            rating: track.val().rating,
            title: track.val().name,
            url: track.val().previewUrl,
          }];
        });

        //parsedTracks.reverse();

        setTracks(parsedTracks);
      });
    }
  }, [user])

  const handleSelectArtist = useCallback(async () => {
    if (user) {
      const artistsRef = database.ref(`libs/${user?.id}/artists`).orderByChild('rating');
      let parsedArtist: Artist[] = [];

      artistsRef.once('value', snapshot => {
        snapshot.forEach(artist => {
          parsedArtist = [...parsedArtist, {
            id: artist.val().id,
            image: artist.val().image,
            name: artist.val().name,
            rating: artist.val().rating,
            type: artist.val().type,
          }];
        });

        parsedArtist.reverse();

        setArtists(parsedArtist);
      });
    }
  }, [user]);

  useEffect(() => {
    let mounted = true;

    handleSelectArtist();

    return () => { mounted = false }
  }, [user?.id]);

  return (
    <div className={styles.wrapper}>
      <main>
        <Header />

        <div className={styles.container} ref={containerRef}>
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
                onClick={() => {
                  setTypeSelected('artist');
                  handleSelectArtist();
                }}
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
                <Artists
                  artistsList={artists}
                  listType="library"
                  onItemSelected={onItemSelected}
                  loading={loading}
                />
              }
              {typeSelected === 'album' &&
                <Albums
                  albumList={albums}
                  loading={loading}
                  onItemSelected={onItemSelected}
                  listType="library"
                />
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