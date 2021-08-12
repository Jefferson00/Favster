import { GetStaticPaths, GetStaticProps } from "next";
import Image from 'next/image';
import Head from "next/head";
import Link from 'next/link';
import api from "../../services/api";
import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR'
import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString';
import styles from './episode.module.scss';
import { usePlayer } from "../../contexts/PlayerContext";
import { Player } from "../../components/Player";
import { Header } from "../../components/Header";
import { useEffect, useState } from "react";

type Album = {
    id: string;
    name: string;
    releasedDate: Date;
    copyright: string;
    artistName: string;
    image: string | null;
}

type Genre = {
    id: string;
    name: string;
    description: string;
}

type Track = {
    id: string;
    title: string;
    artistName: string;
    albumName: string;
    image: string;
    duration: number;
    url: string;
}

type Artist = {
    id: string;
    name: string;
    type: string;
    bio: string;
    albums: Album[];
    genres: Genre[];
    topTracks: Track[];
    image: string;
}

type ArtistProps = {
    artist: Artist,
}

export default function Episode({ artist }: ArtistProps) {

    const { play, playList } = usePlayer();

    const [trackList, setTrackList] = useState<Track[]>([]);
    const [albums, setAlbums] = useState<Album[]>([]);
    const [tracks, setTracks] = useState<Track[]>([]);

    const [showingAllAlbums, setShowingAllAlbums] = useState(false);
    const [showingAllTracks, setShowingAllTracks] = useState(false);

    function toggleShowAllAlbums() {
        setShowingAllAlbums(!showingAllAlbums);
    }

    function toggleShowAllTracks() {
        setShowingAllTracks(!showingAllTracks);
    }

    useEffect(() => {
        setTrackList(artist.topTracks);

        if (showingAllAlbums) {
            setAlbums(artist.albums);
        } else {
            setAlbums(artist.albums.slice(0, 10));
        }
        if (showingAllTracks) {
            setTracks(artist.topTracks);
        } else {
            setTracks(artist.topTracks.slice(0, 10));
        }
    }, [artist, showingAllAlbums, showingAllTracks]);

    return (
        <div className={styles.wrapper}>
            <main>
                <Header />
                <div className={styles.container}>
                    <Head>
                        <title>{artist.name} | Musifavs</title>
                    </Head>
                    <div className={styles.topBackgroundImage}>
                        {artist.image ?
                            <img src={artist.image} alt={artist.name} />
                            :
                            <img src="/default.png" alt={artist.name} />
                        }
                    </div>
                    <div className={styles.artist}>
                        <div className={styles.thumbnailContainer}>
                            <Link href="/">
                                <button type="button">
                                    <img src="/arrow-left.svg" alt="Voltar" />
                                </button>
                            </Link>
                            {artist.image ?
                                <Image
                                    width={700}
                                    height={258}
                                    src={artist.image}
                                    objectFit="cover"
                                />
                                :
                                <Image
                                    width={700}
                                    height={258}
                                    src="/default.png"
                                    objectFit="cover"
                                />
                            }

                            <button type="button">
                                <img src="/play.svg" alt="Tocar episódio" />
                            </button>
                        </div>

                        <header>
                            <h1>{artist.name}</h1>
                            {
                                artist.genres.map(genre => {
                                    return (
                                        <span key={genre.id}>{genre.name}</span>
                                    )
                                })
                            }
                        </header>

                        <div
                            className={styles.description}
                            dangerouslySetInnerHTML={{ __html: artist.bio }}
                        />

                        <div className={styles.albumsContainer}>
                            <h2>Albuns</h2>
                            <div className={styles.albumsList}>
                                {albums.map(album => {
                                    return (
                                        <div className={styles.album} key={album.id}>
                                            {album.image ?
                                                <img src={album.image} alt={album.name} />
                                                :
                                                <img src="default.png" alt={album.name} />
                                            }
                                            <p>{album.name}</p>
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

                        <div className={styles.tracksContainer}>
                            <h2>Músicas</h2>
                            <div className={styles.tracksList}>
                                {tracks.map((track, index) => {
                                    return (
                                        <div className={styles.track} key={track.id}>
                                            <div className={styles.imageContainer}>
                                                {track.image ?
                                                    <img src={track.image} alt={track.title} />
                                                    :
                                                    <img src="default.png" alt={track.title} />
                                                }
                                                <button
                                                    className={styles.playButton}
                                                    onClick={() => playList(trackList, index)}
                                                >
                                                    <img src="/play-green.svg" alt="Tocar" />
                                                </button>
                                            </div>
                                            <p>{track.title}</p>
                                            <p>{track.albumName}</p>
                                        </div>
                                    )
                                })}
                            </div>
                            <footer>
                                <button onClick={toggleShowAllTracks}>
                                    {showingAllTracks ?
                                        <img src="/chevron-up.svg" alt="ocultar" /> :
                                        <img src="/plus.svg" alt="ver mais" />
                                    }
                                </button>
                            </footer>
                        </div>
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

    const { data } = await api.get(`/artists/${slug}?apikey=${API_KEY}&lang=pt-BR`);

    let images = await api.get(`${data.artists[0].links.images.href}?apikey=${API_KEY}`);

    let albums: Album[] = [];
    let genres: Genre[] = [];
    let topTracks: Track[] = [];

    let albumsAPIResponse = await api.get(`${data.artists[0].links.albums.href}/top?apikey=${API_KEY}`);
    let genresAPIResponse = await api.get(`${data.artists[0].links.genres.href}?apikey=${API_KEY}`);
    let topTracksAPIResponse = await api.get(`/artists/${slug}/tracks/top?apikey=${API_KEY}`);



    const topTracksMapPromises = topTracksAPIResponse.data.tracks.map(async (track: any) => {
        let albumsResponse = await api.get(`${track.links.albums.href}?apikey=${API_KEY}`);
        let albumImagesLink = albumsResponse.data.albums[0].links.images.href;
        let { data } = await api.get(`${albumImagesLink}?apikey=${API_KEY}`);
        let imageURL = null;
        if (data.images.length > 0) {
            imageURL = data.images[0].url
        }

        topTracks.push({
            id: track.id,
            image: imageURL,
            title: track.name,
            url: track.previewURL,
            albumName: track.albumName,
            artistName: track.artistName,
            duration: track.playbackSeconds,
        });
    });

    const genresMapPromises = genresAPIResponse.data.genres.map(async (genre: any) => {
        genres.push({
            id: genre.id,
            description: genre.description,
            name: genre.name,
        })
    });

    const albumsMapPromises = albumsAPIResponse.data.albums.map(async (album: any) => {
        let { data } = await api.get(`${album.links.images.href}?apikey=${API_KEY}`);

        let imageUrl = null;
        if (data.images.length > 0) {
            imageUrl = data.images[0].url
        }

        albums.push({
            id: album.id,
            name: album.name,
            releasedDate: album.originallyReleased,
            copyright: album.copyright,
            artistName: album.artistName,
            image: imageUrl,
        });
    });

    await Promise.all(albumsMapPromises);
    await Promise.all(genresMapPromises);
    await Promise.all(topTracksMapPromises);

    let bio = '';
    if (data.artists[0].bios) {
        bio = data.artists[0].bios[0].bio
    }

    let image = null;
    if (images.data.images[3]) {
        image = images.data.images[3].url
    }

    const artist = {
        id: data.artists[0].id,
        name: data.artists[0].name,
        image,
        type: data.artists[0].type,
        bio,
        albums,
        genres,
        topTracks,
    }

    return {
        props: { artist },
        revalidate: 60 * 60 * 24, //24 hours
    }
}