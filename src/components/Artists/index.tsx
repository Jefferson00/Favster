import Link from "next/link";
import { useEffect, useState } from "react";

import { fadeInUp, stagger } from "../../styles/animations";
import styles from './artists.module.scss';

import { useInView } from "react-intersection-observer";
import { motion, useAnimation } from "framer-motion";

type Artist = {
  id: string;
  name: string;
  type: string;
  image: string;
  rating: number;
}

interface ArtistsProps {
  artistsList: Artist[],
  listType?: "similar" | "favorites",
}

export function Artists({ artistsList, listType }: ArtistsProps) {
  const controls = useAnimation();
  const { ref, inView } = useInView();
  //const [showingAllAlbums, setShowingAllAlbums] = useState(false);
  const [isItemClicked, setIsItemClicked] = useState(false);

  const [artists, setArtist] = useState<Artist[]>([]);

  useEffect(() => {
    setArtist(artistsList)
  }, [artistsList]);


  /*function toggleShowAllAlbums() {
    setShowingAllAlbums(!showingAllAlbums);
  }*/

  useEffect(() => {
    if (inView) {
      controls.start('animate');
    }
    if (!inView) {
      controls.start('initial');
    }
  }, [controls, inView, artists]);

  return (
    <motion.div
      className={styles.artistsContainer}
      variants={stagger}
      initial='initial'
      animate={controls}
      ref={ref}
    >
      {listType === 'similar' ?
        <h2>Álbuns Similares</h2>
        :
        <h2>Artistas</h2>
      }
      <div className={styles.artistsList}>
        {artists.map(artist => {
          return (
            <motion.div
              variants={fadeInUp}
              className={styles.artist}
              key={artist.id}
            >
              <Link href={`/artists/${artist.id}`}>
                <a onClick={() => setIsItemClicked(true)}>
                  {artist.image ?
                    <motion.img
                      src={artist.image}
                      alt={artist.name}
                      whileHover={{ y: -5 }}
                      whileTap={{ scale: 0.95 }}
                    />
                    :
                    <motion.img
                      whileHover={{ y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      src="default.png"
                      alt={artist.name}
                    />
                  }
                </a>
              </Link>
              <p>{artist.name}</p>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}