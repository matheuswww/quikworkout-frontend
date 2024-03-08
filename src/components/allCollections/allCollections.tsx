import GetAllClothing from "@/api/clothing/getAllClothing"
import styles from './allCollections.module.css'
import Link from "next/link";
import SkeletonImage from "../skeletonImage/skeletonImage";

export default async function AllCollections() {
  const data = await GetAllClothing(null)
  return (
    <>
      <h2 className={styles.h2}>Todas as Coleções  </h2>
      <div className={styles.wrapper}>
        {(data.status != 400 && data.status != 500) ? data.clothing ? data.clothing.map((clothing) =>
          clothing.inventario.map((inventory) => {
            if (inventory.images == null) {
              return null
            }
            return(
              <Link href="#" key={clothing.id} className={styles.card}>
                <SkeletonImage src={inventory.images[0]} alt={inventory.imgDesc} width={225} height={300} className={styles.clothing} />
                <div className={styles.clothingInfos}>
                  <p className={styles.name}>{clothing.nome}</p>
                  <p className={styles.price}>R${clothing.preco}0</p>
                </div>
              </Link>
            )
          })
        ) : <div className={styles.notFound}><p>Nenhuma roupa foi encontrada</p></div> : <p className={styles.error}>Oops, parece que houve um erro</p>}
      </div>
    </>
  )
}