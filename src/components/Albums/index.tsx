import Link from "next/link";
import { useEffect, useState } from "react";

import { fadeInUp, stagger } from "../../styles/animations";
import styles from './albums.module.scss';

import { useInView } from "react-intersection-observer";
import { motion, useAnimation } from "framer-motion";
import { Rating } from "../Rating";
import { Loading } from "../Loading";

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
  const [showingAllAlbums, setShowingAllAlbums] = useState(false);

  const [albums, setAlbums] = useState<Album[]>([]);

  useEffect(() => {
    if (showingAllAlbums) {
      setAlbums(albumList);
    } else {
      setAlbums(albumList.slice(0, 10));
    }
  }, [albumList, showingAllAlbums]);


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
        {albums.map(album => {
          return (
            <motion.div
              variants={fadeInUp}
              className={styles.album}
              key={album.id}
            >
              {listType === 'library' &&
                <Rating
                  value={album.rating}
                />
              }

              <Link href={`/albums/${album.id}`}>
                <a onClick={onItemSelected}>
                  {album.image ?
                    <motion.img
                      src={album.image}
                      alt={album.name}
                      whileHover={{ y: -5 }}
                      whileTap={{ scale: 0.95 }}
                    />
                    :
                    <motion.img
                      whileHover={{ y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      src="default.png"
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