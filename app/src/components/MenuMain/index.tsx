import styles from './styles.module.css'

type Props = React.MenuHTMLAttributes<HTMLMenuElement> & {
  current: 'connecting' | 'claiming' | 'claimed';
};

export default function MenuMain({ current, ...props }: Props) {
  return (
    <menu className={styles.menu} {...props}>
      <li>
        <a href="/" aria-current={current === 'connecting'}>
          <span>Connect wallet</span>
        </a>
      </li>
      <li>
        <a href="/claim" aria-current={current === 'claiming'}>
          <span>Check allocation</span>
        </a>
      </li>
      <li>
        <a href="/claimed" aria-current={current === 'claimed'}>
          <span>Claim</span>
        </a>
      </li>
    </menu>
  )
}