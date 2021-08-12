import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import styles from './styles.module.scss';

export function Header() {
    const { user, signOut } = useAuth();

    return (
        <header className={styles.headerContainer}>
            <Link href="/">
                <a>
                    <img src="/logo.svg" alt="Musifavs" />
                </a>
            </Link>

            <p>Suas músicas favoritas, em um só lugar</p>

            {user &&
                <button onClick={signOut}>
                    <img src="/sign.svg" alt="Sair" />
                </button>
            }
        </header>
    )
}