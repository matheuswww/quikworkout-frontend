import { api } from '../path';
import { clothingPath } from './clothingPath';

interface params {
 sexo?: string;
 categoria?: string;
 cor?: string;
 material?: string;
 cursor?: string;
 precoMaximo?: number;
 precoMinimo?: number;
 Limite?: number;
 corPrincipal?: string;
 m?: string;
 f?: string;
}

type status = 200 | 404 | 400 | 500;

export interface responseGetAllClothing {
 status: status;
 clothing: data[] | null;
}

interface inventario {
 cor: string;
 corPrincipal: boolean;
 imgDesc: string;
 p: number;
 m: number;
 g: number;
 gg: number;
 images: string[] | null;
}

interface data {
 id: string;
 nome: string;
 descricao: string;
 sexo: string;
 categoria: string;
 material: string;
 preco: number;
 criadoEm: string;
 inventario: inventario[];
}

export default async function GetAllClothing(
 params: params,
): Promise<responseGetAllClothing> {
 let url = api;
 url += clothingPath + '/getClothing';
 params.corPrincipal = 'true';
 url += getParams(params);
 try {
  const res = await fetch(url, {
   method: 'GET',
   headers: {
    'Content-Type': 'application/json',
   },
   next: {
    revalidate: 60 * 10,
   },
  }).then((res) => res);
  let status: status;
  if (
   res.status === 200 ||
   res.status === 404 ||
   res.status === 400 ||
   res.status === 500
  ) {
   status = res.status;
  } else {
   status = 500;
  }
  let data: data[] | null;
  if (status == 200) {
   data = await res.json();
  } else {
   data = null;
  }
  return {
   status: status,
   clothing: data,
  };
 } catch (err) {
  console.error('error trying getAllClothing:', err);
  return {
   status: 500,
   clothing: null,
  };
 }
}

function getParams(params: params): string {
 let urlParams: string = '?';

 if (params.Limite !== undefined) {
  urlParams += 'limite=' + params.Limite + '&';
 }
 if (params.categoria !== undefined) {
  urlParams += 'categoria=' + params.categoria + '&';
 }
 if (params.cor !== undefined) {
  urlParams += 'cor=' + params.cor + '&';
 }
 if (params.material !== undefined) {
  urlParams += 'material=' + params.material + '&';
 }
 if (params.cursor !== undefined) {
  urlParams += 'cursor=' + params.cursor + '&';
 }
 if (params.precoMaximo !== undefined) {
  urlParams += 'precoMaximo=' + params.precoMaximo + '&';
 }
 if (params.precoMinimo !== undefined) {
  urlParams += 'precoMinimo=' + params.precoMinimo + '&';
 }
 if (params.m !== undefined) {
  urlParams += 'm=' + params.m + '&';
 }
 if (params.f !== undefined) {
  urlParams += 'f=' + params.f + '&';
 }
 if (params.cor !== undefined) {
  urlParams += 'cor=' + params.cor + '&';
 }
 if (params.corPrincipal !== undefined) {
  urlParams += 'corPrincipal=' + params.corPrincipal + '&';
 }

 urlParams = urlParams.slice(0, -1);

 return urlParams;
}
