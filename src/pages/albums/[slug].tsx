import { useEffect, useRef, useState } from "react";
import { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";

import { Albums } from "../../components/Albums";
import { Header } from "../../components/Header";
import { Player } from "../../components/Player";

import { usePlayer } from "../../contexts/PlayerContext";

import api from "../../services/api";

import styles from './album.module.scss';
import { fadeInUp, staggerDelay } from "../../styles/animations";

import { motion } from 'framer-motion';
import { database } from "../../services/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { Rating } from "../../components/Rating";

import { TrackProps, AlbumsProps } from "./interfaces"

type AlbumProps = {
  album: AlbumsProps,
  slug: string,
  artistId: string,
}

export default function Album({ album, slug, artistId }: AlbumProps) {
  const API_KEY = process.env.NEXT_PUBLIC_NAPSTER_API_KEY;

  const { playList, currentTrackIndex, trackList } = usePlayer();
  const { user } = useAuth();
  const albumImageRef = useRef<HTMLImageElement>(null);

  const [similarAlbums, setSimilarAlbums] = useState<AlbumsProps[]>([]);
  const [artistAlbums, setArtistAlbums] = useState<AlbumsProps[]>([]);
  const [tracks, setTracks] = useState<TrackProps[]>([]);
  const [currentTrack, setCurrentTrack] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [ratingValue, setRatingValue] = useState(0);

  async function getRemainingData() {
    const similarAlbums = await getSimilarAlbumsData();
    setSimilarAlbums(similarAlbums);

    const albumTracks = await getTracksData();

    const verifiedTracks = await verifyFavTracks(albumTracks);

    setTracks(verifiedTracks);

    if (artistId) {
      const artistAlbumsReturned = await getArtistAlbumsData();
      setArtistAlbums(artistAlbumsReturned);
    }
  }

  async function getSimilarAlbumsData() {
    let similarAlbums: AlbumsProps[] = [];

    let similarAlbumsAPIResponse = await api.get(`/albums/${slug}/similar?apikey=${API_KEY}`);

    const similarAlbumsMapPromises = similarAlbumsAPIResponse.data.albums.map(async (album: any) => {
      let { data } = await api.get(`/albums/${album.id}/images?apikey=${API_KEY}`);
      let imageURL = null;
      if (data.images.length > 0) {
        imageURL = data.images[0].url
      }

      similarAlbums.push({
        id: album.id,
        name: album.name,
        releasedDate: album.originallyReleased,
        copyright: album.copyright,
        artistName: album.artistName,
        image: imageURL,
      })
    });

    await Promise.all(similarAlbumsMapPromises);

    return similarAlbums;
  }

  async function getArtistAlbumsData() {
    let artistAlbums: AlbumsProps[] = [];

    let artistAlbumsAPIResponse = await api.get(`/artists/${artistId}/albums/top?apikey=${API_KEY}`);

    const artistAlbumsMapPromises = artistAlbumsAPIResponse.data.albums.map(async (album: any) => {
      let { data } = await api.get(`/albums/${album.id}/images?apikey=${API_KEY}`);
      let imageURL = null;
      if (data.images.length > 0) {
        imageURL = data.images[0].url
      }

      artistAlbums.push({
        id: album.id,
        name: album.name,
        releasedDate: album.originallyReleased,
        copyright: album.copyright,
        artistName: album.artistName,
        image: imageURL,
      })
    });

    await Promise.all(artistAlbumsMapPromises);

    return artistAlbums;
  }

  async function getTracksData() {
    let tracks: TrackProps[] = [];

    let tracksAPIResponse = await api.get(`/albums/${slug}/tracks?apikey=${API_KEY}`);

    const tracksMapPromises = tracksAPIResponse.data.tracks.map(async (track: any) => {
      tracks.push({
        id: track.id,
        image: album.image,
        title: track.name,
        url: track.previewURL,
        albumName: track.albumName,
        artistName: track.artistName,
        duration: track.playbackSeconds,
        isFavorite: false,
      });
    });

    await Promise.all(tracksMapPromises);

    return tracks;
  }

  async function handleCreateFavAlbum() {
    const id = album.id.replace('.', '');

    const albumRef = database.ref(`libs/${user.id}/albums/${id}`);

    const albumRefExist = await albumRef.get();

    if (albumRefExist.exists()) {
      handleToggleFavTracklist(true);
      await albumRef.remove();
      setIsFavorite(false);
    } else {
      handleToggleFavTracklist(false);
      await albumRef.set({
        id: album.id,
        name: album.name,
        artistName: album.artistName,
        image: album.image,
        rating: 0,
        userId: user?.id,
      });
      setIsFavorite(true);
    }
  }

  async function handleToggleFavTracklist(isFavorite: boolean) {
    tracks.map(async (track, index) => {
      const id = track.id.replace('.', '');
      const trackRef = database.ref(`libs/${user.id}/tracks/${id}`);
      const trackRefExist = await trackRef.get();

      if (isFavorite) {
        await trackRef.remove();

        setTracks([...tracks].map((track) => {
          return {
            ...track,
            isFavorite: false
          }
        }));
      } else {
        setTracks([...tracks].map((track) => {
          return {
            ...track,
            isFavorite: true
          }
        }));
        if (!trackRefExist.exists()) {
          await trackRef.set({
            id: track.id,
            name: track.title,
            artistName: track.artistName,
            albumName: track.albumName,
            image: track.image,
            previewUrl: track.url,
            rating: 0,
            userId: user?.id,
          });
        }
      }
    });
  }

  function updateFavTrack(index: number) {
    setTracks([...tracks].map((track, idx) => {
      if (idx === index) {
        return {
          ...track,
          isFavorite: !track.isFavorite
        }
      } else {
        return track;
      }
    }));
  }

  async function handleToggleFavTracks(track: TrackProps, index: number) {
    const id = track.id.replace('.', '');

    const trackRef = database.ref(`libs/${user.id}/tracks/${id}`);

    const trackRefExist = await trackRef.get();

    updateFavTrack(index);

    if (trackRefExist.exists()) {
      await trackRef.remove();
    } else {
      await trackRef.set({
        id: track.id,
        name: track.title,
        artistName: track.artistName,
        albumName: track.albumName,
        image: track.image,
        previewUrl: track.url,
        rating: 0,
        userId: user?.id,
      });
    }
  }

  async function verifyFavAlbum() {
    if (user) {
      const id = album.id.replace('.', '');

      const albumsRef = database.ref(`libs/${user?.id}/albums/${id}`);

      const albumRefExist = await albumsRef.get();

      if (albumRefExist.exists()) {
        setRatingValue(albumRefExist.val().rating);
        setIsFavorite(true);
      } else {
        setIsFavorite(false);
      }
    }
  }

  async function handleChangeRating(value: number) {
    setRatingValue(value);
    const id = album.id.replace('.', '');

    const albumsRef = database.ref(`libs/${user?.id}/albums/${id}`);

    await albumsRef.update({ 'rating': value });
  }

  async function verifyFavTracks(albumTracks: TrackProps[]) {
    if (user) {
      const mapPromisse = albumTracks.map(async (track) => {
        const id = track.id.replace('.', '');
        const trackRef = database.ref(`libs/${user.id}/tracks/${id}`);
        const trackRefExist = await trackRef.get();
        if (trackRefExist.exists()) {
          track.isFavorite = true;
        } else {
          track.isFavorite = false;
        }
      });

      await Promise.all(mapPromisse);
    }

    return albumTracks;
  }


  useEffect(() => {
    getRemainingData();

  }, [album, slug, artistId, user]);

  useEffect(() => {
    verifyFavAlbum();
  }, [user, album]);

  useEffect(() => {
    if (trackList[currentTrackIndex]) {
      setCurrentTrack(trackList[currentTrackIndex].title);
    }
  }, [trackList, currentTrackIndex]);

  return (
    <div className={styles.wrapper}>
      <main>
        <Header />
        <div className={styles.container}>
          <Head>
            <title>{album.name} | Musifavs</title>
          </Head>
          <motion.div
            className={styles.topBackgroundImage}
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              duration: 0.2,
              delay: 0.4
            }}
          >
            {album.image ?
              <img src={album.image} alt={album.name} ref={albumImageRef} />
              :
              <img src="/default.png" alt={album.name} />
            }
          </motion.div>

          <div className={styles.album}>
            <motion.div
              className={styles.albumContainer}
              initial='initial'
              animate='animate'
              transition={{ delay: 0.5 }}
              variants={fadeInUp}
            >
              <Link href="/">
                <motion.button
                  initial={{ x: '-50%', y: '-50%' }}
                  whileHover={{ x: '-60%' }}
                  className={styles.sideButton}
                  type="button"
                >
                  <img src="/arrow-left.svg" alt="Voltar" />
                </motion.button>
              </Link>

              <div className={styles.imageContainer}>
                {album.image ?
                  <motion.img
                    src={album.image}
                    alt={album.name}
                    initial={{ scale: 0, opacity: 0, borderRadius: '500px 500px 500px 500px' }}
                    animate={{ scale: 1, opacity: 1, borderRadius: '10px 0 0 10px' }}
                    transition={{
                      duration: 0.4,
                      delay: 0.8,
                      ease: 'easeIn'
                    }}
                  />
                  :
                  <img src="/default.png" alt={album.name} />
                }
                <div className={styles.favstarContainer}>
                  <motion.button
                    type="button"
                    whileTap={{
                      rotate: 90,
                      scale: 1.5,
                    }}
                    onClick={handleCreateFavAlbum}
                  >
                    {isFavorite ?
                      <img src="/star-selected.svg" alt="favoritar" />
                      :
                      <img src="/star.svg" alt="favoritar" />
                    }
                  </motion.button>
                </div>
              </div>

              <div className={styles.tracksContainer}>
                <h3>{album.name}</h3>
                <h5>{album.artistName}</h5>

                <motion.div
                  className={styles.trackList}
                  variants={staggerDelay}
                  initial='initial'
                  animate='animate'

                >
                  {tracks.map((track, index) => {
                    return (
                      <motion.div variants={fadeInUp} key={track.id}>
                        <button onClick={() => playList(tracks, index)}>
                          {currentTrack === track.title ?
                            <>
                              <strong style={{ color: '#414141' }}>{index + 1}. </strong>
                              <span style={{ color: '#414141' }}>{track.title}</span>
                            </>
                            :
                            <>
                              <strong>{index + 1}. </strong>
                              <span>{track.title}</span>
                            </>
                          }
                        </button>

                        <button onClick={() => handleToggleFavTracks(track, index)}>
                          {track.isFavorite ?
                            <img src="/star-selected.svg" alt="favoritar" />
                            :
                            <img src="/star.svg" alt="favoritar" />
                          }
                        </button>
                      </motion.div>
                    )
                  })}
                </motion.div>
                <p>
                  &copy; {album.copyright}
                </p>
              </div>

              <motion.button
                initial={{ x: '50%', y: '-50%' }}
                whileHover={{ x: '60%' }}
                className={styles.sideButton}
                type="button"
              >
                <img src="/play.svg" alt="Tocar episódio" />
              </motion.button>
            </motion.div>

            {(user && isFavorite) &&
              <Rating
                value={ratingValue}
                onChange={(value) => handleChangeRating(value)}
              />
            }

            {artistAlbums.length !== 0 &&
              <Albums albumList={artistAlbums} />
            }

            {similarAlbums.length !== 0 &&
              <Albums albumList={similarAlbums} listType="similar" />
            }
          </div>
        </div>
      </main>
      <Player />
    </div>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  }
}

export const getStaticProps: GetStaticProps = async (ctx) => {
  const { slug } = ctx.params;

  const API_KEY = process.env.NEXT_PUBLIC_NAPSTER_API_KEY;

  const { data } = await api.get(`/albums/${slug}?apikey=${API_KEY}&lang=pt-BR`);

  let imagesAPIResponse = await api.get(`${data.albums[0].links.images.href}?apikey=${API_KEY}`);
  let image = null;
  if (imagesAPIResponse.data.images[3]) {
    image = imagesAPIResponse.data.images[3].url
  }

  let artistId = null
  if (data.albums[0].contributingArtists.primaryArtist) {
    artistId = data.albums[0].contributingArtists.primaryArtist
  }

  const album = {
    id: data.albums[0].id,
    name: data.albums[0].name,
    releasedDate: data.albums[0].originallyReleased,
    copyright: data.albums[0].copyright,
    artistName: data.albums[0].artistName,
    image,
  }

  return {
    props: { album, slug, artistId },
    revalidate: 60 * 60 * 24, //24 hours
  }
}