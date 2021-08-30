import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useAuth } from '../../contexts/AuthContext';
import styles from './styles.module.scss';
import { useEffect, useState } from 'react';

export function Header() {
    const { user, signOut } = useAuth();
    const { theme, setTheme } = useTheme();
    const [userTheme, setUserTheme] = useState(null);

    function changeTheme() {
        if (theme === 'dark') {
            setTheme('light');
        } else {
            setTheme('dark');
        }
    }

    useEffect(() => {
        setUserTheme(theme);
    }, [theme])

    return (
        <header className={styles.headerContainer}>
            <div>
                <Link href="/">
                    <a>
                        {userTheme && (userTheme === 'dark' ?
                            <img src="/logo-dark-theme.svg" alt="Favster" />
                            :
                            <img src="/logo-light-theme.svg" alt="Favster" />
                        )}
                    </a>
                </Link>

                <p>Suas músicas favoritas, em um só lugar</p>
            </div>

            <div>
                <Link href="/library">
                    <button className={styles.libButton}>
                        {userTheme && (userTheme === 'dark' ?
                            <img src="/icons/lib-icon-dark.svg" alt="biblioteca" />
                            :
                            <img src="/icons/lib-icon.svg" alt="biblioteca" />
                        )}
                    </button>
                </Link>

                <button onClick={changeTheme} className={styles.themeButton}>
                    {userTheme && (userTheme === 'dark' ?
                        <img src="/icons/light.svg" alt="tema light" />
                        :
                        <img src="/icons/dark.svg" alt="tema dark" />)
                    }
                </button>

                {user &&
                    <button onClick={signOut}>
                        <img src="/sign.svg" alt="Sair" />
                    </button>
                }
            </div>
        </header>
    )
}