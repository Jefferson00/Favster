import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

import { fadeInUp, stagger } from "../../styles/animations";
import styles from './albums.module.scss';

import { useInView } from "react-intersection-observer";
import { motion, useAnimation } from "framer-motion";
import { Rating } from "../Rating";
import { Loading } from "../Loading";
import { database } from "../../services/firebase";
import { useAuth } from "../../contexts/AuthContext";

type Album = {
  id: string;
  name: string;
  releasedDate?: Date;
  copyright?: string;
  artistName: string;
  image: string | null;
  rating?: number;
}

interface AlbumsProps {
  albumList: Album[],
  loading?: boolean,
  onItemSelected: () => void,
  listType?: "similar" | "artist" | "library",
}

export function Albums({ albumList, listType, loading, onItemSelected }: AlbumsProps) {
  const controls = useAnimation();
  const { ref, inView } = useInView();
  const { user } = useAuth();

  const [showingAllAlbums, setShowingAllAlbums] = useState(false);
  const [albums, setAlbums] = useState<Album[]>([]);

  useEffect(() => {
    if (showingAllAlbums) {
      setAlbums(albumList);
    } else {
      setAlbums(albumList.slice(0, 10));
    }
  }, [albumList, showingAllAlbums]);

  /**
   * Change de rating value for an favorite album
   * @param album : Album
   * @param value : number
   */
  async function handleChangeRating(album: Album, value: number, index: number) {
    const id = album.id.replace('.', '');

    const albumRef = database.ref(`libs/${user?.id}/albums/${id}`);

    setAlbums([...albums].map((album, idx) => {
      if (idx === index) {
        return {
          ...album,
          rating: value
        }
      } else {
        return album;
      }
    }));

    await albumRef.update({ 'rating': value });
  }

  function toggleShowAllAlbums() {
    setShowingAllAlbums(!showingAllAlbums);
  }

  useEffect(() => {
    if (inView) {
      controls.start('animate');
    }
    if (!inView) {
      controls.start('initial');
    }
  }, [controls, inView, showingAllAlbums, albums]);

  return (
    <motion.div
      className={styles.albumsContainer}
      variants={stagger}
      initial='initial'
      animate={showingAllAlbums ? 'animate' : controls}
      ref={ref}
    >
      {loading &&
        <Loading />
      }

      {listType === 'similar' ?
        <h2>Álbuns Similares</h2>
        :
        <h2>Álbuns</h2>
      }
      <div className={styles.albumsList}>
        {albums.map((album, index) => {
          return (
            <motion.div
              variants={fadeInUp}
              className={styles.album}
              key={album.id}
            >
              {listType === 'library' &&
                <Rating
                  value={album.rating}
                  onChange={(value) => handleChangeRating(album, value, index)}
                />
              }

              <Link href={`/albums/${album.id}`}>
                <a onClick={onItemSelected}>
                  {album.image ?
                    <motion.div
                      whileHover={{ y: -5 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Image
                        src={album.image}
                        objectFit="cover"
                        width={138}
                        height={138}
                        placeholder="blur"
                        blurDataURL={album.image}
                      />
                    </motion.div>
                    :
                    <motion.img
                      whileHover={{ y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      src="default-album.svg"
                      alt={album.name}
                    />
                  }
                </a>
              </Link>

              <p>{album.name}</p>
              {listType !== 'artist' &&
                <span className={styles.artistName}>
                  {album.artistName}
                </span>
              }
            </motion.div>
          )
        })}
      </div>

      <footer>
        <motion.button
          onClick={toggleShowAllAlbums}
          whileHover={{ y: -5 }}
        >
          {showingAllAlbums ?
            <img src="/chevron-up.svg" alt="ocultar" /> :
            <img src="/plus.svg" alt="ver mais" />
          }
        </motion.button>
      </footer>

    </motion.div>
  )
}