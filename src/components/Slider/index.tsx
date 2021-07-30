
import { useEffect, useRef, useState } from 'react';
import styles from './styles.module.scss';

interface DataProps {
    id: string;
    image: string;
    link: string;
    name: string;
    type: string;
    subtitle?: string;
}

interface SliderProps {
    data: DataProps[],
    loadingIndicator: boolean;
}

export function Slider({ data, loadingIndicator }: SliderProps) {
    const listRef = useRef<HTMLDivElement>(null);
    const itemRef = useRef<HTMLDivElement>(null);

    const [nextItem, setNextItem] = useState(0);
    const [prevItem, setPrevItem] = useState(0);

    const [isResultsSmallerThanList, setIsResultsSmallerThanList] = useState(true);

    const API_KEY = process.env.NEXT_PUBLIC_NAPSTER_API_KEY;

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
    }, [data, loadingIndicator]);

    return (
        <div className={styles.resultContainer}>
            <h3>{data[0].type}</h3>
            {!isResultsSmallerThanList &&
                <a href={`#${prevItem}-${data[0].type}`} className={styles.arrowButton} onClick={handlePrevItem}>
                    ‹
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
                            {item.image ?
                                <a href={`${item.link}?apikey=${API_KEY}`}>
                                    <img src={item.image} alt={item.name} />
                                </a>
                                :
                                <img src="default.png" alt={item.name} />
                            }
                            <p>{item.name}</p>
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