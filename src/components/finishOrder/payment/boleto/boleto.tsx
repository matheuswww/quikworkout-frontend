import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'
import Back from '../back/back'
import styles from './boleto.module.css'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { boleto } from '../../finishOrderForm'

interface props {
  showBoleto: boolean
  setPaymentType: Dispatch<SetStateAction<"card" | "pix" | "boleto" | null>>
  setBoleto: Dispatch<boleto | null>
  boleto: boleto | null
}

const schema = z.object({
  email: z.string().min(1, "email inválido").max(255, "é permitido no máximo 255 caracteres").regex(/^([a-zA-Z0-9.!#$%&'*+\/=?^_ {|}~-]{1,64}@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?){0,5})?$/, "email inválido"),
  holder: z.string().min(1, "é necessário pelo menos 1 carácter").max(30, "é permitido no máximo 30 caracteres"),
  cpfCnpj: z.string().min(11, "cpf ou cnpj inválido").max(14, "cpf ou cnpj inválido"),
  dueDate: z.string(),
  instructionLine1: z.string().min(2, "é necessário pelo menos 2 caracteres").max(75, "é permitido no máximo 75 caracteres"),
  instructionLine2: z.string().max(75, "é permitido no máximo 75 caracteres")
}).refine((fields) => {
   if(fields.dueDate == "") {
     return false
   }
    const today = new Date();
    const date = new Date(fields.dueDate);
    const differenceInDays = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (differenceInDays >= 0 && differenceInDays <= 7) {
     return true
    }
    return false
}, {
  path: ["dueDate"],
  message: "data de vencimento deve ser entre 1 dia e 1 semana"
})

type FormProps = z.infer<typeof schema>

export default function Boleto({ showBoleto,setPaymentType,setBoleto,boleto }:props) {
  const [saved, setSaved] = useState<boolean>(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormProps>({
    mode: "onBlur",
    reValidateMode: "onBlur",
    resolver: zodResolver(schema)
  })
  
  function handleForm(data: FormProps) {
    setBoleto({
      dataVencimento: data.dueDate,
      titularBoleto: {
        nome: data.holder,
        cpfCnpj: data.cpfCnpj,
        email: data.email,
        endereco: null
      },
      linhasInstrucao: {
        linha_1: data.instructionLine1,
        linha_2: data.instructionLine2
      }
    })
    setSaved(true)
  }

  return (
    !saved ? 
    <form className={`${styles.form} ${!showBoleto && styles.displayNone}`} onSubmit={(handleSubmit(handleForm))}>
      <Back handleBack={() => setPaymentType(null)} ariaLabel="Voltar para formas de pagamento" />
      <label className={styles.label} htmlFor="email">Email</label>
      <input {...register("email")} type="text" id="email" placeholder="email" />
      {errors.email && <p className={styles.error}>{errors.email.message}</p>}
      <label className={styles.label} htmlFor="name">Titular do boleto</label>
      <input {...register("holder")} type="text" id="name" placeholder="titular do boleto" />
      {errors.holder && <p className={styles.error}>{errors.holder.message}</p>}
      <label className={styles.label} htmlFor="cpfCnpj">Cpf ou cnpj</label>
      <input {...register("cpfCnpj")} type="text" id="cpfCnpj" placeholder="cpf ou cnpj" />
      {errors.cpfCnpj && <p className={styles.error}>{errors.cpfCnpj.message}</p>}
      <label className={styles.label} htmlFor="dueData">Data de vencimento</label>
      <input {...register("dueDate")} type="date" id="dueData" placeholder="data de vencimento do boleto" />
      {errors.dueDate && <p className={styles.error}>{errors.dueDate.message}</p>}
      <label className={styles.label} htmlFor="instructionLine1">Linha de instrução 1 (obrigatório)</label>
      <textarea {...register("instructionLine1")} placeholder="primeira linha de instrução do boleto" className={styles.textarea} id="instructionLine1" maxLength={75}></textarea>
      {errors.instructionLine1 && <p className={styles.error}>{errors.instructionLine1.message}</p>}
      <label className={styles.label} htmlFor="instructionLine2">Linha de instrução 2  (opcional)</label>
      <textarea {...register("instructionLine2")} placeholder="segunda linha de instrução do boleto" className={styles.textarea} id="instructionLine2" maxLength={75}></textarea>
      {errors.instructionLine2 && <p className={styles.error}>{errors.instructionLine2.message}</p>}
      <button style={{marginRight: "15px"}} className={styles.button} type="submit">Salvar dados do boleto</button>
    </form>
    :
    boleto &&
    <div style={{display:"grid"}} className={`${!showBoleto && styles.displayNone}`}>
      <div className={styles.values}>
        <p className={styles.field}>Email: </p>
        <p className={styles.value}>{boleto.titularBoleto.email}</p>
      </div>
      <div className={styles.values}>
        <p className={styles.field}>Titular do boleto: </p>
        <p className={styles.value}>{boleto.titularBoleto.nome}</p>
      </div>
      <div className={styles.values}>
        <p className={styles.field}>{boleto.titularBoleto.cpfCnpj.length === 11 ? 'CPF: ' : 'CNPJ: '}</p>
        <p className={styles.value}>{boleto.titularBoleto.cpfCnpj}</p>
      </div>
      <div className={styles.values}>
        <p className={styles.field}>Data de vencimento: </p>
        <p className={styles.value}>{boleto.dataVencimento}</p>
      </div>
      <div className={styles.values}>
        <p className={styles.field}>Linha de instrução 1: </p>
        <p className={styles.value}>{boleto.linhasInstrucao.linha_1}</p>
      </div>
      {boleto.linhasInstrucao.linha_2 &&
      <div className={styles.values}>
        <p className={styles.field}>Linha de instrução 2: </p>
        <p className={styles.value}>{boleto.linhasInstrucao.linha_2}</p>
      </div>
      }
      <button className={styles.button} onClick={() => setSaved(false)}>Editar dados do boleto</button>
    </div>
  )
} 