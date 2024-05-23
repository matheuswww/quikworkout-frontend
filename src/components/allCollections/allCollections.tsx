import GetAllClothing from "@/api/clothing/getAllClothing"
import styles from './allCollections.module.css'
import Link from "next/link";
import SkeletonImage from "../skeletonImage/skeletonImage";
import formatPrice from "@/funcs/formatPrice";

export default async function AllCollections() {
  const data = await GetAllClothing(null)
  return (
    <>
      <h2 className={styles.h2}>Todas as Coleções  </h2>
      <div className={styles.wrapper}>
        {(data.status != 400 && data.status != 500) ? data.clothing ? data.clothing.map((clothing) => {
            if (clothing.inventario[0].images == null) {
              return null
            }
            const images = clothing.inventario.find((item) => item.corPrincipal)?.images
            const image = images?.length ? btoa(images[0]) : ""
            return(
              <Link href={"/roupa/"+clothing.nome+"/"+clothing.descricao+"/"+clothing.id+"?img="+image} key={clothing.id} className={styles.card}>
                <SkeletonImage src={clothing.inventario[0].images[0]} alt={clothing.inventario[0].imgDesc} width={225} height={300} className={styles.clothing} />
                <div className={styles.clothingInfos}>
                  <p className={styles.name}>{clothing.nome}</p>
                  <p className={styles.price}>R${formatPrice(clothing.preco)}</p>
                </div>
              </Link>
            )
          }
        ) : <div className={styles.notFound}><p>Nenhuma roupa foi encontrada</p></div> : <p className={styles.error}>Oops, parece que houve um erro, tente recarregar a página</p>}
      </div>
    </>
  )
}