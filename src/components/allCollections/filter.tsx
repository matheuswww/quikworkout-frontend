'use client'

import { useEffect, useRef } from 'react'
import styles from './filter.module.css'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const schema = z.object({
  maxPrice: z.string(),
  minPrice: z.string(),
  category: z.string(),
  material: z.string(),
  cor: z.string(),
  m: z.boolean(),
  f: z.boolean()
}).refine((fields) => checkPrice(fields.maxPrice), {
  path: [ 'maxPrice' ],
  message: "valor inválido"
}).refine((fields) => checkPrice(fields.minPrice), {
  path: [ 'minPrice' ],
  message: "valor inválido"
})

function checkPrice(price: string):boolean {
  if(price == "") {
    return true
  }
  if(price.length > 9) {
    return false
  }
  if(price.includes(",") || price.includes(".")) { 
    if(price.includes(",")) {
      if(Number(price.split(",")[1] == "")) {
        return false
      }
      const number = Number(price.replace(",",""))
      if(isNaN(number)) {
        return false
      }
      if(number <= 0) {
        return false
      }
      return true
    }
    if(price.includes(".")) {
      if(Number(price.split(".")[1] == "")) {
        return false
      }
      const number = Number(price.replace(".",""))
      if(isNaN(number)) {
        return false
      }
      if(number <= 0) {
        return false
      }
      return true
    }
  }
  const number = Number(price)
  if(isNaN(number)) {
    return false
  }
  if(number <= 0) {
    return false
  }
  return true
}

type FormProps = z.infer<typeof schema>

export default function Filter() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormProps>({
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    resolver: zodResolver(schema)
  })

  const formRef = useRef<HTMLFormElement | null>(null)

  function handleForm(data: FormProps) {
    let baseUrl = window.location.origin + window.location.pathname.slice(0, -1)
    let params = new URLSearchParams()
    
    if (data.maxPrice) params.append('precoMaximo', data.maxPrice.includes(",") ? data.maxPrice.replace(",",".") : data.maxPrice)
    if (data.minPrice) params.append('precoMinimo', data.minPrice.includes(",") ? data.minPrice.replace(",",".") : data.minPrice)
    if (data.category) params.append('categoria', data.category)
    if (data.material) params.append('material', data.material)
    if (data.cor) params.append('cor', data.cor)
    if (data.m == true) params.append('m', data.m.toString())
    if (data.f == true) params.append('f', data.f.toString())
    let newUrl = `${baseUrl}?${params.toString()}`;
    window.location.href = newUrl
  }

  useEffect(() => {
    formRef.current instanceof HTMLFormElement && formRef.current.focus()
  },[])
  
  return (
    <form id="filter" ref={formRef} className={styles.filter} onSubmit={handleSubmit(handleForm)} tabIndex={0}>
      <p className={styles.filterClothing}>Filtrar roupas</p>
      <label htmlFor="color">Cor</label>
      <select id="color" {...register("cor")}>
        <option value="">Selecione uma opção</option>
        <option value="vermelho">vermelho</option>
      </select>
      <label htmlFor="category">Categoria</label>
      <select id="category" {...register("category")}>
        <option value="">Selecione uma opção</option>
        <option value="crossfit">crossfit</option>
      </select>
      <label htmlFor="material">Material</label>
      <select id="material" {...register("material")}>
        <option value="">Selecione uma opção</option>
        <option value="drif-t">drif-t</option>
      </select>
      <label>Genêro</label>
      <div className={styles.gender}>
        <label htmlFor="m" className={styles.m}>masculino</label>
        <input type="checkbox" id="m" {...register("m")} />
        <label htmlFor="f" className={styles.f}>feminino</label>
        <input type="checkbox" id="f" {...register("f")} />
      </div>
      <label htmlFor="maxPrice">Preço maxímo</label>
      <input {...register("maxPrice")} type="text" id="maxPrice" />
      {errors.maxPrice?.message && <p className={styles.error}>{errors.maxPrice.message}</p>}
      <label htmlFor="minPrice">Preço minímo</label>
      <input {...register("minPrice")} type="text" id="minPrice" />
      {errors.minPrice?.message && <p className={styles.error}>{errors.minPrice.message}</p>}
      <button className={styles.submit}>Filtrar</button>
      <button aria-label="fechar" id="close" type="button" className={styles.close}><span aria-hidden="true" id="closeSpan">x</span></button>
    </form>
  )
}