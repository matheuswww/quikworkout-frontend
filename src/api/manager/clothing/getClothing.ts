import { api } from '@/api/path';
import { pathManager } from '../pathManager';
import { managerClothing } from './pathClothing';

type statusCode = 200 | 404 | 500 | 401;

export interface getClothing {
 status: statusCode;
 clothing: clothing[] | null;
}

export interface inventario {
 cor: string;
 alt: string;
 corPrincipal: boolean;
 imgDesc: string;
 p: number;
 m: number;
 g: number;
 gg: number;
 imagens: string[] | null;
}

export interface clothing {
 id: string;
 nome: string;
 descricao: string;
 sexo: string;
 categoria: string;
 material: string;
 criadoEm: string;
 preco: number;
 ativo: boolean;
 inventario: inventario[];
}

export default async function GetClothing(
 cookie: string,
 cursor?: string,
): Promise<getClothing> {
 let url = api + pathManager + managerClothing + '/getClothing';
 if (cursor) {
  url += '?cursor=' + cursor;
 }
 try {
  const res = await fetch(url, {
   method: 'GET',
   headers: {
    'Content-Type': 'application/json',
    Cookie: cookie,
   },
   credentials: 'include',
   cache: 'no-store',
  }).then((res) => res);
  let status: statusCode;
  if (
   res.status === 200 ||
   res.status === 404 ||
   res.status === 500 ||
   res.status == 401
  ) {
   status = res.status;
  } else {
   status = 500;
  }
  let data: clothing[] | null;
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
  console.error('error trying getClothing:', err);
  return {
   status: 500,
   clothing: null,
  };
 }
}
