import React from 'react';
import styles from './styles.module.scss';
import Lottie from 'react-lottie';
import animationData from '../../assets/animations/loading.json';

export function Loading() {

    return (
        <div className={styles.loadingContainer}>
            <Lottie
                options={{
                    animationData,
                    autoplay: true,
                    loop: true,
                    rendererSettings: {
                        preserveAspectRatio: "xMidYMid slice"
                    }
                }}
                height={400}
                width={400}
            />
        </div>
    )
}