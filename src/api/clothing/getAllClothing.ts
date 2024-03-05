import { clothingPath } from "./clothingPath"

interface params {
  corPrincipal: boolean
  p: boolean | null
  m: boolean | null
  g: boolean | null
  gg: boolean | null
  id: string | null
  sexo: string | null
  categoria: string | null
  cor: string | null
  material: string | null
  cursor: string | null
  precoMaximo: number | null
  precoMinimo: number | null
  Limite: number | null
}

type statusCode = 200 | 404 | 400 | 500

interface response {
  status: statusCode
  clothing: data[] | null
}

interface inventario {
  cor: string,
  corPrincipal: boolean,
  imgDesc: string,
  p: number,
  m: number,
  g: number,
  gg: number,
  images: string[] | null,
}

interface data {
  id: string,
  nome: string,
  sexo: string,
  categoria: string,
  material: string,
  preco: number,
  inventario: inventario[]
}


export default async function GetAllClothing(params: params | null):Promise<response> {
  let url = process.env.API
  if (url == undefined) {
    return {
      status: 500,
      clothing: null,
    }
  }
  url+=clothingPath+"/getClothing"
  if (params !== null) {
    url += getParams(params)
  }
  try {
    const res = await fetch(url, {
      method: "GET",
    }).then(res => res)
    const data = await res.json()
    let status:statusCode
    if (res.status === 200 || res.status == 404 || res.status == 400 || res.status == 500) {
      status = res.status
    } else {
      status = 500
    }
    return {
      status: status,
      clothing: data
    }
  } catch(err) {
    console.error("error trying fetch data:", err);
    return {
      status: 500,
      clothing: null
    }
  }
}

function getParams(params: params): string {
  let urlParams: string = "?";

  if (params.Limite !== null) {
    urlParams += "limite=" + params.Limite + "&";
  }
  if (params.categoria !== null) {
    urlParams += "categoria=" + params.categoria + "&";
  }
  if (params.corPrincipal !== null) {
    urlParams += "corPrincipal=" + params.corPrincipal + "&";
  }
  if (params.p !== null) {
    urlParams += "p=" + params.p + "&";
  }
  if (params.m !== null) {
    urlParams += "m=" + params.m + "&";
  }
  if (params.g !== null) {
    urlParams += "g=" + params.g + "&";
  }
  if (params.gg !== null) {
    urlParams += "gg=" + params.gg + "&";
  }
  if (params.id !== null) {
    urlParams += "id=" + params.id + "&";
  }
  if (params.sexo !== null) {
    urlParams += "sexo=" + params.sexo + "&";
  }
  if (params.cor !== null) {
    urlParams += "cor=" + params.cor + "&";
  }
  if (params.material !== null) {
    urlParams += "material=" + params.material + "&";
  }
  if (params.cursor !== null) {
    urlParams += "cursor=" + params.cursor + "&";
  }
  if (params.precoMaximo !== null) {
    urlParams += "precoMaximo=" + params.precoMaximo + "&";
  }
  if (params.precoMinimo !== null) {
    urlParams += "precoMinimo=" + params.precoMinimo + "&";
  }

  urlParams = urlParams.slice(0, -1);

  return urlParams
}