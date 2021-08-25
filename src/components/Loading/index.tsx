import styles from './styles.module.scss';

export function Loading() {

    return (
        <div className={styles.loadingContainer}>
            <img src="/loading-2.gif" alt="carregando" />
        </div>
    )
}