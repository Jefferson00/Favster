import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

import styles from './styles.module.scss';
import { translateType } from '../../utils/translateType';
import { fadeInUp, stagger } from '../../styles/animations';
import { usePlayer } from '../../contexts/PlayerContext';

import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Loading } from '../Loading';

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
    const itemRef = useRef<HTMLDivElement[]>([]);

    const [dataList, setDataList] = useState<DataProps[]>(data);

    const [maxItemOnScreen, setMaxItemOnScreen] = useState(0);
    const [isItemClicked, setIsItemClicked] = useState(false);

    const [isResultsSmallerThanList, setIsResultsSmallerThanList] = useState(true);

    const [trackList, setTrackList] = useState<Track[]>([]);

    function handleNextItem() {
        let itens: DataProps[] = [];
        dataList.map(dt => {
            itens.push(dt);
        });
        itens.push(itens.shift());
        setDataList(itens);
        handleTransitionAnimation();
    }

    function handlePrevItem() {
        let itens: DataProps[] = [];
        dataList.map(dt => {
            itens.push(dt);
        });
        itens.unshift(itens.pop());
        setDataList(itens);
        handleTransitionAnimation();
    }

    function handleTransitionAnimation() {
        itemRef.current.forEach(item => {
            if (item) {
                item.classList.add(styles.fade);
                setTimeout(() => {
                    item.classList.remove(styles.fade);
                }, 500);
            }
        });
    }

    /**
     * return item element based on data type
     * @param item DataProps
     * @param index number
     * @returns JSX item element
     */
    function setItemList(item: DataProps, index: number) {
        let imageSource = 'default-artist.svg';
        let routeName = '';

        if (item.image) {
            imageSource = item.image;
        }

        if (item.type === 'artist') {
            routeName = 'artists';
        }

        if (item.type === 'album') {
            routeName = 'albums';
        }

        if (item.type === "track") {
            return (
                <div className={styles.imageContainer}>
                    <img src={imageSource} alt={item.name} />

                    <button
                        className={styles.playButton}
                        onClick={() => playList(trackList, index)}
                    >
                        <motion.img
                            whileHover={{ scale: 1.1 }}
                            src="/play-green.svg"
                            alt="Tocar"
                        />
                    </button>
                </div>
            )
        }
        else {
            return (
                <motion.div
                    whileHover={{ y: 5 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Link href={`/${routeName}/${item.id}`}>
                        <a onClick={() => setIsItemClicked(true)}>
                            <motion.img
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{
                                    duration: 0.4,
                                    delay: 0.2
                                }}
                                src={imageSource}
                                alt={item.name}
                            />
                        </a>
                    </Link>
                </motion.div>
            )
        }
    }

    useEffect(() => {
        if (listRef.current && itemRef.current[0]) {
            let maxItensOnScreen = Math.floor(listRef.current.offsetWidth / itemRef.current[0].offsetWidth);

            setMaxItemOnScreen(maxItensOnScreen);

            if ((data.length - 1) > maxItensOnScreen) {
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
        if (inView) {
            controls.start('animate');
        }
        if (!inView) {
            controls.start('initial');
        }
    }, [controls, inView, data]);

    return (
        <motion.div
            variants={stagger}
            initial='initial'
            animate={controls}
            ref={ref}
            className={styles.sliderContainer}>
            {isItemClicked &&
                <Loading />
            }
            <h3>{translateType(data[0].type)}</h3>

            {!isResultsSmallerThanList &&
                <motion.a
                    initial={{ x: '-50%', y: '-50%' }}
                    whileHover={{ x: '-60%' }}
                    className={styles.arrowButton}
                    onClick={handlePrevItem}>
                    ‹
                </motion.a>
            }

            <div
                className={styles.list}
                ref={listRef}
            >
                {dataList.map((item, index) => {
                    return (
                        <motion.div
                            key={index}
                            variants={fadeInUp}
                        >
                            <div
                                className={styles.listItem}
                                id={index.toString() + "-" + item.type}
                                ref={(ref) => !itemRef.current.includes(ref) && itemRef.current.push(ref)}
                            >

                                {/*function that return a JSX element based on type of the item*/}
                                {setItemList(item, index)}

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
                    className={styles.arrowButton}
                    onClick={handleNextItem}>
                    ›
                </motion.a>
            }
        </motion.div>
    )
}