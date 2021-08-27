import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { useAuth } from '../../contexts/AuthContext';
import styles from './login.module.scss';
import { parseCookies } from 'nookies';
import { LoginAnimation } from '../../assets/animations/Login';

export default function Login() {
  const { user, signInWithGoogle } = useAuth();

  async function handleLogin() {
    if (!user) {
      await signInWithGoogle();
    }
  }

  return (
    <div className={styles.wrapper}>
      <main>
        <div className={styles.container}>
          <Head>
            <title>Login | Musifavs</title>
          </Head>
          <section className={styles.main}>
            {/*<img src="/illustration-login.svg" alt="music" />*/}
            <LoginAnimation />
            <div className={styles.text}>
              <p>Seus artistas preferidos</p>
              <span>Do seu jeito</span>
            </div>
          </section>
        </div>
      </main>

      <section className={styles.loginContainer}>
        <img src="/logo.svg" alt="Musifavs" />

        <button onClick={handleLogin}>
          <img src="/google.svg" alt="google" />
          Entre com o Google
        </button>
      </section>
    </div>

  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { ['@Musifavs:token']: token } = parseCookies(context);

  if (token) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      }
    }
  }

  return {
    props: {

    },
  }
}