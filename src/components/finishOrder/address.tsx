'use client'

import styles from './address.module.css'
import { Dispatch, MutableRefObject, useEffect, useRef, useState } from "react"
import ArrowUp from 'next/image'
import ArrowDown from 'next/image'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { regions } from './regionCode'
import { ValidateCnpj, ValidateCpf } from './payment/validateCpfCnpj'
import { ValidatePhoneNumber } from '@/funcs/validateEmailAndPhoneNumber'
import { enderecoContato } from '@/api/clothing/payOrderInterfaces'
import { getAddressData } from '@/api/user/getAddress'
import { useRouter } from 'next/navigation'
import GetAddress from '@/api/user/getAddress'

const schema = z.object({
  name: z.string().regex(/^\p{L}+['.-]?(?:\s+\p{L}+['.-]?)+$/u, { message: "nome e sobrenome inválido" }),
  email: z.string().min(10, "email precisa ter pelo menos 10 caracteres").max(255, "é permitido no máximo 255 caracteres").regex(/^([a-zA-Z0-9.!#$%&'*+\/=?^_ {|}~-]{1,64}@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?){0,5})?$/, "email inválido"),
  phoneNumber: z.string().min(10, "telefone inválido").max(14, "telefone inválido"),
  cpfCnpj: z.string().min(11, "cpf ou cnpj inválido").max(14, "cpf ou cnpj inválido"),
  street: z.string().min(1, "rua precisa ter pelo menos 1 carácter").max(160, "é permitido no máximo 160 caracteres"),
  residenceNumber: z.string().min(1, "número de residência precisa ter pelo menos 1 carácter").max(20, "é permitido no máximo 20 caracteres"),
  complement: z.string().min(1, "complemento precisa ter pelo menos 1 carácter").max(40, "é permitido no máximo 40 caracteres"),
  neighbordhood: z.string().min(1, "bairro precisa ter pelo menos 1 carácter").max(60, "é permitido no máximo 60 caracteres"),
  city: z.string().min(1, "cidade precisa ter pelo menos 1 carácter").max(90, "é permitido no máximo 90 caracteres"),
  regionCode: z.string(),
  cep: z.string().min(8, "cep inválido").max(9, "cep inválido"),
}).refine((fields) => {
  return ValidatePhoneNumber(fields.phoneNumber)
}, {
  path: ["phoneNumber"],
  message: "telefone inválido"
}).refine((fields) => {
  if(fields.cpfCnpj.includes(".")) {
    fields.cpfCnpj = fields.cpfCnpj.replaceAll(".","")
  }
  if(fields.cpfCnpj.includes("-")) {
    fields.cpfCnpj = fields.cpfCnpj.replaceAll("-","")
  }
  if(fields.cpfCnpj.length == 11) {
    return ValidateCpf(fields.cpfCnpj)
  }
  if(fields.cpfCnpj.length == 14) {
    return ValidateCnpj(fields.cpfCnpj)
  }
}, {
   path: ["cpfCnpj"],
   message: "cpf ou cnpj inválido"
}).refine((fields) => {
  let cepNumber = fields.cep
  if(fields.cep.includes("-")){
    cepNumber = fields.cep.replace("-","")
  }
  if(isNaN(Number(cepNumber))) {
    return false
  }
  return true
},{
  path: [ 'cep' ],
  message: "cep inválido"
})

type FormProps = z.infer<typeof schema>

interface props {
  setAddress: Dispatch<enderecoContato>
  address: enderecoContato | null
  addressRef: MutableRefObject<HTMLElement | null>
  cookieName?: string
  cookieVal?: string
  setLoad: Dispatch<boolean>
  setAdressStatus: Dispatch<500 | null>
}

export default function Address({ setAddress, address, addressRef, cookieName, cookieVal, setLoad,setAdressStatus }:props) {
  const router = useRouter()
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormProps>({
    mode: "onBlur",
    reValidateMode: "onBlur",
    resolver: zodResolver(schema)
  })
  const [addressForm, setAddressForm] = useState<boolean>(true)
  const [delivery, setDelivery] = useState<"E" | "X" | "R">("E")
  const [saved, setSaved] = useState<boolean>(false)
  const [addressSaved, setAddressSaved] = useState<getAddressData[] | null>(null)

  useEffect(() => {
    (async function() {
      if(cookieName == undefined || cookieVal == undefined) {
        router.push("/auth/entrar")
        return
      }
      setLoad(true)
      const cookie = cookieName+"="+cookieVal
      const res = await GetAddress(cookie)
      if(typeof res.status == "number" && res.status == 401) {
        router.push("/auth/entrar")
        return
      }
      if(typeof res.status == "number" && res.status == 500) {
        setAdressStatus(res.status)
      }
      if(typeof res.status == "number" && res.status == 200 && typeof res.data == "object") {
        setAddressSaved(res.data)
      }
      setLoad(false)
    }())
  }, [])

  function handleSavedAdressClick(i: number) {    
    const regionCode = document.querySelector("#regionCode")
    if(regionCode instanceof HTMLSelectElement && addressSaved) {
      for(let j = 0; j < regionCode.options.length; j++) {
        if(regionCode.options[j].value.includes(`${addressSaved[i].codigoRegiao} - `)) {
          regionCode.options[j].selected = true
        }
      }
      reset({
        street: addressSaved[i].rua,
        residenceNumber: addressSaved[i].numeroResidencia,
        complement: addressSaved[i].complemento,
        neighbordhood: addressSaved[i].bairro,
        city: addressSaved[i].cidade,
        cep: addressSaved[i].cep,
      })
      setAddressSaved(null)
    }
  }
                                                                 
  function handleForm(data: FormProps) {
    const region = data.regionCode.substring(5)
    const regionCode = data.regionCode.slice(0,2)
    const DDD = data.phoneNumber.slice(0,2)
    const number = data.phoneNumber.substring(2)
    if(data.cep.includes("-")) {
      data.cep = data.cep.replace("-","")
    }
    setAddress({
      nome: data.name,
      cep: data.cep,
      cidade: data.city,
      complemento: data.complement,
      email: data.email,
      telefone: {
        DDI: "55",
        DDD: DDD,
        Numero: number
      },
      bairro: data.neighbordhood,
      numeroResidencia: data.residenceNumber,
      regiao: region,
      codigoRegiao: regionCode,
      rua: data.street,
      tax_id: data.cpfCnpj,
      servico: delivery,
    })
    setSaved(true)
  }

  function handleOtherAddressClick() {
    setAddressSaved(null)
  }

  return (
    <>
      <div style={{display: "flex"}}>
        {
          addressForm ? 
          <button className={styles.arrow} id="arrowAddress" onClick={(() => setAddressForm((a) => !a))} aria-label="diminuir sessão de endereço e contato"><ArrowUp src="/img/arrowUp.png" alt="seta para cima" width={24} height={24} /></button>
          :
          <button className={styles.arrow} id="arrowAddress" onClick={(() => setAddressForm((a) => !a))} aria-label="expandir sessão de endereço e contato"><ArrowDown src="/img/arrowDown.png" alt="seta para baixo" width={24} height={24}/></button>
        }
        <label className={styles.label} style={{marginTop: "18px"}} htmlFor="arrowAddress">Endereço e contato</label>
      </div>
      <section className={`${styles.section}`} ref={addressRef}>
            {addressForm && 
            <>
            {addressSaved?.map((infos,i) => {
              return (
                <div className={styles.addressSaved} key={infos.rua+i}>
                  <div className={styles.values}>
                    <p className={styles.field}>Rua: </p>
                    <p className={styles.value}>{infos.rua}</p>
                  </div>
                  <div className={styles.values}>
                    <p className={styles.field}>Número de residência </p>
                    <p className={styles.value}>{infos.numeroResidencia}</p>
                  </div>
                    <div className={styles.values}>
                    <p className={styles.field}>Complemento: </p>
                    <p className={styles.value}>{infos.complemento}</p>
                  </div>
                  <div className={styles.values}>
                    <p className={styles.field}>Bairro: </p>
                    <p className={styles.value}>{infos.bairro}</p>
                  </div>
                  <div className={styles.values}>
                    <p className={styles.field}>Cidade: </p>
                    <p className={styles.value}>{infos.cidade}</p>
                  </div>
                  <div className={styles.values}>
                    <p className={styles.field}>Código de região: </p>
                    <p className={styles.value}>{infos.codigoRegiao}</p>
                  </div>
                  <div className={styles.values}>
                    <p className={styles.field}>Cep: </p>
                    <p className={styles.value}>{infos.cep}</p>
                  </div>
                  <button onClick={() => handleSavedAdressClick(i)} className={styles.selectAddress}>Selecionar endereço</button>
                </div>
              )
            })}
            {addressSaved && <button className={styles.otherAddress} id="submit" onClick={handleOtherAddressClick}>Selecionar outro endereço</button>}
          </>
          }
          {
            !saved ?
            <form className={`${styles.form} ${(!addressForm || addressSaved ) && styles.displayNone}`} onSubmit={handleSubmit(handleForm)}>
            <label className={styles.label} htmlFor="name">Nome e sobrenome</label>
            <input {...register("name")} className={styles.input} placeholder="nome e sobrenome" type="text" id="name"/>
            {errors.name && <p className={styles.error}>{errors.name.message}</p>}
            <label className={styles.label} htmlFor="email">Email</label>
            <input {...register("email")} className={styles.input} placeholder="email" type="text" id="email"/>
            {errors.email && <p className={styles.error}>{errors.email.message}</p>}
            <label className={styles.label} htmlFor="telefone">Telefone</label>
            <input {...register("phoneNumber")} className={styles.input} placeholder="telefone(+55 somente)" type="text" id="telefone"/>
            {errors.phoneNumber && <p className={styles.error}>{errors.phoneNumber.message}</p>}
            <label className={styles.label} htmlFor="cpfCnpj">Cpf ou cnpj</label>
            <input {...register("cpfCnpj")} className={styles.input} placeholder="cpf ou cnpj" type="text" id="cpfCnpj"/>
            {errors.cpfCnpj && <p className={styles.error}>{errors.cpfCnpj.message}</p>}
            <label className={styles.label} htmlFor="street">Rua</label>
            <input {...register("street")} className={styles.input} placeholder="rua" type="text" id="street"/>
            {errors.street && <p className={styles.error}>{errors.street.message}</p>}
            <label className={styles.label} htmlFor="neighborhood">Bairro</label>
            <input {...register("neighbordhood")} className={styles.input} placeholder="bairro" type="text" id="neighbordhood"/>
            {errors.neighbordhood && <p className={styles.error}>{errors.neighbordhood.message}</p>}
            <label className={styles.label} htmlFor="complement">Complemento</label>
            <input {...register("complement")} className={styles.input} placeholder="complemento" type="text" id="complement"/>
            {errors.complement && <p className={styles.error}>{errors.complement.message}</p>}
            <label className={styles.label} htmlFor="city">Cidade</label>
            <input {...register("city")} className={styles.input} placeholder="cidade" type="text" id="city"/>
            {errors.city && <p className={styles.error}>{errors.city.message}</p>}
            <label className={styles.label} htmlFor="residenceNumber">Número da residência</label>
            <input {...register("residenceNumber")} className={styles.input} placeholder="número de residência" type="text" id="residenceNumber"/>
            {errors.residenceNumber && <p className={styles.error}>{errors.residenceNumber.message}</p>}
            <label className={styles.label} htmlFor="cep2">Cep</label>
            <input {...register("cep")} className={styles.input} placeholder="cep" type="text" id="cep2" />
            {errors.cep && <p className={styles.error}>{errors.cep.message}</p>}
            <div style={{marginTop: "5px"}}>
              <label className={styles.label} htmlFor="E2">entrega normal</label>
              <input type="checkbox" className={styles.checkbox} id="E2" value="E" onChange={() => setDelivery("E")} checked={delivery === "E"}/>
            </div>
            <div>
              <label className={styles.label} htmlFor="X2">entrega expressa</label>
              <input type="checkbox" className={styles.checkbox} id="X2" value="X" onChange={() => setDelivery("X")} checked={delivery === "X"}/>
            </div>
            <div>
              <label className={styles.label} htmlFor="R2">retirar</label>
              <input type="checkbox" className={styles.checkbox} id="R2" value="R" onChange={() => setDelivery("R")} checked={delivery === "R"}/>
            </div>
            <label className={styles.label} htmlFor="regionCode">Código de região</label>
            <select id="regionCode" {...register("regionCode")}>
            {Object.entries(regions).map(([estado, capital]) => (
              <option key={estado} value={`${estado} - ${capital}`}>{estado} - {capital}</option>
            ))}
            </select>
            <button type="submit" id="submit" className={styles.button}>Salvar endereço e contato</button>
          </form>
          : 
            address && 
            <>
              <div className={styles.values}>
                <p className={styles.field}>Nome: </p>
                <p className={styles.value}>{address.nome}</p>
              </div>
              <div className={styles.values}>
                <p className={styles.field}>Email: </p>
                <p className={styles.value}>{address.email}</p>
              </div>
              <div className={styles.values}>
                <p className={styles.field}>Telefone: </p>
                <p className={styles.value}>{address.telefone.DDD+address.telefone.Numero}</p>
              </div>
              <div className={styles.values}>
                <p className={styles.field}>{address.tax_id.length === 11 ? 'CPF: ' : 'CNPJ: '}</p>
                <p className={styles.value}>{address.tax_id}</p>
              </div>
              <div className={styles.values}>
                <p className={styles.field}>Rua: </p>
                <p className={styles.value}>{address.rua}</p>
              </div>
              <div className={styles.values}>
                <p className={styles.field}>Bairro: </p>
                <p className={styles.value}>{address.bairro}</p>
              </div>
              <div className={styles.values}>
                <p className={styles.field}>Complemento: </p>
                <p className={styles.value}>{address.complemento}</p>
              </div>
              <div className={styles.values}>
                <p className={styles.field}>Cidade: </p>
                <p className={styles.value}>{address.cidade}</p>
              </div>
              <div className={styles.values}>
                <p className={styles.field}>Região: </p>
                <p className={styles.value}>{address.regiao}</p>
              </div>
              <div className={styles.values}>
                <p className={styles.field}>Código de região: </p>
                <p className={styles.value}>{address.codigoRegiao}</p>
              </div>
              <div className={styles.values}>
                <p className={styles.field}>CEP: </p>
                <p className={styles.value}>{address.cep}</p>
              </div>
              <div className={styles.values}>
                <p className={styles.field}>Tipo de entrega: </p>
                <p className={styles.value}>{delivery == "E" ? "entrega normal" : delivery == "R" ? "retirar" : delivery == "X" && "entrega expressa"}</p>
              </div>
              <button className={styles.button} onClick={() => setSaved(false)} style={{marginLeft: "12px"}}>Editar endereço e contato</button>
            </>
          }
      </section>
    </>
  )
}