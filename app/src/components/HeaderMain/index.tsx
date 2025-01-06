import styles from './styles.module.css'

export default function HeaderMain() {
    return (
        <header className={styles.header}>
            <a href={import.meta.env.VITE_HOMEPAGE} target={'_blank'}>
                <img src="/merkle-air-drop.png" alt={"logo"}/>
            </a>
        </header>
    )
}
