import { usePlayer } from '../../contexts/PlayerContext';
import Slider from 'rc-slider';
import Image from 'next/image';

import 'rc-slider/assets/index.css';
import styles from './styles.module.scss';
import { useEffect, useRef, useState } from 'react';
import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString';

import { motion, useAnimation } from 'framer-motion';

export function Player() {
    const audioRef = useRef<HTMLAudioElement>(null)
    const [progress, setProgress] = useState(0);
    const [loading, setLoading] = useState(false);
    const controls = useAnimation();

    const {
        trackList,
        currentTrackIndex,
        isPlaying,
        hasNext,
        hasPrevious,
        isLooping,
        isShuffling,
        togglePlay,
        setPlayingState,
        playNext,
        playPrevious,
        toggleLoop,
        toggleShuffle,
        clearPlayerState,
    } = usePlayer();

    const track = trackList[currentTrackIndex];

    const rotation = {
        initial: {
            rotate: 0,
        },
        animate: {
            rotate: 360,
            transition: {
                duration: 20,
                ease: 'linear',
                repeat: Infinity
            }
        },
    };

    useEffect(() => {
        if (track) {
            setLoading(true);
        }
    }, [track])

    useEffect(() => {
        if (!audioRef.current) {
            return;
        }

        if (isPlaying) {
            audioRef.current.play();

        } else {
            audioRef.current.pause();
            setLoading(false);
        }

    }, [isPlaying]);

    useEffect(() => {
        if (isPlaying && !loading) {
            controls.start('animate');
        }
        if (!isPlaying || loading) {
            controls.start('initial')
        }
    }, [controls, isPlaying, loading]);

    function setupProgressListener() {
        setLoading(false);
        audioRef.current.currentTime = 0;

        audioRef.current.addEventListener('timeupdate', () => {
            setProgress(Math.floor(audioRef.current.currentTime))
        })
    }

    function handleSeek(amount: number) {
        audioRef.current.currentTime = amount;

        setProgress(amount)
    }

    function handleTrackEnded() {
        if (hasNext) {
            playNext()
        } else {
            clearPlayerState()
        }
    }

    return (
        <div className={styles.playerContainer}>
            {track &&
                <div className={styles.playerBackgroundImg}>
                    <img
                        src={track.image}
                        alt={track.title}
                    />
                </div>
            }
            <header>
                <img src="/playing.svg" alt="Tocando agora" />
                <strong>{loading ? 'carregando...' : 'Tocando agora'} </strong>
            </header>

            {track ? (
                <div className={styles.currentTrack}>
                    <motion.div
                        animate={controls}
                        variants={rotation}
                    >
                        <Image
                            src={track.image}
                            width={592}
                            height={592}
                            objectFit='cover'
                            placeholder='blur'
                            blurDataURL={track.image}
                        />
                    </motion.div>
                    <strong>{track.title}</strong>
                    <span>{track.artistName}</span>
                </div>
            ) : (
                <div className={styles.emptyPlayer}>
                    <strong>

                    </strong>
                </div>
            )}

            <footer className={!track ? styles.empty : ''}>
                <div className={styles.progress}>
                    <span>{convertDurationToTimeString(progress)}</span>
                    <div className={styles.slider}>
                        {track ? (
                            <Slider
                                max={track.duration}
                                value={progress}
                                onChange={handleSeek}
                                trackStyle={{
                                    backgroundColor: '#04d361'
                                }}
                                railStyle={{
                                    backgroundColor: '#FFD600'
                                }}
                                handleStyle={{
                                    borderColor: '#04d361',
                                    borderWidth: 4
                                }}
                            />
                        ) : (
                            <div className={styles.emptySlider} />
                        )}
                    </div>
                    <span>
                        {convertDurationToTimeString(track?.duration ?? 0)}
                    </span>
                </div>

                {track && (
                    <audio
                        src={track.url}
                        autoPlay
                        ref={audioRef}
                        loop={isLooping}
                        onPlay={() => setPlayingState(true)}
                        onPause={() => setPlayingState(false)}
                        onLoadedMetadata={setupProgressListener}
                        onEnded={handleTrackEnded}
                    />
                )}

                <div className={styles.buttons}>
                    <button
                        type="button"
                        disabled={!track || trackList.length === 1}
                        onClick={toggleShuffle}
                        className={isShuffling ? styles.isActive : ''}
                    >
                        <img src="/shuffle.svg" alt="Embaralhar" />
                    </button>
                    <button type="button" disabled={!track || !hasPrevious} onClick={playPrevious}>
                        <img src="/play-previous.svg" alt="Tocar anterior" />
                    </button>
                    <button
                        type="button"
                        className={styles.playButton}
                        disabled={!track}
                        onClick={togglePlay}
                    >
                        {isPlaying ?
                            <img src="/pause.svg" alt="Pausar" />
                            :
                            <img src="/play.svg" alt="Tocar" />
                        }
                    </button>
                    <button type="button" disabled={!track || !hasNext} onClick={playNext}>
                        <img src="/play-next.svg" alt="Tocar próxima" />
                    </button>
                    <button
                        type="button"
                        disabled={!track}
                        onClick={toggleLoop}
                        className={isLooping ? styles.isActive : ''}
                    >
                        <img src="/repeat.svg" alt="Repetir" />
                    </button>
                </div>
            </footer>
        </div>
    )
}