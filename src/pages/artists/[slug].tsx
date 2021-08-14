import { GetStaticPaths, GetStaticProps } from "next";
import Image from 'next/image';
import Head from "next/head";
import Link from 'next/link';
import api from "../../services/api";
import styles from './artists.module.scss';
import { usePlayer } from "../../contexts/PlayerContext";
import { Player } from "../../components/Player";
import { Header } from "../../components/Header";
import { useEffect, useState } from "react";
import { motion, useAnimation } from 'framer-motion';
import { useInView } from "react-intersection-observer";
import { fadeInUp, stagger } from "../../styles/animations";
import { Albums } from "./components/Albums";
import { Tracks } from "./components/Tracks";

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
    image: string;
}

type ArtistProps = {
    artist: Artist,
    slug: string,
    data: any,
}

export default function Episode({ artist, slug, data }: ArtistProps) {

    const { play, playList } = usePlayer();

    const API_KEY = process.env.NEXT_PUBLIC_NAPSTER_API_KEY;

    const [artistAlbums, setArtistAlbums] = useState<Album[]>([]);

    const [artistTracks, setArtistTracks] = useState<Track[]>([]);

    const [genres, setGenres] = useState<Genre[]>([]);

    async function getRemainingData() {
        const albumsForArtist = await getAlbumsData();
        setArtistAlbums(albumsForArtist);
        const topTracks = await getTracksData();
        setArtistTracks(topTracks);
        const genresForArtist = await getGenreData();
        setGenres(genresForArtist);
    }

    async function getAlbumsData() {
        let albums: Album[] = [];

        let albumsAPIResponse = await api.get(`${data.artists[0].links.albums.href}/top?apikey=${API_KEY}`);

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

        return albums;
    }

    async function getTracksData() {
        let topTracks: Track[] = [];

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

        await Promise.all(topTracksMapPromises);

        return topTracks;
    }

    async function getGenreData() {
        let genres: Genre[] = [];
        let genresAPIResponse = await api.get(`${data.artists[0].links.genres.href}?apikey=${API_KEY}`);

        const genresMapPromises = genresAPIResponse.data.genres.map(async (genre: any) => {
            genres.push({
                id: genre.id,
                description: genre.description,
                name: genre.name,
            })
        });

        await Promise.all(genresMapPromises);

        return genres;
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
                        <title>{artist.name} | Musifavs</title>
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
                        {artist.image ?
                            <img src={artist.image} alt={artist.name} />
                            :
                            <img src="/default.png" alt={artist.name} />
                        }
                    </motion.div>

                    <div className={styles.artist}>
                        <motion.div
                            initial='initial'
                            animate='animate'
                            transition={{ delay: 0.5 }}
                            variants={fadeInUp}
                            className={styles.thumbnailContainer}
                        >
                            <Link href="/">
                                <motion.button
                                    type="button"
                                    initial={{ x: '-50%', y: '-50%' }}
                                    whileHover={{ x: '-60%' }}
                                >
                                    <img
                                        src="/arrow-left.svg"
                                        alt="Voltar"
                                    />
                                </motion.button>
                            </Link>
                            {artist.image ?
                                <Image
                                    width={700}
                                    height={258}
                                    src={artist.image}
                                    objectFit="cover"
                                    placeholder="blur"
                                    blurDataURL={artist.image}
                                />
                                :
                                <Image
                                    width={700}
                                    height={258}
                                    src="/default.png"
                                    objectFit="cover"
                                />
                            }

                            <motion.button
                                initial={{ x: '50%', y: '-50%' }}
                                whileHover={{ x: '60%' }}
                                type="button">
                                <img src="/play.svg" alt="Tocar episódio" />
                            </motion.button>
                        </motion.div>

                        <header>
                            <motion.div
                                variants={stagger}
                                initial='initial'
                                animate={'animate'}

                                transition={{ delay: 0.6, duration: 0.8 }}
                            >
                                <motion.h1 variants={fadeInUp}>{artist.name}</motion.h1>
                                {
                                    genres.map(genre => {
                                        return (
                                            <motion.span key={genre.id}
                                                variants={fadeInUp}

                                            >
                                                {genre.name}
                                            </motion.span>
                                        )
                                    })
                                }
                            </motion.div>
                        </header>

                        <div
                            className={styles.description}
                            dangerouslySetInnerHTML={{ __html: artist.bio }}
                        />

                        <Albums artistAlbums={artistAlbums} />

                        <Tracks artistTracks={artistTracks} />
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
    }

    return {
        props: { artist, slug, data },
        revalidate: 60 * 60 * 24, //24 hours
    }
}