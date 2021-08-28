import React, { useEffect, useState } from "react";
import Image from "next/image";
import { usePlayer } from "../../contexts/PlayerContext";

import { fadeInUp, stagger } from "../../styles/animations";
import styles from './tracks.module.scss';

import { useInView } from "react-intersection-observer";
import { motion, useAnimation } from "framer-motion";
import { Rating } from "../Rating";
import { useAuth } from "../../contexts/AuthContext";
import { database } from "../../services/firebase";

type Track = {
  id: string;
  title: string;
  artistName: string;
  albumName: string;
  image: string;
  duration: number;
  url: string;
  rating?: number;
}

interface TracksProps {
  artistTracks: Track[],
  listType?: "artist" | "library",
}

export function Tracks({ artistTracks, listType }: TracksProps) {
  const controls = useAnimation();
  const { playList } = usePlayer();
  const { ref, inView } = useInView();
  const { user } = useAuth();

  const [showingAllTracks, setShowingAllTracks] = useState(false);
  const [tracks, setTracks] = useState<Track[]>([]);

  useEffect(() => {
    if (showingAllTracks) {
      setTracks(artistTracks);
    } else {
      setTracks(artistTracks.slice(0, 10));
    }
  }, [artistTracks, showingAllTracks]);

  function toggleShowAllTracks() {
    setShowingAllTracks(!showingAllTracks);
  }

  /**
   * Change de rating value for an favorite track
   * @param track : Track
   * @param value : number
   */
  async function handleChangeRating(track: Track, value: number, index: number) {
    const id = track.id.replace('.', '');

    const trackRef = database.ref(`libs/${user?.id}/tracks/${id}`);

    await trackRef.update({ 'rating': value });


    setTracks([...tracks].map((track, idx) => {
      if (idx === index) {
        return {
          ...track,
          rating: value
        }
      } else {
        return track;
      }
    }));
  }

  useEffect(() => {
    if (inView) {
      controls.start('animate');
    }
    if (!inView) {
      controls.start('initial');
    }
  }, [controls, inView, showingAllTracks, tracks]);

  return (
    <motion.div
      variants={stagger}
      initial='initial'
      animate={showingAllTracks ? 'animate' : controls}
      ref={ref}
      className={styles.tracksContainer}
    >
      {listType !== 'library' &&
        <h2>Músicas</h2>
      }

      <div className={styles.tracksList}>
        {tracks.map((track, index) => {
          return (
            <motion.div
              variants={fadeInUp}
              className={styles.track}
              key={track.id}
            >
              {listType === 'library' &&
                <Rating
                  value={track.rating}
                  onChange={(value) => handleChangeRating(track, value, index)}
                />
              }
              <div className={styles.imageContainer}>
                {track.image ?
                  <motion.div
                    whileHover={{ y: -5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Image
                      src={track.image}
                      objectFit="cover"
                      width={138}
                      height={138}
                      placeholder="blur"
                      blurDataURL={track.image}
                    />
                  </motion.div>
                  :
                  <img src="default.png" alt={track.title} />
                }
                <motion.button
                  initial={{ x: '50%', y: '80%' }}
                  whileHover={{ y: '60%' }}
                  className={styles.playButton}
                  onClick={() => playList(artistTracks, index)}
                >
                  <img src="/play-green.svg" alt="Tocar" />
                </motion.button>
              </div>
              <p>{track.title}</p>
              <p>{track.albumName}</p>
            </motion.div>
          )
        })}
      </div>

      <footer>
        <motion.button
          onClick={toggleShowAllTracks}
          whileHover={{ y: -5 }}
        >
          {showingAllTracks ?
            <img src="/chevron-up.svg" alt="ocultar" /> :
            <img src="/plus.svg" alt="ver mais" />
          }
        </motion.button>
      </footer>
    </motion.div>
  )
}