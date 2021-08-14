import { motion, useAnimation } from "framer-motion"
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { fadeInUp, stagger } from "../../../../styles/animations";
import styles from './albums.module.scss';

type Album = {
  id: string;
  name: string;
  releasedDate: Date;
  copyright: string;
  artistName: string;
  image: string | null;
}

interface AlbumsProps {
  artistAlbums: Album[],
}

export function Albums({ artistAlbums }: AlbumsProps) {
  const controls = useAnimation();
  const { ref, inView } = useInView();
  const [showingAllAlbums, setShowingAllAlbums] = useState(false);

  const [albums, setAlbums] = useState<Album[]>([]);

  useEffect(() => {
    if (showingAllAlbums) {
      setAlbums(artistAlbums);
    } else {
      setAlbums(artistAlbums.slice(0, 10));
    }
  }, [artistAlbums, showingAllAlbums]);


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
  }, [controls, inView, showingAllAlbums]);

  return (
    <motion.div
      className={styles.albumsContainer}
      variants={stagger}
      initial='initial'
      animate={showingAllAlbums ? 'animate' : controls}
      ref={ref}
    >
      <h2>Albuns</h2>
      <div className={styles.albumsList}>
        {albums.map(album => {
          return (
            <motion.div
              variants={fadeInUp}
              className={styles.album}
              key={album.id}
            >
              {album.image ?
                <img src={album.image} alt={album.name} />
                :
                <img src="default.png" alt={album.name} />
              }
              <p>{album.name}</p>
            </motion.div>
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
    </motion.div>
  )
}