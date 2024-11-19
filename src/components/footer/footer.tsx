import Link from 'next/link';
import styles from './footer.module.css';
import Image from 'next/image';

export default function Footer() {
 return (
  <footer className={styles.footer}>
   <p>Nossas redes sociais:</p>
   <div className={styles.icon}>
    <Link href="https://instagram.com/usequikworkout" target="_blank">
     <Image
      alt="icone do instagram"
      src="/img/instagram.png"
      width={40}
      height={40}
      className={styles.icon}
     />
    </Link>
    <Link
     href="https://wa.me/5555139820579"
     target="_blank"
    >
     <Image
      alt="icone do whatsapp"
      src="/img/whatsapp.png"
      width={40}
      height={40}
      className={styles.icon}
     />
    </Link>
    <Link
     href="https://www.facebook.com/people/UseQuik-Workout/100088837753125/?mibextid=LQQJ4d"
     target="_blank"
    >
     <Image
      alt="icone do facebook"
      src="/img/facebook.png"
      width={40}
      height={40}
      className={styles.icon}
     />
    </Link>
   </div>
  </footer>
 );
}
