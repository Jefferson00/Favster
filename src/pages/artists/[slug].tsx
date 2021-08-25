import { useEffect, useRef, useState } from "react";
import { GetStaticPaths, GetStaticProps } from "next";
import Image from 'next/image';
import Head from "next/head";

import api from "../../services/api";
import { API_KEY } from "../../config/ApiKey";
import axios from "axios";

import styles from './artists.module.scss';
import { fadeInUp, stagger } from "../../styles/animations";

import { usePlayer } from "../../contexts/PlayerContext";

import { Player } from "../../components/Player";
import { Header } from "../../components/Header";
import { Albums } from "../../components/Albums";
import { Tracks } from "../../components/Tracks";

import { motion } from 'framer-motion';
import { Rating } from "../../components/Rating";
import { database } from "../../services/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/router";

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

export default function Artists({ artist, slug, data }: ArtistProps) {
    const router = useRouter();
    const { playList } = usePlayer();
    const { user } = useAuth();

    const containerRef = useRef<HTMLDivElement>(null);

    const [artistAlbums, setArtistAlbums] = useState<Album[]>([]);
    const [artistTracks, setArtistTracks] = useState<Track[]>([]);
    const [genres, setGenres] = useState<Genre[]>([]);

    const [isFavorite, setIsFavorite] = useState(false);
    const [ratingValue, setRatingValue] = useState(0);

    const [loading, setLoading] = useState(false);

    /**
     * Add loading and scroll page to top
     */
    function onAlbumItemSelected() {
        setLoading(true);

        containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }

    /**
     * Set data for albums, tracks and genres from artist
     */
    async function setArtistRemainingData() {
        const albumsForArtist = await getAlbumsData();
        setArtistAlbums(albumsForArtist);
        const topTracks = await getTracksData();
        setArtistTracks(topTracks);
        const genresForArtist = await getGenreData();
        setGenres(genresForArtist);
    }

    /**
     * get albums data from artist selected
     * @returns albums: Array
     */
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

    /**
     * get tracks data from artist selected
     * @returns tracks: Array
     */
    async function getTracksData() {
        let topTracks: Track[] = [];

        let topTracksAPIResponse = await api.get(`/artists/${slug}/tracks/top?apikey=${API_KEY}`);

        const topTracksMapPromises = topTracksAPIResponse.data.tracks.map(async (track: any) => {
            let albumsResponse = await api.get(`${track.links.albums.href}?apikey=${API_KEY}`);
            let albumImagesLink = albumsResponse.data.albums[0].links.images.href;
            let { data } = await api.get(`${albumImagesLink}?apikey=${API_KEY}`);
            let imageURL = null;
            if (data.images.length > 0) {
                imageURL = data.images[3].url
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

    /**
     * get genres data from artist selected
     * @returns genres: Array
     */
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

    /**
     * Verify if an artist is favorite or not and add or remove the artist from favorites 
     */
    async function toggleFavArtist() {
        const id = artist.id.replace('.', '');

        const artistsRef = database.ref(`libs/${user.id}/artists/${id}`);

        const artistRefExist = await artistsRef.get();

        if (artistRefExist.exists()) {
            await artistsRef.remove();
            setIsFavorite(false);
        } else {
            await artistsRef.set({
                id: artist.id,
                name: artist.name,
                type: artist.type,
                bio: artist.bio,
                image: artist.image,
                rating: 0,
                userId: user?.id,
            });
            setIsFavorite(true);
        }
    }

    /**
     * Verify if the artist selected is favorite or not 
     * and set the state for favorite and rating value
     */
    async function verifyFavArtist() {
        if (user) {
            const id = artist.id.replace('.', '');

            const artistsRef = database.ref(`libs/${user?.id}/artists/${id}`);

            const artistRefExist = await artistsRef.get();

            if (artistRefExist.exists()) {
                setRatingValue(artistRefExist.val().rating);
                setIsFavorite(true);
            } else {
                setIsFavorite(false);
                setRatingValue(0);
            }
        }
    }

    /**
     * Change de rating value for an favorite artist
     * @param value : number
     */
    async function handleChangeRating(value: number) {
        setRatingValue(value);
        const id = artist.id.replace('.', '');

        const artistsRef = database.ref(`libs/${user?.id}/artists/${id}`);

        await artistsRef.update({ 'rating': value });
    }

    useEffect(() => {
        const source = axios.CancelToken.source();

        setArtistRemainingData();

        return () => source.cancel();
    }, []);

    useEffect(() => {
        const source = axios.CancelToken.source();

        verifyFavArtist();

        return () => source.cancel();
    }, [user]);

    return (
        <div className={styles.wrapper}>
            <main>
                <Header />
                <div className={styles.container} ref={containerRef}>
                    <Head>
                        <title>{artist.name} | Musifavs</title>
                    </Head>

                    <motion.div
                        className={styles.artistBackgroundImage}
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
                            <img src="/default-artist.svg" alt={artist.name} />
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

                            <motion.button
                                type="button"
                                initial={{ x: '-50%', y: '-50%' }}
                                whileHover={{ x: '-60%' }}
                                className={styles.sideButton}
                                onClick={() => router.back()}
                            >
                                <img
                                    src="/arrow-left.svg"
                                    alt="Voltar"
                                />
                            </motion.button>

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
                                    src="/default-artist.svg"
                                    objectFit="cover"
                                />
                            }
                            {user &&
                                <div className={styles.favstarContainer}>
                                    <motion.button
                                        type="button"
                                        whileTap={{
                                            rotate: 90,
                                            scale: 1.5,
                                        }}
                                        onClick={toggleFavArtist}
                                    >
                                        {isFavorite ?
                                            <img src="/star-selected.svg" alt="favoritar" />
                                            :
                                            <img src="/star.svg" alt="favoritar" />
                                        }
                                    </motion.button>
                                </div>
                            }
                            <motion.button
                                initial={{ x: '50%', y: '-50%' }}
                                whileHover={{ x: '60%' }}
                                type="button"
                                className={styles.sideButton}
                                onClick={() => playList(artistTracks, 0)}
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

                        <header>
                            <motion.div
                                variants={stagger}
                                initial='initial'
                                animate={'animate'}
                                transition={{ delay: 0.6, duration: 0.8 }}
                            >
                                <motion.h1 variants={fadeInUp}>
                                    {artist.name}
                                </motion.h1>
                                {
                                    genres.map(genre => {
                                        return (
                                            <motion.span
                                                key={genre.id}
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

                        <Albums
                            albumList={artistAlbums}
                            loading={loading}
                            onItemSelected={onAlbumItemSelected}
                        />

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