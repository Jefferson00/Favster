import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePlayer } from '../../contexts/PlayerContext';
import { translateType } from '../../utils/translateType';
import styles from './styles.module.scss';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { fadeInUp, stagger } from '../../styles/animations';

interface DataProps {
    id: string;
    image: string;
    link: string;
    name: string;
    type: string;
    subtitle?: string;
    previewURL?: string;
    duration?: number;
    albumName?: string;
    artistName?: string;
}

type Track = {
    id: string;
    title: string;
    artistName: string;
    albumName: string;
    image: string;
    duration: number;
    url: string;
};

interface SliderProps {
    data: DataProps[],
    loadingIndicator: boolean;
}

export function Slider({ data, loadingIndicator }: SliderProps) {
    const { playList } = usePlayer();
    const controls = useAnimation();
    const { ref, inView } = useInView();

    const listRef = useRef<HTMLDivElement>(null);
    const itemRef = useRef<HTMLDivElement>(null);

    const [nextItem, setNextItem] = useState(0);
    const [prevItem, setPrevItem] = useState(0);
    const [isItemClicked, setIsItemClicked] = useState(false);

    const [isResultsSmallerThanList, setIsResultsSmallerThanList] = useState(true);

    const [trackList, setTrackList] = useState<Track[]>([]);

    function handleNextItem() {
        if ((nextItem + 1) < data.length) {
            setNextItem(nextItem + 1);
            setPrevItem(1);
        }
    }

    function handlePrevItem() {
        if ((prevItem - 1) >= 0) {
            setPrevItem(prevItem - 1);
            setNextItem(nextItem - 1);
        }
    }

    useEffect(() => {
        if (listRef.current && itemRef.current) {
            setPrevItem(data.length);
            let maxItensOnScreen = Math.floor(listRef.current.offsetWidth / itemRef.current.offsetWidth);

            if ((data.length - 1) > maxItensOnScreen) {
                setNextItem(maxItensOnScreen);
                setIsResultsSmallerThanList(false);
            }
        }

        if (data[0].type === "track") {
            let trackArray: Track[] = [];
            data.map((item, index) => {
                trackArray[index] = {
                    albumName: item.albumName,
                    artistName: item.artistName,
                    duration: item.duration,
                    id: item.id,
                    image: item.image,
                    title: item.name,
                    url: item.previewURL,
                }
            });

            setTrackList(trackArray);
        }

    }, [data, loadingIndicator]);

    useEffect(() => {
        console.log(inView)
        if (inView) {
            controls.start('animate');
        }
        if (!inView) {
            controls.start('initial')
        }
    }, [controls, inView]);

    return (
        <motion.div
            variants={stagger}
            initial='initial'
            animate={controls}
            ref={ref}
            className={styles.sliderContainer}>
            {isItemClicked && <h3>Carregando...</h3>}
            <h3>{translateType(data[0].type)}</h3>

            {!isResultsSmallerThanList &&
                <motion.a
                    initial={{ x: '-50%', y: '-50%' }}
                    whileHover={{ x: '-60%' }}
                    href={`#${prevItem}-${data[0].type}`}
                    className={styles.arrowButton}
                    onClick={handlePrevItem}>
                    ‹ {/*Change for SVG Icon*/}
                </motion.a>
            }

            <div
                className={styles.list}
                ref={listRef}
            >
                {data.map((item, index) => {
                    return (
                        <motion.div
                            key={item.id}
                            variants={fadeInUp}

                        >
                            <div

                                className={styles.listItem}
                                id={index.toString() + "-" + item.type}
                                ref={itemRef}
                            >
                                {item.type === 'track' ?
                                    <div className={styles.imageContainer}>
                                        {item.image ?
                                            <img src={item.image} alt={item.name} />
                                            :
                                            <img src="default.png" alt={item.name} />
                                        }
                                        <button className={styles.playButton} onClick={() => playList(trackList, index)}>
                                            <motion.img
                                                whileHover={{ scale: 1.1 }}
                                                src="/play-green.svg"
                                                alt="Tocar"
                                            />
                                        </button>
                                    </div>
                                    :
                                    <motion.div
                                        whileHover={{ y: 5 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        {item.image ?
                                            item.type === 'artist' ?
                                                <Link href={`/artists/${item.id}`}>
                                                    <a onClick={() => setIsItemClicked(true)}>
                                                        <motion.img
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                            transition={{
                                                                duration: 0.4,
                                                                delay: 0.2
                                                            }}
                                                            src={item.image}
                                                            alt={item.name}
                                                        />
                                                    </a>
                                                </Link>
                                                :
                                                <Link href={`/albums/${item.id}`}>
                                                    <a onClick={() => setIsItemClicked(true)}>
                                                        <motion.img
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                            transition={{
                                                                duration: 0.4,
                                                                delay: 0.2
                                                            }}
                                                            src={item.image}
                                                            alt={item.name}
                                                        />
                                                    </a>
                                                </Link>
                                            :
                                            item.type === 'artist' ?
                                                <Link href={`/artists/${item.id}`}>
                                                    <a onClick={() => setIsItemClicked(true)}>
                                                        <motion.img
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                            transition={{
                                                                duration: 0.4,
                                                                delay: 0.2
                                                            }}
                                                            src="default.png"
                                                            alt={item.name}
                                                        />
                                                    </a>
                                                </Link>
                                                :
                                                <Link href={`/albums/${item.id}`}>
                                                    <a onClick={() => setIsItemClicked(true)}>
                                                        <motion.img
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                            transition={{
                                                                duration: 0.4,
                                                                delay: 0.2
                                                            }}
                                                            src="default.png"
                                                            alt={item.name}
                                                        />
                                                    </a>
                                                </Link>
                                        }
                                    </motion.div>
                                }

                                <p>{item.name}</p>

                                {item.subtitle && <span>{item.subtitle}</span>}
                                {item.artistName && <span>{item.artistName}</span>}
                            </div>
                        </motion.div>
                    )
                })}
            </div>
            {!isResultsSmallerThanList &&
                <motion.a
                    initial={{ x: '50%', y: '-50%' }}
                    whileHover={{ x: '60%' }}
                    href={`#${nextItem}-${data[0].type}`}
                    className={styles.arrowButton}
                    onClick={handleNextItem}>
                    ›
                </motion.a>
            }
        </motion.div>
    )
}