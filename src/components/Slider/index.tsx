import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePlayer } from '../../contexts/PlayerContext';
import { translateType } from '../../utils/translateType';
import styles from './styles.module.scss';

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

    return (
        <div className={styles.sliderContainer}>
            {isItemClicked && <h3>Carregando...</h3>}
            <h3>{translateType(data[0].type)}</h3>

            {!isResultsSmallerThanList &&
                <a href={`#${prevItem}-${data[0].type}`} className={styles.arrowButton} onClick={handlePrevItem}>
                    ‹ {/*Change for SVG Icon*/}
                </a>
            }

            <div className={styles.list} ref={listRef}>
                {data.map((item, index) => {
                    return (
                        <div
                            key={item.id}
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
                                        <img src="/play-green.svg" alt="Tocar" />
                                    </button>
                                </div>
                                :
                                item.image ?
                                    item.type === 'artist' ?
                                        <Link href={`/artists/${item.id}`}>
                                            <a onClick={() => setIsItemClicked(true)}>
                                                <img src={item.image} alt={item.name} />
                                            </a>
                                        </Link>
                                        :
                                        <Link href={`/albums/${item.id}`}>
                                            <a onClick={() => setIsItemClicked(true)}>
                                                <img src={item.image} alt={item.name} />
                                            </a>
                                        </Link>
                                    :
                                    item.type === 'artist' ?
                                        <Link href={`/artists/${item.id}`}>
                                            <a onClick={() => setIsItemClicked(true)}>
                                                <img src="default.png" alt={item.name} />
                                            </a>
                                        </Link>
                                        :
                                        <Link href={`/albums/${item.id}`}>
                                            <a onClick={() => setIsItemClicked(true)}>
                                                <img src="default.png" alt={item.name} />
                                            </a>
                                        </Link>
                            }

                            <p>{item.name}</p>

                            {item.subtitle && <span>{item.subtitle}</span>}
                            {item.artistName && <span>{item.artistName}</span>}
                        </div>
                    )
                })}
            </div>
            {!isResultsSmallerThanList &&
                <a href={`#${nextItem}-${data[0].type}`} className={styles.arrowButton} onClick={handleNextItem}>
                    ›
                </a>
            }
        </div>
    )
}