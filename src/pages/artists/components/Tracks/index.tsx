import { useEffect, useState } from "react";
import { usePlayer } from "../../../../contexts/PlayerContext";

import { fadeInUp, stagger } from "../../../../styles/animations";
import styles from './tracks.module.scss';

import { useInView } from "react-intersection-observer";
import { motion, useAnimation } from "framer-motion";

type Track = {
  id: string;
  title: string;
  artistName: string;
  albumName: string;
  image: string;
  duration: number;
  url: string;
}

interface TracksProps {
  artistTracks: Track[],
}

export function Tracks({ artistTracks }: TracksProps) {
  const controls = useAnimation();
  const { playList } = usePlayer();
  const { ref, inView } = useInView();
  const [showingAllTracks, setShowingAllTracks] = useState(false);
  const [isItemClicked, setIsItemClicked] = useState(false);

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

  useEffect(() => {
    if (inView) {
      controls.start('animate');
    }
    if (!inView) {
      controls.start('initial');
    }
  }, [controls, inView, showingAllTracks]);

  return (
    <motion.div
      variants={stagger}
      initial='initial'
      animate={showingAllTracks ? 'animate' : controls}
      ref={ref}
      className={styles.tracksContainer}
    >
      <h2>Músicas</h2>
      <div className={styles.tracksList}>
        {tracks.map((track, index) => {
          return (
            <motion.div
              variants={fadeInUp}
              className={styles.track}
              key={track.id}
            >
              <div className={styles.imageContainer}>
                {track.image ?
                  <img src={track.image} alt={track.title} />
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