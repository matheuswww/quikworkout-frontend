import Logo from 'next/image'
import styles from './menu.module.css'

export default function Menu() {
 return (
    <div className={styles.container}>
      <Logo 
        src="/img/logo.png"
        alt="logo da quik workout"
        width={93}
        height={53}
        className={styles.logo}
      />
      <button className={styles.menu} aria-label="menu">
        <span></span>
      </button>
    </div>
 )
}