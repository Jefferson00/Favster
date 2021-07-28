import { useAuth } from '../../contexts/AuthContext';
import styles from './styles.module.scss';

export function Header() {
    const { user, signOut } = useAuth();

    return (
        <header className={styles.headerContainer}>
            <img src="/logo.svg" alt="Musifavs" />

            <p>O melhor para você ouvir, sempre</p>

            {user &&
                <button onClick={signOut}>
                    <img src="/sign.svg" alt="Sair" />
                </button>
            }
        </header>
    )
}