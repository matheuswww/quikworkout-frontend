'use client'
import { Dispatch, SetStateAction, useState } from 'react'
import styles from './calcFreight.module.css'
import { dataGetClothingCart } from '@/api/clothing/getClothingCart'
import CalcFreight from '@/api/clothing/calcFreight'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import PopupError from '../popupError/popupError'
import ArrowUp from 'next/image'
import ArrowDown from 'next/image'
import formatPrice from '@/funcs/formatPrice'

interface props {
  setDelivery: Dispatch<SetStateAction<"E" | "X" | "R">>
  delivery: "E" | "X" | "R"
  clothing: dataGetClothingCart[]
  end: boolean
  load: boolean
  setLoad: Dispatch<boolean>
  setFreight: Dispatch<SetStateAction<string | null>>
}

const schema = z.object({
  cep: z.string().min(8, "cep inválido").max(9, "cep inválido"),
}).refine((fields) => {
  let cepNumber = fields.cep
  if(fields.cep.includes("-")){
    cepNumber = fields.cep.replace("-","")
  }
  if(isNaN(Number(cepNumber))) {
    return false
  }
  return true
}, {
  path: [ 'cep' ],
  message: "cep inválido"
})

type FormProps = z.infer<typeof schema>

export default function CalcFreightForm({ setDelivery, delivery, end, load, setLoad, clothing, setFreight }:props) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormProps>({
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    resolver: zodResolver(schema)
  })

  const [calcFreight, setCalcFreight] = useState<boolean>(true)
  const [price, setPrice] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)
  const [popupError, setPopupError] = useState<boolean>(false)

  async function handleForm(values: FormProps) {
    if(end) {
      setError(null)
      setPopupError(false)
      setLoad(true)
      let clothingIds: string[] = []
      let productQuantity: number[] = []
      if(clothing) {
        if(values.cep.includes("-")) {
          values.cep = values.cep.replace("-","")
        }
        if(values.cep.length >= 9) {
          setLoad(false)
          setError("cep inválido")
          return
        }
        clothing.map(({roupa_id,quantidade}) => {
          clothingIds.push(roupa_id)
          productQuantity.push(quantidade)
        })
        const res = await CalcFreight({
          cep: values.cep,
          quantidadeProduto: productQuantity,
          roupa: clothingIds,
          servico: delivery
        })
        if(res.status == 500) {
          setPopupError(true)
          setLoad(false)
          setPrice(0)
          setFreight(null)
          return
        }
        if(res.data == "cep de destino inválido") {
          setError(res.data)
          setLoad(false)
          setPrice(0)
          setFreight(null)
          return
        }
        if(res.data == "frete não disponível") {
          setError("frete não disponível para este endereço e tipo de entrega")
          setLoad(false)
          setPrice(0)
          setFreight(null)
          return
        }
        if(res.data == "peso maxímo atingido") {
          setError("tente deletar alguns items do carrinho pois o peso excede o peso máximo de entrega")
          setLoad(false)
          setPrice(0)
          setFreight(null)
          return
        }
        if(res.data == "roupa não encontrada") {
          setError("parece que uma das suas roupas está indisponível, verifique sua bolsa e remova a roupa")
          setLoad(false)
          setPrice(0)
          setFreight(null)
          return
        }
        if(res.data?.vlrFrete) {
          setPrice(res.data.vlrFrete)
          setFreight(formatPrice(res.data.vlrFrete))
        }
        setLoad(false)
      }
    }
  }

  return (
    <section className={styles.section}>
      <div style={{display: "flex"}}>
        {
          calcFreight ? 
          <button className={styles.arrow} id="arrowCalcFreight" onClick={(() => setCalcFreight((a) => !a))} aria-label="diminuir sessão de calculo de frete"><ArrowUp src="/img/arrowUp.png" alt="seta para cima" width={24} height={24} /></button>
          :
          <button className={styles.arrow} id="arrowCalcFreight" onClick={(() => setCalcFreight((a) => !a))} aria-label="expandir sessão de calculo de frete"><ArrowDown src="/img/arrowDown.png" alt="seta para baixo" width={24} height={24}/></button>
        }
        <label className={styles.label} htmlFor="arrowCalcFreight">Cálculo de frete</label>
      </div>
      {
        calcFreight &&
        <>
          { popupError && <PopupError handleOut={() => setPopupError(false)}/>}
          <form className={styles.form} onSubmit={handleSubmit(handleForm)} >
            <label htmlFor="cep">Digite seu cep</label>
            <input {...register("cep")} type="text" id="cep" className={styles.cep} placeholder="digite seu cep aqui"/>
            {error ? <p className={styles.error}>{error}</p> : errors.cep && <p className={styles.error}>{errors.cep.message}</p>}
            <div style={{marginTop: "5px"}}>
              <label htmlFor="E">entrega normal</label>
              <input type="checkbox" className={styles.checkbox} id="E" value="E" onChange={() => setDelivery("E")} checked={delivery === "E"}/>
            </div>
            <div>
              <label htmlFor="X">entrega expressa</label>
              <input type="checkbox" className={styles.checkbox} id="X" value="X" onChange={() => setDelivery("X")} checked={delivery === "X"}/>
            </div>
            <div>
              <label htmlFor="R">retirar</label>
              <input type="checkbox" className={styles.checkbox} id="R" value="R" onChange={() => setDelivery("R")} checked={delivery === "R"}/>
            </div>
            {price != 0 && <p className={styles.price}>R${price}</p>}
            <button disabled={load} className={`${styles.calcFreight}`}>Calcular frete</button>
          </form>
        </>
      }
    </section>
  )
}