import { api } from "@/api/path"
import { pathManager } from "../pathManager"
import { managerClothing } from "./pathClothing"

type statusCode = 200 | 404 | 500 | 401

export interface getOrderAdmin {
  res: any
  status: statusCode
  order: order | null
}

interface order {
  pedido: orders[]
}

interface orders {
  pedido_id: string
  status_pagamento: string
  tipo_pagamento: string
  rua: string
  numeroResidencia: string
  complemento: string
  bairro: string
  cidade: string
  criadoEm: string
  email: string
  telefone: string
  servico: string
  cpfCnpj: string
  frete: number
  codigoRastreio: string
  cancelamento: string
  precoTotal: number
  pacotes: packages[]
}

interface packages {
  pacote_id: string
  codigoRastreio: string
  numeroPacote: number
  largura:  number
  altura: number
  peso: number
  comprimento: number
  preco: number
  roupa: clothing[]
}

interface clothing {
  id: string
  preco: number
  nome: string
  descricao: string
  cor: string
  tamanho: string
  quantidade: number
  imagem: string
  alt: string
}

export default async function GetOrder(cookie: string, cursor?: string, atualizado?: string, id?: string):Promise<getOrderAdmin> {
  let url = api+pathManager+managerClothing+"/getOrder"
  if(cursor || atualizado || id) {
    url += "?"
  }
  if(cursor) {
    url+="cursor="+cursor+"&"
  }
  if(atualizado) {
    url+="atualizadoEm="+atualizado+"&"
  }
  if(id) {
    url+="id="+id
  }
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Cookie": cookie
      },
      credentials: "include",
      cache: "no-store"
    }).then(res => res)
    let status:statusCode
    if (res.status === 200 || res.status === 404 || res.status === 500 || res.status == 401) {
      status = res.status
    } else {
      status = 500
    }
    
    let data: order | null
    if (status == 200) {  
      data = await res.json()
    } else {
      data = null
    }
    return {
      status: status,
      order: data
    }
  } catch(err) {
    console.error("error trying getOrder:", err);
    return {
      status: 500,
      order: null
    }
  }
}