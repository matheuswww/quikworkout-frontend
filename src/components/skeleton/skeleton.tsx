import { useState } from "react";
import styles from './skeleton.module.css'

export default function Skeleton({className}: {className?: string}) {
  const [load, setLoad] = useState<boolean>(true)

  return (
    <span className={`${load && styles.skeleton} ${className}`} onLoad={(() => setLoad(true))}></span>
  )
}