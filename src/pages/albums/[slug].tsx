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
import { fadeInUp, stagger, staggerDelay } from "../../styles/animations";

import { motion } from 'framer-motion';

type Track = {
  id: string;
  title: string;
  artistName: string;
  albumName: string;
  image: string;
  duration: number;
  url: string;
}

type Albums = {
  id: string;
  name: string;
  releasedDate: Date;
  copyright: string;
  artistName: string;
  image: string | null;
}

type Album = {
  id: string;
  name: string;
  releasedDate: Date;
  copyright: string;
  artistName: string;
  image: string | null;
}

type AlbumProps = {
  album: Album,
  slug: string,
  artistId: string,
}

export default function Album({ album, slug, artistId }: AlbumProps) {
  const API_KEY = process.env.NEXT_PUBLIC_NAPSTER_API_KEY;

  const { playList } = usePlayer();
  const albumImageRef = useRef<HTMLImageElement>(null);

  const [similarAlbums, setSimilarAlbums] = useState<Albums[]>([]);
  const [artistAlbums, setArtistAlbums] = useState<Albums[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);

  async function getRemainingData() {
    const similarAlbums = await getSimilarAlbumsData();
    setSimilarAlbums(similarAlbums);
    const albumTracks = await getTracksData();
    setTracks(albumTracks);
    if (artistId) {
      const artistAlbumsReturned = await getArtistAlbumsData();
      setArtistAlbums(artistAlbumsReturned);
    }
  }

  async function getSimilarAlbumsData() {
    let similarAlbums: Albums[] = [];

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
    let artistAlbums: Albums[] = [];

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
    let tracks: Track[] = [];

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
      });
    });

    await Promise.all(tracksMapPromises);

    return tracks;
  }

  useEffect(() => {
    getRemainingData();
  }, []);

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
                    initial={{ scale: 0, opacity: 0, borderRadius: '50%' }}
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
                          <strong>{index + 1}. </strong>
                          <span>{track.title}</span>
                        </button>

                        <button>
                          <img src="/star-outline.svg" alt="favoritar" />
                        </button>
                      </motion.div>
                    )
                  })}
                </motion.div>
                <p>
                  {album.copyright}
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