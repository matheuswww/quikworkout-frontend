import styles from './skeleton.module.css';

export default function Skeleton({ className }: { className?: string }) {
 return (
  <span
   className={`${styles.skeleton} ${className}`}
  ></span>
 );
}
