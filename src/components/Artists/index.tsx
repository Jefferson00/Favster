import Link from "next/link";
import Image from 'next/image';
import { useEffect, useState } from "react";

import { fadeInUp, stagger } from "../../styles/animations";
import styles from './artists.module.scss';

import { useInView } from "react-intersection-observer";
import { motion, useAnimation } from "framer-motion";
import { Loading } from "../Loading";
import { Rating } from "../Rating";
import { database } from "../../services/firebase";
import { useAuth } from "../../contexts/AuthContext";

type Artist = {
  id: string;
  name: string;
  type: string;
  image: string;
  rating: number;
}

interface ArtistsProps {
  artistsList: Artist[],
  loading?: boolean,
  onItemSelected: () => void,
  listType?: "similar" | "library",
}

export function Artists({ artistsList, listType, loading, onItemSelected }: ArtistsProps) {
  const controls = useAnimation();
  const { ref, inView } = useInView();
  const { user } = useAuth();

  const [showingAllArtists, setShowingAllArtists] = useState(false);
  const [artists, setArtists] = useState<Artist[]>([]);

  /**
  * Change de rating value for an favorite artist
  * @param artist : Artist
  * @param value : number
  */
  async function handleChangeRating(artist: Artist, value: number, index: number) {
    const id = artist.id.replace('.', '');

    const artistRef = database.ref(`libs/${user?.id}/artists/${id}`);

    setArtists([...artists].map((album, idx) => {
      if (idx === index) {
        return {
          ...album,
          rating: value
        }
      } else {
        return album;
      }
    }));

    await artistRef.update({ 'rating': value });
  }

  useEffect(() => {
    if (showingAllArtists) {
      setArtists(artistsList);
    } else {
      setArtists(artistsList.slice(0, 10));
    }
  }, [artistsList, showingAllArtists]);


  function toggleShowAllAlbums() {
    setShowingAllArtists(!showingAllArtists);
  }

  useEffect(() => {
    if (inView) {
      controls.start('animate');
    }
    if (!inView) {
      controls.start('initial');
    }
  }, [controls, inView, showingAllArtists, artists]);

  return (
    <motion.div
      className={styles.artistsContainer}
      variants={stagger}
      initial='initial'
      animate={showingAllArtists ? 'animate' : controls}
      ref={ref}
    >
      {loading &&
        <Loading />
      }

      {listType !== 'library' && (
        listType === 'similar' ?
          <h2>Artistas Similares</h2>
          :
          <h2>Artistas</h2>
      )}

      <div className={styles.artistsList}>
        {artists.map((artist, index) => {
          return (
            <motion.div
              variants={fadeInUp}
              className={styles.artist}
              key={artist.id}
            >
              {listType === 'library' &&
                <Rating
                  value={artist.rating}
                  onChange={(value) => handleChangeRating(artist, value, index)}
                />
              }

              <Link href={`/artists/${artist.id}`}>
                <a onClick={onItemSelected}>
                  {artist.image ?
                    <motion.div
                      whileHover={{ y: -5 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Image
                        src={artist.image}
                        objectFit="cover"
                        width={138}
                        height={138}
                        placeholder="blur"
                        blurDataURL={artist.image}
                      />
                    </motion.div>
                    :
                    <motion.img
                      whileHover={{ y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      src="default-artist.svg"
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

      <footer>
        <motion.button
          onClick={toggleShowAllAlbums}
          whileHover={{ y: -5 }}
        >
          {showingAllArtists ?
            <img src="/chevron-up.svg" alt="ocultar" /> :
            <img src="/plus.svg" alt="ver mais" />
          }
        </motion.button>
      </footer>
    </motion.div>
  )
}