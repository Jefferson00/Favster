import { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { ImgHTMLAttributes, useEffect, useRef, useState } from "react";
import { Header } from "../../components/Header";
import { Player } from "../../components/Player";
import { usePlayer } from "../../contexts/PlayerContext";
import api from "../../services/api";

import styles from './album.module.scss';

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
  tracks: Track[];
  similarAlbums: Albums[];
}

type AlbumProps = {
  album: Album,
}

export default function Album({ album }: AlbumProps) {
  const { play, playList } = usePlayer();
  const albumImageRef = useRef<HTMLImageElement>(null);

  const [similarAlbums, setSimilarAlbums] = useState<Albums[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);


  const [showingAllAlbums, setShowingAllAlbums] = useState(false);

  function toggleShowAllAlbums() {
    setShowingAllAlbums(!showingAllAlbums);
  }

  useEffect(() => {
    setTracks(album.tracks)
    setSimilarAlbums(album.similarAlbums)
  }, [album]);

  return (
    <div className={styles.wrapper}>
      <main>
        <Header />
        <div className={styles.container}>
          <Head>
            <title>{album.name} | Musifavs</title>
          </Head>
          <div className={styles.topBackgroundImage}>
            {album.image ?
              <img src={album.image} alt={album.name} ref={albumImageRef} />
              :
              <img src="/default.png" alt={album.name} />
            }
          </div>
          <div className={styles.album}>
            <div className={styles.albumContainer}>
              <Link href="/">
                <button className={styles.sideButton} type="button">
                  <img src="/arrow-left.svg" alt="Voltar" />
                </button>
              </Link>
              <div className={styles.imageContainer}>
                {album.image ?
                  <img src={album.image} alt={album.name} />
                  :
                  <img src="/default.png" alt={album.name} />
                }
              </div>
              <div className={styles.tracksContainer}>
                <h3>{album.name}</h3>
                <h5>{album.artistName}</h5>

                <div className={styles.trackList}>
                  {album.tracks.map((track, index) => {
                    return (
                      <div key={track.id}>
                        <button onClick={() => playList(tracks, index)}>
                          <strong>{index + 1}. </strong>
                          <span>{track.title}</span>
                        </button>

                        <button>
                          <img src="/star-outline.svg" alt="favoritar" />
                        </button>
                      </div>
                    )
                  })}
                </div>
                <p>
                  {album.copyright}
                </p>
              </div>
              <button className={styles.sideButton} type="button">
                <img src="/play.svg" alt="Tocar episódio" />
              </button>
            </div>

            {similarAlbums.length !== 0 &&
              <div className={styles.similarAlbumsContainer}>
                <h2>Albuns</h2>
                <div className={styles.albumsList}>
                  {similarAlbums.map(album => {
                    return (
                      <div className={styles.album} key={album.id}>
                        {album.image ?
                          <img src={album.image} alt={album.name} />
                          :
                          <img src="default.png" alt={album.name} />
                        }
                        <p>{album.name}</p>
                        <span>{album.artistName}</span>
                      </div>
                    )
                  })}
                </div>
                <footer>
                  <button onClick={toggleShowAllAlbums}>
                    {showingAllAlbums ?
                      <img src="/chevron-up.svg" alt="ocultar" /> :
                      <img src="/plus.svg" alt="ver mais" />
                    }
                  </button>
                </footer>
              </div>
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

  let tracks: Track[] = [];
  let similarAlbums: Albums[] = [];

  let tracksAPIResponse = await api.get(`/albums/${slug}/tracks?apikey=${API_KEY}`);
  let similarAlbumsAPIResponse = await api.get(`/albums/${slug}/similar?apikey=${API_KEY}`);

  const tracksMapPromises = tracksAPIResponse.data.tracks.map(async (track: any) => {
    tracks.push({
      id: track.id,
      image,
      title: track.name,
      url: track.previewURL,
      albumName: track.albumName,
      artistName: track.artistName,
      duration: track.playbackSeconds,
    });
  });

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
  })

  await Promise.all(tracksMapPromises);
  await Promise.all(similarAlbumsMapPromises);

  const album = {
    id: data.albums[0].id,
    name: data.albums[0].name,
    releasedDate: data.albums[0].originallyReleased,
    copyright: data.albums[0].copyright,
    artistName: data.albums[0].artistName,
    image,
    tracks,
    similarAlbums,
  }

  return {
    props: { album },
    revalidate: 60 * 60 * 24, //24 hours
  }
}