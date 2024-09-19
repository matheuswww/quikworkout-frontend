import { inventario } from '@/api/clothing/getClothing';
import styles from './color.module.css';
import { SyntheticEvent } from 'react';

interface props {
 modalRef: React.MutableRefObject<HTMLDivElement | null>;
 mainColor: string | null;
 color: string | null;
 setColor: React.Dispatch<React.SetStateAction<string | null>>;
 setMainColor: React.Dispatch<React.SetStateAction<string | null>>;
 inventory: inventario[] | undefined;
}

export default function ModalColor({
 mainColor,
 modalRef,
 setColor,
 setMainColor,
 inventory,
 color,
}: props) {
 return (
  <div
   className={styles.selectModal}
   ref={modalRef}
   aria-label="selecione uma cor"
  >
   {mainColor && (
    <button
     value={mainColor}
     key={mainColor}
     onClick={(event: SyntheticEvent) =>
      event.currentTarget instanceof HTMLButtonElement &&
      setColor(event.currentTarget.value)
     }
     aria-label={`${mainColor}, opção 1 de ${inventory?.length}`}
    >
     {mainColor}
    </button>
   )}
   {inventory?.map(({ cor, corPrincipal }, index) => {
    if (corPrincipal && color == null) {
     setColor(cor);
     setMainColor(cor);
    }
    return (
     !corPrincipal && (
      <button
       value={cor}
       key={cor}
       onClick={(event: SyntheticEvent) =>
        event.currentTarget instanceof HTMLButtonElement &&
        setColor(event.currentTarget.value)
       }
       aria-label={`${cor}, opção ${index + 2} de ${inventory?.length}`}
      >
       {cor}
      </button>
     )
    );
   })}
  </div>
 );
}
