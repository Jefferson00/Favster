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
import { useEffect } from "react";

type Album = {
    id: string;
    name: string;
    releasedDate: Date;
    copyright: string;
    artistName: string;
    image: string | null;
}

type Genre = {

}

type Artist = {
    id: string;
    name: string;
    type: string;
    bio: string;
    albums: Album[];
    image: string;
}

type ArtistProps = {
    artist: Artist,
}

export default function Episode({ artist }: ArtistProps) {

    const { play } = usePlayer();

    useEffect(() => {
        console.log(artist)
    }, [])

    return (
        <div className={styles.wrapper}>
            <main>
                <Header />
                <div className={styles.container}>
                    <Head>
                        <title>{artist.name} | Musifavs</title>
                    </Head>
                    <div className={styles.topBackgroundImage}>
                        <img src={artist.image} alt={artist.name} />
                    </div>
                    <div className={styles.artist}>
                        <div className={styles.thumbnailContainer}>
                            <Link href="/">
                                <button type="button">
                                    <img src="/arrow-left.svg" alt="Voltar" />
                                </button>
                            </Link>

                            <Image
                                width={700}
                                height={258}
                                src={artist.image}
                                objectFit="cover"
                            />

                            <button type="button">
                                <img src="/play.svg" alt="Tocar episódio" />
                            </button>
                        </div>

                        <header>
                            <h1>{artist.name}</h1>

                        </header>

                        <div
                            className={styles.description}
                            dangerouslySetInnerHTML={{ __html: artist.bio }}
                        />

                        <div className={styles.albumsContainer}>
                            <h2>Albuns</h2>
                            <div className={styles.albumsList}>
                                {artist.albums.map(album => {
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

    const artist = {
        id: data.artists[0].id,
        name: data.artists[0].name,
        image: images.data.images[3].url || null,
        type: data.artists[0].type,
        bio: data.artists[0].bios[0].bio || '',
        albums: albums,
    }

    return {
        props: { artist },
        revalidate: 60 * 60 * 24, //24 hours
    }
}