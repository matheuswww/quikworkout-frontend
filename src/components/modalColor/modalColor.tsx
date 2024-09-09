import handleModalColorClick from '@/funcs/handleModalColorClick'
import styles from './modalColor.module.css'
import { LegacyRef, MutableRefObject, SyntheticEvent } from 'react'
import { inventario } from '@/api/clothing/getClothing'

interface changeColorProps {
  buttonToOpenModalRef: React.MutableRefObject<HTMLButtonElement | null>
  modalRef: MutableRefObject<HTMLDivElement | null>
  color: string | null
  callbackOnEnter?: Function
  callbackOnOut?: Function
  activeModal?: boolean
} 

export function ChangeColor({buttonToOpenModalRef, color, modalRef, callbackOnEnter, callbackOnOut, activeModal}: changeColorProps) {
  return (
    <>
      <button className={styles.changeColorButton} disabled={activeModal} onClick={() => handleModalColorClick(buttonToOpenModalRef, modalRef, styles.active, callbackOnEnter, callbackOnOut)} type="button" ref={buttonToOpenModalRef} aria-label={`cor ${color} está selecionada, clique aqui para alterar a cor da roupa`}>
        <p>{color}</p>
        <span className={styles.expand}></span>
      </button>
    </>
  )
}

interface modalColorProps {
  mainColor: string | null
  modalRef: LegacyRef<HTMLDivElement> | undefined
  setColor: React.Dispatch<React.SetStateAction<string | null>>
  inventario: inventario[] | undefined
  color?: string
}

export function ModalColor({mainColor, modalRef, setColor, inventario, color}: modalColorProps) {
  return (
    <div className={styles.selectModal} ref={modalRef} aria-label="selecione uma cor" style={{backgroundColor: color ? color : "#19191d"}}>
      {mainColor && <button type="button" value={mainColor} key={mainColor} onClick={((event: SyntheticEvent) => event.currentTarget instanceof HTMLButtonElement && setColor(event.currentTarget.value))} aria-label={`${mainColor}, opção 1 de ${inventario?.length}`}>{mainColor}</button>}
      {inventario?.map(({cor,corPrincipal}, index) => {
        return !corPrincipal && <button type="button" value={cor} key={cor} onClick={((event: SyntheticEvent) => event.currentTarget instanceof HTMLButtonElement && setColor(event.currentTarget.value))} aria-label={`${cor}, opção ${index + 2} de ${inventario.length}`}>{cor}</button>
      })}
    </div>
  )
}